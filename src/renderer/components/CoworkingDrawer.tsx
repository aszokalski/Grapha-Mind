import * as React from 'react';

import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    InviteButton
} from './ui/StyledMUI';
  
import {
    Drawer,
    List,
    ListItem,
    ListItemAvatar,
    Avatar,
    ListItemText,
    FormControlLabel,
    Switch,
    CircularProgress,
    ClickAwayListener,
    Tooltip,
    Menu,
    MenuItem
} from '@material-ui/core';

import LinkIcon from '@material-ui/icons/Link';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import CloudDoneIcon from '@material-ui/icons/CloudDone';
import CloudOffIcon from '@material-ui/icons/CloudOff';

interface CoworkingDrawerProps {
    openDrawer: boolean;
    openAccordion: boolean;
    openTooltip: boolean;
    cloudSaving: boolean;
    cloudSaved: boolean;
    cloudChecked: boolean;
    anchorEl: any;
    toggleDrawer: (x: boolean) => void;
    toggleMenu: () => void;
    handleMenuClick: (event: any) => void;
    toggleAccordion: () => void;
    handleCloudChecked: (event: any) => void;
    handleTooltipClose: () => void;
    copyInvite:()=>void;
}

export class CoworkingDrawer extends React.PureComponent<CoworkingDrawerProps, {}> {
  constructor(props: CoworkingDrawerProps) {
    super(props);
  }

  public render() {
    return (
        <Drawer variant={"temporary"} anchor={"right"} open={this.props.openDrawer} onClose={()=>{this.props.toggleDrawer(false)}}>
              <List dense className="coworkersList">
          {[10, 11, 12, 13].map((value) => {
            const labelId = `checkbox-list-secondary-label-${value}`;
            return (
              <div onClick={this.props.handleMenuClick}>
              <ListItem key={value} button>
                <ListItemAvatar>
                  <Avatar
                    alt={`Avatar n°${value + 1}`}
                    // src={`/static/images/avatar/${value + 1}.jpg`}
                  />
                </ListItemAvatar>
                <ListItemText id={labelId} primary={`Line item ${value + 1}`} />
              </ListItem>
              </div>

            );
          })}
              <Accordion square expanded={this.props.openAccordion}>
        <AccordionSummary onClick={this.props.toggleAccordion}
          aria-controls="panel1bh-content"
          id="panel1bh-header"
        >
                        <ListItem key={99} button>
                <ListItemAvatar>
                  <Avatar style={{backgroundColor: "#2962ff"}}>
                    <PersonAddIcon></PersonAddIcon>
                  </Avatar>
                </ListItemAvatar>
                <ListItemText style={{color: "#2962ff"}} primary={"Invite Coworkers"} />
              </ListItem>
        </AccordionSummary>
        <AccordionDetails>
          <div style={{textAlign:"center"}}>
          <FormControlLabel
        control={
          this.props.cloudSaved?
          <Switch
          checked={this.props.cloudChecked}
          onChange={this.props.handleCloudChecked}
          color="default"
          inputProps={{ 'aria-label': 'checkbox with default color' }}
        />:
          <Switch
          checked={this.props.cloudChecked}
          onChange={this.props.handleCloudChecked}
          color="default"
          inputProps={{ 'aria-label': 'checkbox with default color' }}
        />
        }
        label={<small style={this.props.cloudSaved && !this.props.cloudSaving?{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          // color:lightGreen['A700']
      }:{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
    }}>
        {this.props.cloudSaving?
        <CircularProgress size={20}/>
        :
        <>
          {this.props.cloudSaved?
          <CloudDoneIcon/>
          :
          <CloudOffIcon />
        }
        </>
      }
          <span> &nbsp; Save in cloud </span>
      </small> }
        labelPlacement="start"
      />
 
        <ClickAwayListener onClickAway={this.props.handleTooltipClose}>
            <div>
              <Tooltip
                PopperProps={{
                  disablePortal: true,
                }}
                onClose={this.props.handleTooltipClose}
                open={this.props.openTooltip}
                disableFocusListener
                disableHoverListener
                disableTouchListener
                title="Link Copied"
              >
                      <InviteButton
                      onClick={this.props.copyInvite}
                      disabled={!this.props.cloudSaved}
                      color="primary"
                      startIcon={<LinkIcon/>}
                    > Copy Invite Link
                    </InviteButton>
              </Tooltip>
            </div>
          </ClickAwayListener>
        

            </div>
        </AccordionDetails>
      </Accordion>
        </List>
        {/* <div className="middle">
        <small className="smol"> or send them </small> <br/>
          <h3 style={{padding: "0", margin:"5px", paddingTop:"5px"}}> Workplace Code</h3>
              <UITextBox type='copy' readOnly={true} value="HG673G6" placeholder="a" onSubmit={this.copyCode}/>

            <br/>
        </div> */}
        <Menu id="coworkerMenu"
              anchorEl={this.props.anchorEl}
              getContentAnchorEl={null}
              anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
              transformOrigin={{ vertical: "top", horizontal: "center" }}
              keepMounted
              open={Boolean(this.props.anchorEl)}
              onClose={this.props.toggleMenu}
              >
              <MenuItem onClick={this.props.toggleMenu}>Make host</MenuItem>
              <MenuItem onClick={this.props.toggleMenu}>Kick out</MenuItem>
          </Menu>
          </Drawer>
    );
  }
}
