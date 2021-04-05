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
    InputLabel,
    ListSubheader
} from '@material-ui/core';

const basicFonts: Array<string> = ["Abadi MT Condensed Light","Albertus Extra Bold","Albertus Medium","Antique Olive","Arial","Arial Black","Arial MT","Arial Narrow","Bazooka","Book Antiqua","Bookman Old Style","Boulder","Calisto MT","Calligrapher","Century Gothic","Century Schoolbook","Cezanne","CG Omega","CG Times","Charlesworth","Chaucer","Clarendon Condensed","Comic Sans MS","Copperplate Gothic Bold","Copperplate Gothic Light","Cornerstone","Coronet","Courier","Courier New","Cuckoo","Dauphin","Denmark","Fransiscan","Garamond","Geneva","Haettenschweiler","Heather","Helvetica","Herald","Impact","Jester","Letter Gothic","Lithograph","Lithograph Light","Long Island","Lucida Console","Lucida Handwriting","Lucida Sans","Lucida Sans Unicode","Marigold","Market","Matisse ITC","MS LineDraw","News GothicMT","OCR A Extended","Old Century","Pegasus","Pickwick","Poster","Pythagoras","Sceptre","Sherwood","Signboard","Socket","Steamer","Storybook","Subway","Tahoma","Technical","Teletype","Tempus Sans ITC",
"Times","Times New Roman","Times New Roman PS","Trebuchet MS","Tristan","Tubular","Unicorn","Univers","Univers Condensed","Vagabond","Verdana","Westminster"];

interface FontPickerProps {
    onFontChange: (fontFamily: string, variants: Array<string>) => void;
    variants: Array<string>;

}

interface FontPickerState {
  fontFamily: string,
  fonts : { [familyName: string] : Array<string>; } ;
  fancyFonts : { [familyName: string] : Array<string>; } ;
}


export class FontPicker extends React.PureComponent<FontPickerProps, FontPickerState> {
    constructor(props: FontPickerProps) {
        super(props);
        this.state = {
            fontFamily: "NeverMind",
            fonts: {"Helvetica" : ["Bold", "Italic"], "NeverMind" : ["Bold", "Italic"], "Comic Sans MS" : ["Bold", "Italic"]},
            fancyFonts: {}
        };
        this.handleChange = this.handleChange.bind(this);
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
                            if(basicFonts.includes(font.familyName)){
                                if(font.familyName in draft.fonts){
                                    draft.fonts[font.familyName].push(font.styleName);
                                } else{
                                    draft.fonts[font.familyName] = [font.styleName]
                                }   
                            } else{
                                if(font.familyName.length < 20 && font.familyName !== "Bodoni Ornaments"){
                                    if(font.familyName in draft.fancyFonts){
                                        draft.fancyFonts[font.familyName].push(font.styleName);
                                    } else{
                                        draft.fancyFonts[font.familyName] = [font.styleName]
                                    }  
                                }
                            }
            
                        }
                    ));
                });
            }
            // fonts.push(path.replace(/^.*[\\\/]/, ''));
        }
    }

    handleChange(event: any){
        this.setState({fontFamily: event.target.value}, ()=>{this.props.onFontChange(event.target.value, [])});
    }

    public render() {
        return (
            <FormControl variant="outlined" style={{width: "100%"}}>
            <Select
            labelId="demo-simple-select-outlined-label"
            id="demo-simple-select-outlined"
            value={this.state.fontFamily}
            onChange={this.handleChange}
          >
              <ListSubheader disableSticky={true}>Basic Fonts</ListSubheader>
              {this.state.fonts?
                Object.keys(this.state.fonts).sort(function(a, b){
                    if(a[0] == '.') {return 1;}
                    if(a< b) { return -1; }
                    if(a> b) { return 1; }
                    return 0;
                }).map((font, index) => {
                  return(<MenuItem style={{'fontFamily' : font}} value={font}>{font}</MenuItem>);
                })
              :
              <MenuItem value="">
              <em>Loading Fonts</em>
            </MenuItem>
            }
            <ListSubheader disableSticky={true}>Other Fonts</ListSubheader>
            {Object.keys(this.state.fancyFonts).sort(function(a, b){
                    if(a[0] == '.') {return 1;}
                    if(a< b) { return -1; }
                    if(a> b) { return 1; }
                    return 0;
                }).map((font, index) => {
                  return(<MenuItem style={{'fontFamily' : font}} value={font}>{font}</MenuItem>);
            })}
          </Select>
          </FormControl>

        );
    }
}
