import React from 'react';
import './Mainpage.css';
import { Provider } from 'react-redux';
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
import Home from './Home'
import Board from './Board/Board'
import FreeBoard from './Board/FreeBoard';


class Mainrouter extends React.Component {
    state = {
    }
    constructor(props, context) {
        super(props, context);
    }

    componentDidMount() {
    }

    render() {
        const loggedIn = window.sessionStorage.getItem('loggedIn')
        return(
            <Router>
                <Switch>
                    <Route exact path="/">
                        <Mainpage />
                    </Route>
                    <Route exact path="/signup" render={props => 
                        loggedIn ?(
                        <Redirect to="/home"/>
                        ) :
                        <SignUp />
                    }>
                    </Route>
                    <Route exact path="/login" render={props => 
                        loggedIn ?(
                        <Redirect to="/home"/>
                        ) :
                        <Login />
                    }>
                    </Route>
                    <Route exact path="/home" render={props => 
                        loggedIn ?(
                        <Home {...props} />    
                        ) :
                        <Redirect to="/login"/>
                    }>
                    </Route>
                    <Route path="/board/:id" render={props =>
                        loggedIn ?(
                        <Board {...props}/>
                        ) :
                        <Redirect to="/login"/>
                    }>
                    </Route>
                    <Route path="/tryboard">
                        <FreeBoard/>
                    </Route>
                </Switch>
            </Router>
        ) ;
        
    }
}

export default Mainrouter;