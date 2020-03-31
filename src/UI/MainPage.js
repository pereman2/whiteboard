
import React from 'react';
import './MainPage.css';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    Redirect
} from "react-router-dom";
import Board from './Board';

class MainPage extends React.Component {
    state = {
        redirect: false,
        idRoom: undefined
    }
    constructor(props, context) {
        super(props, context);
    }

    componentDidMount() {
    }

    connect = () => {
        var idRoom = document.querySelector('#idroom').value
        this.setState({ redirect: true, idRoom: idRoom });
    }
    render() {
        const { redirect, idRoom } = this.state
        if(redirect) {
            return (
                <Route 
                    component={() => <Board room={idRoom}/>}
                />
            );
        }
        return(
            <div id='mainpage'>
                <textarea id='idroom' className='box' placeholder='Number of room'></textarea>
                <button onClick={this.connect}>Connect</button>
            </div>
        ) ;
        
    }
}

export default MainPage;