import { styled, withStyles } from '@material-ui/core/styles';
import { createMuiTheme } from '@material-ui/core/styles'
import {
    AppBar, 
    Button,
    Switch,
    LinearProgressProps,
    LinearProgress,
    Box,
    Drawer,
    Paper, 
    Stepper
} from '@material-ui/core';

import MuiAccordion from '@material-ui/core/Accordion';
import MuiAccordionSummary from '@material-ui/core/Accordion';
import MuiAccordionDetails from '@material-ui/core/Accordion';

import { lightGreen } from '@material-ui/core/colors';
import { NoEncryptionTwoTone } from '@material-ui/icons';

export const Bar = styled(AppBar)({
    float: 'right',
    padding: '0px',
    //paddingLeft: '80px',
    paddingTop: '7px',
    paddingBottom: '7px',
  });
  
export const InviteButton = withStyles({
    root: {
      color: '#2962ff' 
    },
  })(Button);
  
  export const CreateButton = withStyles({
    root: {
      backgroundColor: "rgb(90, 187, 249)", 
      color:"white", 
      '&:hover': {
        backgroundColor: 'rgb(133, 207, 255)',
      },
    },
  })(Button);

export const Accordion = withStyles({
    root: {
      border: 'none',
      boxShadow: 'none',
      borderBottom: 0,
      '&:before': {
        display: 'none',
      },
      '&$expanded': {
        margin: 'auto',
      },
    },
    expanded: {
  
    }
  })(MuiAccordion);
  
export const AccordionSummary = withStyles({
    root: {
      boxShadow: 'none',
      border: 'none',
      marginBottom: -1,
      minHeight: 56,
      '&$expanded': {
        minHeight: 56,
      },
      '&:after': {
        display: 'none',
      },
    },
    expanded: {},
  })(MuiAccordionSummary);
  
export const AccordionDetails = withStyles((theme) => ({
    root: {
      // backgroundColor: 'rgb(245, 245, 245)',
      padding: theme.spacing(2),
      paddingTop: '0 !important',
      border: 'none',
      boxShadow: 'none',
      '&:before': {
        display: 'none',
      },
    },
    expanded: {
    }
  }))(MuiAccordionDetails);
  
export const SuccessSwitch = withStyles({
    switchBase: {
      '&$checked': {
        color: lightGreen['A700'],
      },
      '&$checked + $track': {
        backgroundColor: lightGreen['A700'],
      },
    },
    checked: {},
    track: {},
  })(Switch);
  
export const theme = createMuiTheme({
    props: {
      // Name of the component
      MuiButtonBase: {
        // The properties to apply
        disableRipple: true // No more ripple, on the whole application!
      }
    },
      palette: {
        primary: {
          main: '#202122',
        },
        secondary: {
          main: 'rgb(250, 250, 250)'
        },
        
    },
    typography: {
      fontFamily: [
        "NeverMind"
      ].join(','),
    },
  });

  export const ShortDrawer = withStyles({
    root: {
    },
    paper: {
      top: 80
    }
  })(Drawer);

  export const StyledStepper = withStyles({
    root: {
      backgroundColor: "rgb(250,250,250)"
    }
  })(Stepper);