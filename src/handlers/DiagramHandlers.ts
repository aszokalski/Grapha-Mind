import {CustomLink} from '../renderer/extensions/CustomLink';
import * as go from 'gojs';
import { produce } from 'immer';
import {AppState} from '../models/AppState'
import { add_node, modify, remove, transaction, clear_workplace, clear_transactions } from '../server';
import { add } from './DiagramActions';

const MongoClient = require('mongodb').MongoClient;

  //Diagram event handler
  export function handleDiagramEvent(this:any, e: go.DiagramEvent) {
    const name = e.name;
    switch (name) {
      case 'ChangedSelection': {
        const sel = e.subject.first();
        this.setState(
          produce((draft: AppState) => {
            if (sel) {
              if (sel instanceof go.Node) {
                const idx = this.mapNodeKeyIdx.get(sel.key);
                if (idx !== undefined && idx >= 0) {
                  const nd = draft.nodeDataArray[idx];
                  draft.selectedData = nd;
                  draft.verticalButtonDisabled = !(draft.selectedData['presentationDirection'] === 'horizontal');
                }
              } 
            } else {
              draft.selectedData = null;
            }
          })
        );
        break;
      }
      default: break;
    }
  }

  /**
   * Handle GoJS model changes, which output an object of data changes via Model.toIncrementalData.
   * This method iterates over those changes and updates state to keep in sync with the GoJS model.
   * @param obj a JSON-formatted string
   */
  export function handleModelChange(this:any, obj: go.IncrementalData, key: string|null = null) {
    const insertedNodeKeys = obj.insertedNodeKeys;
    const modifiedNodeData = obj.modifiedNodeData;
    const removedNodeKeys = obj.removedNodeKeys;
    const modifiedModelData = obj.modelData;
    console.log("hmc");
    let r = Math.random().toString(36).substring(7);

    // maintain maps of modified data so insertions don't need slow lookups
    const modifiedNodeMap = new Map<go.Key, go.ObjectData>();
    this.setState(
      produce((draft: AppState) => {
        if(key == null){
          draft.lastTransactionKey.push(r);
        } else{
          draft.lastTransactionKey.push(key);
        }
        let narr = draft.nodeDataArray;
        if (modifiedNodeData) {
          modifiedNodeData.forEach((nd: go.ObjectData) => {
            modifiedNodeMap.set(nd.key, nd);
            const idx = this.mapNodeKeyIdx.get(nd.key);
            if (idx !== undefined) {
              narr[idx] = nd;
              if (draft.selectedData && draft.selectedData.key === nd.key) {
                draft.selectedData = nd;
              }
            }
          });
          if(this.state.nodeDataArray!==[] && key == null){
            for(let node of modifiedNodeData){
              console.log('modify node');
              modify(this.state.graphId, node);//fix potem na luziku bo to nie jest błąd
            }
          }
        }
        if (insertedNodeKeys) {
          insertedNodeKeys.forEach((key: go.Key) => {
            const nd = modifiedNodeMap.get(key);
            const idx = this.mapNodeKeyIdx.get(key);
            if (nd && idx === undefined) {  // nodes won't be added if they already exist
              this.mapNodeKeyIdx.set(nd.key, narr.length);
              narr.push(nd);
              console.log(nd);
              if(key == null){
                console.log('add node');
                add_node(this.state.graphId, nd);
              }
            }
          });
        }
        if (removedNodeKeys) {
          console.log('aaa');
          narr = narr.filter((nd: go.ObjectData) => {
            if (removedNodeKeys.includes(nd.key)) {
              return false;
            }
            return true;
          });
          draft.nodeDataArray = narr;
          this.refreshNodeIndex(narr);
          if(key == null){
            for(let node of removedNodeKeys){
              console.log('remove node');
              remove(this.state.graphId, node as number);
            }
          }
        // handle model data changes, for now just replacing with the supplied object
        if (modifiedModelData) {
          draft.modelData = modifiedModelData;
        }
      }
      draft.skipsModelChange = (key != null);  // the GoJS model already knows about these updates
      draft.skipsDiagramUpdate = (key == null);
    }),()=>{
      if(key == null){
        console.log("sending transaction: ", r);
        let ltr = null;
        if(this.state.lastTransactionKey.length > 1){
          ltr = this.state.lastTransactionKey[this.state.lastTransactionKey.length - 2];
        }
        transaction(this.state.graphId, {'transaction': obj, 'key': r, 'last_tranaction_required': ltr});
      }
    });
    
    this.setState(
      produce((draft: AppState) => {
        if(!this.state.first){
          draft.saved = false;
        } else{
          draft.first = false;
          draft.saved = true;
        }
        
      })
    );

    //Hide hidden links
    var ref = this.wrapperRef.current;
    if(ref){
      var ref2 = ref.diagramRef.current;
      if(ref2){
        var dia = ref2.getDiagram();
        if (dia) {
          let it = dia.links;
          while(it.next()){
            let n = it.value.toNode;
            if(n  && n.data.hidden){
              (it.value as CustomLink).toggle(true);
            }
          }
        }
      }
    }
  }

  /**
   * Handle inspector changes, and on input field blurs, update node/link data state.
   * @param path the path to the property being modified
   * @param value the new value of that property
   * @param isBlur whether the input event was a blur, indicating the edit is complete
   */
  export function handleInputChange(this:any, path: string, value: string, isBlur: boolean) {
    this.setState(
      produce((draft: AppState) => {
        const data = draft.selectedData as go.ObjectData;  // only reached if selectedData isn't null
        if(data === null) return
        data[path] = value;
        let key=data.key;
        const idx = this.mapNodeKeyIdx.get(key);
        if (idx !== undefined && idx >= 0) {
          draft.nodeDataArray[idx] = data;
          draft.skipsDiagramUpdate = false;
        }
      })
    );
  }

    //
  /**
   * Update map of node keys to their index in the array.
   */
export function refreshNodeIndex(this:any, nodeArr: Array<go.ObjectData>) {
  this.mapNodeKeyIdx.clear();
  nodeArr.forEach((n: go.ObjectData, idx: number) => {
    this.mapNodeKeyIdx.set(n.key, idx);
  });
}

export function resetSkipModelChange(this:any) {
  this.setState(
    produce((draft: AppState) => {
      draft.skipsModelChange = false;
    })
  );
}
