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
        }
    }

    componentDidMount() {
        let canvas = document.querySelector('#Board');
        canvas.addEventListener('mousedown', (e) => this.mouseDown(e), false);
        canvas.addEventListener('mousemove', (e) => this.mouseMove(e), false);
        canvas.addEventListener('mouseup', (e) => this.mouseUp(e), false);
    }

    mouseDown = event => {
        let canvas = document.querySelector('#Board');
        var pos = getMousePos(canvas, event);
        this.setState({ isDown: true });
        console.log(this.state.isDown);
    }

    mouseUp = event => {
        let canvas = document.querySelector('#Board');
        var pos = getMousePos(canvas, event);
        this.setState({ isDown: false });
    }

    mouseMove = event => {
        if(this.state.isDown) {
            let canvas = document.querySelector('#Board');
            var pos = getMousePos(canvas, event);
            var rect = canvas.getBoundingClientRect();

            let ctx = canvas.getContext('2d');
            ctx.beginPath();
            ctx.arc(pos.x - rect.left, pos.y - rect.top, 9, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
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
                <canvas id="Board" onMouseMove={(e) => this.draw(e)} height='700px' width='700px'></canvas>
                <button onClick={(e) => this.reset(e)}>Reset</button>
            </div>
            
        );
    }
}

export default Board;
