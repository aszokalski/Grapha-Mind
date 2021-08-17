import * as go from 'gojs';
import { data } from 'jquery';
import * as React from 'react';

/**
 * Properties passed to the Diagram component.
 */
export interface DiagramProps {
  initDiagram: () => go.Diagram;
  divClassName: string;
  nodeDataArray: Array<go.ObjectData>;
  linkDataArray?: Array<go.ObjectData>;
  modelData?: go.ObjectData;
  skipsDiagramUpdate: boolean;
  skipsModelChange: boolean;
  onModelChange?: (e: go.IncrementalData) => void;
  resetSkipModelChange: () => void;
}

/**
 * A Diagram component to allow a GoJS diagram to be used within a React app.
 *
 * Data arrays passed to this component will be deep cloned before usage in a GoJS model, preserving immutability.
 */
export class ReactDiagramCustom extends React.Component<DiagramProps, {}> {
  /** @internal */
  private divRef: React.RefObject<HTMLDivElement>;
  /** @internal */
  private modelChangedListener: ((e: go.ChangedEvent) => void) | null = null;

  /** @internal */
  constructor(props: DiagramProps) {
    super(props);
    this.divRef = React.createRef();
  }

  /**
   * Returns a reference to the GoJS diagram instance for this component.
   */
  public getDiagram(): go.Diagram | null {
    if (this.divRef.current === null) return null;
    return go.Diagram.fromDiv(this.divRef.current);
  }

  /**
   * @internal
   * Initialize the diagram and add the required listeners.
   */
  public componentDidMount() {
    if (this.divRef.current === null) return;
    const diagram = this.props.initDiagram();

    diagram.div = this.divRef.current;

    // initialize data change listener
    this.modelChangedListener = (e: go.ChangedEvent) => {
      if (e.isTransactionFinished && e.model && !e.model.isReadOnly && this.props.onModelChange) {
        const dataChanges = e.model.toIncrementalData(e);
        console.log(this.props.skipsModelChange);
        if (dataChanges !== null){
          if(this.props.skipsModelChange){
            this.props.resetSkipModelChange();
          } else{
            this.props.onModelChange(dataChanges);
          }
          // if(!(dataChanges.insertedNodeKeys != undefined && dataChanges.insertedNodeKeys.length == e.model.nodeDataArray.length)){
          //   this.props.onModelChange(dataChanges);
          // }
        } 
      }
    };
    diagram.addModelChangedListener(this.modelChangedListener);

    diagram.delayInitialization(() => {
      const model = diagram.model;
      model.commit((m: go.Model) => {
        if (this.props.modelData !== undefined) {
          m.assignAllDataProperties(m.modelData, this.props.modelData);
        }
        m.mergeNodeDataArray(this.props.nodeDataArray);
        if (this.props.linkDataArray !== undefined && m instanceof go.GraphLinksModel) {
          m.mergeLinkDataArray(this.props.linkDataArray);
        }
      }, 'gojs-react init merge');
    });
  }

  /**
   * @internal
   * Disassociate the diagram from the div and remove listeners.
   */
  public componentWillUnmount() {
    const diagram = this.getDiagram();
    if (diagram !== null) {
      diagram.div = null;
      if (this.modelChangedListener !== null) {
        diagram.removeModelChangedListener(this.modelChangedListener);
        this.modelChangedListener = null;
      }
    }
  }

  /**
   * @internal
   * Determines whether component needs to update by checking the skips flag and doing a shallow compare on props.
   * @param nextProps
   * @param nextState
   */
  public shouldComponentUpdate(nextProps: DiagramProps, nextState: any) {
    if (nextProps.skipsDiagramUpdate) return false;
    // quick shallow compare
    if (nextProps.nodeDataArray === this.props.nodeDataArray &&
        nextProps.linkDataArray === this.props.linkDataArray &&
        nextProps.modelData === this.props.modelData) return false;
    return true;
  }

  /**
   * @internal
   * When the component updates, merge all data changes into the GoJS model to ensure everything stays in sync.
   * @param prevProps
   * @param prevState
   */
  public componentDidUpdate(prevProps: DiagramProps, prevState: any) {
    const diagram = this.getDiagram();
    if (diagram !== null) {
      const model = diagram.model;
      model.startTransaction('update data');
      if (this.props.modelData !== undefined) {
        model.assignAllDataProperties(model.modelData, this.props.modelData);
      }
      model.mergeNodeDataArray(this.props.nodeDataArray);
      if (this.props.linkDataArray !== undefined && model instanceof go.GraphLinksModel) {
        model.mergeLinkDataArray(this.props.linkDataArray);
      }
      model.commitTransaction('update data');
    }
  }

  /** @internal */
  public render() {
    return (<div ref={this.divRef} className={this.props.divClassName}></div>);
  }
}