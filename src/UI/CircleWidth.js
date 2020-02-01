import React from 'react';
import ReactDOM from 'react-dom'
import './CircleWidth.css';
import ColorPickerWrapper from './ColorPickerWrapper';
import { CirclePicker } from 'react-color';

function getMousePos(circle, evt) {
    return {
        x: evt.clientX,
        y: evt.clientY
    };
}
function moveLinearGradient(to) {
    var linear = 'linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(0,0,0,1) ' 
                + to + '%)'; 
    return linear;
}

class CircleWidth extends React.Component {
    constructor(props, context) { 
        super(props, context);
        this.state = {
            width: this.props.width,
        }
        console.log(this.props)
    }
    saveWidth = event => {
        console.log('yee')
        if(event.key === 'Enter') {
            try {
                var pixels = this.refs.circle; 
                pixels.contentEditable = 'false';
                var newWidth = parseInt(pixels.innerHTML, 10);
                if(!isNaN(newWidth) &&  newWidth < 100) {
                    this.setState({ width: newWidth });
                    //Cambia el background del circulo
                    var background = moveLinearGradient(100 - this.state.width);
                    this.state.circle.style.background = background; 
                }
                pixels.innerHTML = this.state.width;
                pixels.blur();

                //Acciona el evento para el padre cuando cambia el valor
                this.props.onValueChange(event);
            } catch (error) {}


        }
    }

    editWidth = event => {
        var pixels = this.refs.circle; 
        if(pixels != null) {
            pixels.contentEditable = true;
            pixels.focus();
        }
    }

    saveLast = (event, x, y) => {
        let canvas = document.querySelector('#Board');
        var pos = getMousePos(canvas, event);
        var rect = canvas.getBoundingClientRect();
        var mouseX = x || (pos.x - rect.left);
        var mouseY = y || (pos.y - rect.top);
        this.setState({
            lastX: mouseX,
            lastY: mouseY,
        });
    }
    
    mouseDown = event => {
        this.setState({ isDown: true });
        this.state.circle.focus();
        this.saveLast(event);
    }

    mouseUp = event => {
        var pos = getMousePos(this.state.circle, event);
        this.setState({
            isDown: false,
        });
    }

    mouseMove = event => {
        if (this.state.isDown) {
            var pos = getMousePos(this.state.circle, event);
            var difference = this.state.lastY - pos.y;
            //Width change speed
            var difference = parseInt(difference * 0.1, 10);
            var sum = this.state.width + difference;
            if(sum < 100 && sum > 0) {
                this.setState({ width: sum });
                var background = moveLinearGradient(100 - this.state.width);
                this.state.circle.style.background = background; 
                var background = moveLinearGradient(100 - sum);
                this.state.circle.style.background = background; 
                //Evento para el padre cuando cambia el valor
                this.onValueChange(this);
            }
        }
    }
    onValueChange = event => {
        this.props.onValueChange(event);
    }
    componentDidMount() {
        var circle = this.refs.circle; 
        var pixels = this.refs.pixels; 
        this.setState({ circle: circle });
        pixels.contentEditable = 'false';
    }
    render() {
        return (
            <div className="CircleWidth">
                <div ref='circle' onMouseUp={(e) => this.mouseUp(e)} onMouseMove={(e) => this.mouseMove(e)} onMouseDown={(e) => this.mouseDown(e)} className='brush-circle'>
                    <div ref='pixels' className='width-circle'
                    >{this.state.width}</div>
                </div>
            </div>

        );
    }
}

export default CircleWidth; 
