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
            <div>
                <div onClick={this.createRoom} className="text-box">Create room</div>
            </div>
        ) ;
        
    }
}

export default Home;