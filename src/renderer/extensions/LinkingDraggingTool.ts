import * as go from 'gojs';

export class LinkingDraggingTool extends go.DraggingTool {

  private _tempLink: go.Link;
  private _tempNode: go.Node;

  
  constructor() {
    super();

    const $ = go.GraphObject.make;

    this._tempLink =
    $(go.Link, {
            layerName: "Grid",
            zOrder: -100,
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
          layerName: "Grid"
      }, {
          fromLinkable: true
      });
  }

  /**
   * Calls the base method and removes the guidelines from the graph.
   */
  public doDeactivate(): void {
    this.diagram.remove(this._tempLink);
    this.diagram.remove(this._tempNode);
    super.doDeactivate();
  }

  public doActivate(): void{
    super.doActivate();
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
                !draggeds.contains(p) && p.data !== null
                // && linkingTool.isValidLink(p, p.port, draggednode, draggednode.port) //Removing it fixed an error with linking back to the same node
                ) {
                return p;
            }
            return root;
        });
    // find Node whose location is closest to PT
    var dist = Infinity;
    var l = draggednode.findNodesConnected();
    var nearest = root;
    near.each(function (n) {
        var d2 = n.location.distanceSquaredPoint(pt);
        if (d2 < dist) {
            dist = d2;
            nearest = n;
        }
    });
    return nearest;
  };

  
  public doDragOver(pt: go.Point, obj: go.GraphObject): void {
    if (this.copiedParts !== null) return;
    
    if(this.draggedParts) var draggednode = this.draggedParts.first().key;
    else return;

    if (draggednode.data.parent != 0) {
        this.diagram.model.setDataProperty(draggednode.data, 'last_parent', draggednode.data.parent);
    }
  

    if(obj !== null){
      this._tempLink.opacity=0.0;
    } else{
      this._tempLink.opacity=1.0;
    }
  
    // (this.diagram.model as go.TreeModel).setParentKeyForNodeData((this.currentPart as go.Node).data, undefined);

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

        var calc = (this._tempLink.fromNode.location.x - this._tempLink.toNode.location.x);

        if(calc <= 0){
          this._tempLink.curviness= ((calc/5) < -70)? -70 : calc/5;
        } else{
          this._tempLink.curviness= ((calc/5) > 70)? 70 : calc/5;
        }

        

        this.diagram.add(this._tempLink);
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

    //Ignore when dropped on an object to allow reordering
    if(obj !== null && obj.part instanceof go.Node && draggednode instanceof go.Node && obj.part.data.depth == draggednode.data.depth){
    
      var link = draggednode.findLinksConnected().first();
      if(link != null){
          link.opacity = 1.0;
      }
      draggednode.expandTree();
      var last = this.diagram.findNodeForKey(obj.part.data.parent);
      if(last !== null){
        this.diagram.toolManager.linkingTool.insertLink(last, last.port, draggednode, draggednode.port);
      }
      return;
    } 
    
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
                this.updateNodeDirection(draggednode, 'right')
              } else {
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
          console.log(nearest);
            model.setDataProperty(draggednode.data, 'depth', nearest.data.depth+1);
            if(draggednode.data.depth == 1){model.setDataProperty(draggednode.data, 'font', "21pt Nevermind")}
            else if(draggednode.data.depth > 1){model.setDataProperty(draggednode.data, 'font', "14pt Nevermind");}
            this.diagram.toolManager.linkingTool.insertLink(nearest, nearest.port, draggednode, draggednode.port);
            //FIXME: Linkowanie do roota bez animacji

            var ch = nearest.findTreeChildrenNodes()

            var chArrRight: Array<go.Node> = [];
            var chArrLeft: Array<go.Node> = [];
            while(ch.next()){
              if(ch.value == draggednode){
                continue;
              }
              if(ch.value.data.dir === "left"){
                chArrLeft.push(ch.value);
              } else{
                chArrRight.push(ch.value);
              }
            }

            chArrRight.sort((a: go.Node, b: go.Node) => a.data.order - b.data.order);
            chArrLeft.sort((a: go.Node, b: go.Node) => a.data.order - b.data.order);

            for(let i = 0; i < chArrRight.length; ++i){
              model.setDataProperty(chArrRight[i].data, 'order', i+1);
            }
            if(draggednode.data.dir === "right"){
              model.setDataProperty(draggednode.data, 'order', chArrRight.length + 1);
              chArrRight.push(draggednode);
            }
            for(let j = 0; j < chArrLeft.length; ++j){
              model.setDataProperty(chArrLeft[j].data, 'order', j+ chArrRight.length + 1);
            }
            if(draggednode.data.dir === "left"){
              model.setDataProperty(draggednode.data, 'order', chArrRight.length+chArrLeft.length + 1);
            }
        }
    }
  }

}

