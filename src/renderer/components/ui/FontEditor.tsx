import * as React from 'react';
import {produce} from 'immer';
import * as go from 'gojs';

import {
    Slider,
    Grid, 
    TextField,
    Typography,
    IconButton,
    Checkbox,
} from '@material-ui/core';



import FormatSizeIcon from '@material-ui/icons/FormatSize';
import FormatBoldIcon from '@material-ui/icons/FormatBold';
import FormatItalicIcon from '@material-ui/icons/FormatItalic';
import LineWeightIcon from '@material-ui/icons/LineWeight';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';

import {ColorPicker} from './UIColorPicker'
import {FontPicker} from './FontPicker';

interface FontEditorProps {
    selectedData: any;
    onInputChange: (id: string, value: string, isBlur: boolean) => void;
}

interface FontEditorState {
  fontSize : number;
  activeFontFamily: string,
  variant: {
    bold: boolean,
    italic: boolean
  },
  fontColor: string;
  boxColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
}


const marks = [
  {
    value: 10,
    label: '',
  },
  {
    value: 11,
    label: '',
  },
  {
    value: 12,
    label: '',
  },
  {
    value: 14,
    label: '',
  },
  {
    value: 18,
    label: '',
  },
  {
    value: 24,
    label: '',
  },
  {
    value: 30,
    label: '',
  },
  {
    value: 36,
    label: '',
  },
  {
    value: 48,
    label: '',
  }
];

export class FontEditor extends React.PureComponent<FontEditorProps, FontEditorState> {
  constructor(props: FontEditorProps) {
    super(props);
    this.state = {
      fontSize: 28,
      activeFontFamily: "NeverMind",
      variant: {
        bold: false,
        italic: false
      },
      fontColor: "white",
      boxColor: "red",
      borderColor: "",
      borderWidth: 0,
      borderRadius: 5
    };

    this.handleFontSizeSlider = this.handleFontSizeSlider.bind(this);
    this.handleFontSizeInput = this.handleFontSizeInput.bind(this);
    this.handleBorderWidthInput = this.handleBorderWidthInput.bind(this);
    this.handleFontColorChange = this.handleFontColorChange.bind(this);
    this.handleBoxColorChange = this.handleBoxColorChange.bind(this);
    this.handleBorderColorChange = this.handleBorderColorChange.bind(this);
    this.handleRadiusSlider = this.handleRadiusSlider.bind(this);
    this.handleRadiusInput = this.handleRadiusInput.bind(this);
  }

  componentDidUpdate(){
    let font = (this.state.variant.italic?"Italic ":"") + (this.state.variant.bold?"bold ":"") + this.state.fontSize + "pt " + this.state.activeFontFamily;
    let fontColor = this.state.fontColor;
    let boxColor = this.state.boxColor;
    let borderColor = this.state.borderColor;
    let borderWidth = this.state.borderWidth;
    let borderRadius = this.state.borderRadius;

    if(this.props.selectedData){
      font = (this.props.selectedData as go.ObjectData)['font'];
      fontColor = (this.props.selectedData as go.ObjectData)['stroke'];
      boxColor = (this.props.selectedData as go.ObjectData)['color'];
      borderColor = (this.props.selectedData as go.ObjectData)['borderColor'];
      borderRadius = (this.props.selectedData as go.ObjectData)['borderRadius'];
      borderWidth = (this.props.selectedData as go.ObjectData)['borderWidth'];
    }

    let spl = font.split(" ");
    let italic = (spl[0] == "Italic");
    let normal = (spl[0] == "normal");
    let bold = (spl[0] == "bold" || (spl[1] == "bold"));
    let size = +spl[0 + Number(bold) + Number(italic) + Number(normal)].substr(0, spl[0 + Number(bold) + Number(italic) + Number(normal)].indexOf("pt"));
    let familyName = font.substr(font.indexOf("pt") + 3);

    this.setState(produce((draft: FontEditorState)=>{
      draft.fontSize = size;
      draft.variant.bold = bold;
      draft.variant.italic = italic;
      draft.activeFontFamily = familyName;
      draft.fontColor = fontColor;
      draft.boxColor = boxColor;
      draft.borderColor = borderColor;
      draft.borderRadius = borderRadius;
      draft.borderWidth = borderWidth;
    }))

    
  }

  public handleFontSizeSlider(event: any, value : number){
    this.updateFont(value, this.state.activeFontFamily, {
      bold: this.state.variant.bold,
      italic: this.state.variant.italic,
    });
  }

  public handleRadiusSlider(event: any, value : number){
    this.props.onInputChange('borderRadius', String(value), true)
  }

  public updateFont(fontSize : number, fontFamily: string, variant: { bold: boolean,italic: boolean}){
    this.props.onInputChange('font',  (variant.italic?"Italic ":"") + (variant.bold?"bold ":"") + fontSize + "pt " + fontFamily, true)
  }

  public handleFontSizeInput(event: any){
    this.updateFont(event.target.value, this.state.activeFontFamily, {
      bold: this.state.variant.bold,
      italic: this.state.variant.italic,
    });
  }

  public handleBorderWidthInput(event: any){
    this.props.onInputChange('borderWidth',  event.target.value, true)
  }

  public handleRadiusInput(event: any){
    this.props.onInputChange('borderRadius', event.target.value, true)
  }


  public handleFontColorChange(hex: string){
    this.props.onInputChange('stroke', hex , true)
  }

  public handleBoxColorChange(hex: string){
    this.props.onInputChange('color', hex , true)
  }

  public handleBorderColorChange(hex: string){
    this.props.onInputChange('borderColor', hex , true)
  }

  public render() {
    return (
      <>
        <Typography variant="overline">
          TEXT
        </Typography>
        <Grid container spacing={2}>
        <Grid item>
          <FormatSizeIcon />
        </Grid>
        <Grid item xs>
            <Slider
            value={this.state.fontSize}
            aria-labelledby="discrete-slider"
            valueLabelDisplay="off"
            marks={marks}
            step={null}
            min={10}
            max={48}
            onChange={this.handleFontSizeSlider}
            track="normal"
          />
        </Grid>
        <Grid item>
        <TextField style={{width:"60px", height: "20px", padding: 0, margin: 0, fontSize: "0px", marginTop:"3px"}}
          id="outlined-number"
          size={"small"}
          type="number"
          variant="outlined"
          value={this.state.fontSize}
          onChange={this.handleFontSizeInput}
        />
        </Grid>
      </Grid>
      <Grid container spacing={1}>
      <Grid item> 
      <IconButton onClick={()=>{
              this.updateFont(this.state.fontSize, this.state.activeFontFamily, {
                bold: !this.state.variant.bold,
                italic: this.state.variant.italic,
              });
          }
        }>
          {this.state.variant.bold ?
              <FormatBoldIcon   fontSize="small" style={{color: "black"}}/>
            :
              <FormatBoldIcon   fontSize="small"/>
          }
        
      </IconButton>
      </Grid>

      <Grid item>
      <IconButton onClick={()=>{
              this.updateFont(this.state.fontSize, this.state.activeFontFamily, {
                bold: this.state.variant.bold,
                italic: !this.state.variant.italic,
              });
          }
        }>
          {this.state.variant.italic ?
              <FormatItalicIcon   fontSize="small" style={{color: "black"}}/>
            :
              <FormatItalicIcon   fontSize="small"/>
          }
        
      </IconButton>
      </Grid>
      <Grid item>
      <ColorPicker 
        activeColor={this.state.fontColor}
        type={'text'}
        handleColorChange={this.handleFontColorChange}
      />
      </Grid>
      <Grid item>
      <ColorPicker
        activeColor={this.state.boxColor}
        type={'box'}
        handleColorChange={this.handleBoxColorChange}
      />
      </Grid>
      </Grid>
      <div>
            <FontPicker
              activeFontFamily={this.state.activeFontFamily}
              onFontChange={(fontFamily)=>{
                this.updateFont(this.state.fontSize, fontFamily, {
                  bold: this.state.variant.bold,
                  italic: this.state.variant.italic,
                });
              }
            }
            />
        </div>

        <br/>
      <Typography variant="overline">
          Radius
      </Typography>
      <Grid container spacing={2}>
        <Grid item>
          <CheckBoxOutlineBlankIcon/>
        </Grid>
        <Grid item xs>
            <Slider
            value={this.state.borderRadius}
            aria-labelledby="discrete-slider"
            valueLabelDisplay="off"
            step={1}
            min={0}
            max={40}
            onChange={this.handleRadiusSlider}
            track="normal"
          />
        </Grid>
        <Grid item>
        <TextField style={{width:"60px", height: "20px", padding: 0, margin: 0, fontSize: "0px", marginTop:"3px"}}
          id="outlined-number"
          size={"small"}
          type="number"
          variant="outlined"
          value={this.state.borderRadius}
          onChange={this.handleRadiusInput}
        />
        </Grid>
      </Grid>
        
      </>

    );
  }
}
