import React from 'react';
import './Board.css';
import Toolbar from './Toolbar';
import RoomConnection from './RoomConnection';



function getMousePos(canvas, evt) {
	return {
		x: evt.clientX,
		y: evt.clientY
	};
}

const constraints = window.constraints = {
	video: true,
	audio: true
}

class FreeBoard extends React.Component {

	constructor(props, context) {
		super(props, context)
		this.initializeRefs();		
		this.getRoom();	
		this.state = {
			isDown: false,
			tool: 'Brush',
			room: this.getRoom(),
			pushArray: new Array(15),
			pos: 0,
		}
	}

	getRoom = () => {
		let url = window.location.href;
		var id = url.substring(url.lastIndexOf('/') + 1);
		console.log(id)
		return id;
	}

	componentDidMount() {
		var tools = this.toolbar.current.getTools();
		var line = tools.line;
		var lineErase = tools.lineErase;
		var form = tools.form;
		this.setState({
			canvas: this.canvas.current,
			line: line,
			lineErase: lineErase,
			form: form,
			tools: tools,
		});
		this.setToolsCanvas(this.getCanvas());
		this.setListener();		
	}

	setListener = () => {				
		document.addEventListener('keydown', (e) => this.isKeysCombination(e));
	}

	isKeysCombination = (event) => {		
		if (event.ctrlKey && event.key === 'z') {
			this.canvasUndo();					
		}
		else if (event.ctrlKey && event.key === 'y') {
			this.canvasRedo();
		}	
	}

	canvasPush = () => {		
		var lastCanvasImg = document.getElementById('Board').toDataURL();		
		if(this.state.pos == 0) {					
			this.updatePushArray(lastCanvasImg);			
		}
		else {
			this.removeUnusedElements(lastCanvasImg);
			this.setState({ pos: 0, });
		}		
	}

	toStringCanvas = () => {
		var aux = this.state.pushArray;
		for(var i = 0; i < aux.length; i++) { 
			console.log(i);
			console.log(aux[i]); 
		}
	}

	updatePushArray = (lastCanvas) => {
		var aux = new Array(this.state.pushArray.length);
		aux[0] = lastCanvas;
		for (var i = 1; i < this.state.pushArray.length; i++) {
			aux[i] = this.state.pushArray[i-1];
		}
		this.setState({
			pushArray: aux,
		});
	}

	removeUnusedElements = (lastCanvasImg) => {
		var aux = this.state.pushArray;
		var pos = aux.length - (aux.length - this.state.pos);		
		aux[0] = lastCanvasImg;
		for (var i = 1; i < aux.length; i++) {
			if (aux.length > pos+i) {
				aux[i] = this.state.pushArray[pos+i-1]; 
			}
			else {
				aux[i] = undefined;
			}			
		}
		this.setState({
			pushArray: aux,
		})
	}	

	canvasUndo = () => {			
		var posAux = this.state.pos;
		var aux = this.state.pushArray;		
		if (posAux < aux.length) {
			let ctx = this.state.canvas.getContext("2d");									
			let canvasImg = new Image();
			posAux++;
			if (aux[posAux] != undefined) {							
        this.updateCanvas(aux[posAux]);
			}						
			this.setState({
				pos: posAux,				
			})
		}
		

	}

	canvasRedo = () => {		
		var posAux = this.state.pos;
		var aux = this.state.pushArray;		
		if (posAux > 0) {
			posAux--;
			if (aux[posAux] != undefined) {												
        this.updateCanvas(aux[posAux]);
			}
			this.setState({
				pos: posAux,			
			});		
		}		
	}

  updateCanvas = (canvasImgReceived) => {
		let ctx = this.state.canvas.getContext('2d');
    var canvasImg = new Image();				
    canvasImg.addEventListener('load', e => {
      this.reset();
      ctx.drawImage(canvasImg,0,0);					
    });					
    canvasImg.src = canvasImgReceived;												
  }

	

	initializeRefs = () => {
		this.canvas = React.createRef();
		this.toolBrush = React.createRef();
		this.toolEraser = React.createRef();
		this.toolForm = React.createRef();
		this.toolbar = React.createRef();
    this.roomConnection = React.createRef();

	}

	getCanvas = () => {
		return this.canvas;
	}

	getTools = () => {
		return this.state.tools;
	}

	setToolsCanvas = (canvas) => {
		var tools = this.toolbar.current.getTools();
		var canvas = this.getCanvas().current;
		for (var i in tools) {
			var tool = tools[i];
			tool.setCanvas(canvas)
		}
	}

	mouseDown = event => {
		this.toolbar.current.hideConfig();
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

	closePaths = () => {
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
			//this.canvasPush();
		}
	}

	reset = event => {
		let ctx = this.state.canvas.getContext('2d');
		ctx.clearRect(0, 0, this.state.canvas.width, this.state.canvas.height);			
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

	handleToolModified = (toolObj, tool) => {
		switch (tool) {
			case 'Brush':
				this.changeBrush(toolObj);
				break;
			case 'Eraser':
				this.changeEraser(toolObj);
				break;
			case 'Form':
				this.changeForm(toolObj);
				break;
		}
	}

	changeBrush = (newBrush) => {
		this.setState({ line: newBrush, });
	}

	changeEraser = (newEraser) => {
		this.setState({ lineErase: newEraser, });
	}

	changeForm = (newForm) => {
		this.setState({ form: newForm, });
		newForm.setCanvas(this.canvas.current)
	}

	handleToolChange = (tool) => {
		this.setState({ tool: tool, });
	}

	render() {
		return (
			<div className="Board">
				<canvas ref={this.canvas} id="Board" height='1080px' width='1920px'
					onMouseDown={(e) => this.mouseDown(e)}
					onMouseUp={(e) => this.mouseUp(e)}
					onMouseMove={(e) => this.mouseMove(e)}
					onClick = { () => this.canvasPush() }										
				></canvas>
				<Toolbar ref={this.toolbar}
					onToolModified={(toolObj, tool) => { this.handleToolModified(toolObj, tool); }}
					onToolChange={(tool) => { this.handleToolChange(tool); }}
					onResetCanvas={() => { this.reset(); }}
					onFormChanged={(form) => { this.changeForm(form); }}
				/>
      />				
      </div>

		);
	}
}

export default FreeBoard;
