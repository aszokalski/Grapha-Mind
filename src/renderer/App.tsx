/*
*  Copyright (C) 1998-2020 by Northwoods Software Corporation. All Rights Reserved.
*/

import * as go from 'gojs';
import { produce } from 'immer';
import * as React from 'react';

import { Grid, Typography, Container, AppBar, IconButton, Tabs, Tab, Box, CssBaseline, Card, CardContent, Button, ThemeProvider, createMuiTheme, Icon} from '@material-ui/core';
import { styled } from '@material-ui/core/styles';

import { DiagramWrapper } from './components/DiagramWrapper';
import { SelectionInspector } from './components/SelectionInspector';
import {CustomLink} from './extensions/CustomLink';

import {UIButton} from './components/ui/UIButton';
import {UIPopup} from './components/ui/UIPopup';
import {UITextBox} from './components/ui/UITextBox';

import './styles/App.css';
import { DraftsTwoTone } from '@material-ui/icons';

import { download, modify, add, remove } from '../server';
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
  verticalButtonDisabled: boolean;
  showPopup: boolean;
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
  public wrapperRef: React.RefObject<DiagramWrapper>;
  
  constructor(props: object) {
    super(props);
    this.state = {
      nodeDataArray: [
        //{ key: 0, text: 'Alpha', loc: "0 0", diagram: "main", parent: 0, deletable: false, dir: "right", depth: 0, scale: 1, font: "28pt Nevermind-Medium", id: "82j", order: 0, presentationDirection:"horizontal", hidden: false },
      ],
      modelData: {
        // Jakieś parametry modelu
      },
      selectedData: null,
      skipsDiagramUpdate: false,
      focus: 0,
      graphId: "",
      verticalButtonDisabled: false,
      showPopup: false
    }; 

    //initiate graph object in backend and set unique graphId for the workplace
    download('').then(data =>{
      this.setState(
        produce((draft: Appstate) => {//ten error kurwa skąd
          draft.graphId = data._id.toString();
          var dymki = data.nodes;
          for(let node of dymki){
            var klucze = Object.keys(node);
            for(var i = 0;i<klucze.length;i++){
              var tempObj = Reflect.get(node,klucze[i]);
              if(typeof tempObj === 'object'){
                Reflect.set(node, klucze[i], parseInt(Reflect.get(tempObj,Object.keys(tempObj)[0])));
              }
            }
          }
          draft.nodeDataArray=dymki;
          draft.skipsDiagramUpdate=false;
          this.refreshNodeIndex(draft.nodeDataArray);
        })
      )
    });

    // init maps
    this.mapNodeKeyIdx = new Map<go.Key, number>();
    this.refreshNodeIndex(this.state.nodeDataArray);
    // bind handler methods
    this.handleDiagramEvent = this.handleDiagramEvent.bind(this);
    this.handleModelChange = this.handleModelChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);

    //bindowanie this
    this.nextSlide = this.nextSlide.bind(this);
    this.setHorizontal = this.setHorizontal.bind(this);
    this.setVertical = this.setVertical.bind(this);
    this.toggleHidden = this.toggleHidden.bind(this);
    this.typing = this.typing.bind(this);
    this.add = this.add.bind(this);
    this.addUnder = this.addUnder.bind(this);
    this._handleKeyDown = this._handleKeyDown.bind(this);
    this.togglePopup = this.togglePopup.bind(this);
    this.copyCode = this.copyCode.bind(this);
    this.handleCode = this.handleCode.bind(this);
    this.wrapperRef = React.createRef();
    
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

  _handleKeyDown = (event: any) => {
    switch( event.keyCode ) {
      case 9:
        this.add();
        break;
      case 13:
        this.addUnder();
        break;
      default: 
        this.typing();
        break;
  }

    
}

componentDidMount(){
  document.addEventListener("keydown", this._handleKeyDown);
}


componentWillUnmount() {
  document.removeEventListener("keydown", this._handleKeyDown);
}

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
                  draft.verticalButtonDisabled = !(draft.selectedData['presentationDirection'] === 'horizontal');
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
          if(this.state.nodeDataArray!==[]){
            for(let node of modifiedNodeData){
              modify(this.state.graphId,node);
            }
          }
        }
        if (insertedNodeKeys) {
          insertedNodeKeys.forEach((key: go.Key) => {
            const nd = modifiedNodeMap.get(key);
            const idx = this.mapNodeKeyIdx.get(key);
            if (nd && idx === undefined) {  // nodes won't be added if they already exist
              this.mapNodeKeyIdx.set(nd.key, narr.length);
              narr.push(nd);
              add(this.state.graphId, nd);
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
          for(let node of removedNodeKeys){
            node=(node*-1)-1;//kurwa tego nie rozumiem
            remove(this.state.graphId,node);
          }
        }
        // handle model data changes, for now just replacing with the supplied object
        if (modifiedModelData) {
          draft.modelData = modifiedModelData;
        }
        draft.skipsDiagramUpdate = true;  // the GoJS model already knows about these updates
      })
    );
    
    //Hide hidden links
    var ref = this.wrapperRef.current;
    if(ref){
      var ref2 = ref.diagramRef.current;
      if(ref2){
        var dia = ref2.getDiagram();
        if (dia) {
          let it = dia.links;
          while(it.next()){
            let n = it.value.toNode;
            if(n  && n.data.hidden){
              (it.value as CustomLink).toggle(true);
            }
          }
        }
      }
    }
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
    var ref = this.wrapperRef.current;
    if(ref){
      var ref2 = ref.diagramRef.current;
      if(ref2){
        var dia = ref2.getDiagram();
        if (dia) {
          if(dia.toolManager.textEditingTool.state === go.TextEditingTool.StateNone){
            ref.nextSlide();
          }
        }
      }
    }
  }

  setVertical(){
    this.setState(
      produce((draft: AppState) => {
        if(draft.selectedData === null) return;
        const data = draft.selectedData as go.ObjectData;  // only reached if selectedData isn't null
        data['presentationDirection'] = 'vertical';
        const key = data.key;
        const idx = this.mapNodeKeyIdx.get(key);
        if (idx !== undefined && idx >= 0) {
          draft.nodeDataArray[idx] = data;
          draft.skipsDiagramUpdate = false;
          draft.verticalButtonDisabled = true;
        }  
      })
    );
  }

  setHorizontal(){
    this.setState(
      produce((draft: AppState) => {
        if(draft.selectedData === null) return;
        const data = draft.selectedData as go.ObjectData;  // only reached if selectedData isn't null
        data['presentationDirection'] = 'horizontal';
        const key = data.key;
        const idx = this.mapNodeKeyIdx.get(key);
        if (idx !== undefined && idx >= 0) {
          draft.nodeDataArray[idx] = data;
          draft.skipsDiagramUpdate = false;
          draft.verticalButtonDisabled = false;
        }
      })
    );
  }

  toggleHidden(){
    if(this.state.selectedData === null) return;
    let h = !this.state.selectedData['hidden'];
    var ref = this.wrapperRef.current;
    if(ref){
      var ref2 = ref.diagramRef.current;
      if(ref2){
        var dia = ref2.getDiagram();
        if (dia) {
          let n = dia.findNodeForKey(this.state.selectedData['key']);
          if(n !== null){
            this.hideRecursive(n, h);
          }
        }
      }
    }

    this.setState(
      produce((draft: AppState) => {
        if(draft.selectedData === null) return;
        const data = draft.selectedData as go.ObjectData;  // only reached if selectedData isn't null
        if(data['key'] === 0){
          data['hidden'] = !data['hidden'];
        } else{
          let h = !data['hidden'];
          data['hidden'] = h

        }
        
        const key = data.key;
        const idx = this.mapNodeKeyIdx.get(key);
        if (idx !== undefined && idx >= 0) {
          draft.nodeDataArray[idx] = data;
          draft.skipsDiagramUpdate = false;
          draft.verticalButtonDisabled = false;
        }
      })
    );
  }


  hideRecursive(n: go.Node, h: boolean){
    let it = n.findTreeChildrenNodes();
    let linkf = n.findLinksInto().first() as CustomLink;
    if(linkf){
      linkf.toggle(h);
    }
    while(it.next()){
      this.setState(
        produce((draft: AppState) => {
          if(draft.selectedData === null) return;
          const data = draft.selectedData as go.ObjectData;  // only reached if selectedData isn't null
          let it = n.findTreeChildrenNodes();
          while(it.next()){
            let c = this.mapNodeKeyIdx.get(it.value.key);
            if(c !== undefined){
              draft.nodeDataArray[c]['hidden'] = h;
              let link = it.value.findLinksInto().first() as CustomLink;
              if(link){
                link.toggle(h);
              }
              this.hideRecursive(it.value, h);
            }
          }
          draft.skipsDiagramUpdate = false;
        })
      );
    }
  }

  typing(){
    var ref = this.wrapperRef.current;
    if(ref){
      var ref2 = ref.diagramRef.current;
      if(ref2){
        var dia = ref2.getDiagram();
        if (dia) {
          if(dia.toolManager.textEditingTool.state === go.TextEditingTool.StateNone){
            var e = dia.lastInput;
            var cmd = dia.commandHandler;
            let sel = dia.selection.first();
            if ((e.key.length === 0 || !e.key.trim()) //Fix of the empty key bug
                || (!e.meta && !e.control && e.key.length < 2 && ((e.key.charCodeAt(0) > 47 && e.key.charCodeAt(0) < 91) || 
                (e.key.charCodeAt(0) > 95  && e.key.charCodeAt(0) < 112) || 
                (e.key.charCodeAt(0) > 160  && e.key.charCodeAt(0) < 166) ||
                e.key.charCodeAt(0) === 170 || e.key.charCodeAt(0) === 171 || 
                (e.key.charCodeAt(0) > 186  && e.key.charCodeAt(0) < 232)))) {  // could also check for e.control or e.shift
              if(sel){
                let textBox = sel.findObject("TEXT");
                if(textBox instanceof go.TextBlock){
                  dia.startTransaction();
                  textBox.text = '';
                  dia.commitTransaction("Clear");
                  dia.toolManager.textEditingTool.selectsTextOnActivate = false;
                  cmd.editTextBlock(textBox);
                  go.CommandHandler.prototype.doKeyDown.call(cmd); //Rerun so the textbox records this character
                  dia.toolManager.textEditingTool.selectsTextOnActivate = true;
                }
              
              }
              
            }
          }
        }
      }
    }
  }

  add(){
    var ref = this.wrapperRef.current;
    if(ref){
      var ref2 = ref.diagramRef.current;
      if(ref2){
        var dia = ref2.getDiagram();
        if (dia) {
          if(dia.toolManager.textEditingTool.state === go.TextEditingTool.StateNone){
            ref.addNodeFromSelection(true);
          }
        }
      }
    }
  }

  addUnder(){
    var ref = this.wrapperRef.current;
    if(ref){
      var ref2 = ref.diagramRef.current;
      if(ref2){
        var dia = ref2.getDiagram();
        if (dia) {
          if(dia.toolManager.textEditingTool.state === go.TextEditingTool.StateNone){
            ref.addNodeFromSelection();
          }
        }
      }
    }
  }

  togglePopup() {
    var ref = this.wrapperRef.current;
    if(ref){
      var ref2 = ref.diagramRef.current;
      if(ref2){
        var dia = ref2.getDiagram();
        if (dia) {
          dia.clearSelection()
        }
      }
    }

    this.setState(
      produce((draft: AppState) => {
        draft.showPopup = !draft.showPopup;
      })
    );
  }

  copyCode() {
      let str="HG673"
      // Create new element
      var el = document.createElement('textarea');
      // Set value (string to be copied)
      el.value = str;
      // Set non-editable to avoid focus and move outside of view
      el.setAttribute('readonly', '');
      document.body.appendChild(el);
      // Select text inside element
      el.select();
      // Copy text to clipboard
      document.execCommand('copy');

      //alert("Copied");
      // Remove temporary element
      document.body.removeChild(el);
  }

  handleCode(value: string){
    alert(value);
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
            <UIButton hidden={!this.state.selectedData} disabled={false} label="Topic" type={"topic"} onClick={this.addUnder}></UIButton>
            <UIButton hidden={!this.state.selectedData} disabled={false} label="Subtopic" type={"subtopic"} onClick={this.add}></UIButton>
            <Box width={25}></Box> {/* Spacing */}
            <UIButton hidden={!this.state.selectedData} disabled={this.state.verticalButtonDisabled} label="Vertical" type={"vertical"} onClick={this.setVertical}></UIButton>
            <UIButton hidden={!this.state.selectedData} disabled={!this.state.verticalButtonDisabled} label="Horizontal" type={"horizontal"} onClick={this.setHorizontal}></UIButton>
            <UIButton hidden={!this.state.selectedData} disabled={false} label="Hide" type={"hide"} onClick={this.toggleHidden}></UIButton>
            <Box width={25}></Box> {/* Spacing */}
            <UIButton hidden={false} disabled={false} label="Play" type={"play"} onClick={this.nextSlide}></UIButton>
            <Box width={25}></Box> {/* Spacing */}
            <UIButton hidden={false} disabled={false} label="Share" type={"share"} onClick={this.togglePopup}></UIButton>
            </Box>
            </Container>
          </Bar>  
          
          {this.state.showPopup ? 
          <UIPopup closePopup={this.togglePopup}>
            <div className="center">
              <br/>
            <span className="title"> Share</span>
              Your workplace code: <br/>
              <UITextBox type='copy' readOnly={true} value="HG673" placeholder="a" onSubmit={this.copyCode}/>
            <br/>
            <span  className="title">Join</span>
            Paste workplace code: <br/>
            <UITextBox type='submit' readOnly={false} value="" placeholder="a" onSubmit={this.handleCode}/>
            </div>
            
          </UIPopup>
          : null
          }
        
         <DiagramWrapper
          ref={this.wrapperRef}
          nodeDataArray={this.state.nodeDataArray}
          modelData={this.state.modelData}
          skipsDiagramUpdate={this.state.skipsDiagramUpdate}
          onDiagramEvent={this.handleDiagramEvent}
          onModelChange={this.handleModelChange}
        />
        {/* {inspector} */}
        </ThemeProvider>
      </div>
      
      

    );
  }
}

export default App;
