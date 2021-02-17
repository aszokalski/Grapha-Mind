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