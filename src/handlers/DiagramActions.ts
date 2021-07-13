import * as go from 'gojs';
import { produce } from 'immer';
import {CustomLink} from '../renderer/extensions/CustomLink';
import * as eu from 'electron-util';
import {AppState} from '../models/AppState'

  export function nextSlide(this:any, first:boolean = false){
    if(!this.state.inPresentation && !first) return;
    var ref = this.wrapperRef.current;
      if(ref){
        var ref2 = ref.diagramRef.current;
        if(ref2){
          var dia = ref2.getDiagram();
          if (dia) {
            if(dia.toolManager.textEditingTool.state === go.TextEditingTool.StateNone){
              ref.nextSlide();
            }
          }
        }
      } 

      if(!first){
        produce((draft: AppState) => {
          draft.snackbarVisible = false;
        })
      }
  }

  export function previousSlide(this:any, first:boolean = false){
    if(!this.state.inPresentation && !first) return;
    var ref = this.wrapperRef.current;
      if(ref){
        var ref2 = ref.diagramRef.current;
        if(ref2){
          var dia = ref2.getDiagram();
          if (dia) {
            if(dia.toolManager.textEditingTool.state === go.TextEditingTool.StateNone){
              ref.previousSlide();
            }
          }
        }
      }
  }

  export function add(this:any){
    var ref = this.wrapperRef.current;
    if(ref){
      var ref2 = ref.diagramRef.current;
      if(ref2){
        var dia = ref2.getDiagram();
        if (dia) {
          if(dia.toolManager.textEditingTool.state === go.TextEditingTool.StateNone){
            ref.addNodeFromSelection(true);
          }
        }
      }
    }
  }

  export function addUnder(this:any){
    var ref = this.wrapperRef.current;
    if(ref){
      var ref2 = ref.diagramRef.current;
      if(ref2){
        var dia = ref2.getDiagram();
        if (dia) {
          if(dia.toolManager.textEditingTool.state === go.TextEditingTool.StateNone){
            ref.addNodeFromSelection();
          }
        }
      }
    }
  }

  export function setVertical(this:any){
    this.setState(
      produce((draft: AppState) => {
        if(draft.selectedData === null) return;
        const data = draft.selectedData as go.ObjectData;  // only reached if selectedData isn't null
        data['presentationDirection'] = 'vertical';
        const key = data.key;
        const idx = this.mapNodeKeyIdx.get(key);
        if (idx !== undefined && idx >= 0) {
          draft.nodeDataArray[idx] = data;
          draft.skipsDiagramUpdate = false;
          draft.verticalButtonDisabled = true;
        }  
      })
    );
  }

  export function setHorizontal(this:any){
    this.setState(
      produce((draft: AppState) => {
        if(draft.selectedData === null) return;
        const data = draft.selectedData as go.ObjectData;  // only reached if selectedData isn't null
        data['presentationDirection'] = 'horizontal';
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

  export function startPresentation(this:any){
    this.setState(
      produce((draft: AppState) => {
        draft.openFormatDrawer = false;
        draft.inPresentation = true;
        draft.snackbarVisible = true;
      })
    );

    var ref = this.wrapperRef.current;
      if(ref){
        var ref2 = ref.diagramRef.current;
        if(ref2){
          var dia = ref2.getDiagram();
          if (dia) {
            dia.scrollMode = go.Diagram.InfiniteScroll; //TODO: Wyłącz po prezentacji
            dia.allowHorizontalScroll = false;
            dia.allowVerticalScroll = false;
            dia.allowSelect = false;
            dia.isModelReadOnly = true;
            dia.clearHighlighteds();
            dia.clearSelection();
          }
        }
      } 

    eu.activeWindow().setFullScreen(true);

    setTimeout(()=>{this.nextSlide(true);}, 1000);

  }

  export function stopPresentation(this:any){
    if(!this.state.inPresentation) return;
    eu.activeWindow().setFullScreen(false);
    this.setState(
      produce((draft: AppState) => {
        draft.inPresentation = false;
      })
    );

    var ref = this.wrapperRef.current;
    if(ref){
      var ref2 = ref.diagramRef.current;
      if(ref2){
        var dia = ref2.getDiagram();
        if (dia) {
          dia.scrollMode = go.Diagram.DocumentScroll; //TODO: Wyłącz po prezentacji
          dia.allowHorizontalScroll = true;
          dia.allowVerticalScroll = true;
          dia.allowSelect = true;
          dia.isModelReadOnly = false;
        }
      }

      setTimeout(()=>{if(ref) ref.stopPresentation();}, 500);
    
    } 

  }

  export function updateSlideNumber(this:any, n : number){
    this.setState(
      produce((draft: AppState) => {
        draft.slideNumber = n;
      })
    );
  }

  export function hideRecursive(this:any, n: go.Node, h: boolean){
    let it = n.findTreeChildrenNodes();
    let linkf = n.findLinksInto().first() as CustomLink;
    if(linkf){
      linkf.toggle(h);
    }
    while(it.next()){
      this.setState(
        produce((draft: AppState) => {
          if(draft.selectedData === null) return;
          const data = draft.selectedData as go.ObjectData;  // only reached if selectedData isn't null
          let it = n.findTreeChildrenNodes();
          while(it.next()){
            let c = this.mapNodeKeyIdx.get(it.value.key);
            if(c !== undefined){
              draft.nodeDataArray[c]['hidden'] = h;
              let link = it.value.findLinksInto().first() as CustomLink;
              if(link){
                link.toggle(h);
              }
              this.hideRecursive(it.value, h);
            }
          }
          draft.skipsDiagramUpdate = false;
        })
      );
    }
  }

  export function typing(this:any){
    if(this.state.inPresentation) return;
    var ref = this.wrapperRef.current;
    if(ref){
      var ref2 = ref.diagramRef.current;
      if(ref2){
        var dia = ref2.getDiagram();
        if (dia) {
          if(dia.toolManager.textEditingTool.state === go.TextEditingTool.StateNone){
            var e = dia.lastInput;
            var cmd = dia.commandHandler;
            let sel = dia.selection.first();
            if ((e.key.length === 0 || !e.key.trim()) //Fix of the empty key bug
                || (!e.meta && !e.control && e.key.length < 2 && ((e.key.charCodeAt(0) > 47 && e.key.charCodeAt(0) < 91) || 
                (e.key.charCodeAt(0) > 95  && e.key.charCodeAt(0) < 112) || 
                (e.key.charCodeAt(0) > 160  && e.key.charCodeAt(0) < 166) ||
                e.key.charCodeAt(0) === 170 || e.key.charCodeAt(0) === 171 || 
                (e.key.charCodeAt(0) > 186  && e.key.charCodeAt(0) < 232)))) {  // could also check for e.control or e.shift
              if(sel){
                let textBox = sel.findObject("TEXT");
                if(textBox instanceof go.TextBlock){
                  dia.startTransaction();
                  textBox.text = '';
                  dia.commitTransaction("Clear");
                  dia.toolManager.textEditingTool.selectsTextOnActivate = false;
                  cmd.editTextBlock(textBox);
                  go.CommandHandler.prototype.doKeyDown.call(cmd); //Rerun so the textbox records this character
                  dia.toolManager.textEditingTool.selectsTextOnActivate = true;
                }
              
              }
              
            }
          }
        }
      }
    }
  }