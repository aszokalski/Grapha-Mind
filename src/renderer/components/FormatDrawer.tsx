import * as React from 'react';

import {
    ShortDrawer
} from './ui/StyledMUI';
  
import {

} from '@material-ui/core';


interface FormatDrawerProps {
    openDrawer: boolean;
    toggleDrawer: () => void;
}

export class FormatDrawer extends React.PureComponent<FormatDrawerProps, {}> {
  constructor(props: FormatDrawerProps) {
    super(props);
  }

  public render() {
    return (
        <ShortDrawer 
        variant="persistent"
        anchor="right"
        open={this.props.openDrawer}
        onClose={this.props.toggleDrawer}
      > 

      <div style={{  width: "240px"}}>
        {this.props.children}
      </div>
      
      </ShortDrawer>
    );
  }
}
