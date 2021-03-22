import * as React from 'react';
import * as go from 'gojs';

import {
    ShortDrawer
} from './ui/StyledMUI';
  
import {

} from '@material-ui/core';


import {FontEditor} from './ui/FontEditor'
interface FormatDrawerProps {
  selectedData: any;
  openDrawer: boolean;
  toggleDrawer: () => void;
  onInputChange: (id: string, value: string, isBlur: boolean) => void;
  toggleFocus: (x : boolean) => void;
}

interface FormatDrawerState {

}

export class FormatDrawer extends React.PureComponent<FormatDrawerProps, FormatDrawerState> {
  constructor(props: FormatDrawerProps) {
    super(props);
    this.state = {

    };


  }


  public render() {
    return (
        <ShortDrawer 
        variant="persistent"
        anchor="right"
        open={this.props.openDrawer}
        onClose={this.props.toggleDrawer}
      > 

      <div onFocus={()=>{this.props.toggleFocus(true)}} onBlur={()=>{this.props.toggleFocus(false)}} style={{  padding: "15px", paddingTop: "10px", width: "240px"}}>
        <FontEditor
          selectedData={this.props.selectedData}
          onInputChange={this.props.onInputChange}
        />
        </div>
      
      </ShortDrawer>
    );
  }
}
