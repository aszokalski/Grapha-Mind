/*
*  Copyright (C) 1998-2020 by Northwoods Software Corporation. All Rights Reserved.
*/

import * as React from 'react';
import * as go from 'gojs';
import * as path from 'path'

import {
    Bar, 
} from './ui/StyledMUI';
  
import {
    Container,
    Box,
    Avatar,
} from '@material-ui/core';
import {AvatarGroup} from '@material-ui/lab';

import {UIButton} from '../components/ui/UIButton';

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
    verticalButtonDisabled : boolean;
    path : string | null;
    saved: boolean;
    save: (x: boolean)=>void;
}

export class EditorTopBar extends React.PureComponent<EditorTopBarProps, {}> {
  constructor(props: EditorTopBarProps) {
    super(props);
  }

  public render() {
    let fname = "Untitled"
    if(this.props.path){
      fname = path.parse(this.props.path).base;
    }

    return (
        <Bar color="secondary" className="bar" position="fixed">
        <Container>
          <Box p={0.5} m={-1} display="flex" justifyContent="center" >
            <a onClick={()=>{this.props.save(true)}} unselectable="on" className="filename">{fname}{(this.props.saved)? null: (<span className="smol"> - Edited</span>)}</a>
          </Box>
          <Box p={0} m={-1} display="flex" justifyContent="center" >
            <UIButton hidden={!this.props.selectedData} disabled={false} label="Topic" type={"topic"} onClick={this.props.addUnder}></UIButton>
            <UIButton hidden={!this.props.selectedData} disabled={false} label="Subtopic" type={"subtopic"} onClick={this.props.add}></UIButton>
            <Box width={25}></Box> {/* Spacing */}
            <UIButton hidden={!this.props.selectedData} disabled={this.props.verticalButtonDisabled} label="Vertical" type={"vertical"} onClick={this.props.setVertical}></UIButton>
            <UIButton hidden={!this.props.selectedData} disabled={!this.props.verticalButtonDisabled} label="Horizontal" type={"horizontal"} onClick={this.props.setHorizontal}></UIButton>
            <UIButton hidden={!this.props.selectedData} disabled={false} label="Hide" type={"hide"} onClick={this.props.toggleHidden}></UIButton>
            <Box width={25}></Box> {/* Spacing */}
            <UIButton hidden={false} disabled={false} label="Play" type={"play"} onClick={this.props.startPresentation}></UIButton>
            <Box width={25}></Box> {/* Spacing */}
            <UIButton hidden={false} disabled={false} label="Share" type={"share"} onClick={this.props.togglePopup}></UIButton>
          </Box>

          <Box position={"absolute"} top='21px' right='15px'>
            <AvatarGroup max={4} onClick={()=>{this.props.toggleDrawer(true)}}>
            <Avatar>H</Avatar>
            <Avatar>U</Avatar>
            <Avatar>J</Avatar>
            <Avatar>H</Avatar>
            <Avatar>H</Avatar>
            </AvatarGroup>
          </Box>


          </Container>
        </Bar>  
    );
  }
}
