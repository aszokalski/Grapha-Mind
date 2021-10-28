import * as React from 'react';
import { produce } from 'immer';
import autobind from 'autobind-decorator';

import {
    TextField,
    Grid,
    InputAdornment,
    Checkbox,
    FormControlLabel,
} from '@material-ui/core';

import LockIcon from '@material-ui/icons/Lock';
import MailIcon from '@material-ui/icons/Mail';

import ReCAPTCHA from "react-google-recaptcha";

interface AccountInfoProps{
    usernameUsed(username: string): boolean;
    emailUsed(username: string): boolean;
    setCanContinue(x: boolean): void;
    setName(x: any): void;
    setSurname(x: any): void;
    setUsername(x: any): void;
    setEmail(x: any): void;
    setPassword(x: any): void;
    setRepassword(x: any): void;
    setAcceptTerms(x: any): void;
    name: string;
    surname: string;
    username: string;
    email: string;
    password: string;
    repassword: string;
    acceptTerms: boolean;
}

interface AccountInfoState{
    
}

@autobind
export class AccountInfo extends React.PureComponent<AccountInfoProps, AccountInfoState>{
    constructor(props: AccountInfoProps){
        super(props);

    }

    componentDidUpdate(){
        this.props.setCanContinue(
            this.props.acceptTerms && 
            this.props.name != '' && 
            this.props.surname != '' && 
            this.checkUsername().result && 
            this.checkPasswords().result && 
            this.checkEmail().result
        );
    }

    private checkUsername(){
        if(this.props.usernameUsed(this.props.username)){
            return {
                'result': false,
                'message': "Username already used"
            }
        }
        let re = /^(?=.{4,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/
        if(re.test(this.props.username)){
            return {
                'result': true,
                'message': " "
            }
        }

        if(this.props.username.length == 0){
            return {
                'result': false,
                'message': " "
            }
        }

        return {
            'result': false,
            'message': "Invalid username"
        }
    }

    private checkEmail(){
        function validateEmail(email: string) {
            const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(String(email).toLowerCase());
        }

        if(this.props.email.length < 3){
            return {
                'result': false,
                'message': " "
            }
        } else if(this.props.emailUsed(this.props.email)){
            return {
                'result': false,
                'message': "Email already used"
            }
        }

        let res = validateEmail(this.props.email);
        return {
            'result': res,
            'message': res? " ": "Invalid email address"
        }
    }

    private checkPasswords(){
        function validatePassword(password: string) {
            const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
            return re.test(password);
        }

        if(this.props.password == ''){
            return {
                'result': false,
                'message': " "
            }
        } else if (!validatePassword(this.props.password)) {
            return {
                'result': false,
                'message': "Min. 8 characters, 1 uppercase letter, 1 number"
            }
        } else if(this.props.password !== this.props.repassword){
            return {
                'result': false,
                'message': "Passwords don't match"
            }
        } else{
            return {
                'result': true,
                'message': " "
            }
        }
    }

    public render(){
        return(
            <>
                <div
                    style={{
                        textAlign: "center", 
                        position: "absolute", 
                        top: "-40%", 
                        left:"50%", 
                        transform: "translate(-50%, -50%)"
                    }}
                >
                    <h1> Account Info </h1>
                </div>

                <Grid item>
                    <Grid 
                        container 
                        spacing={2} 
                        alignItems="center" 
                        direction="row" 
                        justifyContent="space-between"
                        
                    >
                        <Grid 
                            container 
                            spacing={1} 
                            alignItems="stretch" 
                            direction="column" 
                            xs={6}
                        >
                            <Grid item>
                                <TextField 
                                    helperText=" "
                                    value={this.props.name}
                                    onChange={this.props.setName}
                                    InputProps={{ 
                                        style:{
                                            backgroundColor: "white"
                                        }
                                    }}
                                    id="name" 
                                    label="Name" 
                                    variant="outlined" 
                                    type="text"
                                    fullWidth={true}
                                />
                            </Grid>

                            <Grid item>
                                <TextField 
                                    helperText=" "
                                    value={this.props.surname}
                                    onChange={this.props.setSurname}
                                    InputProps={{ 
                                        style:{
                                            backgroundColor: "white"
                                        }
                                    }} 
                                    id="surname" 
                                    label="Surname" 
                                    variant="outlined" 
                                    type="text"
                                    fullWidth={true} 
                                />
                            </Grid>

                            <Grid item>
                                <TextField 
                                    helperText={this.checkUsername().message}
                                    error={!this.checkUsername().result && this.checkUsername().message != " "}
                                    value={this.props.username}
                                    onChange={this.props.setUsername}
                                    InputProps={{ 
                                        style:{
                                            backgroundColor: "white"
                                        }
                                    }}
                                    id="username" 
                                    label="Username" 
                                    variant="outlined"
                                    type="text" 
                                    fullWidth={true} 
                                />
                            </Grid>
                        </Grid>

                        <Grid 
                            container 
                            spacing={1} 
                            alignItems="stretch" 
                            direction="column" 
                            xs={6}
                        >
                            <Grid item>
                                <TextField 
                                    helperText={this.checkEmail().message}
                                    error={!this.checkEmail().result && this.checkEmail().message != " "}
                                    value={this.props.email}
                                    onChange={this.props.setEmail}
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
                                        style:{
                                            backgroundColor: "white"
                                        }
                                    }} 
                                    fullWidth={true} 
                                />
                            </Grid>

                            <Grid item>
                                <TextField 
                                    helperText={this.checkPasswords().message == "Passwords don't match"? " " : this.checkPasswords().message}
                                    error={!this.checkPasswords().result && this.checkPasswords().message != " " && this.checkPasswords().message != "Passwords don't match"}
                                    value={this.props.password}
                                    onChange={this.props.setPassword}
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
                                        style:{
                                            backgroundColor: "white"
                                        }
                                    }} 
                                    fullWidth={true} 
                                />
                            </Grid>

                            <Grid item>
                                <TextField 
                                    helperText={this.checkPasswords().message != "Passwords don't match"? " " : this.checkPasswords().message}
                                    error={!this.checkPasswords().result && this.checkPasswords().message != " " && this.checkPasswords().message == "Passwords don't match"}
                                    value={this.props.repassword}
                                    onChange={this.props.setRepassword}
                                    id="confirmpassword" 
                                    label="Confirm password"
                                    type="password" 
                                    variant="outlined" 
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LockIcon />
                                            </InputAdornment>
                                        ),
                                        style:{
                                            backgroundColor: "white"
                                        }
                                    }} 
                                    fullWidth={true} 
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item>
                    <FormControlLabel
                        control={ 
                            <Checkbox 
                                checked={this.props.acceptTerms}
                                onChange={this.props.setAcceptTerms}
                                name="checkedB" 
                                color="primary" 
                            />
                        }
                        label={
                            <>I agree to the <b> <a style={{textDecoration:"none"}} onClick={()=>{}}> terms of service </a> </b></>
                        }
                    />
                </Grid>
                <Grid item>
                    <div style={{textAlign: "center", display: "inline-block"}}>
                        {/* <ReCAPTCHA
                            sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                            onChange={()=>{}}
                        /> */}
                    </div>
                </Grid>
            </>
        );
    }
}