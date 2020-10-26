var myDiagram;
var $ = go.GraphObject.make;
var triggerManager;

function init() {

  myDiagram =
    $(go.Diagram, "myDiagramDiv", {
      allowDragOut: true,
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
      layout: $(DoubleTreeLayout, {
        //vertical: true,  // default directions are horizontal
        // choose whether this subtree is growing towards the right or towards the left:
        directionFunction: function (n) {
          return n.data && n.data.dir !== "left";
        },
        // controlling the parameters of each TreeLayout:
        bottomRightOptions: {layerSpacing: 60, },
        topLeftOptions: { layerSpacing: 60 },
        //topLeftOptions: { alignment: go.TreeLayout.AlignmentStart },
      })
    });


  // var tool = myDiagram.toolManager.linkingTool;
  // tool.direction = tool.ForwardsOnly;
  // tool.doActivate();

  var forelayer = myDiagram.findLayer("Foreground");
  myDiagram.addLayerBefore($(go.Layer, { name: "red" }), forelayer);
  myDiagram.addLayerBefore($(go.Layer, { name: "orange" }), forelayer);
  myDiagram.addLayerBefore($(go.Layer, { name: "black" }), forelayer);

  // a node consists of some text with a line shape underneath
  myDiagram.nodeTemplate =
    $(go.Node, "Vertical", go.Panel.Auto, {
        selectionObjectName: "TEXT"
      },
      new go.Binding("deletable", "deletable"),
      $(go.Shape, {
        figure: "RoundedRectangle",
        fill: "white",
        portId: "",
          fromSpot: go.Spot.LeftRightSides,
          toSpot: go.Spot.LeftRightSides,
          stroke: "black",
          strokeWidth: 4,
      },
      new go.Binding("stroke", "stroke"),
      new go.Binding("fromSpot", "dir", function (d) {
        return spotConverter(d, true);
      }),
      new go.Binding("opacity", "depth", function (d) {
        return (d>1) ? 0 : 1;
      }),
      new go.Binding("toSpot", "dir", function (d) {
        return spotConverter(d, false);
      }),
      new go.Binding("fill", "color")),
      new go.Binding("layerName", "stroke"),
      $(go.TextBlock, {
          name: "TEXT",
          minSize: new go.Size(30, 15),
          margin: new go.Margin(8, 15, 8, 15),
          stroke:"black",
          editable: true
        },
        new go.Binding("stroke", "stroke"),
        new go.Binding("margin", "depth", function (d) {
          return (d>1) ? new go.Margin(8, 3, 8, 3) : new go.Margin(8, 15, 8, 15);
        }),
        // remember not only the text string but the scale and the font in the node data
        new go.Binding("text", "text").makeTwoWay(),
        new go.Binding("scale", "scale").makeTwoWay(),
        new go.Binding("font", "font").makeTwoWay()),



      // remember the locations of each node in the node data
      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
      // make sure text "grows" in the desired direction
      new go.Binding("locationSpot", "dir", function (d) {
        return spotConverter(d, false);
      }),
    );

  // selected nodes show a button for adding children
  myDiagram.nodeTemplate.selectionAdornmentTemplate =
    $(go.Adornment, "Spot",
      $(go.Panel, "Auto",
        // this Adornment has a rectangular blue Shape around the selected node
        $(go.Shape, {
          fill: null,
          stroke: "dodgerblue",
          strokeWidth: 3
        }),
        $(go.Placeholder, {
          margin: new go.Margin(4, 4, 0, 4)
        })
      ),
      // and this Adornment has a Button to the right of the selected node
      $("Button", {
          alignment: go.Spot.Right,
          alignmentFocus: go.Spot.Left,
          click: addNodeAndLink // define click behavior for this Button in the Adornment
        },
        new go.Binding("alignment", "dir", function (d) {
          return d == "right" ? go.Spot.Right : go.Spot.Left;
        }),
        new go.Binding("alignmentFocus", "dir", function (d) {
          return d == "right" ? go.Spot.Left : go.Spot.Right;
        }),
        $(go.TextBlock, "+", // the Button content
          {
            font: "bold 8pt sans-serif"
          })
      )
    );

  // the context menu allows users to change the font size and weight,
  // and to perform a limited tree layout starting at that node
  myDiagram.nodeTemplate.contextMenu =
    $("ContextMenu",
      $("ContextMenuButton",
        $(go.TextBlock, "Bigger"), {
          click: function (e, obj) {
            changeTextSize(obj, 1.1);
          }
        }),
      $("ContextMenuButton",
        $(go.TextBlock, "Smaller"), {
          click: function (e, obj) {
            changeTextSize(obj, 1 / 1.1);
          }
        }),
      $("ContextMenuButton",
        $(go.TextBlock, "Bold/Normal"), {
          click: function (e, obj) {
            toggleTextWeight(obj);
          }
        }),
      $("ContextMenuButton",
        $(go.TextBlock, "Copy"), {
          click: function (e, obj) {
            e.diagram.commandHandler.copySelection();
          }
        }),
      $("ContextMenuButton",
        $(go.TextBlock, "Delete"), {
          click: function (e, obj) {
            e.diagram.commandHandler.deleteSelection();
          }
        }),
      $("ContextMenuButton",
        $(go.TextBlock, "Undo"), {
          click: function (e, obj) {
            e.diagram.commandHandler.undo();
          }
        }),
      $("ContextMenuButton",
        $(go.TextBlock, "Redo"), {
          click: function (e, obj) {
            e.diagram.commandHandler.redo();
          }
        }),
      $("ContextMenuButton",
        $(go.TextBlock, "Ważne"), {
          click: function (e, obj) {
            var adorn = obj.part;
            adorn.diagram.startTransaction("Subtree Layout");
            myDiagram.model.setDataProperty(adorn.adornedPart.data, 'stroke', 'red');
            adorn.diagram.commitTransaction("Subtree Layout");
          }
        }
      ),
      $("ContextMenuButton",
        $(go.TextBlock, "TODO"), {
          click: function (e, obj) {
            var adorn = obj.part;
            adorn.diagram.startTransaction("Subtree Layout");
            myDiagram.model.setDataProperty(adorn.adornedPart.data, 'stroke', 'orange');
            adorn.diagram.commitTransaction("Subtree Layout");
          }
        }
      ),
      $("ContextMenuButton",
        $(go.TextBlock, "Zwykłe"), {
          click: function (e, obj) {
            var adorn = obj.part;
            adorn.diagram.startTransaction("Subtree Layout");
            myDiagram.model.setDataProperty(adorn.adornedPart.data, 'stroke', 'black');
            adorn.diagram.commitTransaction("Subtree Layout");
          }
        }
      ),
    );
  // a link is just a Bezier-curved line of the same color as the node to which it is connected
  myDiagram.linkTemplate =
    $(go.Link, {

        curve: go.Link.Bezier ,
        fromShortLength: -2,
        toShortLength: -2,
        selectable: false
      },
      $(go.Shape, {
          strokeWidth: 3,
          stroke: "black",
        },
        )
    );

      // define this function so that the checkbox event handlers can call it
  toggleVisible = function(layername) {
    myDiagram.commit(function(d) {
      var layer = d.findLayer(layername);
      if (layer !== null) layer.opacity = (document.getElementById(layername).checked)?1:0.3;
    }, 'toggle ' + layername);
  };

  initTriggers();
  initQueue();

  var model = new go.TreeModel();
  model.nodeDataArray = [{
    key: 0,
    text: "Tytuł Twojej Mapy",
    loc: "0 0",
    diagram: "main",
    parent: 0,
    deletable: false,
    dir:"right",
    depth: 0,
    scale:1,
    font:"28pt Helvetica",
    id: Math.random().toString(36).substring(7),
    stroke: 'black',
  }, ];
  myDiagram.model = model;

  document.getElementById('loadFile')
    .addEventListener('change', function () {
      var fr = new FileReader();
      fr.onload = function () {
        load(fr.result);
      }

      fr.readAsText(this.files[0]);
    })
}

function findFirst(node) {
  var p = node.findTreeParentNode();
  if (p != undefined)
    return findFirst(p);
  return node;
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
  var newdata = {
    text: "idea",
    brush: olddata.brush,
    dir: olddata.dir,
    parent: olddata.key,
    diagram: "main",
    depth: olddata.depth + 1,
    scale: 1,
    font: olddata.font,
    id : Math.random().toString(36).substring(7),
    stroke : 'black',

  };
  if(newdata.depth == 1){newdata.scale = 3/4}
  else if(newdata.depth > 1){newdata.scale = 1/2}
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
  var newdata = {
    text: "idea",
    brush: olddata.brush,
    dir: olddata.dir,
    parent: olddata.key,
    diagram: "main",
    depth:olddata.depth+1,
    scale: 1,
    font: olddata.font,
    id : Math.random().toString(36).substring(7),
    stroke: 'black',
  };
  if(newdata.depth == 1){newdata.scale = 3/4}
  else if(newdata.depth > 1){newdata.scale = 1/2}
  myDiagram.model.addNodeData(newdata);
  layoutTree(oldnode);
  myDiagram.commitTransaction("Add Node");

  // if the new node is off-screen, scroll the diagram to show the new node
  var newnode = myDiagram.findNodeForData(newdata);
  if (newnode !== null) myDiagram.scrollToRect(newnode.actualBounds);
}

function layoutTree(node) {
  if (node.data.key === 0) { // adding to the root?
    layoutAll(); // lay out everything
  } else { // otherwise lay out only the subtree starting at this parent node
    var parts = node.findTreeParts();
    layoutAngle(parts, node.data.dir === "left" ? 180 : 0);
  }
}

function layoutAngle(parts, angle) {
  var layout = go.GraphObject.make(go.TreeLayout, {
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
  var rightward = new go.Set( /*go.Part*/ );
  var leftward = new go.Set( /*go.Part*/ );
  root.findLinksConnected().each(function (link) {
    var child = link.toNode;
    if (child.data.dir === "left") {
      leftward.add(root); // the root node is in both collections
      leftward.add(link);
      leftward.addAll(child.findTreeParts());
    } else {
      rightward.add(root); // the root node is in both collections
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
  let d = myDiagram.model.toJson();
  let t = triggerManager.serialize;
  let q = myQueue.model.toJson();

  let s = {
    "diagram": JSON.parse(d),
    "queue": JSON.parse(q),
    "triggers": JSON.parse(t)
  };
  myDiagram.isModified = false;
  saveData(s, 'save.json');
}

function saveData(data, fileName) {
  var a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";

  var blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json"
    }),
    url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
}

function load(data) {
  let s = JSON.parse(data);
  let d = JSON.stringify(s["diagram"]);
  let q = JSON.stringify(s["queue"]);
  let t = JSON.stringify(s["triggers"]);
  myDiagram.model = go.Model.fromJson(d);
  myQueue.model = go.Model.fromJson(q);
  triggerManager.load(t);
}


document.onkeyup = function (e) {
  if (e.which == 78) {
    if (myDiagram.selection.first()) {
      var k = myDiagram.selection.first().data.key
      addNodeAndLinkFromNode(myDiagram.findNodeForKey(k));
    }
  } else if (e.which == 71) {
    console.log("g");
    console.log(myDiagram.commandHandler.canGroupSelection());
    myDiagram.commandHandler.groupSelection();
  }
};

function focusOnNode(node) { // node is optional
  var anim0 = new go.Animation();
  var it = myDiagram.nodes;
  while (it.next()) {
    anim0.add(it.value, "opacity", 1, 1);
  }

  var it = myDiagram.links;
  while (it.next()) {
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
  anim.add(myDiagram, "scale", myDiagram.scale, 2); // and animating down to scale 1.0
  // This animation occurs concurrently with the scrolling animation.
  anim.duration = myDiagram.animationManager.duration;

  setTimeout(() => {
    anim.start();
  }, myDiagram.animationManager.duration);
  var dir = node.data.dir;
  setTimeout(() => {
    shift(dir, node);
  }, 2 * anim.duration);


  // Meanwhile, make sure that the node is in the viewport, so the user can see it


}

function shift(dir, node) {
  var anim2 = new go.Animation();
  var off = (dir == "right") ? 170 : -170;
  //TODO: 170 jest tu hard codowane. Trzeba naprawić je w relacji do rozmiaru nodea

  var ignore = findAllChildren(node);
  ignore.push(node.key)

  var it = myDiagram.nodes;
  while (it.next()) {
    let k = it.value.key;
    if (!ignore.includes(k)) {
      anim2.add(it.value, "opacity", 1, 0.3);
    }
  }

  var it = myDiagram.links;
  while (it.next()) {
    let to = it.value.toNode.key;
    let from = it.value.fromNode.key;
    if (!ignore.includes(to) && !ignore.includes(from)) {
      anim2.add(it.value, "opacity", 1, 0.3);
    }
  }

  anim2.add(myDiagram, "position", myDiagram.position, myDiagram.position.copy().offset(off, 0));
  anim2.duration = myDiagram.animationManager.duration;
  anim2.start();
}

function findAllChildren(node) {
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
  while (it.next()) {
    anim0.add(it.value, "opacity", 1, 1);
  }

  var it = myDiagram.links;
  while (it.next()) {
    anim0.add(it.value, "opacity", 1, 1);
  }
  anim0.duration = 1;
  anim0.start();

  myDiagram.commandHandler.scrollToPart(myDiagram.findNodeForKey(0));
  var anim = new go.Animation();
  anim.add(myDiagram, "scale", myDiagram.scale, 1); // and animating down to scale 1.0
  // This animation occurs concurrently with the scrolling animation.
  anim.duration = myDiagram.animationManager.duration;

  setTimeout(() => {
    anim.start();
  }, myDiagram.animationManager.duration);

}