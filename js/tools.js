function LinkingDraggingTool() {
    go.DraggingTool.call(this);
    var $ = go.GraphObject.make;
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

    if (draggednode.data.parent != 0) {
        this.diagram.model.setDataProperty(draggednode.data, 'last_parent', draggednode.data.parent);
    }
    this.diagram.model.setDataProperty(draggednode.data, 'parent', 0);

    var l = draggednode.findLinksConnected();
    if (l.first()) {
        l.first().opacity = 0.0;
    }

    if (draggednode.isTreeExpanded) draggednode.collapseTree();

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

        if (draggedX >= rootX) {
            //TODO set foe children
            updateNodeDirection(draggednode, 'right')
        } else {
            //TODO set for children
            updateNodeDirection(draggednode, 'left')
        }

        draggednode.findLinksConnected().first().opacity = 1.0;
        model.setDataProperty(draggednode.data, 'depth', nearest.data.depth+1);
        if(draggednode.data.depth == 1){model.setDataProperty(draggednode.data, 'scale', 20/28);}
        else if(draggednode.data.depth > 1){model.setDataProperty(draggednode.data, 'scale', 1/2);}
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