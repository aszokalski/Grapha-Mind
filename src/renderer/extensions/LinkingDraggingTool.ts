import * as go from 'gojs';

export class LinkingDraggingTool extends go.DraggingTool {

  private _tempLink: go.Link;
  private _tempNode: go.Node;

  
  constructor() {
    super();

    const $ = go.GraphObject.make;

    this._tempLink =
    $(go.Link, {
            curve: go.Link.Bezier,
            fromShortLength: -2,
            toShortLength: -2,
            selectable: false
        },
        $(go.Shape, {
            strokeWidth: 3
        }, {
            stroke: "red"
        })
    );
    this._tempNode =
      $(go.Node, {
          layerName: "Tool"
      }, {
          fromLinkable: true
      });
  }

  /**
   * Calls the base method and removes the guidelines from the graph.
   */
  public doDeactivate(): void {
    super.doDeactivate();
    go.DraggingTool.prototype.doDeactivate.call(this);
    this.diagram.remove(this._tempLink);
    this.diagram.remove(this._tempNode);
  }

  public findNearestNode (pt: go.Point, draggednode: go.Node): any{
    var linkingTool = this.diagram.toolManager.linkingTool;
    var draggeds = this.draggedParts;
    var root = this.diagram.findNodeForKey(0);
    var near = this.diagram.findObjectsNear(pt, 150,
        // only consider undragged Nodes for which a new link would be valid
        function (x) {
            var p = x.part;
            if (draggeds && p instanceof go.Node &&
                !draggeds.contains(p) &&
                linkingTool.isValidLink(p, p.port, draggednode, draggednode.port)) {
                return p;
            }
            return root;
        });
    // find Node whose location is closest to PT
    var dist = Infinity;
    var l = draggednode.findNodesConnected();
    var f = l.first();
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

  
  /**
   * Shows vertical and horizontal guidelines for the dragged part.
   */
  public doDragOver(pt: go.Point, obj: go.GraphObject): void {
    if (this.copiedParts !== null) return;
    
    if(this.draggedParts) var draggednode = this.draggedParts.first().key;
    else return;
    
    var tk = this.diagram.model.getKeyForNodeData(this._tempNode.data);

    if (draggednode.data.parent != 0) {
        this.diagram.model.setDataProperty(draggednode.data, 'last_parent', draggednode.data.parent);
    }
    this.diagram.model.setDataProperty(draggednode.data, 'parent', 0);

  
    if(draggednode instanceof go.Node){
      var l = draggednode.findLinksConnected();
      var f = l.first();
      if (f) {
        f.opacity = 0.0;
     }
     if (draggednode.isTreeExpanded) draggednode.collapseTree();
    } 

    if( draggednode instanceof go.Node)
      var nearest = this.findNearestNode(pt, draggednode);
    else return;
    if (nearest !== null && draggednode instanceof go.Node) {
        this._tempNode.location = nearest.actualBounds.center;
        this.diagram.add(this._tempNode);
        this._tempLink.fromNode = this._tempNode;
        this._tempLink.toNode = draggednode;
        this.diagram.add(this._tempLink);
    } else {
        this.diagram.remove(this._tempLink);
        var root = this.diagram.findNodeForKey(0);
    }
  }

  public updateNodeDirection(node :go.Node, dir: string) {
    this.diagram.model.setDataProperty(node.data, "dir", dir);
    // recursively update the direction of the child nodes
    var chl = node.findTreeChildrenNodes(); // gives us an iterator of the child nodes related to this particular node
    while (chl.next()) {
      if(chl.value == node){
        return
      }
      this.updateNodeDirection(chl.value, dir);
    }
  }
  /**
   * On a mouse-up, snaps the selected part to the nearest guideline.
   * If not snapping, the part remains at its position.
   */
  public doDropOnto(pt: go.Point, obj: go.GraphObject): void {
    if (this.copiedParts !== null) return;
    if(this.draggedParts) var draggednode = this.draggedParts.first().key;
    else return;
    
    if( draggednode instanceof go.Node)
      var nearest = this.findNearestNode(pt, draggednode);
    else return;

    if (nearest !== null && draggednode instanceof go.Node) {
        // this happens within the DraggingTool's transaction
        var model = this.diagram.model;
  
        draggednode.expandTree();
        var nearestKey = model.getKeyForNodeData(nearest.data);
  
        //Check if it's the root
        var rootNode = this.diagram.findNodeForKey(0);
        if(rootNode != null){
          var rootPart = rootNode.part;
          if(rootPart!= null){
            var rootX = rootPart.location.x;
            var draggednodePart = draggednode.part
            if(draggednodePart != null){
              var draggedX = draggednodePart.location.x;

              if (draggedX >= rootX) {
                //TODO set foe children
                this.updateNodeDirection(draggednode, 'right')
              } else {
                //TODO set for children
                this.updateNodeDirection(draggednode, 'left')
              }
              
              var link = draggednode.findLinksConnected().first();
              if(link != null){
                link.opacity = 1.0;
              }
              
            }
          }
        }
  
        if(draggednode.key != 0){
            model.setDataProperty(draggednode.data, 'depth', nearest.data.depth+1);
            if(draggednode.data.depth == 1){model.setDataProperty(draggednode.data, 'font', "21pt Nevermind")}
            else if(draggednode.data.depth > 1){model.setDataProperty(draggednode.data, 'font', "14pt Nevermind");}
            this.diagram.toolManager.linkingTool.insertLink(nearest, nearest.port, draggednode, draggednode.port);
            //FIXME: Linkowanie do roota bez animacji
        }
    }
  }

}

