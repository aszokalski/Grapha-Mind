import * as React from 'react';
import * as go from 'gojs';
  
import {
    Slider,
    Grid, 
    TextField,
    Typography,
    IconButton,
    FormHelperText,
} from '@material-ui/core';



import FormatSizeIcon from '@material-ui/icons/FormatSize';
import FormatBoldIcon from '@material-ui/icons/FormatBold';
import FormatItalicIcon from '@material-ui/icons/FormatItalic';
import FormatUnderlinedIcon from '@material-ui/icons/FormatUnderlined';

import {ColorPicker} from './UIColorPicker'
import {FontPicker} from './FontPicker';

interface FontEditorProps {
    selectedData: any;
    onInputChange: (id: string, value: string, isBlur: boolean) => void;
}

interface FontEditorState {
  fontSize : number;
  activeFontFamily: string,
  variant: string
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
      variant: "regular"
    };

    this.handleFontSizeSlider = this.handleFontSizeSlider.bind(this);
    this.handleFontSizeInput = this.handleFontSizeInput.bind(this);
    this.handleColorChange = this.handleColorChange.bind(this);
  }

  componentDidUpdate(){
    let font = "regular 21pt NeverMind"
    if(this.props.selectedData){
      font = (this.props.selectedData as go.ObjectData)['font'];
    }

    let spl = font.split(" ");
    console.log(spl);
    console.log(+spl[1].substr(0, spl[1].indexOf("pt")));

    this.setState({fontSize : +spl[1].substr(0, spl[1].indexOf("pt")), variant: spl[0]}); 
  }

  public handleFontSizeSlider(event: any, value : number){
    this.setState({fontSize: value});
    this.updateFont(value);
  }

  public updateFont(value : number, family: string = this.state.activeFontFamily){
    this.props.onInputChange('font', this.state.variant + " " + value+"pt " + this.state.activeFontFamily , true)
    console.log(this.state.variant + " " + value+"pt " + family );
  }

  public handleFontSizeInput(event: any){
    this.setState({fontSize: event.target.value});
    this.updateFont(event.target.value);
  }

  public handleColorChange(hex: string){
    this.props.onInputChange('stroke', hex , true)
  }

  public render() {
    return (
      <>
              <Typography variant="overline">
          Font
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
          if(this.state.variant === "bold"){
              this.setState({variant: "normal"}, ()=>{this.updateFont(this.state.fontSize);})
          } else{
            this.setState({variant: "bold"}, ()=>{this.updateFont(this.state.fontSize);})
          }
        }}>
        <FormatBoldIcon   fontSize="small" color="primary"/>
      </IconButton>
      </Grid>

      <Grid item>
      <IconButton onClick={()=>{
          if(this.state.variant === "italic"){
              this.setState({variant: "normal"}, ()=>{this.updateFont(this.state.fontSize);})
          } else{
            this.setState({variant: "italic"}, ()=>{this.updateFont(this.state.fontSize);})
          }
        }}>
        <FormatItalicIcon  fontSize="small" color="primary"/>
      </IconButton>
      </Grid>

      <Grid item>
      <IconButton onClick={()=>{
          if(this.state.variant === "underlined"){
              this.setState({variant: "normal"}, ()=>{this.updateFont(this.state.fontSize);})
          } else{
            this.setState({variant: "underlined"}, ()=>{this.updateFont(this.state.fontSize);})
          }
        }}>
        <FormatUnderlinedIcon  fontSize="small" color="primary"/>
      </IconButton>
      </Grid>
      <Grid item>
      <ColorPicker
        handleColorChange={this.handleColorChange}
      />
      </Grid>
      </Grid>
      <div>
                <FontPicker
                onFontChange={(x, y)=>{
                  this.setState({activeFontFamily: x}, ()=>{this.updateFont(this.state.fontSize);})
                  }
                }
                variants={[]}
                />
            </div>
      </>

    );
  }
}
