import { produce } from 'immer';
import {User} from '../models/User'
import {AppState} from '../models/AppState'
import { create_workplace, remove_workplace , join_workplace} from '@/server';
import * as path from 'path'

export async function uploadToCloud(this:any, upload: boolean){
  if(upload){
    console.log(this.state.path)
    let projname = (this.state.path != null && this.state.path != undefined) ? path.parse(this.state.path).base.split(".")[0] : "New Cloud Project";
    await create_workplace(this.state.username, this.state.nodeDataArray, projname).then((id: any)=>{
      let projectList = localStorage.getItem('projectList');
      if(projectList){
          let projectListObj = JSON.parse(projectList);
          if(this.state.path == null){
            projectListObj.push({type: "cloud", name: projname, id: id})
          } else{
            let done = false
            for(let index in projectListObj){
              if(projectListObj[index].path == this.state.path){
                projectListObj[index] = {
                  type: "cloud", 
                  name: projname, 
                  id: id
                }
                done = true;
                break;
              }
            }

            if(!done){
              projectListObj.push({type: "cloud", name: projname, id: id})
            }
          }
        
          localStorage.setItem('projectList', JSON.stringify(projectListObj));
      } else{
          let projectListObj =  [];
          projectListObj.push({type: "cloud", name: projname, id: id})
          localStorage.setItem('projectList', JSON.stringify(projectListObj));
      }
      this.setState(
        produce((draft: AppState) => {
            draft.graphId = id.toString();
            draft.cloudChecked = true;
            draft.cloudSaved = true;
            draft.cloudSaving = false;
            draft.skipsDiagramUpdate = false;
            draft.skipsModelChange = true;
            draft.path = projname
        })
      )

      join_workplace(
        this.state.graphId,
        {
            username: this.state.username, 
            name: this.state.username,
            uuid: this.state.localPeerID
        }
      );
      this.connectToOtherUsers();
    });
    } else{
      this.setState(
        produce((draft: AppState) => {
            draft.graphId = null;
            draft.cloudChecked = false;
            draft.cloudSaved = false;
            draft.cloudSaving = false;
            draft.path = null;
            draft.saved = false;
        })
      )
  }
  }

   //TODO: Outdated
  export function copyCode(this:any) {
      let str=this.state.graphId;
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
    var proc = require('child_process').spawn('pbcopy'); 
    proc.stdin.write(this.state.graphId); proc.stdin.end();

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
    else if(false ){
      //TODO:
      this.setState(
        produce((draft: AppState) => {
          draft.warning = "Wrong credentials"
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

  export function usernameUsed(username: boolean){
    //TODO: check if a validated user with this username exists
    return false;
  }

  export function emailUsed(email: boolean){
    //TODO: check if a validated user with this email exists 
    return false;
  }

  export function createAccount(name: string, surname: string, username: string,  email: string, password: string){
    //  TODO: create an unvalidated account. Remove any previous unvalidated accounts with this username/email. 
    //  Associate this account creation date with a current date
    //  Hash the password
    return false;
  }

  export function activateLicense(username: string,  type: "monthly" | "anually"){
    //  TODO: 
    return false;
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