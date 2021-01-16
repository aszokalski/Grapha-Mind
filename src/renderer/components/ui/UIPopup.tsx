import * as React from 'react';
import '../../styles/ui/UIPopup.css';

import {UIButton} from './UIButton';

interface UIPopupProps {
    closePopup: ()=>void;
}


export class UIPopup extends React.PureComponent<UIPopupProps, {}> {
    render() {
      return (
        <div className='popup'>
          <div className='popup_inner'>
            <div>{this.props.children}</div>
            <div className="bottom">
                <UIButton hidden={false} disabled={false} label="Close" type={""} onClick={this.props.closePopup}></UIButton>
            </div>
            
          </div>
        </div>
      );
    }
  }

