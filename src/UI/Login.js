
import React from 'react';
import './Mainpage.css';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    Redirect
} from "react-router-dom";
import User from '../BusinessLogic/User';
import { useHistory } from "react-router-dom";


class Login extends React.Component {
    state = {
    }
    constructor(props, context) {
        super(props, context);
        this.state = {
            loggedIn: false,
        }
        this.initializeRefs();
    }

    componentDidMount() {
    }

    initializeRefs = () => {
        this.usernameField = React.createRef();
        this.passwordField = React.createRef();
    }

    checkLogin = async () => {
        let username = this.getUsername();
        let password = this.getPassword();
        let user = new User(username, password);
        let res = await user.checkLogin();
        if(res) {
            window.sessionStorage.setItem('loggedIn', true);
            window.sessionStorage.setItem('username', username);
            window.location.reload(false)
        }
    }

    getUsername = () => {
        let username = this.usernameField.current.value;
        return username;
    }

    getPassword = () => {
        let password = this.passwordField.current.value;
        return password; 
    }

    render() {
        const loggedIn = this.state.loggedIn;
        if(loggedIn) {
            return (
                <Redirect 
                    push to={{pathname: "/home"}}
                />
            );
        };
        return(
            <div id='login-wrapper'>
                <div className="main-nav">
                    <Link to='/' style={{ textDecoration: 'none' }}>
                        <div className="nav-home">Omni-Board</div>
                    </Link>
                    <div className="right-nav">
                        <Link to='/signup' style={{ textDecoration: 'none' }}>
                            <div className="nav-separation text-box background-yellow">Sign up</div>
                        </Link>
                    </div>
                </div>
                <div className="login-container">
                    <div className="color-yellow" id="login">Log in</div>
                    <input ref={this.usernameField} className="default-input" placeholder="username" required></input>
                    <input ref={this.passwordField} type="password" className="default-input" placeholder="password" required></input>
                    <div id="accept-area">
                        <div ref={this.messageAlert} id="messageAlert"></div>
                        <div onClick={this.checkLogin} className="default-button flex-end">Accept</div>
                    </div>
                </div>
            </div>
        ) ;
        
    }
}

export default Login;