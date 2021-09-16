import { produce } from 'immer';

import {AppState} from '../models/AppState'
import { show_active_users } from '@/server';

import 'peerjs';
import { DataConnection } from 'peerjs';

import
 {
    red, 
    purple,  
    pink,
    blue, 
    indigo, 
    green, 
    deepOrange, 
    deepPurple, 
    lightBlue, 
    cyan, 
    teal, 
    lightGreen, 
    lime, 
    yellow,
    amber, 
    orange, 
    brown, 
    grey, 
    blueGrey
} from '@material-ui/core/colors';

export function handlePeerOpen(this: any, id: number){
    console.log('Peer running with ID: ' + id);

    this.setState(produce((draft: AppState) => {
      draft.localPeerID = id;
    }));
}

function randomColor(){
    let colors =[
        red, 
        purple,  
        pink,
        blue, 
        indigo, 
        green, 
        deepOrange, 
        deepPurple, 
        lightBlue, 
        cyan, 
        teal, 
        lightGreen, 
        lime, 
        yellow,
        amber, 
        orange, 
        brown, 
        grey, 
        blueGrey
    ]
    return colors[Math.floor(Math.random() * colors.length)][500];
}

export function handlePeerConnection(this: any, conn: DataConnection){
    if(this.state.graphId == null) return;
    console.log('New connection received ' + conn.peer);

    this.setState(produce((draft: AppState) => {
        draft.peerConnections[conn.peer] = conn;
      }));

    show_active_users(this.state.graphId).then(list => {
        if(list !== undefined){
            list.forEach(user => {
                if(user.uuid == conn.peer){
                    this.setState(produce((draft: AppState) => {
                        draft.coworkers[user.username] = {isClient: false, isHost:false, color: randomColor(), name: user.username, username:user.username}
                    }));
                }
            })
        }
    })


    conn.on('open', () => {
        // Receive transactions
        conn.on('data', this.handleTransaction);
        conn.on('close', () => {
            //remove connection on close
            this.setState(produce((draft: AppState) => {
                delete draft.peerConnections[conn.peer];
            }));
        });
    });
}

export async function connectToOtherUsers(this: any){
    show_active_users(this.state.graphId).then(list => {
        if(list!== undefined){
            list.forEach(user => {
                if(this.P2P_Peer && this.state.username !== user.username){
                    var conn = this.P2P_Peer.connect((user as any).uuid);
                    console.log('New connection made ' + conn.peer);
    
                    this.setState(produce((draft: AppState) => {
                        draft.peerConnections[conn.peer] = conn;
                    }));
    
                    conn.on('open', () => {
                        // Receive transactions
                        conn.on('data', this.handleTransaction);
                        conn.on('close', () => {
                            //remove connection on close
                            this.setState(produce((draft: AppState) => {
                                delete draft.peerConnections[conn.peer];
                            }));
                        });
                    });
                }
            })
        }
    })
}