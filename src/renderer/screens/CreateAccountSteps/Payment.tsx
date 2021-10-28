import * as React from 'react';
import { produce } from 'immer';
import autobind from 'autobind-decorator';

import {
    Button,
    Grid,
    Typography,
    Card,
    CardContent,
    CardActions,
    Select,
    MenuItem
} from '@material-ui/core';

interface PaymentProps{
 
}

interface PaymentState{
    paymentLink: string;
}

const paymentLinks = [
    ['https://buy.stripe.com/9AQ15l4cueJwemAeUW', '$15/Year'], 
    ['https://buy.stripe.com/00g3dteR8atg7Yc9AB', '$5/Month']
]

@autobind
export class Payment extends React.PureComponent<PaymentProps, PaymentState>{
    constructor(props: PaymentProps){
        super(props);
        this.state = {
           paymentLink: paymentLinks[0][0]
        }
    }

    private setPaymentLink(event: any){
        this.setState(
            produce((draft: PaymentState) =>{
                draft.paymentLink = event.target.value;
            })
        )
    }

    public render(){
        return (
            <>
                <div style={{textAlign: "center", position: "absolute", top: "-40%", left:"50%", transform: "translate(-50%, -50%)"}}>
                    <h1> Choose a plan </h1>
                </div>

                <Grid container
                spacing={4}
                alignItems="center"
                direction="row"
                justifyContent="center"
                >
                    <Grid item>
                        <Card>
                            <CardContent>
                                <Typography  color="textSecondary" gutterBottom>
                                    <h2> Basic </h2>
                                </Typography>
                                <Typography variant="h5" component="h2">

                                </Typography>
                                <Typography  color="textSecondary">
                                    Free
                                </Typography>
                                <Typography>
                                <br />
                                    Mind mapping  <br />
                                    Coworking and sharing <br />
                                    One-Click Presentation  <br />
                                </Typography>
                            </CardContent>
                            <CardActions style={{textAlign: "center"}}>
                                
                            </CardActions>
                        </Card>
                    </Grid>
                    <Grid item>
                        <Card>
                            <CardContent>
                                <Typography  color="textPrimary" gutterBottom>
                                    <h2> <i>1</i>Mind Pro </h2>
                                </Typography>
                                <Typography variant="h5" component="h2">

                                </Typography>
                                <Typography >
                                <Select style={{color: "green"}}
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={this.state.paymentLink}
                                    onChange={this.setPaymentLink}
                                    
                                >
                                    {paymentLinks.map((x, i) =>{
                                        return <MenuItem value={x[0]}>{x[1]}</MenuItem>
                                    })}
                                </Select>
                
                                </Typography>
                                <Typography>
                                    <br />
                                    <b>
                                    Export options  <br />
                                    More templates  <br />
                                    More components  <br />
                                    AI Smart Suggestions <br />
                                    Unlimited cloud saves  <br />
                                Everything from Basic plan
                                </b> 
                                
                                
                                <br />
                                
                                </Typography>
                            </CardContent>
                            <CardActions style={{textAlign: "center"}}>
                                <Button 
                                    style={{marginLeft: "auto", marginRight:"auto", marginBottom:"20px"}}
                                    onClick={()=>{
                                        require('electron').shell.openExternal(
                                            this.state.paymentLink)}}
                                    variant="contained"
                                    color="primary"
                                >
                                    {this.state.paymentLink == "https://buy.stripe.com/9AQ15l4cueJwemAeUW" ? <> 30 day free trial</> : <> 7 day free trial</>
                                    }
                                    
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>               
                </Grid>
            </> 
        );
    }
}