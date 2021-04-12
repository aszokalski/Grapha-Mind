import { produce } from 'immer';

import {AppState} from '../models/AppState'

  export function toggleHidden(this: any){
    if(this.state.inPresentation) return;
    if(this.state.selectedData === null) return;
    let h = !this.state.selectedData['hidden'];
    var ref = this.wrapperRef.current;
    if(ref){
      var ref2 = ref.diagramRef.current;
      if(ref2){
        var dia = ref2.getDiagram();
        if (dia) {
          let n = dia.findNodeForKey(this.state.selectedData['key']);
          if(n !== null){
            this.hideRecursive(n, h);
          }
        }
      }
    }
    this.setState(
      produce((draft: AppState) => {
        if(draft.selectedData === null) return;
        const data = draft.selectedData as go.ObjectData;  // only reached if selectedData isn't null
        if(data['key'] === 0){
          data['hidden'] = !data['hidden'];
        } else{
          let h = !data['hidden'];
          data['hidden'] = h

        }
        
        const key = data.key;
        const idx = this.mapNodeKeyIdx.get(key);
        if (idx !== undefined && idx >= 0) {
          draft.nodeDataArray[idx] = data;
          draft.skipsDiagramUpdate = false;
          draft.verticalButtonDisabled = false;
        }
      })
    );
  }

  export function toggleDrawer(this: any, x : boolean){
    this.setState(produce((draft: AppState) => {
      draft.openDrawer = x;
      draft.openAccordion =false;
    }));
  }

  export function toggleFormatDrawer(this: any){
    this.setState(produce((draft: AppState) => {
      draft.openFormatDrawer = !draft.openFormatDrawer;
    }));
  }

  export function toggleFormatInspectorFocused(this: any, x: boolean){
    this.setState(
      produce((draft: AppState) => {
        draft.formatInspectorFocused = x;
      })
    );
  }

  export function toggleMenu(this: any){
    this.setState(produce((draft: AppState) => {
      draft.anchorEl = null;
    }));
  }

  export function toggleAccordion(this: any){
    this.setState(produce((draft: AppState) => {
      draft.openAccordion = !this.state.openAccordion;
    }));
  }

  export function handleMenuClick(this: any, event: any) {
    this.setState({anchorEl: event.currentTarget});
  };

  export function handleCloudChecked(this: any, event: any){
    this.setState({cloudSaving: true, cloudChecked: event.target.checked});
    this.uploadToCloud(event.target.checked);
  }

  export function handleTooltipClose(this: any){
    this.setState({openTooltip: false});
  }

  export function togglePopup(this: any) {
    var ref = this.wrapperRef.current;
    if(ref){
      var ref2 = ref.diagramRef.current;
      if(ref2){
        var dia = ref2.getDiagram();
        if (dia) {
          dia.clearSelection()
        }
      }
    }
    this.setState(
      produce((draft: AppState) => {
        // draft.showPopup = !draft.showPopup;
        draft.openDrawer = true;
        draft.openAccordion = true;
      })
    );
  }

  export function closeSnackbar(this: any){
    this.setState(
      produce((draft: AppState) => {
        draft.snackbarVisible = false;
      })
    );
  }