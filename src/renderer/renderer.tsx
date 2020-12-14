// /**
//  * React renderer.
//  */
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';

document.body.style.overflow = "hidden"

ReactDOM.render(
  <App />,
  document.getElementById('app')
);