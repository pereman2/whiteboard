
import React from 'react';
import './Toolbar.css';
import CircleWidth from './CircleWidth';
import ColorPicker from './ColorPicker';
import arrow from '../resources/background/Arrow.png';
import Eraser from '../BusinessLogic/Eraser';
import Brush from '../BusinessLogic/Brush';
import Rectangle from '../BusinessLogic/Rectangle';
import Circle from '../BusinessLogic/Circle';
import StraightLine from '../BusinessLogic/StraightLine';
import DropDown from './DropDown';

var TOOL_STROKE_COLOR ='#e3b04b';
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
        document.querySelector('#Brush').style.stroke = TOOL_STROKE_COLOR;
        this.hideConfig();
    }
    
    reset = event => {
        this.props.onResetCanvas();
    }

    setTool = (event, tool) => {
        this.changeLastToolColor();
        this.setState({
            tool: tool,
            lastTool: document.querySelector('#' + tool)

        });
        this.changeTool(tool);
        document.querySelector('#' + tool).style.stroke = TOOL_STROKE_COLOR;
    }
    changeLastToolColor = () => {
        var tool = this.state.lastTool;
        tool.style.stroke = TOOL_DEFAULT_STROKE_COLOR;
    }
    //Event es el objecto CircleWidth
    handleWidthChange = (event, tool) => {
        if(tool === 'Brush') {
            this.state.line.setWidth(event.state.width)
        } else if(tool === 'Form') {
            this.state.form.setWidth(event.state.width)
        } else if(tool ==='Eraser') {
            this.state.lineErase.setWidth(event.state.width)
        }
    }

    handleColorChange = (color, tool) => {
        if(tool === 'Brush') {
            this.state.line.setColor(color.hex);
        } else if(tool === 'Form') {
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
                var configEraser = document.querySelector('#eraser-config');
                configEraser.style.display = CONFIG_DISPLAY;
                break;
            case 'form-arrow':
                var configForm = document.querySelector('#form-config');
                configForm.style.display = CONFIG_DISPLAY;
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
                            <svg width="37" height="114" viewBox="0 0 37 114" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g filter="url(#filter0_d)">
                                    <path ref={this.toolBrush} id='Brush' className='tool' d="M6 27.0392V104H31V27.0392M6 27.0392L18.5 4L31 27.0392M6 27.0392H31" stroke="#E3B04B" stroke-width="3" />
                                </g>
                                <defs>
                                    <filter id="filter0_d" x="0.5" y="0.854591" width="36" height="112.645" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
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
                            <svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path ref={this.toolForm} id='Form' className='tool' d="M52 2H2V52H52V2Z" stroke="#E3B04B" stroke-width="3" />
                            </svg>
                        </button>
                        <img src={arrow} onClick={(e) => { this.handleArrowOpen(e); }} className='toolarrow' id='form-arrow'></img>
                    </div>

                    <div className='tool-container'>
                        <button onClick={(e) => { this.setTool(e, 'Eraser'); }}> 
                            <svg width="54" height="104" viewBox="0 0 54 104" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path ref={this.toolEraser} id='Eraser' className='tool' d="M2 68.2043V14.8625C27.8427 -14.0782 52 14.8625 52 14.8625V68.2043M2 68.2043V88.633C27 118.709 52 88.633 52 88.633V68.2043M2 68.2043H52" stroke="#E3B04B" stroke-width="3" />
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
