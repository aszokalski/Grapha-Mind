import * as React from 'react';
import { produce } from 'immer';

import {
    Button,
    Grid,
    Step,
    StepLabel,
    Typography,
  } from '@material-ui/core';

import { StyledStepper } from '../components/ui/StyledMUI';

import { AccountInfo } from './CreateAccountSteps/AccountInfo';
import { EmailVerification } from './CreateAccountSteps/EmailVerification';
import { Payment } from './CreateAccountSteps/Payment';

import autobind from 'autobind-decorator';
interface CreateAccountProps{
    usernameUsed(username: string): boolean;
    emailUsed(username: string): boolean;
    setShowCreateAccount: (x: boolean) => void
}

interface CreateAccountState{
    canContinue: boolean;
    activeStep: number;
    mailConfirmed: boolean;
    name: string,
    surname: string;
    username: string;
    email: string;
    password: string;
    repassword: string;
    acceptTerms: boolean;
}

const steps = ['Account Info', 'Email confirmation', 'Choose a plan'];

@autobind
export class CreateAccount extends React.PureComponent<CreateAccountProps, CreateAccountState> {
    constructor(props: CreateAccountProps){
        super(props);
        this.state = {
            canContinue: false,
            activeStep: 2,
            mailConfirmed: false,
            name: "",
            surname: "",
            username: "",
            email: "",
            password: "",
            repassword: "",
            acceptTerms: false
        }
    }

    private setActiveStep(x: number){
        this.setState(
            produce((draft: CreateAccountState) =>{
                draft.activeStep = x;
            })
        )
    }

    private setName(event: any){
        this.setState(
            produce((draft: CreateAccountState) => {
                    draft.name = event.target.value;
                }
            )
        )
    }

    private setSurname(event: any){
        this.setState(
            produce((draft: CreateAccountState) => {
                    draft.surname = event.target.value;
                }
            )
        )
    }

    private setUsername(event: any){
        this.setState(
            produce((draft: CreateAccountState) => {
                    draft.username = event.target.value;
                }
            )
        )
    }

    private setEmail(event: any){
        this.setState(
            produce((draft: CreateAccountState) => {
                    draft.email = event.target.value;
                }
            )
        )
    }

    private setPassword(event: any){
        this.setState(
            produce((draft: CreateAccountState) => {
                    draft.password = event.target.value;
                }
            )
        )
    }

    private setRepassword(event: any){
        this.setState(
            produce((draft: CreateAccountState) => {
                    draft.repassword = event.target.value;
                }
            )
        )
    }

    private setAcceptTerms(event: any){
        this.setState(
            produce((draft: CreateAccountState) => {
                    draft.acceptTerms = event.target.checked;
                }
            )
        )
    }

    public handleNext() {
        this.setActiveStep(this.state.activeStep + 1);
    };
    
    public handleBack(){
        this.setActiveStep(this.state.activeStep - 1);
    };

    public handleReset(){
        this.setActiveStep(0);
    };

    public validateEmail(){
        this.setState(
            produce((draft: CreateAccountState) => {
                draft.mailConfirmed = true;        
        }));
    }

    public setCanContinue(x: boolean){
        this.setState(
            produce((draft: CreateAccountState) =>{
                draft.canContinue = x;
            })
        )
    };

    public render(){
        return(
            <>
                <div style={{textAlign: "center", position: "absolute", top: "50%", left:"50%", transform: "translate(-50%, -90%)"}}>
                    <div style={{width: 600, height: 220}}>
                        <form noValidate>
                            <Grid container
                                    spacing={2}
                                    alignItems="stretch"
                                    direction="column"
                            >
                                {this.state.activeStep == 0 ?
                                    <AccountInfo
                                        usernameUsed={this.props.usernameUsed}
                                        emailUsed={this.props.emailUsed}
                                        setCanContinue={this.setCanContinue}
                                        setName={this.setName}
                                        setSurname={this.setSurname}
                                        setUsername={this.setUsername}
                                        setEmail={this.setEmail}
                                        setPassword={this.setPassword}
                                        setRepassword={this.setRepassword}
                                        setAcceptTerms={this.setAcceptTerms}
                                        name={this.state.name}
                                        surname={this.state.surname}
                                        username={this.state.username}
                                        email={this.state.email}
                                        password={this.state.password}
                                        repassword={this.state.repassword}
                                        acceptTerms={this.state.acceptTerms}
                                    />
                                    : 
                                    null 
                                }

                                {this.state.activeStep == 1 ? 
                                    <EmailVerification
                                        validateEmail={this.validateEmail}
                                        email={this.state.email}
                                    />
                                    : 
                                    null 
                                }

                                {this.state.activeStep == 2 ? 
                                    <Payment
                                    />
                                    :
                                    null
                                }
                            </Grid>
                        </form>
                    </div>        
                </div>

                <div style={{textAlign: "center", position: "absolute", bottom: "0%", left:"50%", transform: "translate(-50%, -50%)"}}>
                    <Grid container
                    spacing={2}
                    alignItems="stretch"
                    direction="column"
                    >
                        <Grid item>
                            <StyledStepper activeStep={this.state.activeStep}>
                                {steps.map((label, index) => {
                                const stepProps: { completed?: boolean } = {};
                                const labelProps: { optional?: React.ReactNode } = {};
                                if(label == "Payment"){
                                    labelProps.optional = labelProps.optional = <Typography variant="caption">Optional</Typography>;
                                }
                                return (
                                    <Step key={label} {...stepProps}>
                                        <StepLabel {...labelProps}>{label}</StepLabel>
                                    </Step>
                                );
                                })}
                            </StyledStepper>
                        </Grid>

                        <Grid item>
                            <Grid container
                                spacing={2}
                                direction="row"
                                justifyContent="center"
                            >
                                <Grid item>
                                    <Button 
                                        onClick={(this.state.activeStep == 0) ? ()=>{this.props.setShowCreateAccount(false)} : this.handleBack }
                                        variant="outlined">
                                        Back
                                    </Button>
                                </Grid>

                                <Grid item>
                                    <Button 
                                    disabled={!this.state.canContinue || (this.state.activeStep == 1 && this.state.mailConfirmed == false)}
                                    onClick={(this.state.activeStep == steps.length - 1) ? ()=>{this.props.setShowCreateAccount(false)}: this.handleNext}
                                    variant={this.state.activeStep == steps.length - 1
                                        ? "outlined" : "contained"}
                                    color={this.state.activeStep == steps.length - 1
                                        ? "default" : "primary"}
                                    >
                                        {this.state.activeStep == steps.length - 1
                                        ? <>Skip</> : <>Next</>}
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </div>
            </>
        );
    }
}