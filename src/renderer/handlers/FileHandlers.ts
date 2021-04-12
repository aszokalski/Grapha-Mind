import { produce } from 'immer';

import * as fs from 'fs';
import * as path from 'path'
import * as el from 'electron';
import {AppState} from '../models/AppState'

//File Handlers
export function save(this:any, saveAs: boolean = false){
if(this.state.showSplash) {return;}
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
            projectListObj.push({name: fname, path: this.state.path})
        }

        localStorage.setItem('projectList', JSON.stringify(projectListObj));
        } else{
        let projectListObj = [];
        projectListObj.push({name: fileName, path: fileName})
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
});
}

export function createNew(this:any){
this.setState(
    produce((draft: AppState) => {
    draft.nodeDataArray = [
        { key: 0, text: 'Central Topic', loc: "0 0", borderColor:"#000000", borderWidth:0, borderRadius:5, stroke:"white", color:"rgb(255,0,0)", diagram: "main", parent: 0, deletable: false, dir: "right", depth: 0, scale: 1, font: "normal 28pt NeverMind", id: "82j", order: 0, presentationDirection:"horizontal" },
    ];
    draft.skipsDiagramUpdate = false;
    draft.showSplash = false;
    this.refreshNodeIndex(draft.nodeDataArray);
    }))
}