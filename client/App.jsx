import React from 'react';
import ReactDOM from 'react-dom';
import Button from '@material-ui/core/Button';

import { wssport } from '../config';

const { hostname } = window.location;

const ws = new WebSocket(`ws://${hostname}:${wssport}`);

ws.onopen = function open() {
  console.log('ws connected');
};

ws.onmessage = function incoming(data) {
  console.log(data);
};

function toggle() {
  ws.send('toggle');
}

function App() {
  return (
    <Button variant="contained" color="primary" onClick={ toggle }>
      Toggle
    </Button>
  );
}

ReactDOM.render(<App />, document.querySelector('#app'));