import { produce } from 'immer';
import {User} from '../models/User'
import {AppState} from '../models/AppState'

import Peer from 'peerjs';

  export function uploadToCloud(this:any, upload: boolean){
    setTimeout(()=>{
      if(upload){
        //TODO: Uploading
        this.setState({cloudSaved: true, cloudSaving: false});
      } else{
        //TODO: Removing and revoking access
        this.setState({cloudSaved: false, cloudSaving: false});
      }
      
    }, 3000)
  }

   //TODO: Outdated
  export function copyCode(this:any) {
      let str="HG673"
      // Create new element
      var el = document.createElement('textarea');
      // Set value (string to be copied)
      el.value = str;
      // Set non-editable to avoid focus and move outside of view
      el.setAttribute('readonly', '');
      document.body.appendChild(el);
      // Select text inside element
      el.select();
      // Copy text to clipboard
      document.execCommand('copy');

      //alert("Copied");
      // Remove temporary element
      document.body.removeChild(el);
  }

  //TODO: Outdated
  export function handleCode(this:any, value: string){
    alert(value);
  }

  export function copyInvite(this:any){
    //TODO: copy invite link
    this.setState(produce((draft: AppState) => {
      draft.openTooltip = true;
    }));
  }

  export function authorize(this:any, username: string, password: string){
    if(username === "" && password === ""){
      this.setState(
        produce((draft: AppState) => {
          draft.warning = "No data entered"
        }))
        return;
    }
    else if(username === "" ){
      this.setState(
        produce((draft: AppState) => {
          draft.warning = "No email entered"
        }))
        return;
    }
    else if(password === "" ){
      this.setState(
        produce((draft: AppState) => {
          draft.warning = "No password entered"
        }))
        return;
    }

    this.setState(
      produce((draft: AppState) => {
        draft.warning = "";
        //TODO:
        draft.username = username;
        localStorage.setItem('username', JSON.stringify(username));
      }))
  }

  export function deauthorize(this:any){
    this.setState(
      produce((draft: AppState) => {
        draft.username = "";
        localStorage.removeItem('username');
      }))
  }

  export function makeHost(this:any, x:number){
    let coworkers: { [id: string] : User} = {...this.state.coworkers};
    coworkers[x] = {isClient: coworkers[x].isClient, username: coworkers[x].username, name: coworkers[x].name, color: coworkers[x].color, isHost: true}

    this.setState(
      produce((draft: AppState) => {
        draft.coworkers = coworkers;
      }))
  }
  export function kickOut(this:any, x:number){
    let coworkers:{ [id: string] : User} = {...this.state.coworkers};
    delete coworkers[x];

    this.setState(
      produce((draft: AppState) => {
        draft.coworkers = coworkers;
      }))
  }