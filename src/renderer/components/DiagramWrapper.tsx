/*
*  Copyright (C) 1998-2020 by Northwoods Software Corporation. All Rights Reserved.
*/

import * as go from 'gojs';
import { ReactDiagram } from 'gojs-react';
import * as React from 'react';


import { LinkingDraggingTool } from '../extensions/LinkingDraggingTool';
import { DoubleTreeLayout } from '../extensions/DoubleTreeLayout';
import '../styles/Diagram.css';

interface DiagramProps {
  nodeDataArray: Array<go.ObjectData>;
  modelData: go.ObjectData;
  skipsDiagramUpdate: boolean;
  onDiagramEvent: (e: go.DiagramEvent) => void;
  onModelChange: (e: go.IncrementalData) => void;
  getQueueSelection: () => go.ObjectData | null;
  setParamForQueueNode: (id: number, param: string, value: any) => void;
}

export class DiagramWrapper extends React.Component<DiagramProps, {}> {
  /**
   * Ref to keep a reference to the Diagram component, which provides access to the GoJS diagram via getDiagram().
   */
  private diagramRef: React.RefObject<ReactDiagram>;

  /** @internal */
  constructor(props: DiagramProps) {
    super(props);
    this.diagramRef = React.createRef();
  }

  /**
   * Get the diagram reference and add any desired diagram listeners.
   * Typically the same function will be used for each listener, with the function using a switch statement to handle the events.
   */
  public componentDidMount() {
    //Jakieś handlery tu sie ustawia
    if (!this.diagramRef.current) return;
    const diagram = this.diagramRef.current.getDiagram();
    if (diagram instanceof go.Diagram) {
      diagram.addDiagramListener('ChangedSelection', this.props.onDiagramEvent);
    }
  }

  /**
   * Get the diagram reference and remove listeners that were added during mounting.
   */
  public componentWillUnmount() {
    //Tu sie handlery usuwa
    if (!this.diagramRef.current) return;
    const diagram = this.diagramRef.current.getDiagram();
    if (diagram instanceof go.Diagram) {
      diagram.removeDiagramListener('ChangedSelection', this.props.onDiagramEvent);
    }
  }

  /**
   * Diagram initialization method, which is passed to the ReactDiagram component.
   * This method is responsible for making the diagram and initializing the model, any templates,
   * and maybe doing other initialization tasks like customizing tools.
   * The model's data should not be set here, as the ReactDiagram component handles that.
   */
  private initDiagram(): go.Diagram {
    const $ = go.GraphObject.make;
    // set your license key here before creating the diagram: go.Diagram.licenseKey = "...";

    const diagram =
      $(go.Diagram,
        {
          allowDragOut: true,
          allowGroup: true,
          initialContentAlignment: go.Spot.Center,
          'undoManager.isEnabled': true,  // must be set to allow for model change listening
          // 'undoManager.maxHistoryLength': 0,  // uncomment disable undo/redo functionality
          // 'clickCreatingTool.archetypeNodeData': { text: 'new node', color: 'lightblue' },
          draggingTool: new LinkingDraggingTool(),  // defined in GuidedDraggingTool.ts
          "commandHandler.copiesTree": true,
          "commandHandler.copiesParentKey": true,
          "commandHandler.deletesTree": true,
          "draggingTool.dragsTree": true,
          layout: $(DoubleTreeLayout, 
            {
              //vertical: true,  // default directions are horizontal
              // choose whether this subtree is growing towards the right or towards the left:
              directionFunction: function (n: any) {
                return n.data && n.data.dir !== "left";
              },
              // controlling the parameters of each TreeLayout:
              bottomRightOptions: {layerSpacing: 60, },
              topLeftOptions: { layerSpacing: 60 },
              //topLeftOptions: { alignment: go.TreeLayout.AlignmentStart },
            }
            ),
          model: $(go.TreeModel)
        });


    // a node consists of some text with a line shape underneath
    diagram.nodeTemplate =
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
  diagram.nodeTemplate.selectionAdornmentTemplate =
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



    // a link is just a Bezier-curved line of the same color as the node to which it is connected
  diagram.linkTemplate =
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


function spotConverter(dir: any, from: any) {
  if (dir === "left") {
    return (from ? go.Spot.Left : go.Spot.Right);
  } else {
    return (from ? go.Spot.Right : go.Spot.Left);
  }
}

function changeTextSize(obj: any, factor: any) {
  var adorn = obj.part;
  adorn.diagram.startTransaction("Change Text Size");
  var node = adorn.adornedPart;
  var tb = node.findObject("TEXT");
  tb.scale *= factor;
  adorn.diagram.commitTransaction("Change Text Size");
}

function toggleTextWeight(obj: any) {
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

function addNodeAndLink(e: any, obj: any) {
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

function layoutTree(node: any) {
  if (node.data.key === 0) { // adding to the root?
    layoutAll(); // lay out everything
  } else { // otherwise lay out only the subtree starting at this parent node
    var parts = node.findTreeParts();
    layoutAngle(parts, node.data.dir === "left" ? 180 : 0);
  }
}

function layoutAngle(parts: any, angle: any) {
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
  var root = diagram.findNodeForKey(0);
  if (root === null) return;
  diagram.startTransaction("Layout");
  // split the nodes and links into two collections
  var rightward = new go.Set( /*go.Part*/ );
  var leftward = new go.Set( /*go.Part*/ );
  root.findLinksConnected().each(function (link) {
    var child = link.toNode;
    if(child !== null){
      if (child.data.dir === "left") {
        leftward.add(root); // the root node is in both collections
        leftward.add(link);
        leftward.addAll(child.findTreeParts());
      } else {
        rightward.add(root); // the root node is in both collections
        rightward.add(link);
        if(child == null ){
          return;
        }
        rightward.addAll(child.findTreeParts());
      }
    }
    
  });
  // do one layout and then the other without moving the shared root node
  layoutAngle(rightward, 0);
  layoutAngle(leftward, 180);
  diagram.commitTransaction("Layout");
}


    return diagram;
  }

  public render() {
    return (
      <ReactDiagram
        ref={this.diagramRef}
        divClassName='diagram-component'
        initDiagram={this.initDiagram}
        nodeDataArray={this.props.nodeDataArray}
        modelData={this.props.modelData}
        onModelChange={this.props.onModelChange}
        skipsDiagramUpdate={this.props.skipsDiagramUpdate}
      />
    );
  }
}
