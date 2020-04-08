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

class SignUp extends React.Component {
    state = {
    }
    constructor(props, context) {
        super(props, context);
        this.initializeRefs();
    }

    componentDidMount() {
    }

    initializeRefs = () => {
        this.usernameField = React.createRef();
        this.passwordField = React.createRef();
        this.emailField = React.createRef();
        this.messageAlert = React.createRef();
    }

    signUp = async () => {
        let username = this.getUsername();
        let password = this.getPassword();
        let email = this.getEmail();
        let user = new User(username, password, email);
        if(!this.validValues()) { return;}
        let res = await user.register();
        this.checkSignUp(res);
    }

    validValues = () => {
        this.resetErrors();
        let username = this.getUsername();
        let password = this.getPassword();
        let email = this.getEmail();
        let valid = true;
        if(username.length < 5) {
            this.usernameField.current.classList.add("incorrect-input")
            this.messageAlert.current.innerHTML = 
                this.messageAlert.current.innerHTML +
                "Username must be 5 characters or longer";
            valid = false;
        }
        if(password.length < 7) {
            this.passwordField.current.classList.add("incorrect-input")
            this.messageAlert.current.innerHTML = 
                this.messageAlert.current.innerHTML +
                " Password must be 7 characters or longer";
            valid = false;
        }
        if(!this.validEmail(email)) {
            this.emailField.current.classList.add("incorrect-input")
            this.messageAlert.current.innerHTML = 
                this.messageAlert.current.innerHTML +
                " Invalid email";
            valid = false;
        }
        return valid;

    }

    resetErrors = () => {
        this.messageAlert.current.innerHTML =
            "";
        this.usernameField.current.classList.remove("incorrect-input")
        this.emailField.current.classList.remove("incorrect-input")
        this.passwordField.current.classList.remove("incorrect-input")
    }
    validEmail = (email) => {
        let res = false;
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
            res = true;
        }
        return res;
    }
    checkSignUp = (signUp) => {
        this.resetErrors();
        console.log(signUp)
        if(signUp.registered) {
            
        }
        if(signUp.email) {
            this.emailField.current.classList.add("incorrect-input")
            this.messageAlert.current.innerHTML = "Value already exists"
        }
        if(signUp.username) {
            this.usernameField.current.classList.add("incorrect-input")
            this.messageAlert.current.innerHTML = "Value already exists"
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
    
    getEmail = () => {
        let email = this.emailField.current.value;
        return email; 
    }

    render() {
        return(
            <div id='login-wrapper'>
                <div className="main-nav">
                    <Link to='/' style={{ textDecoration: 'none' }}>
                        <div className="nav-home">Chalk talk</div>
                    </Link>
                    <div className="right-nav">
                        <Link to='/login' style={{ textDecoration: 'none' }}>
                            <div className="nav-separation text-box">Log in</div>
                        </Link>
                    </div>
                </div>
                <div className="login-container">
                    <div className="color-yellow" id="login">Sign up</div>
                    <input ref={this.usernameField} className="default-input" placeholder="username" required></input>
                    <input ref={this.emailField} type="email" className="default-input" placeholder="email" required></input>
                    <input ref={this.passwordField} type="password" className="default-input" placeholder="password" required></input>
                    <div id="accept-area">
                        <div ref={this.messageAlert} id="messageAlert"></div>
                        <div onClick={this.signUp} className="default-button flex-end">Accept</div>
                    </div>
                </div>
            </div>
        ) ;
        
    }
}

export default SignUp;