/*
 *  Copyright (C) 1998-2020 by Northwoods Software Corporation. All Rights Reserved.
 */

import * as go from 'gojs';
import {
  ReactDiagram
} from 'gojs-react';
import * as React from 'react';
import getEditor from '../extensions/RTTextEditor';


import {LinkingDraggingTool} from '../extensions/LinkingDraggingTool';
import {DoubleTreeLayout} from '../extensions/DoubleTreeLayout';
import {CustomLink} from '../extensions/CustomLink';

import '../styles/Diagram.css';
import { indigo } from '@material-ui/core/colors';
import { CollectionsBookmarkOutlined } from '@material-ui/icons';

interface DiagramProps {
  nodeDataArray: Array < go.ObjectData > ;
  modelData: go.ObjectData;
  skipsDiagramUpdate: boolean;
  onDiagramEvent: (e: go.DiagramEvent) => void;
  onModelChange: (e: go.IncrementalData) => void;
  stopPresentation: () => void;
  updateSlideNumber: (n: number) => void;
}
    
interface DiagramState{
  inPresentation : boolean;
}

export class DiagramWrapper extends React.Component < DiagramProps, DiagramState > {
  /**
   * Ref to keep a reference to the Diagram component, which provides access to the GoJS diagram via getDiagram().
   */
  public diagramRef: React.RefObject < ReactDiagram > ;
  private currentPresentationKey: number | null;
  private skipPres: boolean = false;
  private presIndex: number = 0;
  public slideNumber: number = 0;
  private seen: Array<number> = [];
  private slides: Array<[number, number, number, Array<number>]> = [];

  /** @internal */
  constructor(props: DiagramProps) {
    super(props);
    this.state={
      inPresentation:false
    }
    this.diagramRef = React.createRef();
    this.currentPresentationKey = null;
    this.handleClipboard = this.handleClipboard.bind(this);
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
      diagram.addDiagramListener('ClipboardPasted', this.handleClipboard);
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
      diagram.addDiagramListener('ClipboardPasted', this.handleClipboard);
    }
  }

  public componentDidUpdate(prevProps: any, prevState: any, snapshot:any) {
    //WRONG WAY
    // if(prevProps.focus !== this.props.focus){
    //   this.nextSlide();
    // }
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
        //allowDragOut: true,
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
        "animationManager.canStart": function(reason: any) {
          if (reason === "Layout") return false;
          return true;
        },
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
            alternateNodeSpacing: 0,
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

      diagram.toolManager.textEditingTool.defaultTextEditor = getEditor();
   
    // a node consists of some text with a line shape underneath
    diagram.nodeTemplate =
      $(go.Node, "Vertical", go.Panel.Auto, {
          zOrder: 100,
          // selectionObjectName: "TEXT",
          mouseDrop: function (e, node) {
            //Checks
            if (!(node instanceof go.Node)) return;
            var move = diagram.selection.first();
            if (!(move instanceof go.Node)) return;

            //Works only within a layer and direction
            if(node.data.depth !== move.data.depth || node.data.dir !== move.data.dir) return;

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

              //Works only within a layer and direction
              if(node.data.depth !== move.data.depth || node.data.dir !== move.data.dir) return;

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
        new go.Binding("opacity", "hidden", function(d){
          if(d){
            return 0.5;
          } else{
            return 1;
          }
        }),
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
            figure: "RoundedRectangle",
            parameter1: 3,
            fill: null,
            stroke: "rgb(90, 187, 249)",
            strokeWidth: 2
          }),
          $(go.Placeholder, {
            margin: new go.Margin(0.7, 0.7, 0.7, 0.7)
          })
        ),
      );



    // a link is just a Bezier-curved line of the same color as the node to which it is connected
    diagram.linkTemplate =
      $(CustomLink, {
          curve: go.Link.Bezier,
          selectable: false,
        },
        $(go.Shape, {
          strokeWidth: 3.2,
          stroke: "rgb(32,33,34)",
        }, )
      );

    diagram.commandHandler.canCopySelection = function(){
      let f = diagram.selection.first();
      if(f instanceof go.Node && f.data.key === 0){
        return false;
      }
      return go.CommandHandler.prototype.copySelection.call(this);
    }
      
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
        loc: olddata.loc,
        //brush: olddata.brush,
        dir: (olddata.dir === "center") ? "right" : olddata.dir,
        parent: olddata.key,
        diagram: "main",
        depth: olddata.depth + 1,
        scale: 1,
        font: "28pt Nevermind",
        id: Math.random().toString(36).substring(7),
        stroke: "rgb(32,33,34)",
        color: 'rgb(232,232,232)',
        order: 1,
        presentationDirection: "horizontal"
      };

      var ch = oldnode.findTreeChildrenNodes()
      var chArrRight: Array<go.Node> = [];
      var chArrLeft: Array<go.Node> = [];
      while(ch.next()){
        if(ch.value.data.dir === "left"){
          chArrLeft.push(ch.value);
        } else{
          chArrRight.push(ch.value);
        }
      }

      chArrRight.sort((a: go.Node, b: go.Node) => a.data.order - b.data.order);
      chArrLeft.sort((a: go.Node, b: go.Node) => a.data.order - b.data.order);

      for(let i = 0; i < chArrRight.length; ++i){
        diagram.model.setDataProperty(chArrRight[i].data, 'order', i+1);
      }
      if(newdata.dir === "right"){
        newdata.order = chArrRight.length + 1
        chArrRight.push(oldnode); //just to make the array larger
      }

      for(let j = 0; j < chArrLeft.length; ++j){
        diagram.model.setDataProperty(chArrLeft[j].data, 'order', j+ chArrRight.length + 1);
      }
      if(newdata.dir === "left"){
        newdata.order = chArrRight.length+chArrLeft.length + 1;
      }

      if (newdata.depth == 1) {
        //newdata.scale = 3 / 4;
        newdata.font = "21pt Nevermind";
      } else if (newdata.depth > 1) {
        //newdata.scale = 1 / 2
        newdata.font = "14pt Nevermind";
      }

      diagram.model.addNodeData(newdata);
      //layoutTree(oldnode);
      diagram.commitTransaction("Add Node");

      // if the new node is off-screen, scroll the diagram to show the new node
      var newnode = diagram.findNodeForData(newdata);
      if (newnode !== null) diagram.scrollToRect(newnode.actualBounds);
    }


    //TODO: Outdated
    function layoutTree(node: any) {
      if (node.data.key === 0) { // adding to the root?
        layoutAll(); // lay out everything
      } else { // otherwise lay out only the subtree starting at this parent node
        var parts = node.findTreeParts();
        layoutAngle(parts, node.data.dir === "left" ? 180 : 0);
      }
    }


    //TODO: Outdated
    function layoutAngle(parts: any, angle: any) {
      var layout = go.GraphObject.make(go.TreeLayout, {
        treeStyle: go.TreeLayout.StyleRootOnly,
        angle: angle,
        alternateAngle: angle,
        arrangement: go.TreeLayout.ArrangementFixedRoots,
        nodeSpacing: 5,
        layerSpacing: 20,
        alternateNodeSpacing: 5,
        alternateLayerSpacing: 20,
        setsPortSpot: false, // don't set port spots since we're managing them with our spotConverter function
        setsChildPortSpot: false,
        alternateSetsPortSpot: false,
        alternateSetsChildPortSpot: false,
        sorting: (angle == 180) ? go.TreeLayout.SortingAscending: go.TreeLayout.SortingDescending,
        alternateSorting: go.TreeLayout.SortingDescending,
        comparer: function(va: go.TreeVertex, vb: go.TreeVertex) {
          if(va.node === null || vb.node === null)
            return 0;
          var da = va.node.data;
          var db = vb.node.data;
          if (da.order < db.order) return 1;
          if (da.order > db.order) return -1;
          return 0;
        },
        alternateComparer: function(va: go.TreeVertex, vb: go.TreeVertex) {
          if(va.node === null || vb.node === null)
            return 0;
          var da = va.node.data;
          var db = vb.node.data;
          if (da.order < db.order) return 1;
          if (da.order > db.order) return -1;
          return 0;
        }
      });
      layout.doLayout(parts);
    }

    //TODO: Outdated
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

  public addNodeFromSelection(focusAfter : boolean = false): void{
    if (!this.diagramRef.current) return;
    const diagram = this.diagramRef.current.getDiagram();
    if (!(diagram instanceof go.Diagram) || diagram === null) return;

   

    diagram.startTransaction("Add Node");
    var oldnode = diagram.selection.first() as go.Node;
    if(oldnode === null) return;
    var olddata = oldnode.data;
    // console.log(olddata);
    // copy the brush and direction to the new node data
    var newdata = {
      text: "idea",
      loc: olddata.loc,
      //brush: olddata.brush,
      dir: (olddata.dir === "center") ? "right" : olddata.dir,
      parent: olddata.key,
      diagram: "main",
      depth: 0,
      scale: 1,
      font: "28pt Nevermind",
      id: Math.random().toString(36).substring(7),
      stroke: "rgb(32,33,34)",
      color: 'rgb(232,232,232)',
      order: 1,
      presentationDirection: "horizontal"
    };

    var ch = oldnode.findTreeChildrenNodes()
    if(ch.count >= 3 && oldnode.data.key === 0){
      newdata.dir = "left";
    }

    if(focusAfter === false && oldnode.data.key !== 0){
      newdata.parent = oldnode.data.parent;
    }

    var newparent = diagram.findNodeForKey(newdata.parent);

    if(newparent === null) return;

    oldnode = newparent;

    newdata.depth = oldnode.data.depth + 1;

    var ch = oldnode.findTreeChildrenNodes()
    var chArrRight: Array<go.Node> = [];
    var chArrLeft: Array<go.Node> = [];
    while(ch.next()){
      if(ch.value.data.dir === "left"){
        chArrLeft.push(ch.value);
      } else{
        chArrRight.push(ch.value);
      }
    }

    chArrRight.sort((a: go.Node, b: go.Node) => a.data.order - b.data.order);
    chArrLeft.sort((a: go.Node, b: go.Node) => a.data.order - b.data.order);

    for(let i = 0; i < chArrRight.length; ++i){
      diagram.model.setDataProperty(chArrRight[i].data, 'order', i+1);
    }
    if(newdata.dir === "right"){
      newdata.order = chArrRight.length + 1
      chArrRight.push(oldnode); //just to make the array larger
    }

    for(let j = 0; j < chArrLeft.length; ++j){
      diagram.model.setDataProperty(chArrLeft[j].data, 'order', j+ chArrRight.length + 1);
    }
    if(newdata.dir === "left"){
      newdata.order = chArrRight.length+chArrLeft.length + 1;
    }

    if (newdata.depth == 1) {
      //newdata.scale = 3 / 4;
      newdata.font = "21pt Nevermind";
    } else if (newdata.depth > 1) {
      //newdata.scale = 1 / 2
      newdata.font = "14pt Nevermind";
    }

    diagram.model.addNodeData(newdata);

    //layoutTree(oldnode);
    diagram.commitTransaction("Add Node");

    // if the new node is off-screen, scroll the diagram to show the new node
    var newnode = diagram.findNodeForData(newdata);
    if (newnode !== null) diagram.scrollToRect(newnode.actualBounds);

    if(focusAfter){
      // console.log((diagram.selection.first() as go.Node).data);
      diagram.select(newnode);
      diagram.focus();
      // console.log((diagram.selection.first() as go.Node).data);
      // console.trace();
      
    }

  }

  public stopPresentation(): void{
    if (!this.diagramRef.current) return;
    const diagram = this.diagramRef.current.getDiagram();
    if (!(diagram instanceof go.Diagram) || diagram === null) return;

    this.presIndex = 0;
    this.slideNumber = 0;
    this.props.updateSlideNumber(this.slideNumber);
    this.skipPres = false;
    this.seen = [];
    this.setState({inPresentation: false});
    this.currentPresentationKey = null;
    this.focusOnNode(0, true);
    // diagram.commandHandler.zoomToFit();
  }

  public nextSlide(): void {
    if (!this.diagramRef.current) return;
    const diagram = this.diagramRef.current.getDiagram();
    if (!(diagram instanceof go.Diagram) || diagram === null) return;

    diagram.scrollMode = go.Diagram.InfiniteScroll; //TODO: Wyłącz po prezentacji

    if(this.presIndex === diagram.nodes.count - 1){
      this.stopPresentation()
      this.props.stopPresentation();
      return;
    }

    if(this.currentPresentationKey === null){
        this.currentPresentationKey = 0;
        this.presIndex = 0;
        this.seen = [];
        this.focusOnNode(0, false);
        this.setState({inPresentation: true});
    } else{
      var n = diagram.findNodeForKey(this.currentPresentationKey);
      if(n !== null){
        let lastKey = this.currentPresentationKey;
        this.currentPresentationKey = this.getNext(n);
        if(this.currentPresentationKey == null) return

        let next = diagram.findNodeForKey(this.currentPresentationKey);
        if(next){
          this.slides.push([this.presIndex, this.slideNumber, lastKey, [...this.seen]])
          if(this.seen.includes(this.currentPresentationKey)){
            this.nextSlide();
          } else if(next.data.hidden){
            this.nextSlide();
            this.presIndex++;
          } else{
            console.log(this.slides)
            this.presIndex++;
            this.slideNumber++;
            this.props.updateSlideNumber(this.slideNumber);
            this.focusOnNode(this.currentPresentationKey);
          }
        }
      }
    }
  }

  public previousSlide() :void {
    if (!this.diagramRef.current) return;
    const diagram = this.diagramRef.current.getDiagram();
    if (!(diagram instanceof go.Diagram) || diagram === null) return;

    diagram.scrollMode = go.Diagram.InfiniteScroll; //TODO: Wyłącz po prezentacji

    let last = this.slides.pop();
    if(last){
      this.presIndex = last[0];
      this.slideNumber = last[1];
      this.currentPresentationKey = last[2];
      this.seen = last[3];

      let next = diagram.findNodeForKey(this.currentPresentationKey);
      if(next){
        if(next.data.hidden){
          this.previousSlide();
        } else{
          this.props.updateSlideNumber(this.slideNumber);
          this.focusOnNode(this.currentPresentationKey);
          console.log(this.currentPresentationKey);
        }
      } 
    }
  }

  public getNext(n : go.Node, after?: number) : number | null{
    if (!this.diagramRef.current) return 0;
    const diagram = this.diagramRef.current.getDiagram();
    if (!(diagram instanceof go.Diagram) || diagram === null) return 0;

    var p = diagram.findNodeForKey(n.data.parent);
    
    if(!this.seen.includes(n.data.key) && !this.skipPres && after === undefined && n.data.key !== 0 && p instanceof go.Node && p !== null && p.data.presentationDirection === "vertical"){
        this.seen.push(n.data.key);
        var chp = p.findTreeChildrenNodes();
        var chpArr: Array<go.Node> = [];
        while(chp.next()){
          chpArr.push(chp.value);
        }

        chpArr.sort((a: go.Node, b: go.Node) => a.data.order - b.data.order);

        var flag = false;
        var next_key = null;

        for(let child of chpArr){
          if(flag){
            next_key = child.data.key;
            break;
          }
          if(child.data.key == n.data.key) flag = true;
        }

        if(next_key === null && p.data.presentationDirection !== 'vertical'){
          var pp = diagram.findNodeForKey(p.data.parent);
          if(pp){
            return this.getNext(pp, p.data.key);
          }
            
        }

        if(next_key === null){
          for(let child of chpArr){
            if(child.findTreeChildrenNodes().count > 0){
              this.skipPres = true;
              return this.getNext(child);
            }
          }
          var pp = diagram.findNodeForKey(p.data.parent);
          if(pp){
            return this.getNext(pp, p.data.key);
          }

        }
        return next_key;
    }

    this.seen.push(n.data.key);

    var ch = n.findTreeChildrenNodes();
    
    
    if(ch.count == 0){
        if(p !== null){
            var chp = p.findTreeChildrenNodes();
            var chpArr: Array<go.Node> = [];
            while(chp.next()){
              chpArr.push(chp.value);
            }

            chpArr.sort((a: go.Node, b: go.Node) => a.data.order - b.data.order);

            var flag = false;
            var next_key = null;

            for(let child of chpArr){
              if(flag){
                next_key = child.data.key;
                break;
              }
              if(child.data.key == n.data.key) flag = true;
            }

            

            if(next_key === null && p.key !== 0){
              var pp = diagram.findNodeForKey(p.data.parent);
              if(pp){
                var nxt = this.getNext(pp, p.data.key);

                if(this.skipPres && nxt !== null && pp.data.presentationDirection === "vertical"){
                  var nextNode = diagram.findNodeForKey(nxt);
                  if(nextNode instanceof go.Node && nextNode !== null){
                    if(nxt === 0){
                      this.skipPres = false;
                      return 0;
                    }
                    this.skipPres = false;
                    return this.getNext(nextNode);
                  }
                } else{
                  this.skipPres = false;
                  return nxt;
                }
              }
                
            }

            if(next_key === null){
              this.skipPres = false;
              return 0;
            }
              

            this.skipPres = false;
            return next_key;
          }
        else{
          return 0;
        }
    } else{
      var chArr: Array<go.Node> = [];
      while(ch.next()){
        chArr.push(ch.value);
      }

      chArr.sort((a: go.Node, b: go.Node) => a.data.order - b.data.order);
      
      if(after === undefined){
        var f = chArr[0];
        if(f !== null){
          this.skipPres = false;
          return f.data.key;
        } else{
          this.skipPres = false;
          return 0;
        }
          
      } else{
        var flag = false;
        var next_key = null;
        
        for(let child of chArr){
          if(flag){
            next_key = child.data.key;
            break;
          }

          if(child.data.key == after) flag = true;
        }

        if(next_key === null && n.key !== 0){
          var p = diagram.findNodeForKey(n.data.parent);
          if(p){
            var nxt = this.getNext(p, n.data.key);
            if(this.skipPres && nxt !== null && p.data.presentationDirection === "vertical"){
              var nextNode = diagram.findNodeForKey(nxt);
              if(nextNode instanceof go.Node && nextNode !== null){
                if(nxt === 0){
                  this.skipPres = false;
                  return 0;
                }
                this.skipPres = false;
                return this.getNext(nextNode);
              }
            } else{
              return nxt;
            }
          }
            
        }

        if(next_key === null){
          this.skipPres = false;
          return 0;
        }

        var afnode = diagram.findNodeForKey(after);
        if(this.skipPres && afnode !== null){
          for(let child of chArr){
            if(child.findTreeChildrenNodes().count > 0 && child.data.order > afnode.data.order){
              this.skipPres = false;
              return child.data.key;
            }
          }
          this.skipPres = false;
          return 0;
        }
         
        this.skipPres = false;
        return next_key;
      }
      
    }
    
  }

  public focusOnNode(node_key: number, doIgnore: boolean=false): void {
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
      if(!it.value.data.hidden){
        anim0.add(it.value, "opacity", 1, 1);
      } else{
        anim0.add(it.value, "opacity", 0.5, 0.5);
      }
      
    }

    //tint links
    const it2 = diagram.links;
    while (it2.next()) {
      if(it2.value.toNode && !it2.value.toNode.data.hidden){
        anim0.add(it2.value, "opacity", 1, 1);
      } else{
        anim0.add(it2.value, "opacity", 0.1, 0.1);
      }
      
    }
    anim0.duration = 1;
    anim0.start();

    // diagram.select(node);

    diagram.commandHandler.scrollToPart(node as go.Part);
    let bounds = node.actualBounds.copy();
    diagram.zoomToRect(bounds.grow(200, 200, 200, 200));
    diagram.commandHandler.scrollToPart(node as go.Part);

    // diagram.clearSelection();

    //diagram.animationManager.duration = 500;
    // Figure out how large to scale it initially; assume maximum is one third of the viewport size
    var dir = node.data.dir;
    this.shift(dir, node, doIgnore);
  }

  public shift(dir: string, node: go.Node, doIgnore: boolean = true): void {
    if (!this.diagramRef.current) return;
    const diagram = this.diagramRef.current.getDiagram();
    if (!(diagram instanceof go.Diagram) || diagram === null) return;

    var anim2 = new go.Animation();
    var off = (dir == "right") ? 170 : -170;
    //TODO: 170 jest tu hard codowane. Trzeba naprawić je w relacji do rozmiaru nodea
    var ignore = [];
    // doIgnore = false; //Pokazuje 1 na raz
    if(doIgnore){
      ignore = this.findAllChildren(node);
    }
    
    ignore.push(node.key)

    const it = diagram.nodes;
    while (it.next()) {
      let k = it.value.key;
      if (!ignore.includes(k)) {
        anim2.add(it.value, "opacity", it.value.opacity, 0.1);
      }
    }

    const it2 = diagram.links;
    while (it2.next()) {
      if(it2.value.toNode !== null && it2.value.fromNode !== null){
        //let to = it2.value.toNode.key;
        let from = it2.value.fromNode.key;
    
        if (doIgnore === false || !ignore.includes(from)) {
          anim2.add(it2.value, "opacity", it2.value.opacity, 0.1);
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

  public handleClipboard(){
    if (!this.diagramRef.current) return;
    const diagram = this.diagramRef.current.getDiagram();
    if (!(diagram instanceof go.Diagram) || diagram === null) return;

    let newnode = diagram.selection.first();

    if(newnode instanceof go.Node){
      let oldnode = diagram.findNodeForKey(newnode.data.parent);
      if(oldnode) {
        var ch = oldnode.findTreeChildrenNodes()

        var chArrRight: Array < go.Node > = [];
        var chArrLeft: Array < go.Node > = [];
        while (ch.next()) {
          if (ch.value == newnode) {
            continue;
          }
          if (ch.value.data.dir === "left") {
            chArrLeft.push(ch.value);
          } else {
            chArrRight.push(ch.value);
          }
        }

        chArrRight.sort((a: go.Node, b: go.Node) => a.data.order - b.data.order);
        chArrLeft.sort((a: go.Node, b: go.Node) => a.data.order - b.data.order);

        for (let i = 0; i < chArrRight.length; ++i) {
          diagram.model.setDataProperty(chArrRight[i].data, 'order', i + 1);
        }
        if (newnode.data.dir === "right") {
          diagram.model.setDataProperty(newnode.data, 'order', chArrRight.length + 1);
          chArrRight.push(newnode);
        }
        for (let j = 0; j < chArrLeft.length; ++j) {
          diagram.model.setDataProperty(chArrLeft[j].data, 'order', j + chArrRight.length + 1);
        }
        if (newnode.data.dir === "left") {
          diagram.model.setDataProperty(newnode.data, 'order', chArrRight.length + chArrLeft.length + 1);
        }
      }
    }
  }



  public render() {
    return (<div className={(this.state.inPresentation)? "max clickThrough" : "max"}>
            <ReactDiagram ref = {
        this.diagramRef
      }
      divClassName = "diagram-component"
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
      skipsDiagramUpdate = {this.props.skipsDiagramUpdate 
      }
      />
    </div>

    );
  }
}