import * as React from 'react';

import { 
    TwitterPicker, 
    Color } from 'react-color'

import {
     ClickAwayListener 
} from '@material-ui/core'

type pickerType = 'text' | 'box' | 'border';

interface ColorPickerProps{
    activeColor: string;
    handleColorChange: (hex: string) => void;
    type: pickerType
}

interface ColorPickerState{
    displayColorPicker: boolean;
}

export class ColorPicker extends React.PureComponent<ColorPickerProps, ColorPickerState>  {
    constructor(props : ColorPickerProps){
        super(props);
        this.state ={
                displayColorPicker: false
        };
    }

  handleClick = () => {
    this.setState({ displayColorPicker: !this.state.displayColorPicker })
  };

  handleClose = () => {
    this.setState({ displayColorPicker: false })
  };

  handleChange = (color: any) => {
    this.props.handleColorChange(color.hex);
  };

  render() {
    return (
      <div style={{
          marginTop:"10px",
          position: "relative",
        display: 'inline-block',
        }}>
        <div style={{
            padding: '5px',
            background: '#fff',
            borderRadius: '1.5px',
            boxShadow: '0 0 0 1px rgb(196, 196, 196)',
            display: 'inline-block',
            cursor: 'pointer',
            }} onClick={ this.handleClick }>
              {this.props.type=='text'?
                          <div style={{
                            width: '37.5px',
                            height: '14px',
                            borderRadius: '2px',
                            color: this.props.activeColor,
                            textAlign: 'center',
                            fontWeight: 'bold',
                            fontSize: 'larger',
                            marginTop: '-5px',
                            marginBottom : '5px'
                            }}>Aa</div>
              :
              <div style={{
                width: this.props.type=='border'?'80px':'37.5px',
                height: '14px',
                borderRadius: '2px',
                backgroundColor: this.props.activeColor,
                }}></div>
              }

        </div>
        { this.state.displayColorPicker ? <div style={{
            marginLeft:this.props.type=='border'?"0px":"-95px",
            zIndex: 2,
            position:"absolute",
            marginTop: this.props.type=='text'?"6px":"0"
          }}>
          <div
          onClick={ this.handleClose }/>
          <ClickAwayListener onClickAway={this.handleClose}>
                <TwitterPicker
                     color={ this.props.activeColor as Color } 
                     onChange={ this.handleChange }
                    width="140px" 
                    triangle={this.props.type=='border'?"top-left":"top-right"}
                    colors={['#FFFFFF', "#000000", '#FF6900', '#FCB900', '#00D084', '#8ED1FC', '#0693E3', '#EB144C', '#9900EF']}
                />
            </ClickAwayListener>
        </div> : null }

      </div>
    )
  }
}
