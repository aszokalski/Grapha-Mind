import * as React from 'react';
import '../../styles/ui/UITextInput.css';

interface UITextInputProps {
    placeholder: string;
    handleChange: ()=>void;
    readOnly: boolean;
    value: string;
    type: string;
}



export class UITextInput extends React.PureComponent<UITextInputProps> {

    constructor(props: UITextInputProps) {
        super(props);
    }


    render() {
      let t = "text"
      if(this.props.type === "password"){
        t = "password"
      }
      return (
          <div className="UIInputContainer">
            <span className={"UIInputIcon "+this.props.type}>.</span><input readOnly={this.props.readOnly} className="UITextInput" onChange={this.props.handleChange} type={t}/>
          </div>
      );
    }
  }

