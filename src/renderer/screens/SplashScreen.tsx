/*
*  Copyright (C) 1998-2020 by Northwoods Software Corporation. All Rights Reserved.
*/

import * as React from 'react';
import '../styles/screens/SplashScreen.css';

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
        <h2>Your previous work: </h2>
        <ul>
            <li>Project 1</li>
            <li>Project 2</li>
        </ul>

      </div>
    );
  }
}
