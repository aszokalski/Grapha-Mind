import * as React from 'react';
import '../../styles/ui/UIPopup.css';

import {UIButton} from './UIButton';

interface UIPopupProps {
}


export class UIPopup extends React.PureComponent<UIPopupProps, {}> {
    render() {
      return (
        <div className='popup'>
          <div className='popup_inner'>
            <div>{this.props.children}</div>
          </div>
        </div>
      );
    }
  }

