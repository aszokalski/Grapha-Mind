import * as React from 'react';

import { InspectorRow } from './InspectorRow';
import { Typography } from '@material-ui/core';

import '../styles/Inspector.css';

interface SelectionInspectorProps {
  selectedData: any;
  onInputChange: (id: string, value: string, isBlur: boolean) => void;
}

export class SelectionInspector extends React.PureComponent<SelectionInspectorProps, {}> {
  /**
   * Render the object data, passing down property keys and values.
   */
  private renderObjectDetails() {
    const selObj = this.props.selectedData;
    const dets = [];
    for (const k in selObj) {
      const val = selObj[k];
      const row = <InspectorRow
                    key={k}
                    id={k}
                    value={val}
                    onInputChange={this.props.onInputChange} />;
      if (k === 'key') {
        dets.unshift(row); // key always at start
      } else {
        dets.push(row);
      }
    }
    return dets;
  }

  public render() {
    return (
      <div id='myInspectorDiv' className='inspector'>
        <Typography variant="h6">
          Inspektor
        </Typography>
        <table>
          <tbody>
            {this.renderObjectDetails()}
          </tbody>
        </table>
      </div>
    );
  }
}
