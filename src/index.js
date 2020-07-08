import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Board from './UI/Board/Board'
import * as serviceWorker from './serviceWorker';
import Mainpage from './UI/Mainpage';
import Mainrouter from './UI/Mainrouter';

ReactDOM.render(
    <Board />
    , document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
