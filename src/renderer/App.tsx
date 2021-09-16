import * as go from 'gojs';
import { produce } from 'immer';
import * as React from 'react';

import { 
  runstream, 
  handleTransaction,
  clear_workplace,
  P2P_transaction,
  leave_workplace
} from '../server';

import * as el from 'electron';

import {AppState} from '../models/AppState'

import{
  toggleHidden,
  toggleAccordion,
  toggleDrawer,
  toggleFormatDrawer,
  toggleFormatInspectorFocused,
  toggleMenu,
  toggleExportPopup,
  handleMenuClick,
  handleCloudChecked,
  handleTooltipClose,
  closeSnackbar
} from '../handlers/UIHandlers'

import{
  nextSlide,
  previousSlide,
  add,
  addUnder,
  setHorizontal,
  setVertical,
  startPresentation,
  stopPresentation,
  updateSlideNumber,
  hideRecursive,
  typing
} from '../handlers/DiagramActions'

import{
  handleDiagramEvent,
  handleInputChange,
  handleModelChange,
  refreshNodeIndex,
  resetSkipModelChange
} from '../handlers/DiagramHandlers'

import{
  save,
  load,
  loadFilename,
  createNew
} from '../handlers/FileHandlers'

import{
  uploadToCloud,
  copyInvite,
  authorize,
  deauthorize,
  copyCode,
  handleCode,
  makeHost,
  kickOut
} from '../handlers/BackendBindings'


import{
  handlePeerOpen,
  handlePeerConnection,
  connectToOtherUsers
} from '../handlers/P2PHandlers'

import{
  _handleClick,
  _handleKeyDown
} from '../handlers/UserActions'

import {
  Snackbar, 
  Box, 
  CssBaseline, 
  ThemeProvider, 
} from '@material-ui/core';
import { deepOrange, deepPurple } from '@material-ui/core/colors';

import { DiagramWrapper } from './components/DiagramWrapper';
import {EditorTopBar} from './components/EditorTopBar'
import {CoworkingDrawer} from './components/CoworkingDrawer'
import {FormatDrawer} from './components/FormatDrawer'
import {ExportPopup} from './components/ExportPopup'
import { PresentationProgressBar } from './components/PresentationProgressBar';

import {
  Bar, 
  theme
} from './components/ui/StyledMUI';

import {SplashScreen} from './screens/SplashScreen';


import '../static/styles/App.css';
import '../static/styles/Fonts.css';

import Peer from 'peerjs';

class App extends React.Component<{}, AppState> {
  // Maps to store key -> arr index for quick lookups
  private mapNodeKeyIdx: Map<go.Key, number>;
  public wrapperRef: React.RefObject<DiagramWrapper>;
  public presBar: any;
  public P2P_Peer: Peer | null;
  
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
      skipsModelChange: false,
      focus: 0,
      graphId: null,
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
      openFormatDrawer: true,
      anchorEl: null,
      openAccordion: false,
      openExportPopup: false,
      cloudSaved: true,
      cloudSaving: false,
      cloudChecked: true,
      openTooltip: false,
      coworkers: {"sirlemoniada" : {isClient: true, username: "sirlemoniada", name: "Igor Dmochowski", isHost: true, color: deepOrange[500]}, "aszokalski" : {isClient: false, username: "aszokalski", name: "Adam Szokalski", isHost: false, color: deepPurple[500]}},
      isHost: true,
      formatInspectorFocused: false,
      lastTransactionKey: [],
      pendingTransactions: {},
      localPeerID: null,
      peerConnections: {}
    };
    //initiate graph object in backend and set unique graphId for the workplace


    // init maps
    this.mapNodeKeyIdx = new Map<go.Key, number>();
    this.refreshNodeIndex(this.state.nodeDataArray);

    this.wrapperRef = React.createRef();
    // clear_workplace("");

    this.P2P_Peer = null;
  }
  //UI Handlers (./handlers/UIHandlers.ts)
  toggleHidden = toggleHidden.bind(this);
  toggleDrawer = toggleDrawer.bind(this);
  toggleFormatDrawer = toggleFormatDrawer.bind(this);
  toggleFormatInspectorFocused = toggleFormatInspectorFocused.bind(this);
  toggleMenu = toggleMenu.bind(this);
  toggleAccordion = toggleAccordion.bind(this);
  handleMenuClick = handleMenuClick.bind(this);
  handleTooltipClose= handleTooltipClose.bind(this);
  handleCloudChecked = handleCloudChecked.bind(this);
  toggleExportPopup = toggleExportPopup.bind(this);
  closeSnackbar = closeSnackbar.bind(this);

  //Diagram Actions (./handlers/DiagramActions.ts)
  nextSlide = nextSlide.bind(this);
  previousSlide = previousSlide.bind(this);
  add = add.bind(this);
  addUnder = addUnder.bind(this);
  stopPresentation = stopPresentation.bind(this);
  startPresentation = startPresentation.bind(this);
  updateSlideNumber = updateSlideNumber.bind(this);
  setHorizontal = setHorizontal.bind(this);
  setVertical = setVertical.bind(this);
  typing = typing.bind(this);
  hideRecursive = hideRecursive.bind(this);

  //Diagram Handlers (./handlers/DiagramHandlers.ts)
  handleDiagramEvent = handleDiagramEvent.bind(this);
  handleModelChange = handleModelChange.bind(this);
  handleInputChange = handleInputChange.bind(this);
  refreshNodeIndex = refreshNodeIndex.bind(this);
  resetSkipModelChange = resetSkipModelChange.bind(this);

  //File Handlers (./handlers/FileHandlers.ts)
  createNew = createNew.bind(this);
  save = save.bind(this);
  load = load.bind(this);
  loadFilename = loadFilename.bind(this);

  //Backend Bindings (./handlers/BackendBindings.ts)
  uploadToCloud = uploadToCloud.bind(this);
  copyCode = copyCode.bind(this);
  handleCode = handleCode.bind(this);
  copyInvite = copyInvite.bind(this);
  authorize = authorize.bind(this);
  deauthorize = deauthorize.bind(this);
  makeHost = makeHost.bind(this);
  kickOut = kickOut.bind(this);

  //Server
  runstream=runstream.bind(this);
  handleTransaction=handleTransaction.bind(this);
  P2P_transaction=P2P_transaction.bind(this);

  //Uv Actions (./handlers/UserActions.ts)
  _handleKeyDown = _handleKeyDown.bind(this);
  _handleClick = _handleClick.bind(this);

  //P2P Handlers (./handlers/P2PHandlers.ts)
  handlePeerOpen=handlePeerOpen.bind(this);
  handlePeerConnection=handlePeerConnection.bind(this);
  connectToOtherUsers=connectToOtherUsers.bind(this);

  componentDidMount(){
    document.addEventListener("keydown", this._handleKeyDown);
    document.addEventListener("click",this._handleClick,true);

    //Linking native menu actions
    el.ipcRenderer.on('new-project', this.createNew);
    el.ipcRenderer.on('save', ()=>{this.save(false)});
    el.ipcRenderer.on('save-as', ()=>{this.save(true)});
    el.ipcRenderer.on('open', this.load);
    el.ipcRenderer.on('share', this.toggleExportPopup);

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

      if(this.state.graphId !== null && this.state.cloudSaved){
          leave_workplace(
            this.state.graphId, 
            {
              username: this.state.username, 
              name: this.state.username
            }, 
            ()=>{
              closeWindow = true;
              var remote = el.remote;
              remote.getCurrentWindow().close()
            }
          )

      } else{
        setTimeout(() => {
          var dialog = el.remote.dialog;
          let result = dialog.showMessageBox({
              message: 'Save your work',
              buttons: ['Save', "Don't Save", 'Cancel'],
              defaultId: 0
          })

          if (result == 0) {
              this.save(false);
              closeWindow = true;
              var remote = el.remote;
              remote.getCurrentWindow().close()
          } else if(result == 1){
            closeWindow = true;
            var remote = el.remote;
            remote.getCurrentWindow().close()
          }
        })
      }
    })

    //P2P setup
    this.P2P_Peer = new Peer(
      {
        config: {'iceServers': 
          [
            { url: 'stun:stun.1mind.pl:5349' },
            { url: 'turn:turn.1mind.pl:5349', username: 'test', credential: '12345' }
          ]   
      } /* Sample servers, please use appropriate ones */
    } as Object);
    

    this.P2P_Peer.on('open', this.handlePeerOpen);
    this.P2P_Peer.on('connection', this.handlePeerConnection);
  }

  componentWillUnmount() {
    //Close the P2P peer
    if(this.P2P_Peer){
      this.P2P_Peer.destroy()
    }
    
    //Remove listeners
    document.removeEventListener("keydown", this._handleKeyDown);
    document.removeEventListener("click", (e:any)=>{
      if(this.state.inPresentation){
        e.preventDefault();
      }
    });
  }

  public render() {
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
            warning={this.state.warning}
            />
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
            togglePopup={this.toggleExportPopup}
            toggleDrawer={this.toggleDrawer}
            toggleFormatDrawer={this.toggleFormatDrawer}
            verticalButtonDisabled={this.state.verticalButtonDisabled}
            path={this.state.path}
            saved={this.state.saved}
            save={this.save}
            coworkers={this.state.coworkers}
            cloudSaved={this.state.cloudSaved}
          />

          : 
          
            //PRESENTATION FULLSCREEN BAR

          <Bar color="secondary" className="bar" position="fixed">
            <Box height={60} p={3} display="flex" justifyContent="center" ></Box>
          </Bar>
          }

          {/* MAIN */}
          
          <CoworkingDrawer
             coworkers={this.state.coworkers}
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
             makeHost={this.makeHost}
             kickOut={this.kickOut}
             isHost={this.state.isHost}
          />

          <Snackbar open={this.state.snackbarVisible} message="Use ⇦ ⇨ to navigate. Click Esc to stop" autoHideDuration={6000} onClose={this.closeSnackbar}/>

          <ExportPopup 
            openExportPopup={this.state.openExportPopup}
            toggleExportPopup={this.toggleExportPopup}
            preview={()=>{
              var ref = this.wrapperRef.current;
              if(ref){
                var ref2 = ref.diagramRef.current;
                if(ref2){
                  var dia = ref2.getDiagram();
                  if (dia) {
                    // dia.clearSelection()
                    return dia.makeImage({
                      scale: 1,
                    })
                  }
                }
              }
              return null;
              }
            }
            wrapperRef={this.wrapperRef}
            path={this.state.path}
          >
          </ExportPopup>

          <FormatDrawer
            openDrawer={this.state.openFormatDrawer}
            toggleDrawer={this.toggleFormatDrawer}
            selectedData={this.state.selectedData}
            onInputChange={this.handleInputChange}
            toggleFocus={this.toggleFormatInspectorFocused}
          >
          </FormatDrawer>

          <DiagramWrapper
            ref={this.wrapperRef}
            nodeDataArray={this.state.nodeDataArray}
            modelData={this.state.modelData}
            skipsDiagramUpdate={this.state.skipsDiagramUpdate}
            skipsModelChange={this.state.skipsModelChange}
            coworkers={this.state.coworkers}
            onDiagramEvent={this.handleDiagramEvent}
            onModelChange={this.handleModelChange}
            stopPresentation={this.stopPresentation}
            updateSlideNumber={this.updateSlideNumber}
            runstream={this.runstream}
            resetSkipModelChange={this.resetSkipModelChange}
          />


        {(this.state.inPresentation)?
          <PresentationProgressBar wrapperRef={this.wrapperRef} slideNumber={this.state.slideNumber}/>
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
