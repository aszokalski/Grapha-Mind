const MongoClient = require('mongodb').MongoClient;
const { ObjectID } = require('mongodb').ObjectID;

import * as go from 'gojs';
import { produce } from 'immer';
import {AppState} from './models/AppState';
import {DataConnection} from 'peerjs'

import blank_workplace from './static/graphs/template.json';

class ObjectWithUpdateDescription extends Object{
    public updateDescription: any;

    constructor(){
        super();
    }
}

const uri = "";
const database_type='1mind'

export async function transaction(graph_id: string, obj: {}){
    
    const client = new MongoClient(uri,{ useUnifiedTopology: true });
    try{
        const filter = {id: graph_id};
        const updateDoc={$push:{'transactions': obj}};
        const settings={};
        
        await client.connect();
        const database = client.db(database_type);
        const collection = database.collection("transactions");
        await collection.updateOne(filter,updateDoc, settings);
    }
    catch(err){
        console.log(err);
    }

    finally {
        await client.close();
    }
}

export async function P2P_transaction(this:any, obj: {}){
    for(let id in this.state.peerConnections){
        this.state.peerConnections[id].send(obj);
    }
}

export async function runstream(this: any){
    
    const client = new MongoClient(uri,{ useUnifiedTopology: true });
    var changeStream: any;
    console.log('runstream function runs!!!');
    try{
        await client.connect();
        const database = client.db(database_type);
        const collection = database.collection("transactions");
        changeStream=collection.watch();
        changeStream.on("change", (update: ObjectWithUpdateDescription) =>{
            const zmiana = update.updateDescription.updatedFields;
            const attr = Object.getOwnPropertyNames(zmiana)[0];
            const obj = zmiana[attr];
            this.handleTransaction(obj);

            // this.handleModelChange(obj['transaction'], true);
        });
    } catch(err){
        console.log(err);
    }
    finally{
        //await client.close();// ----roboczo działa, ale trzeba gdzieś changestreamy zamykać potem
    }
}

export function handleTransaction(this: any, obj: any){
    console.log("receiving transaction: ", obj['key'], obj);
    if(this.state.lastTransactionKey.includes(obj['key'])){
        console.log('stopping transaction: ', obj['key']);
    } else{
        if(obj['last_tranaction_required'] == null){
            this.handleModelChange(obj['transaction'], obj['key']);
            console.log(Object.keys(this.state.pendingTransactions));
            if(Object.keys(this.state.pendingTransactions).includes(obj['key'])){
                let transaction = this.state.pendingTransactions[obj['key']];
                this.setState(
                    produce((draft: AppState) => {
                        delete draft.pendingTransactions[obj['key']];
                    })
                    );
                this.handleTransaction(transaction)
            }
        } else{
            if(this.state.lastTransactionKey.includes(obj['last_tranaction_required'])){
                this.handleModelChange(obj['transaction'], obj['key']);
                console.log(Object.keys(this.state.pendingTransactions));
                if(Object.keys(this.state.pendingTransactions).includes(obj['key'])){
                    let transaction = this.state.pendingTransactions[obj['key']];
                    this.setState(
                        produce((draft: AppState) => {
                          delete draft.pendingTransactions[obj['key']];
                        })
                      );
                    this.handleTransaction(transaction)
                }
            }  else{
                this.setState(
                    produce((draft: AppState) => {
                      draft.pendingTransactions[obj['last_tranaction_required']] = obj;
                    })
                  );
            }
        }
    }
}

export async function download(email: string) {
    
    const client = new MongoClient(uri,{ useUnifiedTopology: true });
    try{
        await client.connect();
        const database = client.db(database_type);
        const workplaces = database.collection("workplaces");
        const users=database.collection('users');

        const query = {'email':email};
        const options = {projection: {workplaces: 1}};
        const graph_ids = JSON.parse(JSON.stringify(await users.findOne(query,options)))['workplaces'];
        
        const graph_id=graph_ids[0];

        const query2 = {_id: ObjectID.createFromHexString(graph_id)};
        const options2 = {projection: {_id:1, nodes:1, connected_users:1}}
        var graph = await workplaces.findOne(query2,options2);
        console.log(graph);
        return graph;
    }
    catch(err){
        console.log(err);
    }

    finally {
        await client.close();
    }
}

export async function download_specific_workplace(graph_id:string) {
    
    const client = new MongoClient(uri,{ useUnifiedTopology: true });
    try{
        await client.connect();
        const database = client.db(database_type);
        const workplaces = database.collection("workplaces");
        // const graph_ids = JSON.parse(JSON.stringify(await users.findOne(query,options)))['workplaces'];
        
        // const graph_id=graph_ids[0];

        const query2 = {_id: ObjectID.createFromHexString(graph_id)};
        const options2 = {}
        var graph = await workplaces.findOne(query2,options2);
        // console.log(graph);
        return graph;
    }
    catch(err){
        console.log(err);
    }

    finally {
        await client.close();
    }
}

export async function modify(graph_id: string, node: any){
    
    const client = new MongoClient(uri,{ useUnifiedTopology: true });


    const filter = {_id: ObjectID.createFromHexString(graph_id), 'nodes.id': node.id};
    const updateDoc={$set:{'nodes.$': node}};
    const settings={};

    try{
        await client.connect();
        const database = client.db(database_type);
        const collection = database.collection("workplaces");
        await collection.updateOne(filter,updateDoc, settings);
    }
    catch(err){
        console.error(err);
    }
    finally{
        await client.close();
    }
}

export async function add_node(graph_id: string, node: Object){
    
    const client = new MongoClient(uri,{ useUnifiedTopology: true });
    
    const filter = {_id: ObjectID.createFromHexString(graph_id)};
    const updateDoc={$push:{'nodes': node}};
    const settings={};

    try{
        await client.connect();
        const database = client.db(database_type);
        const collection = database.collection("workplaces");
        await collection.updateOne(filter, updateDoc, settings);
    }
    catch(err){
        console.error(err);
    }
    finally{
        await client.close();
    }
}

export async function remove(graph_id: string, node: Number){
    
    const client = new MongoClient(uri,{ useUnifiedTopology: true });
    
    const filter = {_id: ObjectID.createFromHexString(graph_id)};
    //const updateDoc=[{$set:{ nodes: {$concatArrays:[ {$slice:[ "$nodes", node ]}, {$slice:[ "$nodes", {$add:[1,node]}, {$size:"$nodes"}]}]}}}];
    const updateDoc = {$pull:{'nodes': {key: node}}};
    const settings={};

    try{
        await client.connect();
        const database = client.db(database_type);
        const collection = database.collection("workplaces");
        await collection.updateOne(filter, updateDoc, settings);
    }
    catch(err){
        console.error(err);
    }
    finally{
        await client.close();
    }
}

export async function check_cred(username: string, password: string){
    
    const client = new MongoClient(uri,{ useUnifiedTopology: true });
    
    const query={'username': username, 'password': password};

    try{
        await client.connect();
        const database = client.db(database_type)
        const collection = database.collection('users');

        const ans = await collection.findOne(query);
        if(ans === null){
            return false;
        }
        else if(typeof ans === 'object'){
            return true;
        }
        else{
            return 'unidentified error with logging in procedure';
        }
    }
    catch(err){
        console.error(err);
    }
    finally{
        await client.close();
    }
}

export async function create_user(email: string, password: string) {
    
    const client = new MongoClient(uri,{ useUnifiedTopology: true });

    const doc = {'email': email, 'password': password,'license': new Date(), 'workplaces': []};

    try{
        await client.connect();
        const database = client.db(database_type)
        const collection = database.collection('users');
        await collection.findOne({'email': email}).then(async (res:any) =>{
            if(res === null){
                await collection.insertOne(doc);
            }
            else if(typeof res === 'object'){
                return 'this email has already been used';
            }
            else{
                return 'unidentified error with creating account procedure';
            }
        })
    }
    catch(err){
        console.error(err);
    }
    finally{
        await client.close();
    }
}

export async function change_password(email: string, password: string, newpassword: string){
    
    const client = new MongoClient(uri,{ useUnifiedTopology: true });

    const filter = {'email': email, 'password': password};
    const updateDoc={$set: {'password': newpassword}};
    const settings={};

    try{
        await client.connect();
        const database = client.db(database_type);
        const collection = database.collection('users');

        await collection.findOne({'email': email, 'password': password}).then(async (res:any) =>{
            if(typeof res === 'object'){
                await collection.updateOne(filter, updateDoc, settings);
            }
            else if(res === null){
                return 'email or password are not correct';
            }
            else{
                return 'unidentifier error during changing users password';
            }
        })
    }
    catch(err){
        console.error(err);
    }
    finally{
        await client.close();
    }
}


export async function activate_license(email: string, time: number){
    
    const client = new MongoClient(uri,{ useUnifiedTopology: true });

    const filter = {'email': email};
    var date = new Date();

    const updateDoc={$set: {'license': date}};
    const settings={};

    try{
        await client.connect();
        const database = client.db(database_type);
        const collection = database.collection('users');

        await collection.findOne({'email': email}).then(async (res:any) =>{
            console.log(res);
            if(typeof res === 'object'){
                if(compareDate(res.license, new Date())===1){
                    date.setDate(res.license.getDate() + time);
                    await collection.updateOne(filter, updateDoc, settings);
                    console.log(1);
                }
                else if(compareDate(res.license, new Date())===-1){
                    date.setDate(date.getDate() + time);
                    await collection.updateOne(filter, updateDoc, settings);
                    console.log(2);
                }
                else if(compareDate(res.license, new Date())===0){
                    date.setDate(date.getDate() + time);
                    await collection.updateOne(filter, updateDoc, settings);
                    console.log(3);
                }
                else{
                    //return 'unidentified error while adding license days'
                    console.log(4);
                }
                
                //await collection,updateOne(filter, updateDoc, settings)
            }
            else if(res === null){
                return "email not correct";
            }
            else{
                return 'unidentified error while prolonging the license';
            }
        })
    }
    catch(err){
        console.error(err);
    }
    finally{
        await client.close();
    }
}

function compareDate(date1: Date, date2: Date)
{
    let d1 = new Date(date1); let d2 = new Date(date2);
    let same = d1.getTime() === d2.getTime();
    if (same) return 0;
    if (d1 > d2) return 1;
    if (d1 < d2) return -1;
}

export async function remove_user(email: string){
    
    const client = new MongoClient(uri,{ useUnifiedTopology: true });

    const query = {'email': email};

    try{
        await client.connect();
        const database = client.db(database_type);
        const collection = database.collection('users');

        const result = await collection.deleteOne(query);
        if (result.deletedCount === 1) {
            return 1;
        }
        else {
            return 'unidentified error while removing user';
        }    }
    catch(err){
        console.error(err);
    }
    finally{
        await client.close();
    }
}

export async function create_workplace(email: string, graph?:Array<Object>, workplace_name?:string){
    
    const client = new MongoClient(uri,{ useUnifiedTopology: true });

    try{
        await client.connect();
        const database = client.db(database_type);
        const workplaces = database.collection('workplaces');
        const users = database.collection('users');

        // const nodes=blank_workplace.nodes;
        const connected_users:any=[];
        if (typeof(graph) == 'undefined'){
            graph=blank_workplace.nodes;
        }
        if (typeof(workplace_name) == 'undefined')
        {
            // const querytemp={"email":email}
            // const optionstemp={projection: {'workplaces':1}}
            // await users.findOne(querytemp,optionstemp).then(async(res:any)=>{
            //     return res
            // })
            // return 0
            // return ans.then
            workplace_name='temp_name'
        }
        const insertion={'nodes':graph,'connected_users':connected_users, 'workplace_name':workplace_name, 'owner_email':email};
        var ans = await workplaces.insertOne(insertion).then(async (res: any)=>{
            const id = res.insertedId;
            const filter = {'email': email};
            const options = {};
            const updateDoc = {$push: {'workplaces': id}};
            await users.updateOne(filter, updateDoc, options);
            return id.toString()
        })
        return ans

    }
    catch(err){
        console.error(err);
    }
    finally{
        await client.close();
    }
}

export async function remove_workplace(this:any, id: string){
    
    const client = new MongoClient(uri,{ useUnifiedTopology: true });
    let email = this.state.username;
    
    try{
        await client.connect();
        const database = client.db(database_type);
        const workplaces = database.collection('workplaces');
        const users = database.collection('users');
        const graphId = ObjectID.createFromHexString(id);
        const query = {'_id': graphId};
        await workplaces.deleteOne(query);

        const updateDoc = {$pull: {'workplaces': graphId}};
        const filter = {'email': email};
        const options = {};
        await users.updateOne(filter, updateDoc, options);

    }
    catch(err){
        console.error(err);
    }
    finally{
        await client.close();
    }

}

export async function rename_workplace(email: string, id: string, name: string){
    
    const client = new MongoClient(uri,{ useUnifiedTopology: true });
    
    try{
        await client.connect();
        const database = client.db(database_type);
        const workplaces = database.collection('workplaces');
        const graphId = ObjectID.createFromHexString(id);
        const filter = {'_id': graphId};
        const options = {};
        const updateDoc = {$set: {'workplace_name': name}};
        await workplaces.updateOne(filter, updateDoc, options);
    }
    catch(err){
        console.error(err);
    }
    finally{
        await client.close();
    }
}

export async function rename_current_workplace(this:any, name: string){
    let id = this.state.graphId;
    
    const client = new MongoClient(uri,{ useUnifiedTopology: true });
    
    try{
        await client.connect();
        const database = client.db(database_type);
        const workplaces = database.collection('workplaces');
        const graphId = ObjectID.createFromHexString(id);
        const filter = {'_id': graphId};
        const options = {};
        const updateDoc = {$set: {'workplace_name': name}};
        await workplaces.updateOne(filter, updateDoc, options);
    }
    catch(err){
        console.error(err);
    }
    finally{
        let projectList = localStorage.getItem('projectList');
        if(projectList){
          let projectListObj = JSON.parse(projectList);
            for(let index in projectListObj){
              if(projectListObj[index].name == this.state.path){
                projectListObj[index] = {
                  type: "cloud", 
                  name: name, 
                  id: id
                }
                this.setState({path: name});
                break;
              }
          }
        
          localStorage.setItem('projectList', JSON.stringify(projectListObj));
      }
        await client.close();
    }

}

export async function clear_workplace(graph_id: string){
    
    const client = new MongoClient(uri,{ useUnifiedTopology: true });
    try{
        console.log("clearing workplace");
        await client.connect();
        const database = client.db(database_type);
        const workplaces = database.collection('workplaces');
        const filter = {_id: ObjectID.createFromHexString(graph_id)};
        const updateDoc = {$set:{'nodes':blank_workplace.nodes}}; //niby nie istnieje ale jednak istnieje kurcze :((
        const options = {};
        await workplaces.updateOne(filter, updateDoc, options);
    }
    catch(err){
        console.error(err);
    }
    finally{
        console.log("cleared workplace");
        await client.close();
    }

}

export async function clear_transactions(graph_id: string){
    
    const client = new MongoClient(uri,{ useUnifiedTopology: true });
    try{
        console.log("clearing transactions");
        await client.connect();
        const database = client.db(database_type);
        const transactions = database.collection('transactions');
        const filter = {_id: ObjectID.createFromHexString(graph_id)};
        const updateDoc = {$set:{'transactions': []}}; //niby nie istnieje ale jednak istnieje kurcze :((
        const options = {};
        await transactions.updateOne(filter, updateDoc, options);
    }
    catch(err){
        console.error(err);
    }
    finally{
        console.log("cleared transactions");
        await client.close();
    }

}

export async function join_workplace(graph_id:string, uuid: Object) {
    
    const client = new MongoClient(uri,{ useUnifiedTopology: true });
    try{
        console.log("joining session",graph_id);
        await client.connect();
        const database = client.db(database_type);
        const workplaces = database.collection('workplaces');
        const filter = {_id: ObjectID.createFromHexString(graph_id)};
        const updateDoc = {$push:{'connected_users': uuid}};
        const options = {};
        await workplaces.updateOne(filter, updateDoc, options);
    }
    catch(err){
        console.error(err);
    }
    finally{
        await client.close();
    }

}

export async function leave_workplace(graph_id:string, uuid: Object, callback:()=>void) {//trzeba to przypiąć gdzieś, żeby się wykonało raz przed wyjściem usera
    
    const client = new MongoClient(uri,{ useUnifiedTopology: true });
    try{
        console.log("leaving session",graph_id);
        await client.connect();
        const database = client.db(database_type);
        const workplaces = database.collection('workplaces');
        const filter = {_id: ObjectID.createFromHexString(graph_id)};
        const updateDoc = {$pull:{'connected_users': uuid}};
        const options = {};
        await workplaces.updateOne(filter, updateDoc, options);
    }
    catch(err){
        console.error(err);
    }
    finally{
        await client.close();
        callback();
    }

}

interface UserData{
    username: string,
    uuid: string
}

export async function show_active_users(graph_id:string) {
    
    const client = new MongoClient(uri,{ useUnifiedTopology: true });
    try{
        await client.connect();
        const database = client.db(database_type);
        const workplaces = database.collection('workplaces');
        const query = {_id: ObjectID.createFromHexString(graph_id)};
        const options = {projection: {connected_users:1},};
        const answer = await workplaces.findOne(query, options);
        return answer.connected_users as Array<UserData>;
    }
    catch(err){
        console.error(err);
    }
    finally{
        await client.close();
    }
    
}

export async function show_users_workplaces(email:string) {
    
    const client = new MongoClient(uri,{ useUnifiedTopology: true });
    try{
        await client.connect();
        const database = client.db(database_type);
        const users = database.collection('users');
        const query = {'email': email};
        const options = {projection: {'workplaces':1}};

        var ids:string[];
        var ans = await users.findOne(query,options).then(async(res:any)=>{
            let ids=[];
            for(let i=0;i<res.workplaces.length;i++){
                ids.push(res.workplaces[i].toString())
            }
            return ids
        });
        return ans
    }
    catch(err){
        console.error(err);
    }
    finally{
        await client.close();
    }
    
}

export async function check_workplace(id:string) {
    
    const client = new MongoClient(uri,{ useUnifiedTopology: true });
    try{
        await client.connect();
        const database = client.db(database_type);
        const workplaces = database.collection('workplaces');
        const query = {'_id': ObjectID.createFromHexString(id)};
        const options = {projection:{'owner_email':1}};

        var ans = await workplaces.findOne(query,options).then(async(res:any)=>{
            return res
        });
        return ans
    }
    catch(err){
        console.error(err);
    }
    finally{
        await client.close();
    }
    
}