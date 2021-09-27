/*
*  Copyright (C) 1998-2020 by Northwoods Software Corporation. All Rights Reserved.
*/

import * as React from 'react';
import { produce } from 'immer';

import Box from '@material-ui/core/Box';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
interface LoginFormProps {
  authorize: (username: string, password: string) => void;
}


interface LoginFormState {
    username: string;
    password: string;
}


export class LoginForm extends React.PureComponent<LoginFormProps, LoginFormState> {

  constructor(props: LoginFormProps) {
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
          produce((draft: LoginFormState) => {
              draft.username = event.target.value;
        }));
  }

  public handleChangePassword(event: any) {
    event.persist()
    this.setState(
        produce((draft: LoginFormState) => {
            draft.password = event.target.value;
      }));
  }

  public render() {

    return (
      <>
      </>
    );
  }
}
