import * as React from 'react';
import { produce } from 'immer';

import {
    Button,
    TextField,
    Grid,
    InputAdornment,
  } from '@material-ui/core';

  import AccountCircle from '@material-ui/icons/AccountCircle';
  import LockIcon from '@material-ui/icons/Lock';
  import MailIcon from '@material-ui/icons/Mail';

  import { Player } from '@lottiefiles/react-lottie-player';

interface LoggedOutScreenProps{
    warning: string;
    authorize: (username: string, password: string) => void;
}

interface LoggedOutScreenState{
    username: string;
    password: string;
}

export class LoggedOutScreen extends React.PureComponent<LoggedOutScreenProps, LoggedOutScreenState> {
    constructor(props: LoggedOutScreenProps){
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChangeUsername = this.handleChangeUsername.bind(this);
        this.handleChangePassword = this.handleChangePassword.bind(this);
        this.state = { password: "", username: ""};
    }

    public handleSubmit(event: any){
        event.preventDefault();
        this.props.authorize(this.state.username, this.state.password);
      }
    
    public handleChangeUsername(event: any) {
        event.persist()
        this.setState(
              produce((draft: LoggedOutScreenState) => {
                  draft.username = event.target.value;
            }));
      }
    
    public handleChangePassword(event: any) {
        event.persist()
        this.setState(
            produce((draft: LoggedOutScreenState) => {
                draft.password = event.target.value;
        }));
    }

    public render(){
        return(
            <>
            <div style={{textAlign: "center", position: "absolute", top: "50%", left:"50%", transform: "translate(-50%, -80%)"}}>
                <div style={{width: 300, height: 200}}>
                <form noValidate>
                    <Grid container
                    spacing={2}
                    alignItems="stretch"
                    direction="column"
                    >
                        <Grid item>
                        <h1> <i>1</i>Mind </h1>
                        </Grid>
                        <Grid item>
                            <TextField 
                                error={this.props.warning == "No email entered"}
                                onChange={this.handleChangeUsername}
                                id="email" 
                                label="Email" 
                                variant="outlined" 
                                type="email"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                        <MailIcon />
                                        </InputAdornment>
                                    ),
                                }}
                                fullWidth={true}
                            />
                        </Grid>
                        <Grid item>
                            <TextField 
                                error={this.props.warning == "No password entered"}
                                onChange={this.handleChangePassword}
                                id="password"
                                label="Password" 
                                type="password"
                                variant="outlined" 
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                        <LockIcon />
                                        </InputAdornment>
                                    ),
                                }}
                                fullWidth={true}
                                helperText={this.props.warning}
                            />
                        </Grid>
                        <Grid item>
                            <Button 
                                onClick={this.handleSubmit}
                                variant="outlined">
                                Log In
                            </Button>
                        </Grid>
                        
                        <Grid item>
                            <Button>
                                Create Account
                            </Button>
                        </Grid>
                        
                    </Grid>
                    </form>
                </div>        
            </div>
            {/* <div style={{
                         zIndex: -99,
                         position: "absolute",
                         top:"50%",
                         left:"50%",
                         transform: "translate(-50%, -50%)",
                        //  height: "100vh"
                    }}>
              <Player 
                speed={0.7}
                autoplay
                loop
                src="https://assets2.lottiefiles.com/packages/lf20_9wcallwi.json"
                // src="https://assets6.lottiefiles.com/packages/lf20_hbab0saa.json"
                // style={{ height: '90vh', width: '60vw' }}
                >
              </Player>
            </div> */}
            </>
        );
    }
}