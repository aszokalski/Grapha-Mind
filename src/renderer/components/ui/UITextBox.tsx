import * as React from 'react';
import '../../../static/styles/ui/UITextBox.css';

import {UIButton} from './UIButton';

interface UITextBoxProps {
    placeholder: string;
    onSubmit: (value: string)=>void;
    readOnly: boolean;
    value: string;
    type: string;
}

interface UITextBoxState {
    value: string;
  }


export class UITextBox extends React.PureComponent<UITextBoxProps, UITextBoxState> {

    constructor(props: UITextBoxProps) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.state = { value: this.props.value };
    }

    public handleSubmit(event: any){
        event.persist()
        event.preventDefault();
        this.props.onSubmit(this.state.value);
    }

    public handleChange(event: any) {
        event.persist()
        this.setState({value: event.target.value});
    }

    render() {
      return (
        <form onSubmit={this.handleSubmit}>
            <input value={this.state.value} readOnly={this.props.readOnly} className="UITextBox" onChange={this.handleChange} type="text"/>
            <input className={"UISubmit " + this.props.type} value=">" type='submit'/>
        </form>
      );
    }
  }

