import React from 'react';
import './RoomConnection.css';
import roomConnection from '../BusinessLogic/RoomConnection';
import EventEmitter from 'events'

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
		this.connection = new roomConnection(localVideo, remoteVideo);
		
	}

	connect = (room) => {
		console.log(room)
		this.connection.connect(room);

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
