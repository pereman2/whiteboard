import React from 'react';
import './Mainpage.css';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    Redirect
} from "react-router-dom";
import Login from './Login';
import boardImg from '../resources/background/xd.png'

class Mainpage extends React.Component {
    state = {
    }
    constructor(props, context) {
        super(props, context);
    }

    componentDidMount() {
    }

    render() {
        return(
            <div id='mainpage'>
                <div className="main-nav">
                    <Link to='/' style={{ textDecoration: 'none' }}>
                        <div className="nav-home">Chalk talk</div>
                    </Link>
                    <div className="right-nav">
                        <Link to='/login' style={{ textDecoration: 'none' }}>
                            <div className="nav-separation text-box">Log in</div>
                        </Link>
                        <Link to='/signup' style={{ textDecoration: 'none' }}>
                            <div className="nav-separation text-box background-yellow">Sign up</div>
                        </Link>
                    </div>
                </div>
                <div className="main-text">
                    <div className="color-yellow" id="title">Twelve Bou</div>
                    <div id="title-description">
                        Shared white board with real time
                        video/audio communication
                    </div>
                    <Link to="/tryboard">
                        <div id="board-image"></div>
                    </Link>
                </div>
            </div>
        ) ;
        
    }
}

export default Mainpage;