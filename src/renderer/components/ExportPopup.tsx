import * as React from 'react';
import * as go from 'gojs';
import {produce} from 'immer'

import {
    ShortDrawer
} from './ui/StyledMUI';
  
import {
    Paper,
    Grid,
    Tab,
    Tabs,
    Box,
    Typography
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


  public render() {
    if(this.props.preview()){
      console.log(this.props.preview().src as string );
    }

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
                  <Paper style={{width: "80%", height: "80%", margin:"auto", marginBottom: "10px", marginTop: "10px"}}>
                    { this.props.preview() !== null ?
                    <img src={this.props.preview().src} alt="bbb" /> : "No Preview"
                    }
                  </Paper>
                

                  </Grid>

                  <Grid style={{height:"400px", textAlign: "center", alignItems:"center"}}  item xs={6}>
                    <div style={{ marginTop: "10px"}}> Settings </div>

                        <Tabs value={this.state.formatIndex} onChange={this.switchFormat} variant="scrollable">
                          <Tab  label="PDF" />
                          <Tab label="PNG"/>
                          <Tab label="JPEG" />
                      </Tabs>
                      <TabPanel value={this.state.formatIndex} index={0}>
                        Item One
                      </TabPanel>
                      <TabPanel value={this.state.formatIndex} index={1}>
                        Item Two
                      </TabPanel>
                      <TabPanel value={this.state.formatIndex} index={2}>
                        Item Three
                      </TabPanel>
                    </Grid>
                </Grid>
            </UIPopup>
        : null        
    );
  }
}
