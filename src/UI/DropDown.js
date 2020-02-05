import React from 'react';
import './DropDown.css';
import Rectangle from '../resources/background/Square.png';
import Circle from '../resources/background/Circle.png';
import StraightLine from '../resources/background/Line.png';


class DropDown extends React.Component {
    constructor(props, context) { super(props, context)
        this.state = {
            popupOn: false,
        }
        this.popup = React.createRef();
    }
    handleClick = (event) => {
        if(this.state.popupOn) {
            this.popup.current.style.display = 'none';
        } else {
            this.popup.current.style.display = 'flex';
        }
        this.setState({ popupOn: !this.state.popupOn });
    }
    
    handleFormClicked = (event) => {
        var clickedId = event.target.id;
        this.props.onFormClicked(clickedId);
    }
    render() {
        return (
            <div className='DropDown box' onClick={(e) => {this.handleClick(e); }}>
                <div ref={this.popup} className='popup box'>
                    <img id='rectangle' src={Rectangle} onClick={(e) => {this.handleFormClicked(e)}}></img>
                    <img id='circle' src={Circle} onClick={(e) => {this.handleFormClicked(e)}}></img>
                    <img id='straightLine' src={StraightLine} onClick={(e) => {this.handleFormClicked(e)}}></img>
                </div>
            </div>

        );
    }
}

export default DropDown;
