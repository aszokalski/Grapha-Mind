import * as React from 'react';
import { produce } from 'immer';
import autobind from 'autobind-decorator';

import {
    Button,
    Grid,
} from '@material-ui/core';
import ReactCodeInput from 'react-code-input';

interface EmailVerificationProps{
    validateEmail(): void;
    email: string;
}

interface EmailVerificationState{
    code: string;
}

@autobind
export class EmailVerification extends React.PureComponent<EmailVerificationProps, EmailVerificationState>{
    constructor(props: EmailVerificationProps){
        super(props);
        this.state = {
            code: ""
        }
    }

    public handleChangeCode(value: string){
        this.setState(
            produce((draft: EmailVerificationState) => {
                draft.code = value;
                if(value.length == 6){
                    //TODO: confirm
                    this.props.validateEmail();
                }
        }));
    }

    public render(){
        return (
            <>
                <Grid item>
                        <h1> Enter verification code </h1>
                    </Grid>
                    <Grid item id="code">
                        <ReactCodeInput 
                        value={this.state.code}
                        onChange={this.handleChangeCode}
                        type='text'
                        fields={6} 
                        name="code" 
                        inputMode="verbatim"
                        inputStyle= {{
                            
                            textTransform: "uppercase",
                            font: "32px SourceCodePro",
                            MozAppearance: "textfield",
                            borderRadius: "6px",
                            border: "1px solid",
                            margin: "4px",
                            paddingLeft: "12.5px",
                            width: "53px",
                            height: "53px",
                            fontSize: "40px",
                            boxSizing: "border-box",
                            color: "black",
                            backgroundColor: "white",
                            borderColor: "ligh88tgrey"
                            }}
                        />
                    </Grid>
                    <Grid item>
                            Sent to: {this.props.email}
                    </Grid>

                    <Grid item>
                            <Button 
                                onClick={()=>{}}
                                variant="outlined">
                                Resend
                            </Button>
                    </Grid>
            </>
        );
    }
}