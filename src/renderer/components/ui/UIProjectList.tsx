/*
*  Copyright (C) 1998-2020 by Northwoods Software Corporation. All Rights Reserved.
*/

import * as React from 'react';
import '../../styles/ui/UIProjectList.css';

interface UIProjectListProps {
  load: () => void;
}

export class UIProjectList extends React.PureComponent<UIProjectListProps, {}> {

  constructor(props: UIProjectListProps) {
    super(props);
  }

  public render() {

    return (
        <ul className="list">
            <li className="listItem" > <a href="" > Project 1 (cloud)</a>  </li>
            <li className="listItem" > <a href="" > Project 1 </a>  </li>
            <li className="listItem" > <a onClick={this.props.load} > Load.. </a>  </li>
        </ul>
    );
  }
}
