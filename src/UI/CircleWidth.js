import React from 'react';
import './CircleWidth.css';

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
    constructor(props, context) { super(props, context)
        this.state = {
            width: this.props.width,
        }
    }
    saveWidth = event => {
        if(event.key === 'Enter') {
            try {
                var pixels = document.querySelector('.width-circle');
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
        var pixels = document.querySelector('.width-circle');
        if(pixels != null) {
            pixels.contentEditable = 'true';
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
        var circle = document.querySelector('.brush-circle');
        var pixels = document.querySelector('.width-circle');

        this.setState({ circle: circle });
        circle.addEventListener('mousedown', (e) => this.mouseDown(e), false);
        circle.addEventListener('mousemove', (e) => this.mouseMove(e), false);
        circle.addEventListener('mouseup', (e) => this.mouseUp(e), false);

    }
    render() {
        return (
            <div className="CircleWidth">
                <div className='brush-circle'>
                    <div className='width-circle'
                        onKeyPress={(e) => { this.saveWidth(e); }}
                        onDoubleClick={(e) => { this.editWidth(e) }}
                    >{this.state.width}</div>
                </div>
            </div>

        );
    }
}

export default CircleWidth;
