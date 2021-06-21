import * as React from 'react';

import {User} from '../models/User'

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
    ListItemSecondaryAction,
    Avatar,
    ListItemText,
    FormControlLabel,
    Switch,
    CircularProgress,
    ClickAwayListener,
    Tooltip,
    Menu,
    MenuItem,
    Badge,
    IconButton
} from '@material-ui/core';

import SettingsIcon from '@material-ui/icons/Settings';
import LinkIcon from '@material-ui/icons/Link';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import CloudDoneIcon from '@material-ui/icons/CloudDone';
import CloudOffIcon from '@material-ui/icons/CloudOff';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import MoreVertIcon from '@material-ui/icons/MoreVert';

interface CoworkingDrawerProps {
    coworkers : { [id: string] : User};
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
    makeHost:(x: number)=>void;
    kickOut: (x: number)=>void;
    isHost: boolean;
}

interface CoworkingDrawerState {
  currentUserID: number | null;
}

export class CoworkingDrawer extends React.PureComponent<CoworkingDrawerProps, CoworkingDrawerState> {
  constructor(props: CoworkingDrawerProps) {
    super(props);
    this.state = {
      currentUserID: null,
    }

    this.makeHost = this.makeHost.bind(this);
    this.kickOut = this.kickOut.bind(this);
    this.handleMenuClick = this.handleMenuClick.bind(this);
  }

  private makeInitials(name: string){
    return name.split(" ").map((n)=>n[0]).join("");
  }

  private handleMenuClick(event: any){
    this.setState({currentUserID: event.currentTarget.getAttribute('data-key')})
    this.props.handleMenuClick(event);
  }
  private makeHost(event:any){
    if(this.state.currentUserID){
      this.props.makeHost(this.state.currentUserID);
    }
    this.props.toggleMenu();
  }

  private kickOut(event:any){
    if(this.state.currentUserID){
      this.props.kickOut(this.state.currentUserID);
    }
    this.props.toggleMenu();
  }

  public render() {
    return (
        <Drawer variant={"temporary"} anchor={"right"} open={this.props.openDrawer} onClose={()=>{this.props.toggleDrawer(false)}}>
              <List dense className="coworkersList">
          {Object.keys(this.props.coworkers).map((id, index) => {
            let user = this.props.coworkers[id];
            const labelId = `checkbox-list-secondary-label-${id}`;
            return (
              <div key={id} data-key={id} onClick={user.isClient?(e: any)=>{}: this.handleMenuClick}>
              <ListItem button>
                <ListItemAvatar>
                  {user.isHost?
                  <Badge 
                  badgeContent="H"
                  overlap="circle"
                  color="secondary"
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                  >
                <Avatar
                  style={{backgroundColor: user.color}}
                  alt={`Avatar n°${id + 1}`}
                  // src={`/static/images/avatar/${value + 1}.jpg`}
                >
                  {this.makeInitials(user.name)}
                </Avatar>
                  </Badge>
                  :
                  <Avatar
                  style={{backgroundColor: user.color}}
                  alt={`Avatar n°${id + 1}`}
                  // src={`/static/images/avatar/${value + 1}.jpg`}
                >
                  {this.makeInitials(user.name)}
                </Avatar>
                  }
                
   
                </ListItemAvatar>
                <ListItemText id={labelId} primary={user.name} />
                  {user.isClient?
                                  <ListItemSecondaryAction>
                                  <IconButton edge="end" aria-label="comments">
                                    <SettingsIcon />
                                  </IconButton>
                                </ListItemSecondaryAction>
                                :
                                <ListItemSecondaryAction>
                                <IconButton edge="end" aria-label="comments">
                                  <MoreVertIcon />
                                </IconButton>
                              </ListItemSecondaryAction>
                  }

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
        <CircularProgress style={{color:"rgb(128, 128, 128)"}} size={20}/>
        :
        <>
          {this.props.cloudSaved?
          <CloudDoneIcon style={{color:"rgb(128, 128, 128)"}}/>
          :
          <CloudOffIcon style={{color:"rgb(128, 128, 128)"}}/>
        }
        </>
      }
          <span style={{color:"rgb(14, 14, 14)"}}> &nbsp;&nbsp; Save in cloud </span>
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
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              keepMounted
              open={Boolean(this.props.anchorEl)}
              onClose={this.props.toggleMenu}
              >
              <MenuItem onClick={this.makeHost} disabled={!this.props.isHost}>Make host</MenuItem>
              <MenuItem onClick={this.kickOut} disabled={!this.props.isHost}>Kick out</MenuItem>
          </Menu>
          </Drawer>
    );
  }
}
