import * as React from 'react';
import * as go from 'gojs';
import * as path from 'path'
import autobind from 'autobind-decorator';

import {User} from '../../models/User'

import {
    Bar, 
} from './ui/StyledMUI';
  
import {
    Container,
    Box,
    Avatar,
    CircularProgress
} from '@material-ui/core';
import {AvatarGroup} from '@material-ui/lab';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import CloudQueueIcon from '@material-ui/icons/CloudQueue';
import BrushIcon from '@material-ui/icons/Brush';

import {UIButton} from '../components/ui/UIButton';

import 'react-edit-text/dist/index.css';
import { EditText } from 'react-edit-text';

interface EditorTopBarProps {
    selectedData: go.ObjectData | null;
    add: () => void;
    addUnder: () => void;
    setVertical: () => void;
    setHorizontal: () => void;
    toggleHidden: () => void;
    startPresentation: () => void;
    togglePopup: () => void;
    toggleDrawer: (x: boolean) => void;
    toggleFormatDrawer: () => void;
    renameWorkplace: (name: string) =>  void;
    verticalButtonDisabled : boolean;
    path : string | null;
    saved: boolean;
    save: (x: boolean)=>void;
    coworkers: { [id: string] : User};
    cloudSaved: boolean;
    showLoading: boolean;
}

interface EditorTopBarState{
  filename: string;
  editing: boolean;
}

@autobind
export class EditorTopBar extends React.PureComponent<EditorTopBarProps, EditorTopBarState> {
  constructor(props: EditorTopBarProps) {
    super(props);
    let fname = "Untitled"
    if(this.props.path !== null){
      fname = path.parse(this.props.path).base;
    }
    this.state = {
      filename: fname,
      editing: false
    }
  }

  componentDidUpdate(){
    if(!this.state.editing && this.state.filename.length == 0){
      let fname = "Untitled"
      if(this.props.path !== null){
        fname = path.parse(this.props.path).base;
      }
      this.setState({filename: fname});
    }
  }

  private makeInitials(name: string){
    return name.split(" ").map((n)=>n[0]).join("");
  }

  private changeFilename(props: any){
    this.props.renameWorkplace(props.value);
  }

  private handleEditFilename(value: string){
    this.setState({
      filename: value,
      editing: true
    });
  }

  public render() {
    return (
        <Bar color="secondary" className="bar" position="fixed">
        <Container>
          <Box p={0.5} m={-1} display="flex" justifyContent="center" >
            {this.props.cloudSaved?
            <a style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'nowrap',
          }} onClick={()=>{this.props.togglePopup()}} unselectable="on" className="filename"><CloudQueueIcon style={{fontSize:"15px", marginRight: "3px", paddingBottom:"0.5px"}}/> <EditText value={this.state.filename}  onChange={this.handleEditFilename} onSave={this.changeFilename} style={{display: "inline-block", padding: 0, margin: 0, paddingTop: 5, marginTop: -5,  marginBottom: -6, paddingRight: 2, paddingLeft: 2, borderRadius: 3}} /> <span style={{display: "inline-block", whiteSpace: "nowrap"}} className="smol"> - Autosave</span></a>
            :  
            null
            }
            {(this.props.showLoading)?
              <a style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
            }} onClick={()=>{this.props.togglePopup()}} unselectable="on" className="filename">  <CircularProgress style={{marginRight: 5}} size={15}/> <span className="smol"> Loading</span></a>
           
              :
              this.props.cloudSaved?
              null
              :
              <a onClick={()=>{this.props.save(true)}} unselectable="on" className="filename">{this.state.filename}{(this.props.saved)? null: (<span className="smol"> - Edited</span>)}</a>
            }
           
      
          </Box>

          <Box  p={0} m={-1} justifyContent="center" style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'nowrap',
              width: '100%'
          }}>

          <Box width={1} display="flex" flexGrow={1}></Box>

          <Box display="flex" >
            <UIButton hidden={!this.props.selectedData} disabled={false} label="Topic" type={"topic"} onClick={this.props.addUnder}></UIButton>
            <UIButton hidden={!this.props.selectedData} disabled={false} label="Subtopic" type={"subtopic"} onClick={this.props.add}></UIButton>
            <Box width={25}></Box> {/* Spacing */}
            {/* <UIButton hidden={!this.props.selectedData} disabled={!this.props.selectedData? false : this.props.verticalButtonDisabled} label="Vertical" type={"vertical"} onClick={this.props.setVertical}></UIButton>
            <UIButton hidden={!this.props.selectedData} disabled={!this.props.selectedData? false : !this.props.verticalButtonDisabled} label="Horizontal" type={"horizontal"} onClick={this.props.setHorizontal}></UIButton> */}
            <UIButton hidden={!this.props.selectedData} disabled={false} label="Hide" type={"hide"} onClick={this.props.toggleHidden}></UIButton>
            <Box width={25}></Box> {/* Spacing */}
            <UIButton hidden={false} disabled={false} label="Play" type={"play"} onClick={this.props.startPresentation}></UIButton>
         
            <UIButton hidden={false} disabled={false} label="Share" type={"share"} onClick={this.props.togglePopup}></UIButton>
          </Box>
          <Box  width={1}  style={{
            marginTop: '-14px',
              display: 'flex',
              flexWrap: 'nowrap',
          }} display="flex" flexGrow={1} justifyContent="center">

            <Box display="flex" flexGrow={1} justifyContent="center"> 
            <AvatarGroup style={{marginLeft:"-10%"}}max={4} onClick={()=>{this.props.toggleDrawer(true)}}>
                        {/* <UIButton hidden={false} disabled={false} label="" type={"share"} onClick={this.props.togglePopup}></UIButton> */}
                {Object.keys(this.props.coworkers).map((id, index)=>{
                  let user = this.props.coworkers[id];
                  return(               
                  <Avatar style={{backgroundColor: user.color}}
                    key={id}
                    alt={`Avatar n°${id + 1}`}
                  // src={`/static/images/avatar/${value + 1}.jpg`}
                  >
                  {this.makeInitials(user.name)}
                </Avatar>)
                })
                }
                      <Avatar>
                    <PersonAddIcon></PersonAddIcon>
              </Avatar>
            </AvatarGroup>
            </Box>
            
            <Box position={"absolute"} top='18px' right='15px'>
            <UIButton hidden={false} disabled={false} label="Format" type={"a"} onClick={this.props.toggleFormatDrawer}>
            <BrushIcon fontSize="small"/>
            </UIButton>
          </Box>



          </Box>
          </Box>



          </Container>
        </Bar>  
    );
  }
}
