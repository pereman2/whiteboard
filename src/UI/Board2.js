import React from 'react';
import './Board.css';
import brush from '../resources/svgs/Brush.svg';
import rubber from '../resources/svgs/Rubber.svg';
import form from '../resources/svgs/Form.svg';
import CircleWidth from './CircleWidth';
import ColorPicker from './ColorPicker';
import arrow from '../resources/background/Arrowwhite.png';
import Eraser from '../BusinessLogic/Eraser';
import Brush from '../BusinessLogic/Brush';
import Rectangle from '../BusinessLogic/Rectangle';
import Circle from '../BusinessLogic/Circle';
import StraightLine from '../BusinessLogic/StraightLine';

var TOOL_STROKE_COLOR ='#94d3ac';
var TOOL_DEFAULT_STROKE_COLOR ='white';

var BRUSH_DEFAULT_CONFIG= {
    width: 5,
    color: 'black',

}
var ERASER_DEFAULT_CONFIG = {
    width: 20,
    color: 'black',
}

var FORM_DEFAULT_CONFIG = {
    type: 'rectangle',
    width: 3,
    color: 'black',
}
function getMousePos(canvas, evt) {
    return {
        x: evt.clientX,
        y: evt.clientY
    };
}
var pos = {
    x: 0,
    y: 0
}
var posa = {
    x: 100,
    y: 100
}

class Board extends React.Component {
    constructor(props, context) {
        super(props, context)
        this.initializeRefs();
        var line = new Brush(BRUSH_DEFAULT_CONFIG.width, BRUSH_DEFAULT_CONFIG.width, pos, posa);
        var lineErase = new Eraser(ERASER_DEFAULT_CONFIG.width, ERASER_DEFAULT_CONFIG.width, pos, posa);
        var form = new StraightLine(FORM_DEFAULT_CONFIG.width, FORM_DEFAULT_CONFIG.color, pos);
        var tools = [line,lineErase, form];
        this.state = {
            isDown: false,
            tool: 'Brush',
            line: line,
            lineErase: lineErase,
            form: form,
            tools: tools,
        }
    }

    componentDidMount() {
        this.setState({
            canvas: this.canvas.current, 
            lastTool: document.querySelector('#Brush'),
        });
        this.setToolsCanvas(this.getCanvas());
        document.querySelector('#Brush').style.stroke = TOOL_STROKE_COLOR;
        var toolbar = document.querySelector('.toolbar');
        document.querySelector('.config').style.height = toolbar.offsetHeight + 'px';
        this.hideConfig();
    }
    initializeRefs = () => {
        this.canvas = React.createRef();
        this.toolBrush = React.createRef();
        this.toolEraser = React.createRef();
        this.toolForm = React.createRef();

    }
    getCanvas = () => {
        return this.canvas;
    }
    getTools = () => {
        return this.state.tools;
    }
    setToolsCanvas = (canvas) => {
        var tools = this.getTools();
        var canvas = this.getCanvas().current;
        for(var i = 0; i < tools.length; i++) {
            var tool = tools[i];
            tool.setCanvas(canvas)
        }
    }

    mouseDown = event => {
        this.hideConfig();
        this.setMouseIsDown(true);
        this.initializePaths(event);
    }
    
    setMouseIsDown = (value) => {
        this.setState({ isDown: value });
    }
    
    initializePaths = (event) => {
        this.initializePathBrush(event);
        this.initializePathForm(event);
        this.initializePathEraser(event);
    }
    
    initializePathEraser = (event) => {
        var pos = getMousePos(this.state.line.getCanvas(), event);
        this.state.lineErase.getContext().beginPath();
        this.state.lineErase.updateLine(pos)
    }
    
    initializePathBrush = (event) => {
        var pos = getMousePos(this.state.line.getCanvas(), event);
        this.state.line.getContext().beginPath();
        this.state.line.updateLine(pos)
    }
    
    initializePathForm = (event) => {
        var pos = getMousePos(this.state.line.getCanvas(), event);
        this.state.form.getContext().beginPath();
        this.state.form.setPosActual(pos);
    }

    mouseUp = event => {
        var pos = getMousePos(this.state.canvas, event);
        this.setMouseIsDown(false);
        if (this.state.tool == 'Form') {
            var pos = getMousePos(this.state.canvas, event);
            this.state.form.actualizarPos(pos);
            this.state.form.draw();
        }
        this.closePaths();
    }

    closePaths = () =>  {
        this.state.form.getContext().closePath();
        this.state.line.getContext().closePath();
        this.state.lineErase.getContext().closePath();
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
        this.state.lastTool.style.stroke = TOOL_DEFAULT_STROKE_COLOR;
        this.setState({
            tool: tool,
            lastTool: document.querySelector('#' + tool)

        });
        document.querySelector('#' + tool).style.stroke = TOOL_STROKE_COLOR;
    }

    erase = event => {
        var pos = getMousePos(this.state.canvas, event);
        this.state.lineErase.setMode('erase');
        this.state.lineErase.updateLine(pos); 
        this.state.lineErase.draw();
    }

    form = () => {

    }

    brush = event => {
        var pos = getMousePos(this.state.canvas, event);
        this.state.line.setMode('brush');
        this.state.line.updateLine(pos);
        this.state.line.draw();
    }
    //Event es el objecto CircleWidth
    handleWidthChange = (event, tool) => {
        if(tool == 'Brush') {
            this.state.line.setWidth(event.state.width)
        } else if(tool == 'Form') {
            this.state.form.setWidth(event.state.width)
        } else if(tool == 'Eraser') {
            this.state.lineErase.setWidth(event.state.width)
        }
    }

    handleColorChange = (color, tool) => {
        if(tool == 'Brush') {
            this.state.line.setColor(color.hex);
        } else if(tool == 'Form') {
            this.state.form.setColor(color.hex);
        }
    }

    hideConfig = () => {
        var configs = document.querySelectorAll('.config');
        configs.forEach(element => {
           element.style.display = 'none'; 
        });
    }
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
                <canvas ref={this.canvas} id="Board" height='800px' width='1500px'
                onMouseDown = {(e) => this.mouseDown(e)}
                onMouseUp = {(e) => this.mouseUp(e)}
                onMouseMove = {(e) => this.mouseMove(e)}
                ></canvas>
                <div id='brush-config' className='config'>
                    <CircleWidth onValueChange={(e) => { this.handleWidthChange(e, 'Brush'); }}
                        width={this.state.line.getWidth()}
                    />
                    <ColorPicker onColorChange={(color) => {this.handleColorChange(color, 'Brush');}} />
                </div>
                <div id='form-config' className='config'>
                    <CircleWidth onValueChange={(e) => { this.handleWidthChange(e, 'Form'); }}
                        width={this.state.form.width}
                    />
                    <ColorPicker onColorChange={(color) => {this.handleColorChange(color, 'Form');}} />
                </div>
                <div id='eraser-config' className='config'>
                    <CircleWidth onValueChange={(e) => { this.handleWidthChange(e, 'Eraser'); }}
                        width={this.state.line.getWidth()}
                    />
                </div>
                <div className='toolbar'>
                    <div className='tool-container'>
                        <button onClick={(e) => { this.setTool(e, 'Brush'); }}>
                            <svg width="42" height="215" viewBox="0 0 42 215" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g filter="url(#filter0_d)">
                                    <path ref={this.toolBrush} id='Brush' className='tool' d="M5 206V49L21 2L37 49V206H5Z" stroke="black" />
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
                                <path ref={this.toolForm} id='Form' className='tool' d="M101 1H1V101H101V1Z" stroke="black" />
                            </svg>
                        </button>
                        <img src={arrow} onClick={(e) => { this.handleArrowOpen(e); }} className='toolarrow' id='form-arrow'></img>
                    </div>

                    <div className='tool-container'>
                        <button onClick={(e) => { this.setTool(e, 'Eraser'); }}> <svg width="91" height="179" viewBox="0 0 91 179" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g filter="url(#filter0_i)">
                                <path ref={this.toolEraser} id='Eraser' className='tool' d="M1 118V24C47 -27 90 24 90 24V118M1 118V154C45.5 207 90 154 90 154V118M1 118H90" stroke="black" />
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
