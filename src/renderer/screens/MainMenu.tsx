import * as React from 'react';
import { produce } from 'immer';
import autobind from 'autobind-decorator';

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
    Grid
} from '@material-ui/core';
import {Bar} from '../components/ui/StyledMUI'

import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';

import {LoggedOutScreen} from '../screens/LoggedOutScreen'
import {CreateAccount} from '../screens/CreateAccount'

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

}

@autobind
export class MainMenu extends React.PureComponent<MainMenuProps, MainMenuState>{
    constructor(props: MainMenuProps){
        super(props)
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
                                    width: "80px",
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
                                            <Tooltip placement="right" title="Logout" arrow>
                                                <IconButton style={{ height: '45px', width: '45px'}} onClick={this.props.deauthorize}  aria-label="avatar"><Avatar style={{ height: '45px', width: '45px', transform: "translate(0, -25%)"}} alt={this.props.username.toUpperCase()} src="" >{this.props.username.toUpperCase()[0]}</Avatar></IconButton>
                                            </Tooltip>
                                        </Grid>
                                        <Grid style={{textAlign: "center", paddingTop: 6}} item>
                                            <Typography style={{fontSize: String(14 - (this.props.username.length- 4)*0.8) + "px"}} variant="subtitle1">
                                                {this.props.username}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                    
                                   
                                </ListItem>
                                <ListItem alignItems="center" button key={"AddButton"}>
                                            <Grid 
                                                style={{transform: "translate(17.5%, -0%)"}}
                                                container
                                                direction="column"
                                                justifyContent="center"
                                                alignContent="center"
                                            >
                                                <Grid item>
                                                    <AddCircleOutlineIcon style={{transform: "translate(-7%, -0%)", height: '35px', width: '35px'}}/>
                                                </Grid>
                                                <Grid item>
                                                    <Typography variant="subtitle2">
                                                        New
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                  
                                  
                                   
                                </ListItem>
                            </List>
                            {/* <Divider /> */}

                            </div>
                        </Drawer>
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