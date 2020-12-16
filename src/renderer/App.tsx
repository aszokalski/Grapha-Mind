/*
*  Copyright (C) 1998-2020 by Northwoods Software Corporation. All Rights Reserved.
*/

import * as go from 'gojs';
import { produce } from 'immer';
import * as React from 'react';

import { Grid, Typography, Container, AppBar, Tabs, Tab, Box, CssBaseline, Card, CardContent, Button, ThemeProvider, createMuiTheme} from '@material-ui/core';
import { styled } from '@material-ui/core/styles';
import { sizing } from '@material-ui/system';

import { DiagramWrapper } from './components/DiagramWrapper';
import { QueueWrapper } from './components/QueueWrapper';
import { SelectionInspector } from './components/SelectionInspector';

import './styles/App.css';
/**
 * Use a linkDataArray since we'll be using a GraphLinksModel,
 * and modelData for demonstration purposes. Note, though, that
 * both are optional props in ReactDiagram.
 */
interface AppState {
  nodeDataArray: Array<go.ObjectData>;
  modelData: go.ObjectData;
  selectedData: go.ObjectData | null;
  nodeDataArrayQueue: Array<go.ObjectData>;
  modelDataQueue: go.ObjectData;
  selectedDataQueue: go.ObjectData | null;
  skipsDiagramUpdate: boolean;
  focus: number | null;
}

const theme = createMuiTheme({
    palette: {
      primary: {
        main: '#202122',
      },
      secondary: {
        main: '#ff0000'
      }
  }
});

class App extends React.Component<{}, AppState> {
  // Maps to store key -> arr index for quick lookups
  private mapNodeKeyIdx: Map<go.Key, number>;

  constructor(props: object) {
    super(props);
    this.state = {
      nodeDataArray: [
        { key: 0, text: 'Alpha', loc: "0 0", diagram: "main", parent: "0", deletable: false, dir: "right", depth: 0, scale: 1, font: "28pt Nevermind-Medium", id: "82j" },
      ],
      nodeDataArrayQueue: [
        { key: "End", text: 'KONIEC', diagram: "secondary", deletable: false, id: "0a1nvg"},
      ],
      modelData: {
        // Jakieś parametry modelu
      },
      modelDataQueue: {
        // Jakieś parametry modelu
      },
      selectedData: null,
      selectedDataQueue: null,
      skipsDiagramUpdate: false,
      focus: null
    };
    // init maps
    this.mapNodeKeyIdx = new Map<go.Key, number>();
    this.refreshNodeIndex(this.state.nodeDataArray);
    // bind handler methods
    this.handleDiagramEvent = this.handleDiagramEvent.bind(this);
    this.handleModelChange = this.handleModelChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);

    //bindowanie this
    this.reset = this.reset.bind(this);
    this.focusOnNode = this.focusOnNode.bind(this);
  }

  /**
   * Update map of node keys to their index in the array.
   */
  private refreshNodeIndex(nodeArr: Array<go.ObjectData>) {
    this.mapNodeKeyIdx.clear();
    nodeArr.forEach((n: go.ObjectData, idx: number) => {
      this.mapNodeKeyIdx.set(n.key, idx);
    });
  }


  /**
   * Handle any relevant DiagramEvents, in this case just selection changes.
   * On ChangedSelection, find the corresponding data and set the selectedData state.
   * @param e a GoJS DiagramEvent
   */


  public handleDiagramEvent(e: go.DiagramEvent) {
    const name = e.name;
    switch (name) {
      case 'ChangedSelection': {
        const sel = e.subject.first();
        this.setState(
          produce((draft: AppState) => {
            if (sel) {
              if (sel instanceof go.Node) {
                const idx = this.mapNodeKeyIdx.get(sel.key);
                if (idx !== undefined && idx >= 0) {
                  const nd = draft.nodeDataArray[idx];
                  draft.selectedData = nd;
                }
              } 
            } else {
              draft.selectedData = null;
            }
          })
        );
        break;
      }
      default: break;
    }
  }

  /**
   * Handle GoJS model changes, which output an object of data changes via Model.toIncrementalData.
   * This method iterates over those changes and updates state to keep in sync with the GoJS model.
   * @param obj a JSON-formatted string
   */
  public handleModelChange(obj: go.IncrementalData) {
    const insertedNodeKeys = obj.insertedNodeKeys;
    const modifiedNodeData = obj.modifiedNodeData;
    const removedNodeKeys = obj.removedNodeKeys;
    const modifiedModelData = obj.modelData;

    // maintain maps of modified data so insertions don't need slow lookups
    const modifiedNodeMap = new Map<go.Key, go.ObjectData>();
    this.setState(
      produce((draft: AppState) => {
        let narr = draft.nodeDataArray;
        if (modifiedNodeData) {
          modifiedNodeData.forEach((nd: go.ObjectData) => {
            modifiedNodeMap.set(nd.key, nd);
            const idx = this.mapNodeKeyIdx.get(nd.key);
            if (idx !== undefined && idx >= 0) {
              narr[idx] = nd;
              if (draft.selectedData && draft.selectedData.key === nd.key) {
                draft.selectedData = nd;
              }
            }
          });
        }
        if (insertedNodeKeys) {
          insertedNodeKeys.forEach((key: go.Key) => {
            const nd = modifiedNodeMap.get(key);
            const idx = this.mapNodeKeyIdx.get(key);
            if (nd && idx === undefined) {  // nodes won't be added if they already exist
              this.mapNodeKeyIdx.set(nd.key, narr.length);
              narr.push(nd);
            }
          });
        }
        if (removedNodeKeys) {
          narr = narr.filter((nd: go.ObjectData) => {
            if (removedNodeKeys.includes(nd.key)) {
              return false;
            }
            return true;
          });
          draft.nodeDataArray = narr;
          this.refreshNodeIndex(narr);
        }
        // handle model data changes, for now just replacing with the supplied object
        if (modifiedModelData) {
          draft.modelData = modifiedModelData;
        }
        draft.skipsDiagramUpdate = true;  // the GoJS model already knows about these updates
      })
    );
  }

  /**
   * Handle inspector changes, and on input field blurs, update node/link data state.
   * @param path the path to the property being modified
   * @param value the new value of that property
   * @param isBlur whether the input event was a blur, indicating the edit is complete
   */
  public handleInputChange(path: string, value: string, isBlur: boolean) {
    this.setState(
      produce((draft: AppState) => {
        const data = draft.selectedData as go.ObjectData;  // only reached if selectedData isn't null
        data[path] = value;
        if (isBlur) {
          const key = data.key;
          if (key < 0) {  // negative keys are links
          } else {
            const idx = this.mapNodeKeyIdx.get(key);
            if (idx !== undefined && idx >= 0) {
              draft.nodeDataArray[idx] = data;
              draft.skipsDiagramUpdate = false;
            }
          }
        }
      })
    );
  }

  public getDiagramSelection(): go.ObjectData | null{
    return this.state.selectedData;
  }

  public getQueueSelection(): go.ObjectData | null{
    return this.state.selectedDataQueue;
  }

  public setParamForDiagramNode(id: number, param: string, value: any){
    //todo implementacja
    this.setState(
      produce((draft: AppState) => {
        draft.nodeDataArray[0]["text"] = "dddd";
        draft.skipsDiagramUpdate = false;
      })
    );
  }

  public setParamForQueueNode(id: number, param: string, value: any){
    //todo implementacja
    this.setState(
      produce((draft: AppState) => {
        draft.nodeDataArray[0]["text"] = "dddd";
        draft.skipsDiagramUpdate = false;
      })
    );
  }

  focusOnNode(id: number){
    this.setState(
      produce((draft: AppState) => {
        draft.focus = id;
        draft.skipsDiagramUpdate = false;
      })
    );
  }
  reset(){
    this.setState(
      produce((draft: AppState) => {
        draft.focus = null;
        draft.skipsDiagramUpdate = false;
      })
    );
  }


  public render() {
    const selectedData = this.state.selectedData;
    let inspector;
    if (selectedData !== null) {
      inspector = <SelectionInspector
                    selectedData={this.state.selectedData}
                    onInputChange={this.handleInputChange}
                  />;
    }

    const Bar = styled(AppBar)({
        float: 'right',
        padding: '0px',
        //paddingLeft: '80px',
        paddingTop: '7px',
        paddingBottom: '7px',
    });



    return (
      <div className="root">
        <CssBaseline />
        <ThemeProvider theme={theme}>
        {/* <Grid item xs={12}>
          <Bar className="drag" position="fixed">
            <Container>
            <Button variant="contained" color="primary">
               Save
            </Button>

            </Container>
          </Bar>  
        </Grid> */}


         <DiagramWrapper
          nodeDataArray={this.state.nodeDataArray}
          modelData={this.state.modelData}
          skipsDiagramUpdate={this.state.skipsDiagramUpdate}
          onDiagramEvent={this.handleDiagramEvent}
          onModelChange={this.handleModelChange}
          setParamForQueueNode={this.setParamForQueueNode}
          getQueueSelection={this.getQueueSelection}
          focus={this.state.focus}
        />

        <Card className="card">
          <CardContent>
          <QueueWrapper
          nodeDataArray={this.state.nodeDataArrayQueue}
          modelData={this.state.modelDataQueue}
          skipsDiagramUpdate={this.state.skipsDiagramUpdate}
          onDiagramEvent={this.handleDiagramEvent}
          onModelChange={this.handleModelChange}
          setParamForDiagramNode={this.setParamForDiagramNode}
          getDiagramSelection={this.getDiagramSelection}
          focusOnNode={this.focusOnNode}
          reset={this.reset}
        />
          </CardContent>
        </Card>

        </ThemeProvider>
      </div>
      
      

    );
  }
}

export default App;
