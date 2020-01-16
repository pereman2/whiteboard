import React from 'react';
import './Board.css';
function getMousePos(canvas, evt) {
    return {
      x: evt.clientX,
      y: evt.clientY
    };
}

class Board extends React.Component{
    constructor(props, context) {
        super(props, context)
        this.state = {
          isDown: false,
          mode: 'brush',
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
    componentDidMount() {
        let canvas = document.querySelector('#Board');
        canvas.addEventListener('mousedown', (e) => this.mouseDown(e), false);
        canvas.addEventListener('mousemove', (e) => this.mouseMove(e), false);
        canvas.addEventListener('mouseup', (e) => this.mouseUp(e), false);
    }

    mouseDown = event => {
        this.setState({ isDown: true });
        let canvas = document.querySelector('#Board');
        this.setState({
            ctx: canvas.getContext('2d'),
            begin: true
        });
        this.state.ctx.beginPath();
        this.saveLast(event);
    }

    mouseUp = event => {
        let canvas = document.querySelector('#Board');
        var pos = getMousePos(canvas, event);
        this.setState({ isDown: false });
        //this.state.ctx.stroke();
        this.state.ctx.closePath();
    }

    mouseMove = event => {
        if(this.state.isDown) {
            let canvas = document.querySelector('#Board');
            var pos = getMousePos(canvas, event);
            var rect = canvas.getBoundingClientRect();
            var mouseX = pos.x - rect.left;
            var mouseY = pos.y - rect.top;
            var lastX = this.state.lastX;
            var lastY = this.state.lastY;
            if(this.state.begin) {
                this.state.ctx.moveTo(mouseX, mouseY);
                this.setState({ begin: false });
            }
            this.state.ctx.lineTo(lastX, lastY);
            this.state.ctx.lineJoin = 'round';
            this.state.ctx.lineCap = 'round';
            this.state.ctx.lineWidth = 15;
            this.state.ctx.stroke();
            this.saveLast(event, mouseX, mouseY);
        }
    }

    reset = event => {
        let canvas = document.querySelector('#Board');
        let ctx = canvas.getContext('2d');

        ctx.clearRect(0,0,1200,800);
    }
    render() {
        return (
            <div className="Board">
                <canvas id="Board" height='700px' width='700px'></canvas>
                <button onClick={(e) => this.reset(e)}>Reset</button>
            </div>
            
        );
    }
}

export default Board;
