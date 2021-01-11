/*
*  Copyright (C) 1998-2020 by Northwoods Software Corporation. All Rights Reserved.
*/

import * as React from 'react';
import '../../styles/ui/UIButton.css';

import { TextField } from '@material-ui/core';

interface UIButtonProps {
  type: string;
  onClick: () => void;
}

export class UIButton extends React.PureComponent<UIButtonProps, {}> {

  constructor(props: UIButtonProps) {
    super(props);
  }

  public render() {
    let type = this.props.type;

    return (
        <button className="UIButton" onClick={this.props.onClick}>
            <span className={"icon "+type}></span>
        </button>
    );
  }
}
