import * as React from 'react';
import {produce} from 'immer';

import getSystemFonts from 'get-system-fonts';
import * as opentype from '../../utils/opentype';
import {fontutil} from '../../utils/fonts';


import {
    Slider,
    Grid, 
    TextField,
    Typography,
    IconButton,
    FormHelperText,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@material-ui/core';


interface FontPickerProps {
    onFontChange: (fontFamily: string, variants: Array<string>) => void;
    variants: Array<string>;

}

interface FontPickerState {
  fontFamily: string,
  fonts : { [familyName: string] : Array<string>; } ;
}


export class FontPicker extends React.PureComponent<FontPickerProps, FontPickerState> {
    constructor(props: FontPickerProps) {
        super(props);
        this.state = {
            fontFamily: "NeverMind",
            fonts: {},
        };
    }

    async componentDidMount(){
        fontutil.setup();
        const fontPaths = await getSystemFonts();

        for(let path of fontPaths){
            let extension = path.split('.').pop();
            if(extension && (extension.toUpperCase() === 'TTF' || extension.toUpperCase() === 'OTF' || extension.toUpperCase() === 'WOFF')){
                opentype.load(path, (err:any, font: opentype.Font)=>{
                    if(err || !font.familyName || !fontutil.isInstalled(font.familyName)){
                        return;
                    }
                    this.setState(
                        produce((draft: FontPickerState)=>{
                            if(font.familyName in draft.fonts){
                                draft.fonts[font.familyName].push(font.styleName);
                            } else{
                                draft.fonts[font.familyName] = [font.styleName]
                            }   
                        }
                    ));
                });
            }
            // fonts.push(path.replace(/^.*[\\\/]/, ''));
        }
    }


    public render() {
        return (
            <FormControl variant="outlined" style={{width: "100%"}}>
            <Select
            labelId="demo-simple-select-outlined-label"
            id="demo-simple-select-outlined"
            value={10}
            onChange={()=>{}}
          >
              {this.state.fonts?
                Object.keys(this.state.fonts).map((font, index) => {
                  return(<MenuItem style={{'fontFamily' : font}} value={index}>{font}</MenuItem>);
                })
              :
              <MenuItem value="">
              <em>Loading Fonts</em>
            </MenuItem>
            }
          </Select>
          </FormControl>

        );
    }
}
