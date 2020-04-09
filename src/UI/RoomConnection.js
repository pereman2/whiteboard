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
			room: props.room
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
		this.socket = this.getLocalSocket();
		//this.connection = new roomConnection(this.socket);
		this.dataConnection = new dataConnection(this.socket);
		this.dataConnection.on('canvas', (canvas) => { this.props.onCanvasUpdate(canvas); });
		
	}

  updateCanvas = (canvasImg) => {
    this.dataConnection.updateCanvas(canvasImg);
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
		this.dataConnection.connect(room);

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
