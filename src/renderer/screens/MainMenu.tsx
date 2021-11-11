import * as React from 'react';
import { produce } from 'immer';
import autobind from 'autobind-decorator';
import nextId from "react-id-generator";

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
    ListItemSecondaryAction
} from '@material-ui/core';
import {Bar} from '../components/ui/StyledMUI'

import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import DescriptionIcon from '@material-ui/icons/Description';
import DeleteIcon from '@material-ui/icons/Delete';
import CloudQueueIcon from '@material-ui/icons/CloudQueue';
import ComputerIcon from '@material-ui/icons/Computer';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import SettingsIcon from '@material-ui/icons/Settings';
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import HomeOutlinedIcon from '@material-ui/icons/HomeOutlined';
import DashboardRoundedIcon from '@material-ui/icons/DashboardRounded';

import {LoggedOutScreen} from '../screens/LoggedOutScreen'
import {CreateAccount} from '../screens/CreateAccount'
import {MainTab} from '../screens/MainMenuTabs/MainTab'

interface MainMenuProps{
    createNew: () => void;
    load: () => void;
    loadFilename: (filename: string) => void;
    handleCode: (value: string) => void;
    authorize: (username: string, password: string) => void;
    deauthorize: () => void;
    setShowCreateAccount: (x: boolean) => void;
    usernameUsed: (x: string) => boolean;
    emailUsed: (x: string) => boolean;
    username: string;
    warning: string;
    showCreateAccount: boolean;
}
interface MainMenuState{
    selected: number;
}

const margin = 7;
const toolbarWidth= 90;

@autobind
export class MainMenu extends React.PureComponent<MainMenuProps, MainMenuState>{
    private items: Array<any>;
    constructor(props: MainMenuProps){
        super(props)
        this.state = {
            selected: 0
        }

        let projectListJSON = localStorage.getItem('projectList')
        this.items = [];
        if(projectListJSON){
        let projectList = JSON.parse(projectListJSON);

        if(projectList){
            for (let project of projectList.reverse().slice(0, 5)) {
            // note: we are adding a key prop here to allow react to uniquely identify each
            // element in this array. see: https://reactjs.org/docs/lists-and-keys.html
            this.items.push(
                <ListItem button onClick={()=>{this.props.loadFilename(project.path)}} key={"File"}>
                    <ListItemIcon>
                        <ComputerIcon/>
                    </ListItemIcon>
                    <ListItemText>
                        {project.name}
                    </ListItemText>
                    <ListItemSecondaryAction>
                        <IconButton>
                            <DeleteIcon/>
                        </IconButton>
                    </ListItemSecondaryAction>
                </ListItem>
            );
            }
        }
        }
    }

    public render(){
        return(
            <>
                {this.props.username ?
                    <>
                        <Bar style={{zIndex: 9999999}} color="secondary" className="bar" position="fixed">
                            <Box width={25} height={42}>  </Box>   
                            {/*TODO:INICIAŁY z backendu */}
                        </Bar>
                        <Drawer
                            PaperProps={{
                                style: {
                                    backgroundColor: "rgb(250, 250, 250)",
                                    width: toolbarWidth,
                                    overflow: "hidden"
                                }
                            }}
                            variant="permanent"
                        >
                            <Toolbar />
                            <div>
                            <List style={{textAlign: "center"}}>
                                <ListItem key={"AccountButton"}>
                                    <Grid 
                                        container
                                        direction="column"
                                        justifyContent="center"
                                        alignContent="center"
                                    >
                                        <Grid item>
                                            <Typography style={{textAlign: "center"}}>
                                                <Tooltip placement="right" title="Logout" arrow>
                                                    <IconButton style={{ height: '45px', width: '45px'}} onClick={this.props.deauthorize}  aria-label="avatar"><Avatar style={{ height: '45px', width: '45px', transform: "translate(0, -25%)"}} alt={this.props.username.toUpperCase()} src="" >{this.props.username.toUpperCase()[0]}</Avatar></IconButton>
                                                </Tooltip>
                                            </Typography>
                                        </Grid>
                                        <Grid style={{textAlign: "center", paddingTop: 6}} item>
                                            <Typography style={{textAlign: "center", fontSize: String(Math.max(14 - (this.props.username.length- 4)*0.8, 5)) + "px"}} variant="subtitle1">
                                                {this.props.username}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </ListItem>
                                <ListItem alignItems="center" button key={"HomeButton"} 
                                onClick={
                                    ()=>{
                                        this.setState(produce((draft: MainMenuState )=>{
                                            draft.selected = 0;
                                        }))
                                    }
                                } 
                                style={{
                                    backgroundColor: this.state.selected == 0 ? "rgb(200, 200, 200)" : "",
                                    borderRadius: 10,
                                    margin: margin,
                                    width: toolbarWidth-2*margin,
                                    height: toolbarWidth-2*margin
                                }}
                                >
                                            <Grid 
                                                container
                                                direction="column"
                                                justifyContent="center"
                                                alignContent="center"
                                            >
                                                <Grid item>
                                                <Typography style={{textAlign: "center"}}>
                                                    <DashboardRoundedIcon style={{height: '35px', width: '35px'}}/>
                                                </Typography>
                                                </Grid>
                                                <Grid item>
                                                    <Typography style={{textAlign: "center"}}  variant="subtitle2">
                                                        Main
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                </ListItem>
                                <ListItem alignItems="center" button key={"NewButton"}
                                onClick={
                                    ()=>{
                                        this.setState(produce((draft: MainMenuState )=>{
                                            draft.selected = 1;
                                        }))
                                    }
                                } 
                                style={{
                                    backgroundColor: this.state.selected == 1 ? "rgb(200, 200, 200)" : "",
                                    borderRadius: 10,
                                    margin: margin,
                                    width: toolbarWidth-2*margin,
                                    height: toolbarWidth-2*margin
                                }}
                                >
                                            <Grid 
                                                container
                                                direction="column"
                                                justifyContent="center"
                                                alignContent="center"
                                            >
                                                <Grid item>
                                                <Typography style={{textAlign: "center"}}>
                                                    <AddCircleOutlineIcon style={{height: '35px', width: '35px'}}/>
                                                </Typography>
                                                </Grid>
                                                <Grid item>
                                                    <Typography style={{textAlign: "center"}}  variant="subtitle2">
                                                        New
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                </ListItem>
                                <ListItem alignItems="center" button key={"RecentButton"}
                                onClick={
                                    ()=>{
                                        this.setState(produce((draft: MainMenuState )=>{
                                            draft.selected = 2;
                                        }))
                                    }
                                } 
                                style={{
                                    backgroundColor: this.state.selected == 2 ? "rgb(200, 200, 200)" : "",
                                    borderRadius: 10,
                                    margin: margin,
                                    width: toolbarWidth-2*margin,
                                    height: toolbarWidth-2*margin
                                }}
                                >
                                            <Grid 
                                                container
                                                direction="column"
                                                justifyContent="center"
                                                alignContent="center"
                                            >
                                                <Typography style={{textAlign: "center"}}>
                                                    <AccessTimeIcon style={{height: '35px', width: '35px'}}/>
                                                </Typography>
                                                <Grid item>
                                                    <Typography style={{textAlign: "center"}} variant="subtitle2">
                                                        Recent
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                </ListItem>
                                <ListItem alignItems="center" button key={"AddButton"} 
                                onClick={this.props.load} 
                                style={{
                                    backgroundColor: this.state.selected == 3 ? "rgb(200, 200, 200)" : "",
                                    borderRadius: 10,
                                    margin: margin,
                                    width: toolbarWidth-2*margin,
                                    height: toolbarWidth-2*margin
                                }}
                                >
                                            <Grid 
                                                container
                                                direction="column"
                                                justifyContent="center"
                                                alignContent="center"
                                            >
                                                <Typography style={{textAlign: "center"}}>
                                                    <FolderOpenIcon style={{height: '35px', width: '35px'}}/>
                                                </Typography>
                                                <Grid item>
                                                    <Typography style={{textAlign: "center"}}  variant="subtitle2">
                                                        Open
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                </ListItem>
                                <ListItem alignItems="center" button key={"CloudButton"} 
                                onClick={
                                    ()=>{
                                        this.setState(produce((draft: MainMenuState )=>{
                                            draft.selected = 4;
                                        }))
                                    }
                                } 
                                style={{
                                    backgroundColor: this.state.selected == 4 ? "rgb(200, 200, 200)" : "",
                                    borderRadius: 10,
                                    margin: margin,
                                    width: toolbarWidth-2*margin,
                                    height: toolbarWidth-2*margin
                                }}
                                >
                                            <Grid 
                                                container
                                                direction="column"
                                                justifyContent="center"
                                                alignContent="center"
                                            >
                                                <Typography style={{textAlign: "center"}}>
                                                    <CloudQueueIcon style={{height: '35px', width: '35px'}}/>
                                                </Typography>
                                                <Grid item>
                                                    <Typography style={{textAlign: "center"}}  variant="subtitle2">
                                                        Cloud
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                </ListItem>
                            </List>
                            {/* <Divider /> */}
                            <div style={{position: "absolute", bottom:  10, transform: "translate(25%, 0)"}} key={"SettingsButton"}>
                                <Typography style={{textAlign: "center"}}>
                                    <IconButton  onClick={this.props.deauthorize}  aria-label="avatar"><SettingsIcon style={{fontSize: "35px"}}/></IconButton>
                                </Typography>
                            </div>

                            </div>
                        </Drawer>
                        <main style={{paddingLeft: "90px", paddingTop:"49px"}}>
                                {this.state.selected == 0 ?
                                <MainTab
                                    createNew={this.props.createNew}
                                    loadFilename={this.props.loadFilename}
                                    handleCode={this.props.handleCode}
                                /> 
                                : null
                                }
                        </main>
                    </> 
                : 
                    <>
                        {this.props.showCreateAccount ?
                            <CreateAccount
                                usernameUsed={this.props.usernameUsed}
                                emailUsed={this.props.emailUsed}
                                setShowCreateAccount={this.props.setShowCreateAccount}
                            /> 
                            :

                            <LoggedOutScreen
                                warning={this.props.warning}
                                authorize={this.props.authorize}
                                setShowCreateAccount={this.props.setShowCreateAccount}
                            /> 
                        }
                    </>
                }
            </>
        );
    }
}