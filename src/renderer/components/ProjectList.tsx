import * as React from 'react';
import '../../static/styles/ProjectList.css';
import nextId from "react-id-generator";

interface ProjectListProps {
  load: () => void;
  loadFilename: (filename: string) => void;
}

export class ProjectList extends React.PureComponent<ProjectListProps, {}> {
  constructor(props: ProjectListProps) {
    super(props);
    this.handleLoad = this.handleLoad.bind(this);
  }

  handleLoad(path: string){
    this.props.loadFilename(path);
  }

  public render() {
    let projectListJSON = localStorage.getItem('projectList')
    let items = [];
    if(projectListJSON){
      let projectList = JSON.parse(projectListJSON);

      if(projectList){
        for (let project of projectList.reverse().slice(0, 5)) {
          // note: we are adding a key prop here to allow react to uniquely identify each
          // element in this array. see: https://reactjs.org/docs/lists-and-keys.html
          items.push(<li key={nextId()} className="listItem" > <a onClick={() => this.handleLoad(project.path)} > {project.name} </a>  </li>);
        }
      }
    }
    


    return (
        <ul className="list">
            {items}
            <li className="listItem" > <a onClick={this.props.load} > Other.. </a>  </li>
        </ul>
    );
  }
}
