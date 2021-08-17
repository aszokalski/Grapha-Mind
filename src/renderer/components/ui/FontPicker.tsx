import * as React from 'react';
import {produce} from 'immer';


import {
    Select,
    MenuItem,
    FormControl,
    ListSubheader
} from '@material-ui/core';
interface FontPickerProps {
    activeFontFamily: string;
    onFontChange: (fontFamily: string) => void;
}

interface FontPickerState {
  fonts : Array<string>;
}


export class FontPicker extends React.PureComponent<FontPickerProps, FontPickerState> {
    constructor(props: FontPickerProps) {
        super(props);
        this.state = {
            fonts: [],
        };
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount(){
        this.setState(produce((draft: FontPickerState)=>{
            draft.fonts=[
                "NeverMind",
                "OpenSans",
                "Roboto"
            ]
        }));
    }

    handleChange(event: any){
        this.props.onFontChange(event.target.value);
    }

    public render() {
        return (
            <FormControl variant="outlined" style={{width: "100%"}}>
            <Select
            labelId="demo-simple-select-outlined-label"
            id="demo-simple-select-outlined"
            value={this.props.activeFontFamily}
            onChange={this.handleChange}
          >
              <ListSubheader disableSticky={true}>Basic Fonts</ListSubheader>
              {Object(this.state.fonts)?
                this.state.fonts.map((font, index) => {
                  return(<MenuItem style={{'fontFamily' : font}} key={font} value={font}>{font}</MenuItem>);
                })
              :
              <MenuItem value="" key="abc">
              <em>Loading Fonts</em>
            </MenuItem>
            }
          </Select>
          </FormControl>

        );
    }
}
