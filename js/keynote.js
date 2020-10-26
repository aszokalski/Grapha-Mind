var myQueue;

function initQueue() {
  myQueue =
    $(go.Diagram, "myQueueDiv", // create a Diagram for the DIV HTML element
      {
        allowClipboard: false,
        allowZoom: false,
        autoScrollRegion: 0,
        allowVerticalScroll: false,
        maxSelectionCount: 1,
        layout: $(go.TreeLayout),
        "SelectionMoved": function (e) {
          myQueue.layoutDiagram(true);
        },
        "ExternalObjectsDropped": function (e) {
          var n = myDiagram.selection.first();
          var last = n.data.last_parent;
          if (last == undefined) {
            last = 0;
          }
          myDiagram.model.setDataProperty(n.data, 'parent', last);
          n.findLinksConnected().first().opacity = 1.0;
          n.expandTree();
          n = myQueue.findNodeForKey(n.key);

          n.data.diagram = 'secondary';
          n.data.deletable = "true";
          removeAllMain();
        }
      });

  myQueue.animationManager.initialAnimationStyle = go.AnimationManager.None;
  myQueue.addDiagramListener('InitialAnimationStarting', function (e) {
    var animation = e.subject.defaultAnimation;
    animation.easing = go.Animation.EaseOutExpo;
    animation.duration = 900;
    animation.add(e.diagram, 'scale', 0.1, 1);
    animation.add(e.diagram, 'opacity', 0, 1);
  });

  function removeAllMain() {
    
    var it = myQueue.nodes;
    while (it.next()) {
      if (it.value.data.diagram == 'secondary') continue;

      myQueue.remove(it.value);
    }
  }

  myQueue.nodeTemplate =
    $(go.Node, go.Panel.Auto, { // dropping onto a Node means splicing the moved Node before this target Node
        mouseDrop: function (e, node) {
          insertNodeBefore(node);
        },
        mouseDragEnter: function (e, node) {
          node.elt(0).fill = "chartreuse";
        },
        mouseDragLeave: function (e, node) {
          node.elt(0).fill = "white";
        }
      },
      new go.Binding("deletable", "deletable"),
      $(go.Shape, {
          figure: "RoundedRectangle",
          fill: "white",
          strokeWidth: 2,
        },
        new go.Binding("fill", "color")),
      $(go.TextBlock, {
          margin: 4,
          font: "12pt sans-serif"
        },
        new go.Binding("text", "text")));

  function insertNodeBefore(node) {
    if (!(node instanceof go.Node)) return;
    
    var move = myQueue.selection.first();
    if (!(move instanceof go.Node)) return;
    if (move === node) return; // not in front of itself!
    var it = myQueue.nodes;
    var cnt = 0;
    while (it.next()){
      if (it.value.data.id == move.data.id) cnt++;

    }

    console.log(cnt);
    if(cnt >= 2){
      console.log('a')
      myQueue.remove(move);
      return;
    }
    if (node.data.parent == move.data.key) return; // already in front of itself
    var model = myQueue.model;
    model.startTransaction("splice node");
    // remember original parents for the moved node and the target node
    var nodeparentkey = node.data.parent;
    var moveparentkey = move.data.parent;
    // temporarily unparent both nodes, to avoid any potential cycles
    model.setDataProperty(node.data, "parent", undefined);
    model.setDataProperty(move.data, "parent", undefined);
    // children of moved node need to be reparented to moved node's original parent
    for (var it = move.findTreeChildrenNodes(); it.next();) {
      var child = it.value;
      model.setDataProperty(child.data, "parent", moveparentkey);
    }
    // change parent of target node to be moved node
    model.setDataProperty(node.data, "parent", move.data.key);
    // moved node's new parent is the target node's old parent
    model.setDataProperty(move.data, "parent", nodeparentkey);
    model.commitTransaction("splice node");
  }

  myQueue.linkTemplate =
    $(go.Link, {
        layerName: "Background"
      }, { // dropping onto a Link means splicing the moved Node before the Link.toNode
        mouseDrop: function (e, link) {
          insertNodeBefore(link.toNode);
        },
        mouseDragEnter: function (e, link) {
          link.elt(0).stroke = "chartreuse";
        },
        mouseDragLeave: function (e, link) {
          link.elt(0).stroke = "black";
        }
      },
      $(go.Shape),
      $(go.Shape, {
        toArrow: "OpenTriangle"
      })
    );


  var model = new go.TreeModel();
  model.nodeDataArray = [{
    key: "End",
    color: "white",
    diagram: "secondary",
    text: "KONIEC",
    deletable: false,
    id: Math.random().toString(36).substring(7),
  }, ];
  myQueue.model = model;
}

var currNode = undefined;

function slideShowStart() {
  currNode = findFirst(myQueue.findNodeForKey('End'));
  myQueue.model.setDataProperty(currNode.data, "color", "lightblue");
  focusOnNode(myDiagram.findNodeForKey(currNode.key));
}

function nextSlide() {
  if (currNode != undefined) {
    myQueue.model.setDataProperty(currNode.data, "color", "white");
  }
  currNode = currNode.findTreeChildrenNodes().first();
  //console.log(currNode);
  if (currNode == undefined || currNode.key == "End") {
    return;
  }

  myQueue.model.setDataProperty(currNode.data, "color", "lightblue");

  focusOnNode(myDiagram.findNodeForKey(currNode.key));


}