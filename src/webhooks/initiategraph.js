exports = function(payload, response) {
    
  nodes=EJSON.parse(payload.body.text()).nodeDataArray;
    
  var collection=context.services.get("mongodb-atlas").db("1mind").collection("workplaces");
  
  return collection.insertOne({nodes});
};