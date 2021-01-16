/*
*  Copyright (C) 1998-2020 by Northwoods Software Corporation. All Rights Reserved.
*/

import * as React from 'react';
import '../../styles/ui/UIButton.css';

import { TextField } from '@material-ui/core';

interface UIButtonProps {
  type: string;
  label: string;
  disabled: boolean;
  hidden: boolean;
  onClick: () => void;
}

export class UIButton extends React.PureComponent<UIButtonProps, {}> {

  constructor(props: UIButtonProps) {
    super(props);
  }

  public render() {
    let type = this.props.type;
    let label = this.props.label;
    let disabled = this.props.disabled;
    let hidden = this.props.hidden;

    return (
      <div className={(hidden)?"hidden":""}>
        <div className="Container">
        <button disabled={disabled} className={"UIButton"} onClick={this.props.onClick}>
            <span className={"icon "+type}></span>
        </button> <br/>
        <span className="UILabel">
        {label}
        </span>
      </div>
      </div>
    );
  }
}
