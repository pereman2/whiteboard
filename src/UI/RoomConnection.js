import React from 'react';
import './RoomConnection.css';
import roomConnection from '../BusinessLogic/RoomConnection';
import dataConnection from '../BusinessLogic/DataConnection';
import EventEmitter from 'events'
import io from 'socket.io-client';

const mediaConstraints = { 
	video: {width:200,height:200},
	audio: true 
}

class RoomConnection extends React.Component {
	constructor(props, context) {
		super(props, context);
		this.state = {
			room: props.room,
			dataConnections: [],
			mediaConnections: [],
		}
	}

	componentDidMount() {
		if(!this.state.localVideoOn) {
			this.startLocalVideo();
		}
		this.initializeConnection();
	}

	startLocalVideo = async() => {
		console.log('video')
		var localVideo = document.querySelector("#localVideo");
		if(!this.state.localVideoOn){
			try {
				const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
				this.setState({ stream: stream });
				localVideo.srcObject = stream;
				localVideo.play()
				localVideo.style.display = 'inherit'
				this.setState({ localVideoOn: true });
			} catch (error) {
				console.error(error);
			}
		}
		this.connect(this.state.room);
		console.log('xd')
	}
	initializeConnection() {
		var localVideo = document.querySelector("#localVideo");
		this.socket = this.getRemoteSocket();
		this.socket.on('newconnection', (rol, connectionId) => {
			this.startConection(rol, connectionId);
		});
		
	}

	startConection = async (rol, connectionId) => {
		console.log(rol, connectionId)
		console.log('start connection');
		let mediaConnection = new roomConnection(this.socket, rol, connectionId, this.state.stream);
		let dataConn = new dataConnection(this.socket, rol, connectionId);
		dataConn.on('canvas', (canvas) => { this.props.onCanvasUpdate(canvas); });
		dataConn.connect(this.state.room);
		mediaConnection.connect(this.state.room);
		this.state.dataConnections.push(dataConn);
		this.state.mediaConnections.push(mediaConnection);
	}

	updateCanvas = (canvasImg) => {
		this.state.dataConnections.forEach(dataConn => {
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

	}
	render() {
		return (
			<div id='room'>
				<video id='localVideo' className='box' muted></video>
				<audio id='remoteAudio'></audio>
			</div>
		);
	}
}

export default RoomConnection;
