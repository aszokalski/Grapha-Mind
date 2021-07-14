import * as React from 'react';
import * as go from 'gojs';
import {produce} from 'immer'
import { jsPDF } from 'jspdf'
import * as path from 'path'
import * as el from 'electron';
import * as fs from 'fs';

import {
    ShortDrawer
} from './ui/StyledMUI';
  
import {
    Paper,
    Grid,
    Tab,
    Tabs,
    Box,
    Typography,
    Button
} from '@material-ui/core';

import {UIPopup} from './ui/UIPopupExport'

function TabPanel(props: any) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

interface ExportPopupProps {
    openExportPopup: boolean;
    toggleExportPopup: (x: boolean) => void;
    preview: any;
    wrapperRef: any;
    path: string | null;
}

interface ExportPopupState {
  formatIndex: number;

}

export class ExportPopup extends React.PureComponent<ExportPopupProps, ExportPopupState> {
  constructor(props: ExportPopupProps) {
    super(props);
    this.state = {
      formatIndex: 0
    };

    this.switchFormat = this.switchFormat.bind(this);
  }

  // componentDidMount(){
  //   this.setState(produce((draft: ExportPopupState) => {
  //     draft.preview= this.getPreview();
  //   }));
  // }

  public switchFormat(e: any, index: number){
    this.setState(produce((draft: ExportPopupState) => {
      draft.formatIndex = index;
    }));
  }

  public export(format: string){
    var ref = this.props.wrapperRef.current;
    if(ref){
      var ref2 = ref.diagramRef.current;
      if(ref2){
        var dia : go.Diagram= ref2.getDiagram();
        if (dia) {
          dia.clearSelection()

          if(format=="pdf"){
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
                let newstyle = spl[0]+ " " + (normal?"normal ":"") +(italic?"Italic ":"") + (bold?"bold ":"") + Math.ceil(size*4/3) + "px " + familyName;
                text.setAttribute("style", newstyle);
              }
            }
  
            doc.svg(element, 
              {
                loadExternalStyleSheets: true,
                width:doc.internal.pageSize.getWidth(),
                height: doc.internal.pageSize.getHeight()
              },
              )
              .then(() => {
                // save the created pdf
                let fname = "Untitled"
                if(this.props.path){
                  fname = path.parse(this.props.path).base;
                }
                doc.save(fname+'.pdf')
              })
          } else{
            const element = dia.makeImage({
              scale: 2,
            })
            if(element){
              let base64Image = element.src.split(';base64,').pop();
              const dialog = el.remote.dialog;

              dialog.showSaveDialog({ 
                title: 'Select the File Path to save', 
                defaultPath: '', 
                // defaultPath: path.join(__dirname, '../assets/'), 
                buttonLabel: 'Save', 
                // Restricting the user to only Text Files. 
                filters: [ 
                  { name: 'Images', extensions: [format] },
                 ], 
                properties: [] 
            } as el.SaveDialogOptions,(fileName) => {
                if (fileName === undefined){
                    console.log("You didn't save the file");
                    return;
                }
            
                // fileName is a string that contains the path and filename created in the save file dialog.  
                fs.writeFile(fileName, base64Image, {encoding: 'base64'}, (err) => {
                    if(err){
                        alert("An error ocurred creating the file "+ err.message)
                        return;
                    }
                });
            }); 
            }
          }


        }
      }
    }
  }

  public render() {
    return (
        this.props.openExportPopup?
            <UIPopup onClickAway={()=>{this.props.toggleExportPopup(false)}}>
                <div style={{
                  position: "absolute",
                  left: "50%",
                  transform: "translate(-50%, 0%)",
                  textAlign: "center"
                }}>
                </div>

                <Grid container>
                  <Grid style={{height:"400px", textAlign: "center", alignItems:"center"}} item xs={6}>

                  <div style={{ marginTop: "10px"}}> Preview </div>
                  <Paper style={{width: "226px", height: "320px", margin:"auto", marginBottom: "10px", marginTop: "10px", padding: "10px"}}>
                    <div style={{width: "100%", height: "100%"}}>
                      { this.props.preview() !== null ?
                      <img style={{position: "absolute", top:"50%", transform: "translate(-50%, -50%)", maxWidth: "200px", maxHeight: "400px"}} src={this.props.preview().src} alt="bbb" /> : "No Preview"
                      }
                    </div>
                  </Paper>
                

                  </Grid>

                  <Grid style={{height:"400px", textAlign: "center", alignItems:"center"}}  item xs={6}>
                    <div style={{ marginTop: "10px"}}> Format </div>

                        <Tabs value={this.state.formatIndex} onChange={this.switchFormat} variant="scrollable">
                          <Tab label="PDF" />
                          <Tab label="PNG"/>
                          <Tab label="JPEG" />
                      </Tabs>
                      <TabPanel value={this.state.formatIndex} index={0}>
                        <Button variant="contained" onClick={()=>{this.export("pdf")}}>
                          Export
                        </Button>
                      </TabPanel>
                      <TabPanel value={this.state.formatIndex} index={1}>
                        <Button variant="contained" onClick={()=>{this.export("png")}}>
                          Export
                        </Button>
                      </TabPanel>
                      <TabPanel value={this.state.formatIndex} index={2}>
                        <Button variant="contained" onClick={()=>{this.export("jpg")}}>
                          Export
                        </Button>
                      </TabPanel>
                    </Grid>
                </Grid>
            </UIPopup>
        : null        
    );
  }
}
