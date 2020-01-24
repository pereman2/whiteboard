import React from 'react';
import './Board.css';
import brush from '../resources/svgs/Brush.svg';
import rubber from '../resources/svgs/Rubber.svg';
import form from '../resources/svgs/Form.svg';
import CircleWidth from './CircleWidth';
import ColorPicker from './ColorPicker';
import arrow from '../resources/background/Arrowwhite.png';

var brushConfig = {
    width: 12,
    color: 'black',

}
var eraserConfig = {
    width: 12,
    color: 'black',
}

var formConfig = {
    type: 'rectangle',
    width: 12,
    color: 'black',
}
function getMousePos(canvas, evt) {
    return {
        x: evt.clientX,
        y: evt.clientY
    };
}
function moveLinearGradient(to) {
    var linear = 'background: linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(0,0,0,1) ' 
                + to + '%)'; 
    return linear;
}

class Board extends React.Component {
    constructor(props, context) {
        super(props, context)
        this.state = {
            isDown: false,
            tool: 'Brush',
            brush: brushConfig
        }
    }
    setConfig = () => {
        switch (this.state.tool) {
            case 'Brush':
                break;
            case 'Eraser':
                break;
            case 'Form':
                break;
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
        this.setState({
            canvas: document.querySelector('#Board'),
            lastTool: document.querySelector('#Brush'),
        });
        document.querySelector('#Brush').style.stroke = '#94d3ac';
        var toolbar = document.querySelector('.toolbar');
        document.querySelector('.config').style.height = toolbar.offsetHeight + 'px';
        this.hideConfig();
        this.setListeners();
    }
    setListeners = () => {
        //No uso this.state.canvas porque en didmount el setstate no va
        //hasta salir de la función.
        var canvas = document.querySelector('#Board');
        canvas.addEventListener('mousedown', (e) => this.mouseDown(e), false);
        canvas.addEventListener('mousemove', (e) => this.mouseMove(e), false);
        canvas.addEventListener('mouseup', (e) => this.mouseUp(e), false);
    }

    mouseDown = event => {
        this.hideConfig();
        this.setState({ isDown: true });
        this.setState({
            ctx: this.state.canvas.getContext('2d'),
            begin: true
        });
        this.state.ctx.beginPath();
        this.saveLast(event);
    }

    mouseUp = event => {
        var pos = getMousePos(this.state.canvas, event);
        this.setState({
            isDown: false,
            begin: true,
        });
        if (this.state.tool == 'Form') {
            var pos = getMousePos(this.state.canvas, event);
            var height = pos.y - this.state.lastY;
            var width = pos.x - this.state.lastX;
            this.state.ctx.rect(this.state.lastX, this.state.lastY, width, height);
            this.state.ctx.stroke();
        }
        this.state.ctx.globalCompositeOperation = 'source-over';
        this.state.ctx.restore();
        //Cierra el trazo
        this.state.ctx.closePath();
    }

    mouseMove = event => {
        if (this.state.isDown) {
            switch (this.state.tool) {
                case 'Brush':
                    this.brush(event);
                    break;
                case 'Eraser':
                    this.erase(event);
                    break;
                case 'Form':
                    this.form(event);
                    break;
            }

        }
    }

    reset = event => {
        let ctx = this.state.canvas.getContext('2d');

        ctx.clearRect(0, 0, this.state.canvas.width, this.state.canvas.height);
    }
    setTool = (event, tool) => {
        this.state.lastTool.style.stroke = 'white';
        this.setState({
            tool: tool,
            lastTool: document.querySelector('#' + tool)

        });
        document.querySelector('#' + tool).style.stroke = '#94d3ac';
    }
    form = event => {

    }
    erase = event => {
        var pos = getMousePos(this.state.canvas, event);
        var rect = this.state.canvas.getBoundingClientRect();
        var mouseX = pos.x - rect.left;
        var mouseY = pos.y - rect.top;
        var lastX = this.state.lastX;
        var lastY = this.state.lastY;

        if (this.state.begin) {
            this.state.ctx.moveTo(mouseX, mouseY);
            this.setState({ begin: false });
        }
        this.state.ctx.lineTo(lastX, lastY);
        this.state.ctx.globalCompositeOperation = 'destination-out';
        //union de lineas round (mas natural)
        this.state.ctx.lineJoin = 'round';
        //forma de la linea
        this.state.ctx.lineCap = 'round';
        this.state.ctx.lineWidth = 15;
        //dibuja lo que se ha hecho en el path
        this.state.ctx.stroke();
        this.saveLast(event, mouseX, mouseY);
    }
    //Dibuja conjunto de lineas mientras se mueva
    brush = event => {
        var pos = getMousePos(this.state.canvas, event);
        var rect = this.state.canvas.getBoundingClientRect();
        var mouseX = pos.x - rect.left;
        var mouseY = pos.y - rect.top;
        var lastX = this.state.lastX;
        var lastY = this.state.lastY;

        if (this.state.begin) {
            this.state.ctx.moveTo(mouseX, mouseY);
            this.setState({ begin: false });
        }
        this.state.ctx.lineTo(lastX, lastY);
        //union de lineas round (mas natural)
        this.state.ctx.lineJoin = 'round';
        //forma de la linea
        this.state.ctx.lineCap = 'round';
        this.state.ctx.lineWidth = this.state.brush.width;
        //dibuja lo que se ha hecho en el path
        this.state.ctx.strokeStyle = this.state.brush.color;
        this.state.ctx.stroke();
        this.saveLast(event, mouseX, mouseY);
    }
    //Event es el objecto CircleWidth
    handleWidthChange = event => {
        let brush = JSON.parse(JSON.stringify(this.state.brush))
        brush.width = event.state.width;
        this.setState({ brush: brush });
    }
    handleColorChange = color => {
        let brush = JSON.parse(JSON.stringify(this.state.brush))
        brush.color = color.hex;
        this.setState({ brush: brush });
        switch (this.state.tool) {
            case 'Brush':
                break;
            case 'Eraser':
                break;
            case 'Form':
                break;
        }

    }
    hideConfig = () => {
        var configs = document.querySelectorAll('.config');
        configs.forEach(element => {
           element.style.display = 'none'; 
        });
    }
    /**
     * Handler evento cuando se hace click a la flecha para abrir opciones de una
     * herramienta
     * @param {event} event
     */
    handleArrowOpen = event => {
        this.hideConfig();
        switch (event.target.id) {
            case 'brush-arrow':
                var config = document.querySelector('#brush-config');
                config.style.display = 'inherit';
                break;
            case 'eraser-arrow':
                var config = document.querySelector('#eraser-config');
                config.style.display = 'inherit';
                break;
            case 'form-arrow':
                var config = document.querySelector('#form-config');
                config.style.display = 'inherit';
                break;
        }

    }
    render() {
        return (
            <div className="Board">
                <canvas id="Board" height='800px' width='1500px'></canvas>
                <div id='brush-config' className='config'>
                    <CircleWidth onValueChange={(e) => { this.handleWidthChange(e); }}
                        width={this.state.brush.width}
                    />
                    <ColorPicker onColorChange={(color) => {this.handleColorChange(color);}} />
                </div>
                <div id='form-config' className='config'>
                    <CircleWidth onValueChange={(e) => { this.handleWidthChange(e); }}
                        width={this.state.brush.width}
                    />
                    <ColorPicker onColorChange={(color) => {this.handleColorChange(color);}} />
                </div>
                <div id='eraser-config' className='config'>
                    <CircleWidth onValueChange={(e) => { this.handleWidthChange(e); }}
                        width={this.state.brush.width}
                    />
                    <ColorPicker onColorChange={(color) => {this.handleColorChange(color);}} />
                </div>
                <div className='toolbar'>
                    <div className='tool-container'>
                        <button onClick={(e) => { this.setTool(e, 'Brush'); }}>
                            <svg width="42" height="215" viewBox="0 0 42 215" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g filter="url(#filter0_d)">
                                    <path id='Brush' className='tool' d="M5 206V49L21 2L37 49V206H5Z" stroke="black" />
                                </g>
                                <defs>
                                    <filter id="filter0_d" x="0.5" y="0.448471" width="41" height="214.052" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                                        <feFlood flood-opacity="0" result="BackgroundImageFix" />
                                        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                                        <feOffset dy="4" />
                                        <feGaussianBlur stdDeviation="2" />
                                        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                                        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
                                        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
                                    </filter>
                                </defs>
                            </svg>
                        </button>
                        <img src={arrow} onClick={(e) => { this.handleArrowOpen(e); }} className='toolarrow' id='brush-arrow'></img>
                    </div>
                    <div className='tool-container'>
                        <button onClick={(e) => { this.setTool(e, 'Form'); }}>
                            <svg width="102" height="102" viewBox="0 0 102 102" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path id='Form' className='tool' d="M101 1H1V101H101V1Z" stroke="black" />
                            </svg>
                        </button>
                        <img src={arrow} onClick={(e) => { this.handleArrowOpen(e); }} className='toolarrow' id='form-arrow'></img>
                    </div>

                    <div className='tool-container'>
                        <button onClick={(e) => { this.setTool(e, 'Eraser'); }}> <svg width="91" height="179" viewBox="0 0 91 179" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g filter="url(#filter0_i)">
                                <path id='Eraser' className='tool' d="M1 118V24C47 -27 90 24 90 24V118M1 118V154C45.5 207 90 154 90 154V118M1 118H90" stroke="black" />
                            </g>
                            <defs>
                                <filter id="filter0_i" x="0.5" y="0.833313" width="90" height="181.222" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                                    <feFlood flood-opacity="0" result="BackgroundImageFix" />
                                    <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                                    <feOffset dy="4" />
                                    <feGaussianBlur stdDeviation="2" />
                                    <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                                    <feBlend mode="normal" in2="shape" result="effect1_innerShadow" />
                                </filter>
                            </defs>
                        </svg>
                        </button>
                        <img src={arrow} onClick={(e) => { this.handleArrowOpen(e); }} className='toolarrow' id='eraser-arrow'></img>
                    </div>
                    <div className='tool-container'>
                        <button onClick={(e) => { this.reset(e) }}>
                            <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path id='removeall' className='tool' d="M1 1L51 51M1 51L51 1" stroke="black" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

        );
    }
}

export default Board;
