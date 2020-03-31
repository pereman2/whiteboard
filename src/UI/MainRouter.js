import React from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom";
import MainPage from './MainPage';
import Board from './Board';

class MainRouter extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.idRoom = 3
    }

    componentDidMount() {
    }

    connect = () => {
        var idRoom = document.querySelector('#idroom').value
        this.idRoom = idRoom
    }
    render() {
        return (
            <Router>
                <div>
                    <Switch>
                        <Route path={`/`}>
                            <MainPage/>
                        </Route>
                        <Route path={`/room/${this.idRoom}`}>
                            <Board/>
                        </Route>
                    </Switch>
                </div>
            </Router>
        );
    }
}

export default MainRouter;