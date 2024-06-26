import * as React from 'react';
import '../../static/styles/screens/SplashScreen.css';
import {ProjectList} from '../components/ProjectList';
import {UIBigButton} from '../components/ui/UIBigButton';
import {UITextBox} from '../components/ui/UITextBox';
import {UIPopup} from '../components/ui/UIPopup';
// import {LoginForm} from '../screens/LoginForm'
import {LoggedOutScreen} from '../screens/LoggedOutScreen'
import {CreateAccount} from '../screens/CreateAccount'

import {Box, 
  Tooltip, 
  IconButton, 
  Avatar,
} from '@material-ui/core';
import {Bar} from '../components/ui/StyledMUI'

import { Player, Controls } from '@lottiefiles/react-lottie-player';


interface SplashScreenProps {
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

export class SplashScreen extends React.PureComponent<SplashScreenProps, {}> {

  constructor(props: SplashScreenProps) {
    super(props);
  }

  public render() {

    return (
      <>
        {this.props.username ?
          <>
            <Bar color="secondary" className="bar" position="fixed">
            <Box width={25} height={42}>  </Box>
            <Tooltip title="Logout">
              <IconButton onClick={this.props.deauthorize} style={{ height: '40px', width: '40px',position: 'absolute', right: '15px' }} aria-label="avatar"><Avatar className="avatar" alt={this.props.username.toUpperCase()} src="" >{this.props.username.toUpperCase()[0]}</Avatar></IconButton>
            </Tooltip>
              
              {/*TODO:INICIAŁY z backendu */}
          </Bar>

          <div className='inner'>
            <h1> Welcome to <i>1</i>Mind </h1>
            <small className="smol">ver. 0.01 (04.02.2021) private beta </small>
            <br/>
            <br/>
            <h2>Join a workplace: </h2>
            <UITextBox type='submit' readOnly={false} value="" placeholder="a" onSubmit={this.props.handleCode}/>
            <br/> <br/>
            <h2>Your previous work: </h2>
            <ProjectList load={this.props.load} loadFilename={this.props.loadFilename}></ProjectList>
            <br/>
            <UIBigButton  hidden={false} disabled={false} label="New Project" type={"new"} onClick={this.props.createNew}></UIBigButton>
            <div className="right">
              <Player 
                speed={0.3}
                autoplay
                loop
                src="https://assets1.lottiefiles.com/packages/lf20_9kZ5Pz.json"
                style={{ height: '90vh', width: '60vw' }}
                >
              </Player>
            </div>
          </div>
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
