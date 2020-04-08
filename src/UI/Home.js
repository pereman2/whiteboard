import React from 'react';
import './Home.css';
import './Mainpage.css';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    Redirect
} from "react-router-dom";
import Login from './Login';
import SignUp from './SignUp';
import Mainpage from './Mainpage';
import User from '../Persistence/User';

class Home extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            username: sessionStorage.getItem('username'),
            user: new User(sessionStorage.getItem('username')),
        }
    }

    componentDidMount() {
    }

    createRoom = () => {
        this.setState({
            createdRoom: true,
        })
    }

    logOut = () => {
        window.sessionStorage.removeItem('loggedIn');
        window.sessionStorage.removeItem('username');
        window.location.reload(false)
    }

    renderLogout = () => {
        const loggedIn = window.sessionStorage.getItem('loggedIn');
        if(!loggedIn){
            return (
                <Redirect 
                    to="/login"
                />
            );
        }
    }

    render() {
        const createdRoom = this.state.createdRoom;
        if(createdRoom) {
            return(
                <Redirect to={{
                    pathname: "/board/"+this.state.username,
                    state: { id: this.state.username } 
                }}/>
            );
        }
        return(
            <div id="home">
                <div className="home-nav">
                    <div id="username">{window.sessionStorage.getItem('username')}</div>
                    <div id="logout" onClick={this.logOut}>log out</div>
                </div>
                <hr></hr>
                <div className="workspace-list">
                    Workspaces
                    <div className="workspace" onClick={this.createRoom}>{this.state.username}</div>
                </div>
            </div>
        ) ;
        
    }
}

export default Home;