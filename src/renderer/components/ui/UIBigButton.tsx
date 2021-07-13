import * as React from 'react';
import '../../../static/styles/ui/UIBigButton.css';

interface UIBigButtonProps {
  type: string;
  label: string;
  disabled: boolean;
  hidden: boolean;
  onClick: () => void;
}

export class UIBigButton extends React.PureComponent<UIBigButtonProps, {}> {

  constructor(props: UIBigButtonProps) {
    super(props);
  }

  public render() {
    let type = this.props.type;
    let label = this.props.label;
    let disabled = this.props.disabled;
    let hidden = this.props.hidden;

    return (
      <div className={(hidden)?"hidden":""}>
        <div className="Container">
        <button disabled={disabled} className={"UIBigButton"} onClick={this.props.onClick}>
          {label}        
        </button>

        </div>
      </div>
    );
  }
}
