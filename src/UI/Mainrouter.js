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
import Board from './Board'


class Mainrouter extends React.Component {
    state = {
    }
    constructor(props, context) {
        super(props, context);
    }

    componentDidMount() {
    }

    render() {
        return(
            <Router>
                <Switch>
                    <Route exact path="/">
                        <Mainpage />
                    </Route>
                    <Route path="/login">
                        <Login />
                    </Route>
                    <Route path="/signup">
                        <SignUp />
                    </Route>
                    <Route path="/home" render={props => 
                        <Home {...props} />    
                    }>
                    </Route>
                    <Route path="/board/:id" render={props =>
                        <Board {...props}/>
                    }>
                    </Route>
                </Switch>
            </Router>
        ) ;
        
    }
}

export default Mainrouter;