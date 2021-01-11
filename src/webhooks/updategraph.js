exports = function(payload, response) {
  var collection =context.services.get('mongodb-atlas').db('1mind').collection('workplaces');
  nodes=EJSON.parse(payload.body.text()).nodeDataArray;
  id=BSON.ObjectId(EJSON.parse(payload.body.text()).graphId);
  collection.findOneAndReplace({_id: id},{nodes});
}

//this.state