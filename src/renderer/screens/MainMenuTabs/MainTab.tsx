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
    Button,
    Link,
    Snackbar,
    SnackbarContent
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
    openCloud: (id: any) => void;
    removeWorkplace: (id: string) => void;
    handleCode: (value: string) => void;
    showMore: () => void;
    checkWorkplace: (id: string) => Promise<any>;
    username: string;
}
interface MainTabState{
    selectedTemplate: number;
    items: any;
    createCloud: boolean;
    inviteCode: string;
    checking: boolean;
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
            let projectListOrdered = projectList.reverse();
            if(projectList){
                for (let project of projectListOrdered.slice(0, 6)) {
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
            selectedTemplate: 0,
            items: items,
            createCloud: false,
            inviteCode: '',
            checking: false
        }
    }

    componentDidMount(){
        document.addEventListener('mousemove', (e) => {
            if(!this.state.checking){
                navigator.clipboard.readText().then(text => {
                    if(text.length == 24){
                        this.setState(produce((draft: MainTabState)=>{
                            draft.checking = true;
                        }),()=>{
                            this.props.checkWorkplace(text).then(author =>{
                                if(author !== undefined && author.owner_email != this.props.username){
                                    this.setState(produce((draft: MainTabState)=>{
                                        draft.inviteCode = text;
                                    }))
                                }
                            })
                        })
                    } else if(this.state.inviteCode !== ''){
                        this.setState(produce((draft: MainTabState)=>{
                            draft.inviteCode = '';
                        }))
                    }
                }).catch(err => {
          
                });
            }
        });
    }

    componentWillUnmount(){
        document.removeEventListener('mousemove', (e) => {});
    }

    componentDidUpdate(){
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
        this.setState(produce((draft: MainTabState) =>{
            let i = 0;
            draft.items = [];
            let projectListOrdered = projectList.reverse();
            for (let project of projectListOrdered.slice(0, 6)) {
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
        this.setState(produce((draft: MainTabState)=>{
            draft.createCloud = x;
        }))
    }
    public render(){
        return(
            <>   
            <Snackbar style={{marginTop: 50}} open={this.state.inviteCode !== ''} anchorOrigin={{vertical: "top", horizontal: "right"}}>
                <SnackbarContent message="You have just copied an invitation code" action={
                    <>
                        <Button onClick={()=>{
                            this.props.openCloud(this.state.inviteCode);
                        }} color="secondary" size="small">
                            Join
                        </Button>
                    </>
                } />
            </Snackbar>
                <Typography style={{marginTop: 20, marginLeft: 20, marginBottom: 15}} variant="h6">
                    <b> Templates </b>
                </Typography>
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
                <Typography style={{marginTop: 20, marginLeft: 20, marginBottom: 0}} variant="h6">
                    <b> Recent Projects </b>
                </Typography>
                <List dense>
                    {this.state.items.length > 0 ? this.state.items:
                        null
                    }
                </List>
                <Typography style={{marginLeft: 71, marginBottom: 15}} variant="subtitle2">
                    <Link onClick={this.props.showMore}> Show more </Link>
                </Typography>
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
                    <CreateButton disabled={this.state.selectedTemplate == null || this.state.createCloud == null} onClick={()=>{this.props.createNew(this.state.createCloud, templates[this.state.selectedTemplate].nodeDataArray)}} style={{display: "inline-block", height: 40}} variant="contained" disableElevation>
                        Create
                    </CreateButton>
                </div>
            </>
        );
    }
}