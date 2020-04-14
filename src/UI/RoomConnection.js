import React from 'react';
import './RoomConnection.css';
import roomConnection from '../BusinessLogic/RoomConnection';
import dataConnection from '../BusinessLogic/DataConnection';
import EventEmitter from 'events'
import io from 'socket.io-client';

class RoomConnection extends React.Component {
	constructor(props, context) {
		super(props, context);
		this.state = {
			room: props.room,
			dataConnections: []
		}
	}

	componentDidMount() {
		this.initializeConnection();
		this.connect(this.state.room);
	}

	initializeConnection() {
		var localVideo = document.querySelector("#localVideo");
		var remoteVideo = document.querySelector("#remoteVideo");
		console.log(remoteVideo, localVideo);
		this.socket = this.getRemoteSocket();
		this.socket.on('newconnection', (rol, connectionId) => {this.startConection(rol, connectionId)});
		//this.connection = new roomConnection(this.socket);
		
	}

	startConection = (rol, connectionId) => {
		console.log(rol, connectionId)
		let dataConn = new dataConnection(this.socket, rol, connectionId);
		dataConn.on('canvas', (canvas) => { this.props.onCanvasUpdate(canvas); });
		dataConn.connect(this.state.room);
		this.dataConnections.push(dataConn);
	}

	updateCanvas = (canvasImg) => {
		this.dataConnections.forEach(dataConn => {
			dataConn.updateCanvas(canvasImg);
			
		});
	}

	getLocalSocket = () => {
		var socket = io.connect('ws://localhost:8000',
			{
				reconnect: true,
				transports: ['websocket'],
				path: '/socket.io'
			}
		);
		return socket
	}

	getRemoteSocket = () => {
		var socket = io.connect('wss://pizarrabackend.herokuapp.com',
			{
				reconnect: true,
				transports: ['websocket'],
				path: '/socket.io',
				protocol: window.location.protocol === 'https:' ? 'wss' : 'ws',

			}
		);
		return socket
	}

	connect = (room) => {
		console.log(room)
		this.socket.emit('joinroom', room);
		//this.connection.connect(room);

	}
	render() {
		return (
			<div id='room'>
				<video id='localVideo' className='box' muted></video>
				<video id='remoteVideo' className='box'></video>
				<audio id='remoteAudio'></audio>
			</div>
		);
	}
}

export default RoomConnection;
