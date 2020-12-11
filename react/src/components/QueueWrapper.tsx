/*
*  Copyright (C) 1998-2020 by Northwoods Software Corporation. All Rights Reserved.
*/

import * as go from 'gojs';
import { ReactDiagram } from 'gojs-react';
import * as React from 'react';

import './Diagram.css';


interface DiagramProps {
  nodeDataArray: Array<go.ObjectData>;
  modelData: go.ObjectData;
  skipsDiagramUpdate: boolean;
  onDiagramEvent: (e: go.DiagramEvent) => void;
  onModelChange: (e: go.IncrementalData) => void;
}

export class QueueWrapper extends React.Component<DiagramProps, {}> {
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
            allowClipboard: false,
            allowZoom: false,
            autoScrollRegion: 0,
            allowVerticalScroll: false,
            maxSelectionCount: 1,
            layout: $(go.TreeLayout),
            "SelectionMoved": function (e) {
              diagram.layoutDiagram(true);
            },
            "ExternalObjectsDropped": function (e) {
              var n = diagram.selection.first();
              
              if(n instanceof go.Node && n !== null){
                var last = n.data.last_parent;
                if (last == undefined) {
                  last = 0;
                }

                //TODO: Reference do diagramu
                //myDiagram.model.setDataProperty(n.data, 'parent', last);
                var f = n.findLinksConnected().first()
                if(f) f.opacity = 1.0;
                
                n.expandTree();
                var m = diagram.findNodeForKey(n.key);
                
                if(m instanceof go.Node && m !== null){
                    m.data.diagram = 'secondary';
                    m.data.deletable = "true";
                    removeAllMain();
                }
              }
            },
          model: $(go.TreeModel)
        });

        diagram.animationManager.initialAnimationStyle = go.AnimationManager.None;
        diagram.addDiagramListener('InitialAnimationStarting', function (e) {
          var animation = e.subject.defaultAnimation;
          animation.easing = go.Animation.EaseOutExpo;
          animation.duration = 900;
          animation.add(e.diagram, 'scale', 0.1, 1);
          animation.add(e.diagram, 'opacity', 0, 1);
        });

        function removeAllMain() {
    
            var it = diagram.nodes;
            while (it.next()) {
              if (it.value.data.diagram == 'secondary') continue;
        
              diagram.remove(it.value);
            }
          }

          diagram.nodeTemplate =
          $(go.Node, go.Panel.Auto, { // dropping onto a Node means splicing the moved Node before this target Node
              mouseDrop: function (e, node) {
                  if(node instanceof go.Node && node !== null) insertNodeBefore(node);
              },
              mouseDragEnter: function (e, node) {
                if(node instanceof go.Link){
                  var s = node.elt(0)
                  if(s instanceof go.Shape){
                    s.stroke = "chartreuse";
                  }
                }
              },
              mouseDragLeave: function (e, node) {
                if(node instanceof go.Link){
                  var s = node.elt(0)
                  if(s instanceof go.Shape){
                    s.stroke = "chartreuse";
                  }
                }
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
              new go.Binding("text", "text"))
              );

              diagram.linkTemplate =
              $(go.Link, {
                  layerName: "Background"
                }, { // dropping onto a Link means splicing the moved Node before the Link.toNode
                  mouseDrop: function (e, link) {
                      if(link instanceof go.Link ){
                          var n = link.toNode;
                          if(n) insertNodeBefore(n);
                      }
                  },
                  mouseDragEnter: function (e, link) {
                    if(link instanceof go.Link){
                      var s = link.elt(0)
                      if(s instanceof go.Shape){
                        s.stroke = "chartreuse";
                      }
                    }
                  },
                  mouseDragLeave: function (e, link) {
                    if(link instanceof go.Link){
                      var s = link.elt(0)
                      if(s instanceof go.Shape){
                        s.stroke = "black";
                      }
                    }
                  }
                },
                $(go.Shape),
                $(go.Shape, {
                  toArrow: "OpenTriangle"
                })
              );

              function insertNodeBefore(node :go.Node) {
                if (!(node instanceof go.Node)) return;
                
                var move = diagram.selection.first();
                if (!(move instanceof go.Node)) return;
                if (move === node) return; // not in front of itself!
                var it = diagram.nodes;
                var cnt = 0;
                while (it.next()){
                  if (it.value.data.id == move.data.id) cnt++;
            
                }
            
                if(cnt >= 2){
                  diagram.remove(move);
                  return;
                }
                if (node.data.parent == move.data.key) return; // already in front of itself
                var model = diagram.model;
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


    return diagram;
  }

  public render() {
    return (
      <ReactDiagram
        ref={this.diagramRef}
        divClassName='queue-component'
        initDiagram={this.initDiagram}
        nodeDataArray={this.props.nodeDataArray}
        modelData={this.props.modelData}
        onModelChange={this.props.onModelChange}
        skipsDiagramUpdate={this.props.skipsDiagramUpdate}
      />
    );
  }
}