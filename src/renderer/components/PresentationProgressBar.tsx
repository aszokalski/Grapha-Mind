import * as React from 'react';
import * as go from 'gojs';
import * as path from 'path'

import LinearProgress, { LinearProgressProps } from '@material-ui/core/LinearProgress';

import{ 
  Box, 
} from '@material-ui/core';

import { DiagramWrapper } from '../components/DiagramWrapper';

interface PresentationProgressBarProps {
  wrapperRef:  React.RefObject<DiagramWrapper>;
  slideNumber: number;
}

function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
  return (
    <Box display="flex" alignItems="center">
      <Box width="100%">
        <LinearProgress variant="determinate" {...props} />
      </Box>
      {/* <Box minWidth={35}>
        <Typography variant="body2" color="textSecondary">{`${Math.round(
          props.value,
        )}%`}</Typography>
      </Box> */}
    </Box>
  );
}

export class PresentationProgressBar extends React.PureComponent<PresentationProgressBarProps, {}> {
  constructor(props: PresentationProgressBarProps) {
    super(props);
  }

  public render() {
    let presIndex = 0;
    let total = 0;
    var ref = this.props.wrapperRef.current;
    if(ref){
      var ref2 = ref.diagramRef.current;
      if(ref2){
        var dia = ref2.getDiagram();
        if (dia) {
          total = dia.nodes.count;
          let it = dia.nodes;
          let hidden = 0;
          while(it.next()){
            if(it.value.data.hidden){
              hidden++;
            }
          }
          total -= hidden;
        }
      }
      presIndex = this.props.slideNumber+1;
    }

    return (
  <div className="progress">
      <LinearProgressWithLabel value={(presIndex/total)*100} />
  </div>
    );
  }
}