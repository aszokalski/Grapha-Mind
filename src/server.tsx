import { DateRangeSharp } from "@material-ui/icons";

const MongoClient = require('mongodb').MongoClient;
const { ObjectID } = require('mongodb').ObjectID;

export async function download(graph_id: string) {
    const uri = "mongodb+srv://testuser:kosmatohuj@1mind.z6d3c.mongodb.net/1mind?retryWrites=true&w=majority";
    const client = new MongoClient(uri,{ useUnifiedTopology: true });
    try{
        await client.connect();
        const database = client.db("1mind");
        const collection = database.collection("workplaces");
        const answer = await collection.findOne();
        return answer;
    }
    catch(err){
        console.log(err);
    }

    finally {
        await client.close();
    }
}

export async function modify(graph_id: string, node: Object){
    const uri = "mongodb+srv://testuser:kosmatohuj@1mind.z6d3c.mongodb.net/1mind?retryWrites=true&w=majority";
    const client = new MongoClient(uri,{ useUnifiedTopology: true });

    const filter = {_id: ObjectID.createFromHexString(graph_id), 'nodes.id': node.id};//ten error jest przez kompilator w vscodzie chyba, wszystko tu działa tak jak powinno
    const updateDoc={$set:{'nodes.$': node}};
    const settings={};

    try{
        await client.connect();
        const database = client.db("1mind");
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

export async function add(graph_id: string, node: Object){
    const uri = "mongodb+srv://testuser:kosmatohuj@1mind.z6d3c.mongodb.net/1mind?retryWrites=true&w=majority";
    const client = new MongoClient(uri,{ useUnifiedTopology: true });
    
    const filter = {_id: ObjectID.createFromHexString(graph_id)};
    const updateDoc={$push:{'nodes': node}};
    const settings={};

    try{
        await client.connect();
        const database = client.db("1mind");
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
    const uri = "mongodb+srv://testuser:kosmatohuj@1mind.z6d3c.mongodb.net/1mind?retryWrites=true&w=majority";
    const client = new MongoClient(uri,{ useUnifiedTopology: true });
    
    const filter = {_id: ObjectID.createFromHexString(graph_id)};
    const updateDoc=[{$set:{ nodes: {$concatArrays:[ {$slice:[ "$nodes", node ]}, {$slice:[ "$nodes", {$add:[1,node]}, {$size:"$nodes"}]}]}}}];
    const settings={};

    try{
        await client.connect();
        const database = client.db("1mind");
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

export async function check_cred(email: string, password: string){
    const uri = "mongodb+srv://testuser:kosmatohuj@1mind.z6d3c.mongodb.net/1mind?retryWrites=true&w=majority";
    const client = new MongoClient(uri,{ useUnifiedTopology: true });
    
    const query={'email': email, 'password': password};

    try{
        await client.connect();
        const database = client.db('1mind')
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
    const uri = "mongodb+srv://testuser:kosmatohuj@1mind.z6d3c.mongodb.net/1mind?retryWrites=true&w=majority";
    const client = new MongoClient(uri,{ useUnifiedTopology: true });

    const doc = {'email': email, 'password': password,'license': new Date(), 'workplaces': []};

    try{
        await client.connect();
        const database = client.db('1mind')
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
    const uri = "mongodb+srv://testuser:kosmatohuj@1mind.z6d3c.mongodb.net/1mind?retryWrites=true&w=majority";
    const client = new MongoClient(uri,{ useUnifiedTopology: true });

    const filter = {'email': email, 'password': password};
    const updateDoc={$set: {'password': newpassword}};
    const settings={};

    try{
        await client.connect();
        const database = client.db('1mind');
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

export async function activate_license(email: string, password: string, time: number){
    const uri = "mongodb+srv://testuser:kosmatohuj@1mind.z6d3c.mongodb.net/1mind?retryWrites=true&w=majority";
    const client = new MongoClient(uri,{ useUnifiedTopology: true });

    const filter = {'email': email, 'password': password};
    var date = new Date();
    date.setDate(date.getDate() + time);
    const updateDoc={$set: {'license': date}};
    const settings={};

    try{
        await client.connect();
        const database = client.db('1mind');
        const collection = database.collection('users');

        await collection.findOne({'email': email, 'password': password}).then(async (res:any) =>{
            if(typeof res === 'object'){
                if(compareDate(res.license, new Date())===1){
                    date.setDate(date.getDate() + time);
                    await collection.updateOne(filter, updateDoc, settings);
                    console.log(1);
                    console.log(res.license)

                }
                else if(compareDate(res.license, new Date())===-1){
                    await collection.updateOne(filter, updateDoc, settings);
                    console.log(2);
                }
                else if(compareDate(res.license, new Date())===0){
                    await collection.updateOne(filter, updateDoc, settings);
                }
                else{
                    return 'unidentified error while adding license days'
                }
                
                //await collection,updateOne(filter, updateDoc, settings)
            }
            else if(res === null){
                return "email or password are not correct";
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