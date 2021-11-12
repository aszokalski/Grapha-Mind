import * as React from 'react';
import { produce } from 'immer';
import autobind from 'autobind-decorator';
import nextId from "react-id-generator";
import * as el from 'electron';
import * as fs from 'fs';
import * as path from 'path';

import {
    Box, 
    Toolbar,
    Drawer,
    Avatar,
    List,
    Typography,
    Divider,
    ListItem,
    ListItemIcon,
    ListItemText,
    Tooltip,
    IconButton,
    Grid,
    ListItemSecondaryAction,
    Paper,
    ClickAwayListener,
    Button
} from '@material-ui/core';

import { 
    ToggleButton, 
    ToggleButtonGroup 
} from '@material-ui/lab';

import {Bar, CreateButton} from '../../components/ui/StyledMUI'
import { templates } from '@/static/configs/templates';

import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import DescriptionIcon from '@material-ui/icons/Description';
import DeleteIcon from '@material-ui/icons/Delete';
import CloudQueueIcon from '@material-ui/icons/CloudQueue';
import ComputerIcon from '@material-ui/icons/Computer';
import { truncateSync } from 'original-fs';

interface MainTabProps{
    createNew: (cloud: boolean, template: any) => void;
    loadFilename: (filename: string) => void;
    handleCode: (value: string) => void;
}
interface MainTabState{
    selectedTemplate: number | null;
    items: any;
    createCloud: boolean;
}

@autobind
export class MainTab extends React.PureComponent<MainTabProps, MainTabState>{
    constructor(props: MainTabProps){
        super(props)
        let items = []
        let projectListJSON = localStorage.getItem('projectList')
        if(projectListJSON){
            let projectList = JSON.parse(projectListJSON)
            console.log(projectList)
            let i = 0;
            if(projectList){
                for (let project of projectList.reverse().slice(0, 5)) {
                    let i_copy = i
                    items.push(
                        <ListItem button onClick={()=>{this.props.loadFilename(project.path)}} key={"File"}>
                            <ListItemIcon>
                                <ComputerIcon/>
                            </ListItemIcon>
                            <ListItemText primary={project.name.split(".")[0]} secondary={project.path}/>
                            <ListItemSecondaryAction>
                                <IconButton onClick={()=>this.removeProject(i_copy)}>
                                    <DeleteIcon/>
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                        );
                        i++;
                }
            }
        }
        this.state = {
            selectedTemplate: null,
            items: items,
            createCloud: false
        }
    }

    public componentDidUpdate(){
        let i = 0;
        let projectListJSON = localStorage.getItem('projectList')
        if(projectListJSON){
            let projectList = JSON.parse(projectListJSON)
            for (let project of projectList.reverse().slice(0, 5)) {
                if(!fs.existsSync(project.path)){
                    this.removeProject(i, true);
                }
            }
        }
    }

    public removeProject(index: number, silent: boolean = false){
        if(silent){
            let projectListJSON = localStorage.getItem('projectList')
                if(projectListJSON){
                    let projectList = JSON.parse(projectListJSON);
                    let projectPath = projectList[index].path
                    projectList.splice(index, 1);
                    projectListJSON = JSON.stringify(projectList);
                    localStorage.setItem('projectList', projectListJSON);
                    this.loadProjects(projectList)
                }
        } else{
            var dialog = el.remote.dialog;
            dialog.showMessageBox({ title: "Remove Project", message: "Remove Project", buttons: ["Delete file", "Remove from list", "Cancel"], defaultId: 0 }, (response, checked)=>{
                if(response==2){ return }
                let projectListJSON = localStorage.getItem('projectList')
                if(projectListJSON){
                    let projectList = JSON.parse(projectListJSON);
                    let projectPath = projectList[index].path
                    projectList.splice(index, 1);
                    projectListJSON = JSON.stringify(projectList);
                    localStorage.setItem('projectList', projectListJSON);
                    this.loadProjects(projectList)
    
                    if(response==0){
                        fs.unlinkSync(projectPath)
                    }
                }
            });
        }
    }

    public loadProjects(projectList: any){
        this.setState(produce((draft: MainTabState) =>{
            let i = 0;
            draft.items = [];
            for (let project of projectList.reverse().slice(0, 5)) {
                draft.items.push(
                    <ListItem button onClick={()=>{this.props.loadFilename(project.path)}} key={"File"}>
                        <ListItemIcon>
                            <ComputerIcon/>
                        </ListItemIcon>
                        <ListItemText>
                            {project.name}
                        </ListItemText>
                        <ListItemSecondaryAction>
                            <IconButton onClick={()=>this.removeProject(i)}>
                                <DeleteIcon/>
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                    );
                    i++;
            }
        }))
    }

    public handleCreateCloud(event: any, x: boolean){
        this.setState(produce((draft: MainTabState)=>{
            draft.createCloud = x;
        }))
    }
    public render(){
        console.log(this.state.selectedTemplate !== null ? templates[this.state.selectedTemplate].nodeDataArray : null)
        return(
            <>   
                <Typography style={{marginTop: 20, marginLeft: 20, marginBottom: 15}} variant="h6">
                    <b> Templates </b>
                </Typography>
                <ClickAwayListener onClickAway={()=>{
                                    this.setState(produce((draft: MainTabState) =>{ 
                                        draft.selectedTemplate = null;
                                    }))
                                }}>
                <div style={{overflow:"auto", whiteSpace: "nowrap"}}>
                    {templates.map((template, index) => {
                            return (
                                    <div style={{textAlign: "center", display: "inline-block"}} onClick={()=>{
                                            this.setState(produce((draft: MainTabState) =>{ 
                                                draft.selectedTemplate = index;
                                            }))
                                        }}>
                                        <Paper style={{height: 150, width: 250, marginLeft: 20, marginBottom: 5, borderColor: this.state.selectedTemplate == index ? "rgb(90, 187, 249)" : "", borderWidth:  this.state.selectedTemplate == index ? 3 : "" }} variant="outlined" >
                                            {template.svg}
                                        </Paper>
                                        <Typography variant="caption">
                                            {template.name}
                                        </Typography>
                                    </div>
                            )
                        })
                    }
                </div>
                </ClickAwayListener>
                <Typography style={{marginTop: 20, marginLeft: 20, marginBottom: 15}} variant="h6">
                    <b> Recent Projects </b>
                </Typography>
                <List>
                    {this.state.items.length > 0 ? this.state.items:
                    null
                    }
                </List>
                <div style={{position: "absolute", bottom: 20, right: 25}} >
                    <ToggleButtonGroup
                    size={"small"}
                    exclusive
                    value={this.state.createCloud}
                    onChange={this.handleCreateCloud}
                    aria-label="text alignment"
                    style={{display: "inline-block", marginRight: 15, height: 40}}
                    >
                        <ToggleButton value={true} aria-label="left aligned">
                            <CloudQueueIcon />
                        </ToggleButton>
                        <ToggleButton value={false} aria-label="left aligned">
                            <ComputerIcon />
                        </ToggleButton>
                    </ToggleButtonGroup>
                    <CreateButton onClick={()=>{this.props.createNew(this.state.createCloud, this.state.selectedTemplate !== null ? templates[this.state.selectedTemplate].nodeDataArray : null)}} style={{display: "inline-block", height: 40}} variant="contained" disableElevation>
                        Create
                    </CreateButton>
                </div>
            </>
        );
    }
}