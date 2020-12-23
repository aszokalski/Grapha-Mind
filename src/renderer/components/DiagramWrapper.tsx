/*
 *  Copyright (C) 1998-2020 by Northwoods Software Corporation. All Rights Reserved.
 */

import * as go from 'gojs';
import {
  ReactDiagram
} from 'gojs-react';
import * as React from 'react';


import {LinkingDraggingTool} from '../extensions/LinkingDraggingTool';
import {DoubleTreeLayout} from '../extensions/DoubleTreeLayout';
import {CustomLink} from '../extensions/CustomLink';

import '../styles/Diagram.css';

interface DiagramProps {
  nodeDataArray: Array < go.ObjectData > ;
  modelData: go.ObjectData;
  skipsDiagramUpdate: boolean;
  onDiagramEvent: (e: go.DiagramEvent) => void;
  onModelChange: (e: go.IncrementalData) => void;
  focus : number;
}
    

export class DiagramWrapper extends React.Component < DiagramProps, {} > {
  /**
   * Ref to keep a reference to the Diagram component, which provides access to the GoJS diagram via getDiagram().
   */
  private diagramRef: React.RefObject < ReactDiagram > ;
  private currentPresentationKey: number | null;

  /** @internal */
  constructor(props: DiagramProps) {
    super(props);
    this.diagramRef = React.createRef();
    this.currentPresentationKey = null
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

  componentDidUpdate(prevProps: any, prevState: any, snapshot:any) {
    if(prevProps.focus !== this.props.focus){
      if(this.props.focus !== null){
        this.nextSlide();
      } else{
        this.nextSlide();
      }
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
      $(go.Diagram, {
        allowDragOut: true,
        allowGroup: true,
        // initialContentAlignment: go.Spot.Center,
        'undoManager.isEnabled': true, // must be set to allow for model change listening
        // 'undoManager.maxHistoryLength': 0,  // uncomment disable undo/redo functionality
        // 'clickCreatingTool.archetypeNodeData': { text: 'new node', color: 'lightblue' },
        draggingTool: new LinkingDraggingTool(), // defined in GuidedDraggingTool.ts
        "commandHandler.copiesTree": true,
        "commandHandler.copiesParentKey": true,
        "commandHandler.deletesTree": true,
        "draggingTool.dragsTree": true,
        layout: $(DoubleTreeLayout, {
          //vertical: true,  // default directions are horizontal
          // choose whether this subtree is growing towards the right or towards the left:
          directionFunction: function (n: any) {
            return n.data && n.data.dir !== "left";
          },
          // controlling the parameters of each TreeLayout:
          bottomRightOptions: {

            treeStyle: go.TreeLayout.StyleRootOnly,
            layerSpacing: 70,
            alternateNodeSpacing: 0,
            nodeSpacing: 80,
            setsPortSpot: false, 
            setsChildPortSpot: false,
            alternateSetsPortSpot: false, 
            alternateSetsChildPortSpot: false,
            sorting: go.TreeLayout.SortingDescending,
            comparer: function(va: go.TreeVertex, vb: go.TreeVertex) {
              if(va.node === null || vb.node === null)
                return 0;
              var da = va.node.data;
              var db = vb.node.data;
              if (da.order < db.order) return 1;
              if (da.order > db.order) return -1;
              return 0;
            },
            alternateSorting: go.TreeLayout.SortingDescending,
            alternateComparer: function(va: go.TreeVertex, vb: go.TreeVertex) {
              if(va.node === null || vb.node === null){
                return 0;
              }
                
              var da = va.node.data;
              var db = vb.node.data;
              if (da.order < db.order) return 1;
              if (da.order > db.order) return -1;
              return 0;
            }
          },
          topLeftOptions: {
            treeStyle: go.TreeLayout.StyleRootOnly,
            layerSpacing: 70,
            alternateNodeSpacing: 10,
            nodeSpacing: 80,
            setsPortSpot: false, 
            setsChildPortSpot: false,
            alternateSetsPortSpot: false, 
            alternateSetsChildPortSpot: false,
            alternateAngle: 180,
            sorting: go.TreeLayout.SortingAscending,
            comparer: function(va: go.TreeVertex, vb: go.TreeVertex) {
              if(va.node === null || vb.node === null)
                return 0;
              var da = va.node.data;
              var db = vb.node.data;
              if (da.order < db.order) return 1;
              if (da.order > db.order) return -1;
              return 0;
            },
            alternateSorting: go.TreeLayout.SortingDescending,
            alternateComparer: function(va: go.TreeVertex, vb: go.TreeVertex) {
              if(va.node === null || vb.node === null)
                return 0;
              var da = va.node.data;
              var db = vb.node.data;
              if (da.order < db.order) return 1;
              if (da.order > db.order) return -1;
              return 0;
            }
          },
        }),
        model: $(go.TreeModel)
      });


    // a node consists of some text with a line shape underneath
    diagram.nodeTemplate =
      $(go.Node, "Vertical", go.Panel.Auto, {
          zOrder: 100,
          selectionObjectName: "TEXT",
          mouseDrop: function (e, node) {
            //Checks
            if (!(node instanceof go.Node)) return;
            var move = diagram.selection.first();
            if (!(move instanceof go.Node)) return;

            //Works only within a layer
            if(node.data.depth !== move.data.depth) return;

            var mo = move.data.order;
            var no = node.data.order;

            //reorder
            diagram.model.setDataProperty(move.data, 'order', no);
            diagram.model.setDataProperty(node.data, 'order', mo);
            
          },
          mouseDragEnter: function (e, node) {
            if(node instanceof go.Node){
              var move = diagram.selection.first();
              if (!(move instanceof go.Node)) return;

              //Works only within a layer
              if(node.data.depth !== move.data.depth) return;

              var s = node.elt(0)
              if(s instanceof go.Shape){
                s.fill = 'rgb(173,173,173)';
              }
            }
          },
          mouseDragLeave: function (e, node) {
            if(node instanceof go.Node){
              var move = diagram.selection.first();
              if (!(move instanceof go.Node)) return;

              //Works only within a layer
              if(node.data.depth !== move.data.depth) return;

              var s = node.elt(0)
              if(s instanceof go.Shape){
                s.fill = 'rgb(232,232,232)';
              }
            }
          }
        },
        new go.Binding("deletable", "deletable"),
        $(go.Shape, {
            figure: "RoundedRectangle",
            fill: "rgb(255,0,0)",
            strokeWidth: 0,
          },
          new go.Binding("stroke", "stroke"),
          new go.Binding("fill", "color"),
          
          // new go.Binding("fromSpot", "dir", function (d) {
          //   return spotConverter(d, true);
          // }),
          new go.Binding("opacity", "depth", function (d) {
            return (d > 1) ? 0 : 1;
          }),
          // new go.Binding("toSpot", "dir", function (d) {
          //   return spotConverter(d, false);
          // }),
          new go.Binding("fill", "color")),
        new go.Binding("layerName", "stroke"),
        $(go.TextBlock, {
            name: "TEXT",
            minSize: new go.Size(30, 15),
            margin: new go.Margin(8, 15, 8, 15),
            stroke: "white",
            editable: true,
            isMultiline: false
          },
          new go.Binding("stroke", "stroke"),
          new go.Binding("margin", "depth", function (d) {
            return (d > 1) ? new go.Margin(8, 3, 8, 3) : new go.Margin(8, 15, 8, 15);
          }),

          new go.Binding("text", "text").makeTwoWay(),
          new go.Binding("scale", "scale").makeTwoWay(),
          new go.Binding("font", "font").makeTwoWay()
          ),



        // remember the locations of each node in the node data
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
        // make sure text "grows" in the desired direction
        new go.Binding("locationSpot", "dir", function (d) {
          return spotConverter(d, false, true);
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
            return d == "left" ? go.Spot.Left : go.Spot.Right;
          }),
          new go.Binding("alignmentFocus", "dir", function (d) {
            return d == "left" ? go.Spot.Right : go.Spot.Left;
          }),
          $(go.TextBlock, "+", // the Button content
            {
              font: "bold 8pt sans-serif"
            })
        )
      );



    // a link is just a Bezier-curved line of the same color as the node to which it is connected
    diagram.linkTemplate =
      $(CustomLink, {
          curve: go.Link.Bezier,
          selectable: false
        },
        $(go.Shape, {
          strokeWidth: 3.2,
          stroke: "rgb(32,33,34)",
        }, )
      );



    function spotConverter(dir: any, from: any, setLoc=false) {
      if (setLoc){
        return go.Spot.Right;
      }
      if (dir === "left") {
        return (from ? go.Spot.Left : go.Spot.Right);
      } else if (dir === "right"){
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
      var oldnode = adorn.adornedPart as go.Node;
      var olddata = oldnode.data;
      // copy the brush and direction to the new node data
      var newdata = {
        text: "idea",
        brush: olddata.brush,
        dir: (olddata.dir === "center") ? "right" : olddata.dir,
        parent: olddata.key,
        diagram: "main",
        depth: olddata.depth + 1,
        scale: 1,
        font: "28pt Nevermind",
        id: Math.random().toString(36).substring(7),
        stroke: "rgb(32,33,34)",
        color: 'rgb(232,232,232)',
        order: 1
      };

      var or = oldnode.findTreeChildrenNodes().count;
      newdata.order = or+1;


      if (newdata.depth == 1) {
        //newdata.scale = 3 / 4;
        newdata.font = "21pt Nevermind";
      } else if (newdata.depth > 1) {
        //newdata.scale = 1 / 2
        newdata.font = "14pt Nevermind";
      }

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
        if (child !== null) {
          if (child.data.dir === "left") {
            leftward.add(root); // the root node is in both collections
            leftward.add(link);
            leftward.addAll(child.findTreeParts());
          } else {
            rightward.add(root); // the root node is in both collections
            rightward.add(link);
            if (child == null) {
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

  public nextSlide(): void {
    if (!this.diagramRef.current) return;
    const diagram = this.diagramRef.current.getDiagram();
    if (!(diagram instanceof go.Diagram) || diagram === null) return;
    if(this.currentPresentationKey === null){
        this.currentPresentationKey = 0;
        this.nextSlide();
    } else{
      var n = diagram.findNodeForKey(this.currentPresentationKey);
      if(n !== null){
        this.currentPresentationKey = this.getNext(n);
        if(this.currentPresentationKey == null) return
        this.focusOnNode(this.currentPresentationKey);
      }
    }
  }

  public getNext(n : go.Node, after?: number ) : number | null{
    if (!this.diagramRef.current) return 0;
    const diagram = this.diagramRef.current.getDiagram();
    if (!(diagram instanceof go.Diagram) || diagram === null) return 0;

    var ch = n.findTreeChildrenNodes();
    if(ch.count == 0){
      var p = diagram.findNodeForKey(n.data.parent);
        if(p !== null){
            var chp = p.findTreeChildrenNodes();
            var flag = false;
            var next_key = null;
            while(chp.next()){
              if(flag){
                next_key = chp.value.data.key;
                break;
              }
              if(chp.value.data.key == n.data.key) flag = true;
            }

            if(next_key === null && p.key !== 0){
              var pp = diagram.findNodeForKey(p.data.parent);
              if(pp)
                return this.getNext(pp, p.data.key);
            }

            if(next_key === null)
              return 0;

            return next_key;
          }
        else{
          return 0;
        }
    } else{
      if(after === undefined){
        var f = ch.first();
        if(f !== null)
          return f.data.key;
        else
          return 0;
      } else{
        var flag = false;
            var next_key = null;
            while(ch.next()){
              if(flag){
                next_key = ch.value.data.key;
                break;
              }
              if(ch.value.data.key == after) flag = true;
            }

            if(next_key === null && n.key !== 0){
              var p = diagram.findNodeForKey(n.data.parent);
              if(p)
                return this.getNext(p, n.data.key);
            }

            if(next_key === null)
              return 0;
            
            return next_key;
      }
      
    }
    
  }

  public focusOnNode(node_key: number): void {
    if (!this.diagramRef.current) return;
    const diagram = this.diagramRef.current.getDiagram();
    if (!(diagram instanceof go.Diagram) || diagram === null) return;

    const node  = diagram.findNodeForKey(node_key);

    if(node === null || node === undefined){
      return;
    }
    var anim0 = new go.Animation();

    //tint nodes
    const it = diagram.nodes;
    while (it.next()) {
      anim0.add(it.value, "opacity", 1, 1);
    }

    //tint links
    const it2 = diagram.links;
    while (it2.next()) {
      anim0.add(it2.value, "opacity", 1, 1);
    }
    anim0.duration = 1;
    anim0.start();

    diagram.select(node);

    diagram.commandHandler.scrollToPart(node as go.Part);
    diagram.clearSelection();

    //diagram.animationManager.duration = 500;
    // Figure out how large to scale it initially; assume maximum is one third of the viewport size
    var dir = node.data.dir;
    this.shift(dir, node)
  }

  public shift(dir: string, node: go.Node): void {
    if (!this.diagramRef.current) return;
    const diagram = this.diagramRef.current.getDiagram();
    if (!(diagram instanceof go.Diagram) || diagram === null) return;

    var anim2 = new go.Animation();
    var off = (dir == "right") ? 170 : -170;
    //TODO: 170 jest tu hard codowane. Trzeba naprawić je w relacji do rozmiaru nodea

    var ignore = this.findAllChildren(node);
    ignore.push(node.key)

    const it = diagram.nodes;
    while (it.next()) {
      let k = it.value.key;
      if (!ignore.includes(k)) {
        anim2.add(it.value, "opacity", 1, 0.1);
      }
    }

    const it2 = diagram.links;
    while (it2.next()) {
      if(it2.value.toNode !== null && it2.value.fromNode !== null){
        //let to = it2.value.toNode.key;
        let from = it2.value.fromNode.key;
    
        if (!ignore.includes(from)) {
          anim2.add(it2.value, "opacity", 1, 0.1);
        }
      }
    }

    //anim2.add(diagram, "position", diagram.position, diagram.position.copy().offset(off, 0));
    anim2.duration = diagram.animationManager.duration;
    anim2.start();
  }

  public reset(): void {
    if (!this.diagramRef.current) return;
    const diagram = this.diagramRef.current.getDiagram();
    if (!(diagram instanceof go.Diagram) || diagram === null) return;

    var anim0 = new go.Animation();

    //reset tint on nodes
    const it = diagram.nodes;
    while (it.next()) {
      anim0.add(it.value, "opacity", 1, 1);
    }

    //reset tint on links
    const it2 = diagram.links;
    while (it2.next()) {
      anim0.add(it2.value, "opacity", 1, 1);
    }
    anim0.duration = 1;
    anim0.start();

    const root = diagram.findNodeForKey(0);
    diagram.commandHandler.scrollToPart(root as go.Part);
    diagram.clearSelection();
  }

  private findAllChildren(node: go.Node) {
    var res: any[] = [];
    //console.log(A.filter(n => !B.includes(n)))
    var chl = node.findTreeChildrenNodes();
    while (chl.next()) {
      res.push(chl.value.key);
      res = res.concat(res, this.findAllChildren(chl.value));
    }

    return res;
  }


  public render() {
    return ( <
      ReactDiagram ref = {
        this.diagramRef
      }
      divClassName = 'diagram-component'
      initDiagram = {
        this.initDiagram
      }
      nodeDataArray = {
        this.props.nodeDataArray
      }
      modelData = {
        this.props.modelData
      }
      onModelChange = {
        this.props.onModelChange
      }
      skipsDiagramUpdate = {
        this.props.skipsDiagramUpdate
      }
      />
    );
  }
}