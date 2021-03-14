/*
*  Copyright (C) 1998-2020 by Northwoods Software Corporation. All Rights Reserved.
*/

import * as go from 'gojs';
import { produce } from 'immer';
import * as React from 'react';

import * as el from 'electron';
import * as fs from 'fs';
import * as eu from 'electron-util';
import * as path from 'path'

import{
  toggleHidden,
  toggleAccordion,
  toggleDrawer,
  toggleMenu,
  togglePopup,
  handleMenuClick,
  handleCloudChecked,
  handleTooltipClose,
  closeSnackbar
} from './handlers/UIhandlers'

import {
  Snackbar, 
  Box, 
  CssBaseline, 
  ThemeProvider, 
} from '@material-ui/core';

import LinearProgress, { LinearProgressProps } from '@material-ui/core/LinearProgress';


import { DiagramWrapper } from './components/DiagramWrapper';
import {CustomLink} from './extensions/CustomLink';
import {EditorTopBar} from './components/EditorTopBar'
import {CoworkingDrawer} from './components/CoworkingDrawer'

import {Bar, 
  theme} from './components/ui/StyledMUI';

import {SplashScreen} from './screens/SplashScreen';


import './styles/App.css';

import { 
  download, 
  modify, 
  add, 
  remove, 
  check_cred, 
  create_user, 
  change_password, 
  activate_license, 
  remove_user, 
  create_workplace, 
  remove_workplace, 
  rename_workplace} from '../server';

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
  showSplash: boolean;
  username: string;
  warning: string;
  saved: boolean;
  first: boolean;
  path: string | null;
  inPresentation : boolean;
  snackbarVisible : boolean;
  slideNumber : number;
  openDrawer : boolean;
  openMenu : boolean;
  openAccordion : boolean;
  anchorEl : any;
  cloudSaved : boolean;
  cloudSaving : boolean;
  cloudChecked : boolean;
  openTooltip : boolean;
}

function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
  return (
    <Box display="flex" alignItems="center">
      <Box width="100%">
        <LinearProgress variant="determinate" {...props} />
      </Box>
      {/* <Box minWidth={35}>
        <Typography variant="body2" color="textSecondary">{`${Math.round(
          props.value,
        )}%`}</Typography>
      </Box> */}
    </Box>
  );
}

class App extends React.Component<{}, AppState> {
  // Maps to store key -> arr index for quick lookups
  private mapNodeKeyIdx: Map<go.Key, number>;
  public wrapperRef: React.RefObject<DiagramWrapper>;
  public presBar: any;
  
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
      showPopup: false,
      showSplash: true,
      username: "",
      warning: "",
      saved: false,
      first: false,
      path: null,
      inPresentation: false,
      snackbarVisible: false, 
      slideNumber: 0,
      openDrawer: false,
      openMenu: false,
      anchorEl: null,
      openAccordion: false,
      cloudSaved: false,
      cloudSaving: false,
      cloudChecked: false,
      openTooltip: false,
    };
    //initiate graph object in backend and set unique graphId for the workplace
    // download('').then(data =>{
    //   this.setState(
    //     produce((draft: AppState) => {//ten error kurwa skąd
    //       draft.graphId = data._id.toString();
    //       var dymki = data.nodes;
    //       for(let node of dymki){
    //         var klucze = Object.keys(node);
    //         for(var i = 0;i<klucze.length;i++){
    //           var tempObj = Reflect.get(node,klucze[i]);
    //           if(typeof tempObj === 'object'){
    //             Reflect.set(node, klucze[i], parseInt(Reflect.get(tempObj,Object.keys(tempObj)[0])));
    //           }
    //         }
    //       }
    //       draft.nodeDataArray=dymki;
    //       draft.skipsDiagramUpdate=false;
    //       this.refreshNodeIndex(draft.nodeDataArray);
    //     })
    //   )
    // });

    // init maps
    this.mapNodeKeyIdx = new Map<go.Key, number>();
    this.refreshNodeIndex(this.state.nodeDataArray);
    // bind handler methods
    this.handleDiagramEvent = this.handleDiagramEvent.bind(this);
    this.handleModelChange = this.handleModelChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);

    //bindowanie this
    this.nextSlide = this.nextSlide.bind(this);
    this.previousSlide = this.previousSlide.bind(this);
    this.stopPresentation = this.stopPresentation.bind(this);
    this.startPresentation = this.startPresentation.bind(this);
    this.updateSlideNumber = this.updateSlideNumber.bind(this);
    this.setHorizontal = this.setHorizontal.bind(this);
    this.setVertical = this.setVertical.bind(this);
    this.uploadToCloud = this.uploadToCloud.bind(this);
    this.typing = this.typing.bind(this);
    this.add = this.add.bind(this);
    this.addUnder = this.addUnder.bind(this);
    this._handleKeyDown = this._handleKeyDown.bind(this);
    this._handleClick = this._handleClick.bind(this);
    
    this.copyCode = this.copyCode.bind(this);
    this.handleCode = this.handleCode.bind(this);
    this.createNew = this.createNew.bind(this);
    this.save = this.save.bind(this);
    this.load = this.load.bind(this);
    this.loadFilename = this.loadFilename.bind(this);
    this.copyInvite = this.copyInvite.bind(this);
    this.authorize = this.authorize.bind(this);
    this.deauthorize = this.deauthorize.bind(this);

    this.wrapperRef = React.createRef();
  }

  toggleHidden = toggleHidden.bind(this);
  toggleDrawer = toggleDrawer.bind(this);
  toggleMenu = toggleMenu.bind(this);
  toggleAccordion = toggleAccordion.bind(this);
  handleMenuClick = handleMenuClick.bind(this);
  handleTooltipClose= handleTooltipClose.bind(this);
  handleCloudChecked = handleCloudChecked.bind(this);
  togglePopup = togglePopup.bind(this);
  closeSnackbar = closeSnackbar.bind(this);

  /**
   * Update map of node keys to their index in the array.
   */
  private refreshNodeIndex(nodeArr: Array<go.ObjectData>) {
    this.mapNodeKeyIdx.clear();
    nodeArr.forEach((n: go.ObjectData, idx: number) => {
      this.mapNodeKeyIdx.set(n.key, idx);
    });
  }



  //User Input Handlers
  private _handleKeyDown = (event: any) => {
      if((event.ctrlKey && event.shiftKey)  || (event.metaKey && event.shiftKey)){
        switch (String.fromCharCode(event.which).toLowerCase()) {
          case 's':
              event.preventDefault();
              this.save(true);
              break;
        }
      }
      else if(event.ctrlKey || event.metaKey){
        switch (String.fromCharCode(event.which).toLowerCase()) {
          case 's':
              event.preventDefault();
              this.save();
              break;
          case 'o':
              event.preventDefault();
              this.load();
              break;
          case 'n':
            event.preventDefault();
            this.createNew();
            break;
          case 'p':
            event.preventDefault();
            this.togglePopup();
            break;
      }
    }

      switch( event.keyCode ) {
        case 9:
          if(this.state.inPresentation) return;
          this.add();
          break;
        case 13:
          if(this.state.inPresentation) return;
          this.addUnder();
          break;
        case 27:
          this.stopPresentation();
          break;
        case 39:
          this.nextSlide();
          break;
        case 37:
          this.previousSlide();
          break;
        default: 
          if(this.state.inPresentation) return;
          this.typing();
          break;
    }

    if(this.state.inPresentation){
      event.stopPropagation();
      event.preventDefault();
    }
  }

  private _handleClick = (event: any) => {
    if(this.state.inPresentation){
      // this.presBar.focus();
    }
  }

  componentDidMount(){
    document.addEventListener("keydown", this._handleKeyDown);
    document.addEventListener("click",this._handleClick,true);

    //Linking native menu actions
    el.ipcRenderer.on('new-project', this.createNew);
    el.ipcRenderer.on('save', ()=>{this.save(false)});
    el.ipcRenderer.on('save-as', ()=>{this.save(true)});
    el.ipcRenderer.on('open', this.load);
    el.ipcRenderer.on('share', this.togglePopup);

    ///Loading username from local storage
    let authJSON = localStorage.getItem('username');
    this.setState(
      produce((draft: AppState) => {
        if(authJSON !== null){
          draft.username = JSON.parse(authJSON);
        }
      }))


    //Handling closing before saving
    let closeWindow = false

    window.addEventListener('beforeunload', evt => {
      if (closeWindow || this.state.showSplash || this.state.saved) return

      evt.returnValue = false

      setTimeout(() => {
          var dialog = el.remote.dialog;
          let result = dialog.showMessageBox({
              message: 'Save your work',
              buttons: ['Save', "Don't Save", 'Cancel'],
              defaultId: 0
          })

          if (result == 0) {
              closeWindow = true;
              this.save(false);
              var remote = el.remote;
              remote.getCurrentWindow().close()
          } else if(result == 1){
            closeWindow = true;
            var remote = el.remote;
            remote.getCurrentWindow().close()
          }
      })
    })
  }


  componentWillUnmount() {
    //Remove listeners
    document.removeEventListener("keydown", this._handleKeyDown);
    document.removeEventListener("click", (e:any)=>{
      if(this.state.inPresentation){
        e.preventDefault();
      }
    });
  }


  //Diagram event handler
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
              // modify(this.state.graphId,node);
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
              // add(this.state.graphId, nd);
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

            node=((node as number)*-1)-1;//kurwa tego nie rozumiem
            // remove(this.state.graphId,node);
          }
        }
        // handle model data changes, for now just replacing with the supplied object
        if (modifiedModelData) {
          draft.modelData = modifiedModelData;
        }
        draft.skipsDiagramUpdate = true;  // the GoJS model already knows about these updates
      })
    );
    
    this.setState(
      produce((draft: AppState) => {
        if(!this.state.first){
          draft.saved = false;
        } else{
          draft.first = false;
          draft.saved = true;
        }
        
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

  
  //GOJS actions
  private nextSlide(first:boolean = false){
    if(!this.state.inPresentation && !first) return;
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

      if(!first){
        produce((draft: AppState) => {
          draft.snackbarVisible = false;
        })
      }
  }

  private previousSlide(first:boolean = false){
    if(!this.state.inPresentation && !first) return;
    var ref = this.wrapperRef.current;
      if(ref){
        var ref2 = ref.diagramRef.current;
        if(ref2){
          var dia = ref2.getDiagram();
          if (dia) {
            if(dia.toolManager.textEditingTool.state === go.TextEditingTool.StateNone){
              ref.previousSlide();
            }
          }
        }
      }
  }

  private add(){
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

  private addUnder(){
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

  private setVertical(){
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

  private setHorizontal(){
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

  private startPresentation(){
    this.setState(
      produce((draft: AppState) => {
        draft.inPresentation = true;
        draft.snackbarVisible = true;
      })
    );

    var ref = this.wrapperRef.current;
      if(ref){
        var ref2 = ref.diagramRef.current;
        if(ref2){
          var dia = ref2.getDiagram();
          if (dia) {
            dia.scrollMode = go.Diagram.InfiniteScroll; //TODO: Wyłącz po prezentacji
            dia.allowHorizontalScroll = false;
            dia.allowVerticalScroll = false;
            dia.allowSelect = false;
            dia.isModelReadOnly = true;
            dia.clearHighlighteds();
            dia.clearSelection();
          }
        }
      } 

    eu.activeWindow().setFullScreen(true);

    setTimeout(()=>{this.nextSlide(true);}, 1000);

  }

  private stopPresentation(){
    if(!this.state.inPresentation) return;
    eu.activeWindow().setFullScreen(false);
    this.setState(
      produce((draft: AppState) => {
        draft.inPresentation = false;
      })
    );

    var ref = this.wrapperRef.current;
    if(ref){
      var ref2 = ref.diagramRef.current;
      if(ref2){
        var dia = ref2.getDiagram();
        if (dia) {
          dia.scrollMode = go.Diagram.DocumentScroll; //TODO: Wyłącz po prezentacji
          dia.allowHorizontalScroll = true;
          dia.allowVerticalScroll = true;
          dia.allowSelect = true;
          dia.isModelReadOnly = false;
        }
      }

      setTimeout(()=>{if(ref) ref.stopPresentation();}, 500);
    
    } 

  }

  private updateSlideNumber(n : number){
    this.setState(
      produce((draft: AppState) => {
        draft.slideNumber = n;
      })
    );
  }

  private hideRecursive(n: go.Node, h: boolean){
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

  private typing(){
    if(this.state.inPresentation) return;
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





  //File Handlers
  private save(saveAs: boolean = false){
    if(this.state.showSplash) {return;}
    const dialog = el.remote.dialog; 
    let saveData = {
      graphId: this.state.graphId,
      nodeDataArray: this.state.nodeDataArray
    }

    if(this.state.path && !saveAs){
      fs.writeFile(this.state.path, JSON.stringify(saveData), (err) => {
        if(err){
            alert("An error ocurred creating the file "+ err.message)
            return;
        }

        this.setState(
          produce((draft: AppState) => {
            draft.saved = true;
          })
        );
        
        let projectList = localStorage.getItem('projectList');
        if(projectList){
          let projectListObj = JSON.parse(projectList);
          let pass = true;
          for(let project of projectListObj){
            if(project.path === this.state.path){
              pass = false;
            }
          }
          if(pass && this.state.path){
            let fname = path.parse(this.state.path).base;
            projectListObj.push({name: fname, path: this.state.path})
          }
  
          localStorage.setItem('projectList', JSON.stringify(projectListObj));
        } else{
          let projectListObj = [];

          if(this.state.path){
            let fname = path.parse(this.state.path).base;
            projectListObj.push({name: fname, path: this.state.path})
            localStorage.setItem('projectList', JSON.stringify(projectListObj));
          }
        }
        return;
      });
      return;
    }

    dialog.showSaveDialog({ 
      title: 'Select the File Path to save', 
      defaultPath: '', 
      // defaultPath: path.join(__dirname, '../assets/'), 
      buttonLabel: 'Save', 
      // Restricting the user to only Text Files. 
      filters: [ 
          { 
              name: 'Mind Maps', 
              extensions: ['mind'] 
          }, ], 
      properties: [] 
  } as el.SaveDialogOptions,(fileName) => {
      if (fileName === undefined){
          console.log("You didn't save the file");
          return;
      }
  
      // fileName is a string that contains the path and filename created in the save file dialog.  
      fs.writeFile(fileName, JSON.stringify(saveData), (err) => {
          if(err){
              alert("An error ocurred creating the file "+ err.message)
              return;
          }

          this.setState(
            produce((draft: AppState) => {
              draft.saved = true;
              draft.path = fileName;
            })
          );
          
          let projectList = localStorage.getItem('projectList');
          if(projectList){
            let projectListObj = JSON.parse(projectList);
            let pass = true;
            for(let project of projectListObj){
              if(project.path === fileName){
                pass = false;
              }
            }
            if(pass){
              let fname = path.parse(fileName).base;
              projectListObj.push({name: fname, path: this.state.path})
            }

            localStorage.setItem('projectList', JSON.stringify(projectListObj));
          } else{
            let projectListObj = [];
            projectListObj.push({name: fileName, path: fileName})
            localStorage.setItem('projectList', JSON.stringify(projectListObj));
          }
      });
    }); 
  }

  private load(){
    const dialog = el.remote.dialog; 
    dialog.showOpenDialog({ 
      title: 'Select the File to open', 
      buttonLabel: 'Open', 
      // Restricting the user to only Text Files. 
      filters: [ 
          { 
              name: 'Mind Maps', 
              extensions: ['mind'] 
          }, ], 
  } as el.OpenDialogOptions, (fileNames) => {
      // fileNames is an array that contains all the selected
      if(fileNames === undefined){
          console.log("No file selected");
          return;
      }
  
      fs.readFile(fileNames[0], 'utf-8', (err, data) => {
          if(err){
              alert("An error ocurred reading the file :" + err.message);
              return;
          }
  
         
          let saveData = JSON.parse(data);

          this.setState(
            produce((draft: AppState) => {
              draft.nodeDataArray = saveData['nodeDataArray'];
              draft.graphId = saveData['graphId']
              draft.skipsDiagramUpdate = false;
              draft.showSplash = false;
              draft.path = fileNames[0];
              this.refreshNodeIndex(draft.nodeDataArray);
              draft.saved = true;
              draft.first = true;
            }))
      });
  });
  }

  private loadFilename(filename: string){
    fs.readFile(filename, 'utf-8', (err, data) => {
      if(err){
          alert("An error ocurred reading the file :" + err.message);
          return;
      }

     
      let saveData = JSON.parse(data);

      this.setState(
        produce((draft: AppState) => {
          draft.nodeDataArray = saveData['nodeDataArray'];
          draft.graphId = saveData['graphId']
          draft.skipsDiagramUpdate = false;
          draft.showSplash = false;
          draft.path = filename;
          draft.saved = true;
          draft.first = true;
          this.refreshNodeIndex(draft.nodeDataArray);
        }))
  });
  }

  private createNew(){
    this.setState(
      produce((draft: AppState) => {
        draft.nodeDataArray = [
          { key: 0, text: 'Central Topic', loc: "0 0", diagram: "main", parent: 0, deletable: false, dir: "right", depth: 0, scale: 1, font: "28pt Nevermind-Medium", id: "82j", order: 0, presentationDirection:"horizontal" },
        ];
        draft.skipsDiagramUpdate = false;
        draft.showSplash = false;
        this.refreshNodeIndex(draft.nodeDataArray);
      }))
  }


  //Backend Links
  private uploadToCloud(upload: boolean){
    setTimeout(()=>{
      if(upload){
        //TODO: Uploading
        this.setState({cloudSaved: true, cloudSaving: false});
      } else{
        //TODO: Removing and revoking access
        this.setState({cloudSaved: false, cloudSaving: false});
      }
      
    }, 3000)
  }

   //TODO: Outdated
  private copyCode() {
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

  //TODO: Outdated
  private handleCode(value: string){
    alert(value);
  }

  private copyInvite(){
    //TODO: copy invite link
    this.setState(produce((draft: AppState) => {
      draft.openTooltip = true;
    }));
  }

  private authorize(username: string, password: string){
    if(username === "" && password === ""){
      this.setState(
        produce((draft: AppState) => {
          draft.warning = "No data entered"
        }))
        return;
    }
    else if(username === "" ){
      this.setState(
        produce((draft: AppState) => {
          draft.warning = "No username entered"
        }))
        return;
    }
    else if(password === "" ){
      this.setState(
        produce((draft: AppState) => {
          draft.warning = "No password entered"
        }))
        return;
    }

    this.setState(
      produce((draft: AppState) => {
        draft.warning = "";
        //TODO:
        draft.username = username;

        localStorage.setItem('username', JSON.stringify(username));
      }))
  }

  private deauthorize(){
    this.setState(
      produce((draft: AppState) => {
        draft.username = "";
        localStorage.removeItem('username');
      }))
  }

  public render() {
    let presIndex = 0;
    let total = 0;
    var ref = this.wrapperRef.current;
    if(ref){
      var ref2 = ref.diagramRef.current;
      if(ref2){
        var dia = ref2.getDiagram();
        if (dia) {
          total = dia.nodes.count;
          let it = dia.nodes;
          let hidden = 0;
          while(it.next()){
            if(it.value.data.hidden){
              hidden++;
            }
          }
          total -= hidden;
        }
      }
      presIndex = this.state.slideNumber+1;
    }

    return (
      <div className="root" >
        <CssBaseline />
        <ThemeProvider theme={theme}>

          {this.state.showSplash ? 

          // SPLASH SCREEN
          <>
          <SplashScreen 
            handleCode={this.handleCode} 
            load={this.load} 
            loadFilename={this.loadFilename} 
            createNew={this.createNew} 
            authorize={this.authorize} 
            deauthorize={this.deauthorize} 
            username={this.state.username} 
            warning={this.state.warning}/>
          </>
          :
          <>
          {(!this.state.inPresentation)? 

          //EDiTOR TOP BAR

          <EditorTopBar 
            selectedData={this.state.selectedData}
            add={this.add}
            addUnder={this.addUnder}
            setVertical={this.setVertical}
            setHorizontal={this.setHorizontal}
            toggleHidden={this.toggleHidden}
            startPresentation={this.startPresentation}
            togglePopup={this.togglePopup}
            toggleDrawer={this.toggleDrawer}
            verticalButtonDisabled={this.state.verticalButtonDisabled}
            path={this.state.path}
            saved={this.state.saved}
            save={this.save}
          />

          : 
          
            //PRESENTATION FULLSCREEN BAR

          <Bar color="secondary" className="bar" position="fixed">
            <Box height={60} p={3} display="flex" justifyContent="center" ></Box>
          </Bar>
          }

          {/* MAIN */}
          
          <CoworkingDrawer
             openDrawer={this.state.openDrawer}
             openAccordion={this.state.openAccordion}
             openTooltip={this.state.openTooltip}
             cloudSaving={this.state.cloudSaving}
             cloudSaved={this.state.cloudSaved}
             cloudChecked={this.state.cloudChecked}
             anchorEl={this.state.anchorEl}
             toggleDrawer={this.toggleDrawer}
             toggleMenu={this.toggleMenu}
             handleMenuClick={this.handleMenuClick}
             toggleAccordion={this.toggleAccordion}
             handleCloudChecked={this.handleCloudChecked}
             handleTooltipClose={this.handleTooltipClose}
             copyInvite={this.copyInvite}
          />

          <Snackbar open={this.state.snackbarVisible} message="Use ⇦ ⇨ to navigate. Click Esc to stop" autoHideDuration={6000} onClose={this.closeSnackbar}/>
      
          <DiagramWrapper
            ref={this.wrapperRef}
            nodeDataArray={this.state.nodeDataArray}
            modelData={this.state.modelData}
            skipsDiagramUpdate={this.state.skipsDiagramUpdate}
            onDiagramEvent={this.handleDiagramEvent}
            onModelChange={this.handleModelChange}
            stopPresentation={this.stopPresentation}
            updateSlideNumber={this.updateSlideNumber}
          />


        {(this.state.inPresentation)?
          <div className="progress">
          <LinearProgressWithLabel value={(presIndex/total)*100} />
      </div>
      : null
        }
          

        {/* {inspector} */}
        </>
      }
          
        </ThemeProvider>
      </div>
      
      

    );
  }
}

export default App;
