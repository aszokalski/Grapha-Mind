import { ContactlessOutlined } from '@material-ui/icons';
import * as React from 'react';
import '../../../static/styles/ui/UIPopup.css';

import {UIButton} from './UIButton';

import {
 Zoom
} from '@material-ui/core';

interface UIPopupProps {
  onClickAway?: ()=> void;
}


export class UIPopup extends React.PureComponent<UIPopupProps, {}> {
    render() {
      return (
        <>
        <div className='popup' onClick={(e)=>{
          if(this.props.onClickAway){
            this.props.onClickAway();
          }
        }}>
        </div>
            <div className='popup_inner'>
              <div>{this.props.children}</div>
          </div>
        </>
      );
    }
  }