/*
*  Copyright (C) 1998-2020 by Northwoods Software Corporation. All Rights Reserved.
*/

import * as go from 'gojs';
import { produce } from 'immer';
import * as React from 'react';
import axios from 'axios';

import { Grid, Typography, Container, AppBar, IconButton, Tabs, Tab, Box, CssBaseline, Card, CardContent, Button, ThemeProvider, createMuiTheme, Icon} from '@material-ui/core';
import { styled } from '@material-ui/core/styles';

import { DiagramWrapper } from './components/DiagramWrapper';
import { SelectionInspector } from './components/SelectionInspector';

import {UIButton} from './components/ui/UIButton';

import './styles/App.css';
import { DraftsTwoTone } from '@material-ui/icons';
/**
 * Use a linkDataArray since we'll be using a GraphLinksModel,
 * and modelData for demonstration purposes. Note, though, that
 * both are optional props in ReactDiagram.
 */
interface AppState {
  nodeDataArray: Array<go.ObjectData>;
  modelData: go.ObjectData;
  selectedData: go.ObjectData | null;
  skipsDiagramUpdate: boolean;
  focus: number;
  graphId: string;
}



const theme = createMuiTheme({
    palette: {
      primary: {
        main: '#202122',
      },
      secondary: {
        main: 'rgb(250, 250, 250)'
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
        { key: "0", text: 'Alpha', loc: "0 0", diagram: "main", parent: "0", deletable: false, dir: "right", depth: 0, scale: 1, font: "28pt Nevermind-Medium", id: "82j", order: 0, presentationDirection:"vertical" },
      ],
      modelData: {
        // Jakieś parametry modelu
      },
      selectedData: null,
      skipsDiagramUpdate: false,
      focus: 0,
      graphId: ""
    }; 

    //initiate graph object in backend and set unique graphId for the workplace
    axios.post('https://webhooks.mongodb-realm.com/api/client/v2.0/app/1mind-backend-rbynq/service/1mind/incoming_webhook/returngraph',Object(2)).then(res => {
      this.setState(
        produce((draft: AppState) => {
          // draft.nodeDataArray = [
          //   { key: 0, text: 'AlphaZero', loc: "0 0", diagram: "main", parent: 0, deletable: false, dir: "right", depth: 0, scale: 1, font: "28pt Nevermind-Medium", id: "82j", order: 0, presentationDirection:"horizontal" },
          // ];
          draft.graphId = res.data._id.$oid;
          var dymki = res.data.nodes;
          for(let node of dymki){
            var klucze=Object.keys(node);
            for(var i = 0;i<klucze.length;i++){
              var tempObj = Reflect.get(node,klucze[i]);         
              if(klucze[i] === 'depth'){
                  Reflect.set(node, klucze[i], parseInt(tempObj));
              }
              
              if(typeof tempObj ==="object"){
                Reflect.set(node, klucze[i], Reflect.get(tempObj,Object.keys(tempObj)[0]));
              }
            }
          }
          // console.log(draft.nodeDataArray);
          // console.log(dymki);
          draft.nodeDataArray = dymki;


          //console.log(res.data.nodes);
          //console.log(draft.nodeDataArray,draft.graphId);
          draft.skipsDiagramUpdate = false;
          this.refreshNodeIndex(draft.nodeDataArray);
        }) 
      )
      
    });
    /*
    axios.post('https://webhooks.mongodb-realm.com/api/client/v2.0/app/1mind-backend-rbynq/service/1mind/incoming_webhook/initiategraph',this.state).then(res => {
      this.setState(
        produce((draft: AppState) => {
          draft.graphId=res.data.insertedId.$oid;
        })
      )}
    );
    */

    // init maps
    this.mapNodeKeyIdx = new Map<go.Key, number>();
    this.refreshNodeIndex(this.state.nodeDataArray);
    // bind handler methods
    this.handleDiagramEvent = this.handleDiagramEvent.bind(this);
    this.handleModelChange = this.handleModelChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);

    //bindowanie this
    this.nextSlide = this.nextSlide.bind(this);
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
            if (idx !== undefined) {
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
    console.log(this.state.nodeDataArray);
    axios.post('https://webhooks.mongodb-realm.com/api/client/v2.0/app/1mind-backend-rbynq/service/1mind/incoming_webhook/updategraph',this.state);//.then(res => console.log(res.data.$numberLong));
    // console.log(this.state); //this reacts to every state change
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

  nextSlide(){
    this.setState(
      produce((draft: AppState) => {
        draft.focus += 1;;
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
          
          <Bar color="secondary" className="bar" position="fixed">
            <Container>
            <Box display="flex" justifyContent="center" >
            <UIButton label="Add" type={"add"} onClick={this.nextSlide}></UIButton>
            <Box width={25}></Box> {/* Spacing */}
            <UIButton label="Vertical" type={"vertical"} onClick={this.nextSlide}></UIButton>
            <UIButton label="Horizontal" type={"horizontal"} onClick={this.nextSlide}></UIButton>
            <Box width={25}></Box> {/* Spacing */}
            <UIButton label="Play" type={"play"} onClick={this.nextSlide}></UIButton>
            <Box width={25}></Box> {/* Spacing */}
            <UIButton label="Share" type={"share"} onClick={this.nextSlide}></UIButton>
            </Box>
            </Container>
          </Bar>  
          
          
        
         <DiagramWrapper
          nodeDataArray={this.state.nodeDataArray}
          modelData={this.state.modelData}
          skipsDiagramUpdate={this.state.skipsDiagramUpdate}
          onDiagramEvent={this.handleDiagramEvent}
          onModelChange={this.handleModelChange}
          focus={this.state.focus}
        />
        {/* {inspector} */}
        </ThemeProvider>
      </div>
      
      

    );
  }
}

export default App;
