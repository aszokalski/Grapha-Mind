function LinkingDraggingTool() {
    go.DraggingTool.call(this);
    var $ = go.GraphObject.make;
    this._tempLink =
    $(go.Link,
        {
          curve: go.Link.Bezier,
          fromShortLength: -2,
          toShortLength: -2,
          selectable: false
        },
        $(go.Shape,
          { strokeWidth: 3 }, {stroke: "red"})
      );
    this._tempNode =
        $(go.Node, {
            layerName: "Tool"
        }, {
            fromLinkable: true
        });
}

go.Diagram.inherit(LinkingDraggingTool, go.DraggingTool);

LinkingDraggingTool.prototype.doDeactivate = function () {
    go.DraggingTool.prototype.doDeactivate.call(this);
    this.diagram.remove(this._tempLink);
    this.diagram.remove(this._tempNode);
}

LinkingDraggingTool.prototype.findNearestNode = function (pt, draggednode) {
    var linkingTool = this.diagram.toolManager.linkingTool;
    var draggeds = this.draggedParts;
    var root = this.diagram.findNodeForKey(0);
    var near = this.diagram.findObjectsNear(pt, 100,
        // only consider undragged Nodes for which a new link would be valid
        function (x) {
            var p = x.part;
            if (p instanceof go.Node &&
                !draggeds.contains(p) &&
                linkingTool.isValidLink(p, p.port, draggednode, draggednode.port) && 
                linkingTool.isValidLink(draggednode, draggednode.port, p, p.port)) {
                return p;
            }
            return root;
        });
    // find Node whose location is closest to PT
    var dist = Infinity;
    var nearest = null;
    near.each(function (n) {
        var d2 = n.location.distanceSquaredPoint(pt);
        if (d2 < dist) {
            dist = d2;
            nearest = n;
        }
    });
    return nearest;
};

LinkingDraggingTool.prototype.doDragOver = function (pt, over) {
    if (this.copiedParts !== null) return;
    var draggednode = this.draggedParts.first().key;

    var tk = this.diagram.model.getKeyForNodeData(this._tempNode.data);


    this.diagram.model.setDataProperty(draggednode.data, 'parent', 0);
    draggednode.findLinksConnected().first().opacity = 0.0;
    if(draggednode.isTreeExpanded) draggednode.collapseTree();

    var nearest = this.findNearestNode(pt, draggednode);
    if (nearest !== null && draggednode instanceof go.Node) {
        this._tempNode.location = nearest.actualBounds.center;
        this.diagram.add(this._tempNode);
        this._tempLink.fromNode = this._tempNode;
        this._tempLink.toNode = draggednode;
        this.diagram.add(this._tempLink);
    } else {
        this.diagram.remove(this._tempLink);
    }
};

LinkingDraggingTool.prototype.doDropOnto = function (pt, over) {
    if (this.copiedParts !== null) return;
    var draggednode = this.draggedParts.first().key;
    var nearest = this.findNearestNode(pt, draggednode);
    if (nearest !== null && draggednode instanceof go.Node) {
        // this happens within the DraggingTool's transaction
        var model = this.diagram.model;
        // assume the model is a GraphLinksModel

        //old - for graph link model
        // var it = draggednode.findLinksInto();
        // while (it.next()) {
        //     this.diagram.remove(it.value);
        // }

        draggednode.expandTree();
        var nearestKey = model.getKeyForNodeData(nearest.data);

        //Check if it's the root
        var rootX = this.diagram.findNodeForKey(0).part.location.x;
        var draggedX = draggednode.part.location.x;

        if(draggedX >= rootX){
          //TODO set foe children
          updateNodeDirection(draggednode, 'right')
        } else{
          //TODO set for children
          updateNodeDirection(draggednode, 'left')
        }
        
        draggednode.findLinksConnected().first().opacity = 1.0;
        
        this.diagram.toolManager.linkingTool.insertLink(nearest, nearest.port, draggednode, draggednode.port);
        
        //same thing
        // model.setDataProperty(draggednode.data, 'parent', model.getKeyForNodeData(nearest.data));

        //old - for graph link model
        // model.addLinkData({
        //     from: model.getKeyForNodeData(nearest.data),
        //     to: model.getKeyForNodeData(draggednode.data)
        // });
    }
};

var myDiagram;

function init() {
    var $ = go.GraphObject.make;
    
    myDiagram =
        $(go.Diagram, "myDiagramDiv", {
            scrollMargin: 2000,
            allowGroup: true,
            initialContentAlignment: go.Spot.Center,
            "undoManager.isEnabled": true,
            draggingTool: new LinkingDraggingTool(),
            // when the user drags a node, also move/copy/delete the whole subtree starting with that node
            "commandHandler.copiesTree": true,
            "commandHandler.copiesParentKey": true,
            "commandHandler.deletesTree": true,
            "draggingTool.dragsTree": true,
            layout: $(DoubleTreeLayout,
              {
                //vertical: true,  // default directions are horizontal
                // choose whether this subtree is growing towards the right or towards the left:
                directionFunction: function(n) { return n.data && n.data.dir !== "left"; }
                // controlling the parameters of each TreeLayout:
                //bottomRightOptions: { nodeSpacing: 0, layerSpacing: 20 },
                //topLeftOptions: { alignment: go.TreeLayout.AlignmentStart },
              })
        });
        

    // var tool = myDiagram.toolManager.linkingTool;
    // tool.direction = tool.ForwardsOnly;
    // tool.doActivate();


    // a node consists of some text with a line shape underneath
    myDiagram.nodeTemplate =
    $(go.Node, "Vertical",
      { selectionObjectName: "TEXT" },
      $(go.TextBlock,
        {
          name: "TEXT",
          minSize: new go.Size(30, 15),
          editable: true
        },
        // remember not only the text string but the scale and the font in the node data
        new go.Binding("text", "text").makeTwoWay(),
        new go.Binding("scale", "scale").makeTwoWay(),
        new go.Binding("font", "font").makeTwoWay()),
      $(go.Shape, "LineH",
        {
          stretch: go.GraphObject.Horizontal,
          strokeWidth: 3, height: 3,
          // this line shape is the port -- what links connect with
          portId: "", fromSpot: go.Spot.LeftRightSides, toSpot: go.Spot.LeftRightSides
        },
        //new go.Binding("stroke", "brush"),
        // make sure links come in from the proper direction and go out appropriately
        new go.Binding("fromSpot", "dir", function(d) { return spotConverter(d, true); }),
        new go.Binding("toSpot", "dir", function(d) { return spotConverter(d, false); })),
      // remember the locations of each node in the node data
      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
      // make sure text "grows" in the desired direction
      new go.Binding("locationSpot", "dir", function(d) { return spotConverter(d, false); }),
      $("TreeExpanderButton", {alignment: go.Spot.Right,
        alignmentFocus: go.Spot.Left},
        new go.Binding("alignment", "dir", function(d) { return d=="right" ? go.Spot.Right : go.Spot.Left; }),
        new go.Binding("alignmentFocus", "dir", function(d) { return d=="right" ? go.Spot.Left : go.Spot.Right; }),),
    );
    
     // selected nodes show a button for adding children
     myDiagram.nodeTemplate.selectionAdornmentTemplate =
     $(go.Adornment, "Spot",
       $(go.Panel, "Auto",
         // this Adornment has a rectangular blue Shape around the selected node
         $(go.Shape, { fill: null, stroke: "dodgerblue", strokeWidth: 3 }),
         $(go.Placeholder, { margin: new go.Margin(4, 4, 0, 4) })
       ),
       // and this Adornment has a Button to the right of the selected node
       $("Button",
         {
           alignment: go.Spot.Right,
           alignmentFocus: go.Spot.Left,
           click: addNodeAndLink  // define click behavior for this Button in the Adornment
         },
         new go.Binding("alignment", "dir", function(d) { return d=="right" ? go.Spot.Right : go.Spot.Left; }),
         new go.Binding("alignmentFocus", "dir", function(d) { return d=="right" ? go.Spot.Left : go.Spot.Right; }),
         $(go.TextBlock, "+",  // the Button content
           { font: "bold 8pt sans-serif" })
       )
     );

    // the context menu allows users to change the font size and weight,
      // and to perform a limited tree layout starting at that node
      myDiagram.nodeTemplate.contextMenu =
        $("ContextMenu",
          $("ContextMenuButton",
            $(go.TextBlock, "Bigger"),
            { click: function(e, obj) { changeTextSize(obj, 1.1); } }),
          $("ContextMenuButton",
            $(go.TextBlock, "Smaller"),
            { click: function(e, obj) { changeTextSize(obj, 1 / 1.1); } }),
          $("ContextMenuButton",
            $(go.TextBlock, "Bold/Normal"),
            { click: function(e, obj) { toggleTextWeight(obj); } }),
          $("ContextMenuButton",
            $(go.TextBlock, "Copy"),
            { click: function(e, obj) { e.diagram.commandHandler.copySelection(); } }),
          $("ContextMenuButton",
            $(go.TextBlock, "Delete"),
            { click: function(e, obj) { e.diagram.commandHandler.deleteSelection(); } }),
          $("ContextMenuButton",
            $(go.TextBlock, "Undo"),
            { click: function(e, obj) { e.diagram.commandHandler.undo(); } }),
          $("ContextMenuButton",
            $(go.TextBlock, "Redo"),
            { click: function(e, obj) { e.diagram.commandHandler.redo(); } }),
          $("ContextMenuButton",
            $(go.TextBlock, "Layout"),
            {
              click: function(e, obj) {
                var adorn = obj.part;
                adorn.diagram.startTransaction("Subtree Layout");
                layoutTree(adorn.adornedPart);
                adorn.diagram.commitTransaction("Subtree Layout");
              }
            }
          )
        );
    // a link is just a Bezier-curved line of the same color as the node to which it is connected
    myDiagram.linkTemplate =
    $(go.Link,
      {
        curve: go.Link.Bezier,
        fromShortLength: -2,
        toShortLength: -2,
        selectable: false
      },
      $(go.Shape,
        { strokeWidth: 3 },
        new go.Binding("stroke", "toNode", function(n) {
          //if (n.data.brush) return n.data.brush;
          return "black";
        }).ofObject())
    );

    


    myDiagram.model = go.Model.fromJson(document.getElementById("mySavedModel").textContent);

    initTriggers();
      


}



function spotConverter(dir, from) {
  if (dir === "left") {
    return (from ? go.Spot.Left : go.Spot.Right);
  } else {
    return (from ? go.Spot.Right : go.Spot.Left);
  }
}

function changeTextSize(obj, factor) {
  var adorn = obj.part;
  adorn.diagram.startTransaction("Change Text Size");
  var node = adorn.adornedPart;
  var tb = node.findObject("TEXT");
  tb.scale *= factor;
  adorn.diagram.commitTransaction("Change Text Size");
}

function toggleTextWeight(obj) {
  var adorn = obj.part;
  adorn.diagram.startTransaction("Change Text Weight");
  var node = adorn.adornedPart;
  var tb = node.findObject("TEXT");
  // assume "bold" is at the start of the font specifier
  var idx = tb.font.indexOf("bold");
  if (idx < 0) {
    tb.font = "bold " + tb.font;
  } else {
    tb.font = tb.font.substr(idx + 5);
  }
  adorn.diagram.commitTransaction("Change Text Weight");
}

function updateNodeDirection(node, dir) {
  myDiagram.model.setDataProperty(node.data, "dir", dir);
  // recursively update the direction of the child nodes
  var chl = node.findTreeChildrenNodes(); // gives us an iterator of the child nodes related to this particular node
  while (chl.next()) {
    updateNodeDirection(chl.value, dir);
  }
}

function addNodeAndLink(e, obj) {
  var adorn = obj.part;
  var diagram = adorn.diagram;
  diagram.startTransaction("Add Node");
  var oldnode = adorn.adornedPart;
  var olddata = oldnode.data;
  // copy the brush and direction to the new node data
  var newdata = { text: "idea", brush: olddata.brush, dir: olddata.dir, parent: olddata.key };
  diagram.model.addNodeData(newdata);
  layoutTree(oldnode);
  diagram.commitTransaction("Add Node");

  // if the new node is off-screen, scroll the diagram to show the new node
  var newnode = diagram.findNodeForData(newdata);
  if (newnode !== null) diagram.scrollToRect(newnode.actualBounds);
}

function addNodeAndLinkFromNode(oldnode) {
  var olddata = oldnode.data;
  // copy the brush and direction to the new node data
  var newdata = { text: "idea", brush: olddata.brush, dir: olddata.dir, parent: olddata.key };
  myDiagram.model.addNodeData(newdata);
  layoutTree(oldnode);
  myDiagram.commitTransaction("Add Node");

  // if the new node is off-screen, scroll the diagram to show the new node
  var newnode = myDiagram.findNodeForData(newdata);
  if (newnode !== null) myDiagram.scrollToRect(newnode.actualBounds);
}

function layoutTree(node) {
  if (node.data.key === 0) {  // adding to the root?
    layoutAll();  // lay out everything
  } else {  // otherwise lay out only the subtree starting at this parent node
    var parts = node.findTreeParts();
    layoutAngle(parts, node.data.dir === "left" ? 180 : 0);
  }
}

function layoutAngle(parts, angle) {
  var layout = go.GraphObject.make(go.TreeLayout,
    {
      angle: angle,
      arrangement: go.TreeLayout.ArrangementFixedRoots,
      nodeSpacing: 5,
      layerSpacing: 20,
      setsPortSpot: false, // don't set port spots since we're managing them with our spotConverter function
      setsChildPortSpot: false
    });
  layout.doLayout(parts);
}

function layoutAll() {
  var root = myDiagram.findNodeForKey(0);
  if (root === null) return;
  myDiagram.startTransaction("Layout");
  // split the nodes and links into two collections
  var rightward = new go.Set(/*go.Part*/);
  var leftward = new go.Set(/*go.Part*/);
  root.findLinksConnected().each(function(link) {
    var child = link.toNode;
    if (child.data.dir === "left") {
      leftward.add(root);  // the root node is in both collections
      leftward.add(link);
      leftward.addAll(child.findTreeParts());
    } else {
      rightward.add(root);  // the root node is in both collections
      rightward.add(link);
      rightward.addAll(child.findTreeParts());
    }
  });
  // do one layout and then the other without moving the shared root node
  layoutAngle(rightward, 0);
  layoutAngle(leftward, 180);
  myDiagram.commitTransaction("Layout");
}

// Show the diagram's model in JSON format
function save() {
  document.getElementById("mySavedModel").textContent = myDiagram.model.toJson();
  myDiagram.isModified = false;
}
function load() {
  myDiagram.model = go.Model.fromJson(document.getElementById("mySavedModel").value);
}


document.onkeyup = function(e) {
  if (e.which == 78) {
    if(myDiagram.selection.first()){
      var k = myDiagram.selection.first().data.key
      addNodeAndLinkFromNode(myDiagram.findNodeForKey(k));
    }
  } else if(e.which == 71){
    console.log("g");
    console.log(myDiagram.commandHandler.canGroupSelection());
    myDiagram.commandHandler.groupSelection();
  }
};

function focusOnNode(node) {  // node is optional
  var anim0 = new go.Animation();
  var it = myDiagram.nodes;
  while(it.next()){
    anim0.add(it.value, "opacity", 1, 1);
  }

  var it = myDiagram.links;
  while(it.next()){
    anim0.add(it.value, "opacity", 1, 1);
  }
  anim0.duration = 1;
  anim0.start();


  // If no node is given, choose a node at random, and select it.
  if (!node) {
    var arr = myDiagram.model.nodeDataArray;
    var data = arr[Math.floor(Math.random() * arr.length)];
    node = myDiagram.findNodeForData(data);
  }
  if (!node) return;
  myDiagram.select(node);

  myDiagram.commandHandler.scrollToPart(node);

  myDiagram.animationManager.duration = 500;
  // Figure out how large to scale it initially; assume maximum is one third of the viewport size
  
  var anim = new go.Animation();
  anim.add(myDiagram, "scale", myDiagram.scale, 2);  // and animating down to scale 1.0
  // This animation occurs concurrently with the scrolling animation.
  anim.duration = myDiagram.animationManager.duration;
 
  setTimeout(() => {  anim.start();},  myDiagram.animationManager.duration);
  var dir = node.data.dir;
  setTimeout(() => {  shift(dir, node);}, 2 * anim.duration);
  
  
  // Meanwhile, make sure that the node is in the viewport, so the user can see it
  
  
}

function shift(dir, node){
  var anim2 = new go.Animation();
  var off = (dir == "right")? 170 : -170;
  //TODO: 170 jest tu hard codowane. Trzeba naprawić je w relacji do rozmiaru nodea

  var ignore = findAllChildren(node);
  ignore.push(node.key)

  var it = myDiagram.nodes;
  while(it.next()){
    let k = it.value.key;
    if(!ignore.includes(k)){
      anim2.add(it.value, "opacity", 1, 0.3);
    }
  }

  var it = myDiagram.links;
  while(it.next()){
    let to = it.value.toNode.key;
    let from = it.value.fromNode.key;
    if(!ignore.includes(to) && !ignore.includes(from)){
      anim2.add(it.value, "opacity", 1, 0.3);
    }
  }

  anim2.add(myDiagram, "position", myDiagram.position, myDiagram.position.copy().offset(off, 0));
  anim2.duration = myDiagram.animationManager.duration;
  anim2.start();
}

function findAllChildren(node){
  var res = [];
  //console.log(A.filter(n => !B.includes(n)))
  var chl = node.findTreeChildrenNodes();
  while (chl.next()) {
    res.push(chl.value.key);
    res = res.concat(res, findAllChildren(chl.value));
  }

  return res;
}

function reset() {
  var anim0 = new go.Animation();
  var it = myDiagram.nodes;
  while(it.next()){
    anim0.add(it.value, "opacity", 1, 1);
  }

  var it = myDiagram.links;
  while(it.next()){
    anim0.add(it.value, "opacity", 1, 1);
  }
  anim0.duration = 1;
  anim0.start();

  myDiagram.commandHandler.scrollToPart(myDiagram.findNodeForKey(0));
  var anim = new go.Animation();
  anim.add(myDiagram, "scale", myDiagram.scale, 1);  // and animating down to scale 1.0
  // This animation occurs concurrently with the scrolling animation.
  anim.duration = myDiagram.animationManager.duration;
 
  setTimeout(() => {  anim.start();},  myDiagram.animationManager.duration);

}