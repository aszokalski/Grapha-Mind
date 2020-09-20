function LinkingDraggingTool() {
    go.DraggingTool.call(this);
    var $ = go.GraphObject.make;
    this._tempLink =
        $(go.Link, {
                layerName: "Tool"
            },
            $(go.Shape, {
                stroke: "blue",
                strokeWidth: 3
            }),
            $(go.Shape, {
                stroke: "blue",
                strokeWidth: 3,
                toArrow: "OpenTriangle"
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
    var near = this.diagram.findObjectsNear(pt, 50,
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
        var it = draggednode.findLinksInto();
        while (it.next()) {
            this.diagram.remove(it.value);
        }

        model.addLinkData({
            from: model.getKeyForNodeData(nearest.data),
            to: model.getKeyForNodeData(draggednode.data)
        });
    }
};

function init() {
    var $ = go.GraphObject.make;

    var myDiagram =
        $(go.Diagram, "myDiagramDiv", {
            initialContentAlignment: go.Spot.Center,
            "undoManager.isEnabled": true,
            draggingTool: new LinkingDraggingTool()
        });

    var tool = myDiagram.toolManager.linkingTool;
    tool.direction = tool.ForwardsOnly;
    tool.doActivate();

    myDiagram.nodeTemplate =
        $(go.Node, "Auto",
            $(go.Shape, {
                    portId: "",
                    fromLinkable: true,
                    toLinkable: true
                },
                new go.Binding("fill", "color")),
            $(go.TextBlock, {
                    margin: 8
                },
                new go.Binding("text"))
        );

    myDiagram.model = new go.GraphLinksModel(
        [{
            key: 1,
            text: "Alpha",
            color: "lightblue"
        }, {
            key: 2,
            text: "Beta",
            color: "orange"
        }, {
            key: 3,
            text: "Gamma",
            color: "lightgreen"
        }, {
            key: 4,
            text: "Delta",
            color: "pink"
        }]);
}