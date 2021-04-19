import { produce } from 'immer';
import { jsPDF } from 'jspdf'
import 'svg2pdf.js'

import {AppState} from '../models/AppState'

import '../static/js_fonts/Nevermind/NeverMind-normal.js'
import '../static/js_fonts/Nevermind/NeverMind-italic.js'
import '../static/js_fonts/Nevermind/NeverMind-bold.js'
import '../static/js_fonts/Nevermind/NeverMind-bolditalic.js'

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
        var dia : go.Diagram= ref2.getDiagram();
        if (dia) {
          dia.clearSelection()
          const doc = new jsPDF()

          const element = dia.makeSvg({
            scale: 0.1,

          })

          for(let text of element.getElementsByTagName("text")){
            let style = text.getAttribute("style");
            if(style){
              let spl = style.split(" ");
              let italic = (spl[1] == "Italic");
              let normal = (spl[1] == "normal");
              let bold = (spl[1] == "bold" || (spl[2] == "bold"));
              let size = +spl[1 + Number(bold) + Number(italic) + Number(normal)].substr(0, spl[1 + Number(bold) + Number(italic) + Number(normal)].indexOf("pt"));
              let familyName = style.substr(style.indexOf("pt") + 3);
              console.log(size);
              let newstyle = spl[0]+ " " + (normal?"normal ":"") +(italic?"Italic ":"") + (bold?"bold ":"") + Math.ceil(size*4/3) + "px " + familyName;
              text.setAttribute("style", newstyle);
            }
          }


          var fs = require('fs');

          fs.readFile('/Users/aszokalski/Projekty/IPDS-RELATED/Grapha-Mind/src/renderer/static/fonts/Open_Sans/OpenSans-Regular.ttf', function(err: any, data: any) {
              if (err) throw err;
              // add the font to jsPDF
              console.log(doc.getFontList())
          
          doc.svg(element, 
            {
              loadExternalStyleSheets: true,
            },
            )
            .then(() => {
              // save the created pdf
              doc.save('myPDF.pdf')
            })
          });


          console.log(element);



        }
      }
    }
    // this.setState(
    //   produce((draft: AppState) => {
    //     // draft.showPopup = !draft.showPopup;
    //     draft.openDrawer = true;
    //     draft.openAccordion = true;
    //   })
    // );
  }

  export function closeSnackbar(this: any){
    this.setState(
      produce((draft: AppState) => {
        draft.snackbarVisible = false;
      })
    );
  }