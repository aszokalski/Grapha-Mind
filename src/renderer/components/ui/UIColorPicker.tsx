import * as React from 'react';

import { 
    TwitterPicker, 
    Color } from 'react-color'

import {
     ClickAwayListener 
} from '@material-ui/core'

interface ColorPickerProps{
    handleColorChange: (hex: string) => void;
}

interface ColorPickerState{
    displayColorPicker: boolean;
    color: string;
}

export class ColorPicker extends React.PureComponent<ColorPickerProps, ColorPickerState>  {
    constructor(props : ColorPickerProps){
        super(props);
        this.state ={
                displayColorPicker: false,
                color: "#FF6900"
        };
    }

  handleClick = () => {
    this.setState({ displayColorPicker: !this.state.displayColorPicker })
  };

  handleClose = () => {
    this.setState({ displayColorPicker: false })
  };

  handleChange = (color: any) => {
    this.setState({ color: color.hex }, ()=>{this.props.handleColorChange(this.state.color)})
  };

  render() {
    return (
      <div style={{
          marginTop:"7px",
          position: "relative",
        display: 'inline-block',
        }}>
        <div style={{
            padding: '5px',
            background: '#fff',
            borderRadius: '1px',
            boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
            display: 'inline-block',
            cursor: 'pointer',
            }} onClick={ this.handleClick }>
          <div style={{
          width: '36px',
          height: '14px',
          borderRadius: '2px',
          background: this.state.color,
          }} />
        </div>
        { this.state.displayColorPicker ? <div style={{
            marginLeft:"-95px",
            zIndex: 2,
            position:"absolute"
          }}>
          <div
          onClick={ this.handleClose }/>
          <ClickAwayListener onClickAway={this.handleClose}>
                <TwitterPicker
                     color={ this.state.color as Color } 
                     onChange={ this.handleChange }
                    width="140px" 
                    triangle="top-right"
                    colors={['#FF6900', '#FCB900', '#7BDCB5', '#00D084', '#8ED1FC', '#0693E3', '#ABB8C3', '#EB144C', '#9900EF']}
                />
            </ClickAwayListener>
        </div> : null }

      </div>
    )
  }
}
