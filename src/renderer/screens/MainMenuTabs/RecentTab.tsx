import * as React from 'react';
import { produce } from 'immer';
import autobind from 'autobind-decorator';
import nextId from "react-id-generator";
import * as el from 'electron';
import * as fs from 'fs';
import {
    List,
    Typography,
    ListItem,
    ListItemIcon,
    ListItemText,
    IconButton,
    ListItemSecondaryAction,
    Paper,
} from '@material-ui/core';

import { 
    ToggleButton, 
    ToggleButtonGroup 
} from '@material-ui/lab';

import {CreateButton} from '../../components/ui/StyledMUI'

import DeleteIcon from '@material-ui/icons/Delete';
import CloudQueueIcon from '@material-ui/icons/CloudQueue';
import ComputerIcon from '@material-ui/icons/Computer';
interface RecentTabProps{
    createNew: (cloud: boolean, template: any) => void;
    loadFilename: (filename: string) => void;
    openCloud: (id: any) => void;
    removeWorkplace: (id: string) => void;
    handleCode: (value: string) => void;
}
interface RecentTabState{
    selectedTemplate: number | null;
    items: any;
    createCloud: boolean;
}

@autobind
export class RecentTab extends React.PureComponent<RecentTabProps, RecentTabState>{
    constructor(props: RecentTabProps){
        super(props)
        let items = []
        let projectListJSON = localStorage.getItem('projectList')
        if(projectListJSON){
            let projectList = JSON.parse(projectListJSON)
            let i = 0;
            let projectListOrdered = projectList.reverse();
            if(projectList){
                for (let project of projectListOrdered) {
                    let i_copy = i
                    items.push(
                        <ListItem button onClick={()=>{project.type == "local"? this.props.loadFilename(project.path) : this.props.openCloud(project.id)}} key={nextId()}>
                            <ListItemIcon>
                                {project.type == "local" ?
                                    <ComputerIcon/> :
                                    <CloudQueueIcon/>
                                }
                            </ListItemIcon>
                            <ListItemText primary={project.name.split(".")[0]} secondary={project.type == "local"? project.path : project.author}/>
                            <ListItemSecondaryAction>
                                <IconButton onClick={()=>this.removeProject(projectListOrdered.length - 1 - i_copy)}>
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
            for (let project of projectList.reverse()) {
                if(!fs.existsSync(project.path) && project.type == "local"){
                    this.removeProject(projectList.length - 1 - i, true);
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
            let projectListJSON = localStorage.getItem('projectList')
            if(projectListJSON){
                let projectList = JSON.parse(projectListJSON);
                let projectPath = projectList[index].path

                if(projectList[index].type == "local"){
                    dialog.showMessageBox({ title: "Remove Project", message: "Remove Project", buttons: ["Delete file", "Remove from list", "Cancel"], defaultId: 0 }, (response, checked)=>{
                        if(response==2){ return }
                        let projectListJSON = localStorage.getItem('projectList')
                        projectList.splice(index, 1);
                        projectListJSON = JSON.stringify(projectList);
                        localStorage.setItem('projectList', projectListJSON);
                        this.loadProjects(projectList)
        
                        if(response==0){
                            fs.unlinkSync(projectPath)
                        }
                    });
                } else{
                    dialog.showMessageBox({ title: "Remove Project", message: "Remove Project", buttons: ["Delete from cloud", "Cancel"], defaultId: 0 }, (response, checked)=>{
                        if(response==1){ return }
                        this.props.removeWorkplace(projectList[index].id);
                        let projectListJSON = localStorage.getItem('projectList')
                        projectList.splice(index, 1);
                        projectListJSON = JSON.stringify(projectList);
                        localStorage.setItem('projectList', projectListJSON);
                        this.loadProjects(projectList)
                    });
                }
            }

        }
    }

    public loadProjects(projectList: any){
        this.setState(produce((draft: RecentTabState) =>{
            let i = 0;
            draft.items = [];
            let projectListOrdered = projectList.reverse();
            for (let project of projectListOrdered) {
                    let i_copy = i
                    draft.items.push(
                        <ListItem button onClick={()=>{project.type == "local"? this.props.loadFilename(project.path) : this.props.openCloud(project.id)}} key={nextId()}>
                            <ListItemIcon>
                                {project.type == "local" ?
                                    <ComputerIcon/> :
                                    <CloudQueueIcon/>
                                }
                            </ListItemIcon>
                            <ListItemText primary={project.name.split(".")[0]} secondary={project.type == "local"? project.path : project.author}/>
                            <ListItemSecondaryAction>
                                <IconButton onClick={()=>this.removeProject(projectListOrdered.length - 1 - i_copy)}>
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
        this.setState(produce((draft: RecentTabState)=>{
            draft.createCloud = x;
        }))
    }
    public render(){
        return(
            <>   
                <Typography style={{marginTop: 20, marginLeft: 20, marginBottom: 0}} variant="h6">
                    <b> Recent Projects </b>
                </Typography>
                <div style={{overflow: "auto", height: "85vh"}}>
                    <List dense>
                        {this.state.items.length > 0 ? this.state.items:
                        null
                        }
                    </List>
                </div>
            </>
        );
    }
}