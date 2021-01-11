exports = function(payload, response) {
  var collection=context.services.get("mongodb-atlas").db("1mind").collection("workplaces");
  if (payload==null){
    return collection.findOne();
  }
  else{
    id = BSON.ObjectId(EJSON.parse(payload.body.text()));
    return collection.findOne({_id: id},{})
  }
};

//Object(this.state.graphId)