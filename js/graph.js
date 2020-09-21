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
            return null;
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


        var nearestKey = model.getKeyForNodeData(nearest.data);

        //Check if it's the root
        if(nearestKey == 0){
          var rootX = nearest.part.location.x;
          var draggedX = draggednode.part.location.x;

          if(draggedX >= rootX){
            model.setDataProperty(draggednode.data, 'dir', 'right');
          } else{
            model.setDataProperty(draggednode.data, 'dir', 'left');
          }
        }
        

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

function init() {
    var $ = go.GraphObject.make;

    var myDiagram =
        $(go.Diagram, "myDiagramDiv", {
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
        

    var tool = myDiagram.toolManager.linkingTool;
    tool.direction = tool.ForwardsOnly;
    tool.doActivate();


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
      new go.Binding("locationSpot", "dir", function(d) { return spotConverter(d, false); })
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
}

