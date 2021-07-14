import * as React from 'react';
import '../../../static/styles/ui/UIButton.css';

interface UIButtonProps {
  type: string;
  label: string;
  disabled: boolean;
  hidden: boolean;
  onClick: () => void;
}

export class UIButton extends React.PureComponent<UIButtonProps, {}> {

  constructor(props: UIButtonProps) {
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
        <button disabled={disabled} className={"UIButton"} onClick={this.props.onClick}>
          {Boolean(this.props.children)?
              this.props.children
          :
            <>
                  {type?
                      <span className={"icon "+type}></span>:
                      label
                      }
            </>
          }

        
        </button> <br/>
        {type?
        <span className="UILabel">
        {label}
        </span> :
        null
        }
        
      </div>
      </div>
    );
  }
}
