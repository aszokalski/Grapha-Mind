import { produce } from 'immer';

import {AppState} from '../models/AppState'

import 'peerjs';
import { DataConnection } from 'peerjs';

export function handlePeerOpen(this: any, id: number){
    console.log('Peer running with ID: ' + id);

    this.setState(produce((draft: AppState) => {
      draft.localPeerID = id;
    }));
}

export function handlePeerConnection(this: any, conn: DataConnection){
    if(this.graphId == null) return;
    console.log('New connection received ' + conn.peer);

    this.setState(produce((draft: AppState) => {
        this.draft.peerConnections[conn.peer] = conn;
    }));

    conn.on('open', () => {
        // Receive transactions
        conn.on('data', this.handleTransaction);
        conn.on('close', () => {
            //remove connection on close
            this.setState(produce((draft: AppState) => {
                delete this.draft.peerConnections[conn.peer];
            }));
        });
    });
}