/*
*  Copyright (C) 1998-2020 by Northwoods Software Corporation. All Rights Reserved.
*/

import * as React from 'react';
import '../styles/screens/SplashScreen.css';
import {UIProjectList} from '../components/ui/UIProjectList';
import {UIBigButton} from '../components/ui/UIBigButton';
import {UITextBox} from '../components/ui/UITextBox';
import {Box} from '@material-ui/core';

import { Player, Controls } from '@lottiefiles/react-lottie-player';

interface SplashScreenProps {

}

export class SplashScreen extends React.PureComponent<SplashScreenProps, {}> {

  constructor(props: SplashScreenProps) {
    super(props);
  }

  public render() {

    return (
      <div className='inner'>
        <h1> Welcome to <i>1</i>Mind </h1>
        <small className="smol">ver. 0.01 (04.02.2021) private beta</small>
        <br/>
        <br/>
        <h2>Join a workplace: </h2>
        <UITextBox type='submit' readOnly={false} value="" placeholder="a" onSubmit={()=>{}}/>
        <br/> <br/>
        <h2>Your previous work: </h2>
        <UIProjectList></UIProjectList>
        <br/>
        <UIBigButton  hidden={false} disabled={false} label="New Project" type={"new"} onClick={()=>{}}></UIBigButton>
        <div className="right">
          <Player 

            autoplay
            loop
            src="https://assets1.lottiefiles.com/packages/lf20_9kZ5Pz.json"
            style={{ height: '90vh', width: '60vw' }}
            >
          </Player>
        </div>
        
 
      </div>
    );
  }
}
