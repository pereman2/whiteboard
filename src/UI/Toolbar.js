
import React from 'react';
import './Toolbar.css';
import CircleWidth from './CircleWidth';
import ColorPicker from './ColorPicker';
import arrow from '../resources/background/Arrowwhite.png';
import Eraser from '../BusinessLogic/Eraser';
import Brush from '../BusinessLogic/Brush';
import Rectangle from '../BusinessLogic/Rectangle';
import Circle from '../BusinessLogic/Circle';
import StraightLine from '../BusinessLogic/StraightLine';
import DropDown from './DropDown';

var TOOL_STROKE_COLOR ='#94d3ac';
var TOOL_DEFAULT_STROKE_COLOR ='white';
var CONFIG_DISPLAY = 'flex';

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

var pos = {
    x: 0,
    y: 0
}

var posa = {
    x: 100,
    y: 100
}

class Toolbar extends React.Component {
    constructor(props, context) {
        super(props, context)
        var line = new Brush(BRUSH_DEFAULT_CONFIG.width, BRUSH_DEFAULT_CONFIG.width, pos, posa);
        var lineErase = new Eraser(ERASER_DEFAULT_CONFIG.width, ERASER_DEFAULT_CONFIG.width, pos, posa);
        var circle = new Circle(FORM_DEFAULT_CONFIG.width, FORM_DEFAULT_CONFIG.color, pos);
        var rectangle = new Rectangle(FORM_DEFAULT_CONFIG.width, FORM_DEFAULT_CONFIG.color, pos);
        var straightLine = new StraightLine(FORM_DEFAULT_CONFIG.width, FORM_DEFAULT_CONFIG.color, pos);
        var forms = {
            circle: circle,
            rectangle: rectangle,
            straightLine: straightLine,
        }
        var tools = [line, lineErase, rectangle];
        this.state = {
            isDown: false,
            tool: 'Brush',
            line: line,
            lineErase: lineErase,
            form: rectangle,
            forms: forms,
            tools: tools,
        }
    }

    componentDidMount() {
        this.setState({
            lastTool: document.querySelector('#Brush'),
        });
        var toolbar = document.querySelector('.toolbar');
        document.querySelector('#Brush').style.stroke = TOOL_STROKE_COLOR;
        this.hideConfig();
    }
    
    reset = event => {
        this.props.onResetCanvas();
    }

    setTool = (event, tool) => {
        this.state.lastTool.style.stroke = TOOL_DEFAULT_STROKE_COLOR;
        this.setState({
            tool: tool,
            lastTool: document.querySelector('#' + tool)

        });
        this.changeTool(tool);
        document.querySelector('#' + tool).style.stroke = TOOL_STROKE_COLOR;
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

    changeTool = (tool) => {
        this.props.onToolChange(tool);
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
                config.style.display = CONFIG_DISPLAY;
                break;
            case 'eraser-arrow':
                var config = document.querySelector('#eraser-config');
                config.style.display = CONFIG_DISPLAY;
                break;
            case 'form-arrow':
                var config = document.querySelector('#form-config');
                config.style.display = CONFIG_DISPLAY;
                break;
        }
    }
    getTools = () => {
        var tools = {
            line: this.state.line,
            lineErase: this.state.lineErase,
            form: this.state.form, 
        }
        return tools;
    }

    handleFormClicked = (form) => {
        var newForm = this.state.forms[form];
        console.log(form)
        console.log(newForm)
        this.setState({ form: newForm, });
        this.props.onFormChanged(newForm);
    }

    render() {
        return (
            <div className="Toolbar-wrapper">
                <div id='brush-config' className='config'>
                    <CircleWidth onValueChange={(e) => { this.handleWidthChange(e, 'Brush'); }}
                        width={this.state.line.getWidth()}
                    />
                    <ColorPicker onColorChange={(color) => {this.handleColorChange(color, 'Brush');}} />
                </div>
                <div id='form-config' className='config'>
                    <DropDown onFormClicked={(form) => { this.handleFormClicked(form); }} />
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

export default Toolbar;