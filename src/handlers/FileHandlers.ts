import { produce } from 'immer';

import * as fs from 'fs';
import * as path from 'path'
import * as el from 'electron';
import {AppState} from '../models/AppState'
import { clear_workplace, create_workplace, download, download_specific_workplace, join_workplace, runstream, show_active_users } from '@/server';
import { useReducer } from 'react';
import { join } from 'webpack.config';
import { ObjectData } from 'gojs';

//File Handlers
export function save(this:any, saveAs: boolean = false){
    if(this.state.showSplash) {return;}
    if(this.state.cloudSaved && !saveAs) {return;}
    const dialog = el.remote.dialog; 
    let saveData = {
        graphId: this.state.graphId,
        nodeDataArray: this.state.nodeDataArray
    }

    if(this.state.path && !saveAs){
        fs.writeFile(this.state.path, JSON.stringify(saveData), (err) => {
        if(err){
            alert("An error ocurred creating the file "+ err.message)
            return;
        }

        this.setState(
            produce((draft: AppState) => {
            draft.saved = true;
            })
        );
        
        let projectList = localStorage.getItem('projectList');
        if(projectList){
            let projectListObj = JSON.parse(projectList);
            let pass = true;
            for(let project of projectListObj){
                if(project.path === this.state.path){
                    pass = false;
                }
            }
            if(pass && this.state.path){
                let fname = path.parse(this.state.path).base;
                projectListObj.push({name: fname, path: this.state.path})
            }

            localStorage.setItem('projectList', JSON.stringify(projectListObj));
        } else{
            let projectListObj = [];

            if(this.state.path){
                let fname = path.parse(this.state.path).base;
                projectListObj.push({name: fname, path: this.state.path})
                localStorage.setItem('projectList', JSON.stringify(projectListObj));
            }
        }
        return;
        });
        return;
    }

    dialog.showSaveDialog({ 
        title: 'Select the File Path to save', 
        defaultPath: '', 
        // defaultPath: path.join(__dirname, '../assets/'), 
        buttonLabel: 'Save', 
        // Restricting the user to only Text Files. 
        filters: [ 
            { 
                name: 'Mind Maps', 
                extensions: ['mind'] 
            }, ], 
        properties: [] 
    } as el.SaveDialogOptions,(fileName) => {
        if (fileName === undefined){
            console.log("You didn't save the file");
            return;
        }

        // fileName is a string that contains the path and filename created in the save file dialog.  
        fs.writeFile(fileName, JSON.stringify(saveData), (err) => {
            if(err){
                alert("An error ocurred creating the file "+ err.message)
                return;
            }

            this.setState(
                produce((draft: AppState) => {
                    draft.saved = true;
                    draft.path = fileName;
                })
            );
            
            let projectList = localStorage.getItem('projectList');
            if(projectList){
                let projectListObj = JSON.parse(projectList);
                let pass = true;
                for(let project of projectListObj){
                    if(project.path === fileName){
                        pass = false;
                    }
                }
                if(pass){
                    let fname = path.parse(fileName).base;
                    projectListObj.push({
                        type: "local",
                        name: fname, 
                        path: this.state.path
                    })
                }

                localStorage.setItem('projectList', JSON.stringify(projectListObj));
            } else{
                let projectListObj = [];
                let fname = path.parse(fileName).base;
                projectListObj.push({
                    type: "local",
                    name: fname, 
                    path: this.state.path})
                localStorage.setItem('projectList', JSON.stringify(projectListObj));
            }
        });
    }); 
}

export function load(this:any){
    const dialog = el.remote.dialog; 
    dialog.showOpenDialog({ 
        title: 'Select the File to open', 
        buttonLabel: 'Open', 
        // Restricting the user to only Text Files. 
        filters: [ 
            { 
                name: 'Mind Maps', 
                extensions: ['mind'] 
            }, ], 
    } as el.OpenDialogOptions, (fileNames) => {
        // fileNames is an array that contains all the selected
        if(fileNames === undefined){
            console.log("No file selected");
            return;
        }

        fs.readFile(fileNames[0], 'utf-8', (err, data) => {
            if(err){
                alert("An error ocurred reading the file :" + err.message);
                return;
            }

            
            let saveData = JSON.parse(data);

            this.setState(
            produce((draft: AppState) => {
                draft.nodeDataArray = saveData['nodeDataArray'];
                draft.graphId = saveData['graphId']
                draft.skipsDiagramUpdate = false;
                draft.showSplash = false;
                draft.path = fileNames[0];
                this.refreshNodeIndex(draft.nodeDataArray);
                draft.saved = true;
                draft.first = true;
            }))

            let projectListJSON = localStorage.getItem("projectList")
            if(projectListJSON){
                let projectList = JSON.parse(projectListJSON);
                for(let i in projectList){
                    if(projectList[i].path == fileNames[0]){
                        projectList.splice(i, 1);
                        break;
                    }
                }

                let fname = path.parse(fileNames[0]).base;
                projectList.push({
                    type: "local",
                    name: fname, 
                    path: this.state.path
                })
                localStorage.setItem('projectList', JSON.stringify(projectList));
            } else{
                let projectList = [];
                let fname = path.parse(fileNames[0]).base;
                projectList.push({
                    type: "local",
                    name: fname, 
                    path: this.state.path
                })
                localStorage.setItem('projectList', JSON.stringify(projectList));
            }
        });
    });
}

export function loadFilename(this:any, filename: string){
fs.readFile(filename, 'utf-8', (err, data) => {
    if(err){
        alert("An error ocurred reading the file :" + err.message);
        return;
    }

    
    let saveData = JSON.parse(data);

    this.setState(
    produce((draft: AppState) => {
        draft.nodeDataArray = saveData['nodeDataArray'];
        draft.graphId = saveData['graphId']
        draft.skipsDiagramUpdate = false;
        draft.showSplash = false;
        draft.path = filename;
        draft.saved = true;
        draft.first = true;
        this.refreshNodeIndex(draft.nodeDataArray);
    }))

    let projectListJSON = localStorage.getItem("projectList")
    if(projectListJSON){
        let projectList = JSON.parse(projectListJSON);
        for(let i in projectList){
            if(projectList[i].path == filename){
                projectList.splice(i, 1);
                break;
            }
        }

        let fname = path.parse(filename).base;
        projectList.push({
            type: "local",
            name: fname,
            path: this.state.path
        })
        localStorage.setItem('projectList', JSON.stringify(projectList));
    } else{
        let projectList = [];
        let fname = path.parse(filename).base;
        projectList.push({
            type: "local",
            name: fname,
            path: this.state.path
        })
        localStorage.setItem('projectList', JSON.stringify(projectList));
    }
});
}

export function openCloud(this: any, id: any){
    download_specific_workplace(id).then(data =>{
        this.setState(
            produce((draft: AppState) => {
                draft.graphId = data._id.toString();
                var dymki = data.nodes;
                for(let node of dymki){
                var klucze = Object.keys(node);
                for(var i = 0;i<klucze.length;i++){
                    var tempObj = Reflect.get(node,klucze[i]);
                    if(typeof tempObj === 'object'){
                        Reflect.set(node, klucze[i], parseInt(Reflect.get(tempObj,Object.keys(tempObj)[0])));
                    }
                }
                }
                draft.cloudChecked = true;
                draft.cloudSaved = true;
                draft.skipsDiagramUpdate=false;
                draft.skipsModelChange=true;
                draft.showSplash = false;
                draft.nodeDataArray=dymki;
                draft.path = "New Cloud Project";
                this.refreshNodeIndex(draft.nodeDataArray);
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

        let projectListJSON = localStorage.getItem("projectList")
        if(projectListJSON){
            let projectList = JSON.parse(projectListJSON);
            let name = "New Cloud Project";
            for(let i in projectList){
                if(projectList[i].id == id){
                    name = projectList[i].name;
                    projectList.splice(i, 1);
                    break;
                }
            }
            projectList.push({
                type: "cloud",
                name: name,
                id: id
            })
            localStorage.setItem('projectList', JSON.stringify(projectList));
        } else{
            let projectList = [];
            projectList.push({
                type: "cloud",
                name: "New Cloud Project",
                id: id
            })
            localStorage.setItem('projectList', JSON.stringify(projectList));
        }
    });
}

export function createNew(this:any, cloud: boolean=false, template: Array<any> | null = null){
    // Create New
    if(cloud){
        create_workplace(this.state.username).then((id: any)=>{
            let projectList = localStorage.getItem('projectList');
            if(projectList){
                let projectListObj = JSON.parse(projectList);
                projectListObj.push({type: "cloud", name: "New Cloud Project", id: id})
                localStorage.setItem('projectList', JSON.stringify(projectListObj));
            } else{
                let projectListObj =  [];
                projectListObj.push({type: "cloud", name: "New Cloud Project", id: id})
                localStorage.setItem('projectList', JSON.stringify(projectListObj));
            }

            download_specific_workplace(id).then(data =>{
                this.setState(
                    produce((draft: AppState) => {
                        draft.graphId = data._id.toString();
                        var dymki = data.nodes;
                        for(let node of dymki){
                        var klucze = Object.keys(node);
                        for(var i = 0;i<klucze.length;i++){
                            var tempObj = Reflect.get(node,klucze[i]);
                            if(typeof tempObj === 'object'){
                                Reflect.set(node, klucze[i], parseInt(Reflect.get(tempObj,Object.keys(tempObj)[0])));
                            }
                        }
                        }
                        draft.cloudChecked = true;
                        draft.cloudSaved = true;
                        draft.skipsDiagramUpdate = false;
                        draft.skipsModelChange = true;
                        draft.showSplash = false;
                        draft.nodeDataArray = dymki;
                        draft.path = "New Cloud Project"
                        this.refreshNodeIndex(draft.nodeDataArray);
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
        });

        //clear_workplace(this.state.graphId);
    } else{
        this.setState(
            produce((draft: AppState) => {
            draft.nodeDataArray = template != null ? template as ObjectData[]: [
                { key: 0, editingUser: null, text: 'Central Topic', loc: "0 0", borderColor:"#000000", borderWidth:0, borderRadius:5, stroke:"white", color:"rgb(255,0,0)", diagram: "main", parent: 0, deletable: false, dir: "right", depth: 0, scale: 1, font: "normal 28pt NeverMind", id: "82j", order: 0, presentationDirection:"horizontal" },
            ];
            draft.cloudSaved = false;
            draft.cloudChecked = false;
            draft.skipsDiagramUpdate = false;
            draft.showSplash = false;
            this.refreshNodeIndex(draft.nodeDataArray);
        }))
    }

}

