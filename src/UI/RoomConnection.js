import React from 'react';
import './RoomConnection.css';
import io from 'socket.io-client';
import adapter from 'webrtc-adapter';
console.log(adapter.browserDetails.browser)
console.log(adapter.browserDetails.version)


const dataChannelOptions = {
	ordered: false, // do not guarantee order
	maxPacketLifeTime: 3000, // in milliseconds
};
const mediaConstraints = { 
	video: {width:200,height:200},
	audio: true 
}
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));


class RoomConnection extends React.Component {
	constructor(props, context) {
		super(props, context);
	//	this.socket = io.connect('https://backendboard-35dae.firebaseapp.com:8000');
	//	this.socket = io.connect('https://pizarrabackend.herokuapp.com:59379',
	//		{
	//		}
	//	);
		this.socket = io.connect('localhost:8000/custom_nsp');
		//this.socket = io.connect('localhost:8000');
		this.localPeerConnection = new RTCPeerConnection({
			iceServers: [
				{urls: 'stun:stun.l.google.com:19302'},
			//	{
			//		url: 'turn:192.158.29.39:3478?transport=udp',
			//		credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
			//		username: '28224511:1379330808'
			//	},
					
			],
			offerToReceiveAudio: true,
			offerToReceiveVideo: true,
		});
		this.setSocketEvents();
		this.localPeerConnection.ontrack = this.onTrackHandler;
		this.localPeerConnection.onnegotiationneeded = this.handleNegotation;
		this.iceCandidates = []
	}

	handleNegotation = () => {
		this.createOffer()
		console.log(this.localPeerConnection.signalingState);
	}
	onTrackHandler = (event) => {
		console.log('ontrack');
		console.log(event)
		var remoteVideo = document.querySelector("#remoteVideo");
		remoteVideo.srcObject = event.streams[0];
		this.localPeerConnection.addTrack(event.track, event.streams[0]);
		console.log('e\ne\ne\ne\ne\ne\n')
	}

	setSocketEvents = () => {
	//	this.socket.emit('pong');
	//	this.socket.on('ping', function onPingReceived(e) {
	//		console.log('Server emitted ping: ' + e.message);
	//		this.socket.emit('pong', 'hi server!');
	//	});
		this.socket.on('messages', function(data) {
			console.log(data);
		});
		this.socket.on('connect', function(data) {
			console.log(data);
		});
		this.socket.on('connect_error', function(data) {
			console.log(data);
		});
		this.socket.on('error', function(data) {
			console.log(data);
		});

		this.socket.on('created', async (room, socketId) => {
			this.initiator = true
			if (navigator.mediaDevices.getUserMedia) {
				await navigator.mediaDevices.getUserMedia(mediaConstraints)
					.then(this.gotLocalMediaStream)
					.catch(this.handleLocalMediaStreamError);
			}
		});

		this.socket.on('joined', (room, socketId, offer) => {
			console.log(offer)
			console.log(offer)
			var rtcDescription = new RTCSessionDescription(offer);
			this.createAnswer(rtcDescription)
		});

		this.socket.on('answer', (room, socketId, answer) => {
			var rtcDescription = new RTCSessionDescription(answer);
			this.gotAnswer(rtcDescription);
		});

		this.socket.on('newicecandidates', (room, socketId, iceCandidates) => {
			console.log('newicecandidates');
			console.log(iceCandidates);
			this.addIceCandidates(iceCandidates);
		});

	}

	connect = () => {
		var idPeer = document.querySelector('#idpeer').value
		var idRoom = document.querySelector('#idroom').value
		this.socket.emit('create or join', idRoom);
		this.setState({
			idPeer: idPeer,
			idRoom: idRoom
		})

	}

	createOffer = async () => {
		await this.localPeerConnection.createOffer({ 
			offerToReceiveAudio: true, 
			offerToReceiveVideo: true 
		})
			.then(this.createdOffer)
			.catch(this.setSessionDescriptionError);
		this.localPeerConnection.addEventListener('icecandidate', this.handleConnection);

	}
	candidates = ({sdp}) => {
		var candidates =sdp.split('\r\n')
			.filter(mline => mline.includes('a=candidate'));
		return candidates
	}
	createdOffer = async (description) => {
		console.log('setting local peer1');
		console.log(description)
		await this.localPeerConnection.setLocalDescription(description)
			.then(() => {
				this.setLocalDescriptionSuccess(this.localPeerConnection);
			}).catch(this.setSessionDescriptionError);
		await this.waitGathering()
		this.socket.emit('offer',this.localPeerConnection.localDescription);
	}
	waitGathering = async () => {
		while(this.localPeerConnection.iceGatheringState != 'complete') {
			console.log(this.localPeerConnection.iceGatheringState)
			await wait(1000);
		}
	}

	createAnswer = async (description) => {
		console.log('setting remote peer2');
		console.log(description)
		await this.localPeerConnection.setRemoteDescription(description)
			.then(() => {
				this.setRemoteDescriptionSuccess(this.remotePeerConnection)
			}).catch(this.setSessionDescriptionError);
		if (navigator.mediaDevices.getUserMedia) {
			navigator.mediaDevices.getUserMedia(mediaConstraints)
				.then(this.gotLocalMediaStream)
				.catch(this.handleLocalMediaStreamError);
		}
		await this.localPeerConnection.createAnswer()
			.then(this.createdAnswer)
			.catch(this.setSessionDescriptionError);

	}

	createdAnswer = async (description) => {
		console.log('setting local peer2');
		console.log(description)
		console.log(this.localPeerConnection.connectionState);
		await this.localPeerConnection.setLocalDescription(description)
			.then(() => {
				this.setLocalDescriptionSuccess(this.remotePeerConnection);
			}).catch(this.setSessionDescriptionError);
		await this.waitGathering();	
		this.socket.emit('answer', this.localPeerConnection.localDescription);
	}

	gotAnswer = async (description) => {
		console.log('setting remote peer1');
		console.log(description)
		await this.localPeerConnection.setRemoteDescription(description)
			.then(() => {
				this.setRemoteDescriptionSuccess(this.localPeerConnection);
			}).catch(this.setSessionDescriptionError);
	}

	iceCandidateFinder = (room, socketId) => {
		console.log('finding candidates');
		this.socket.emit('geticecandidates', room, socketId);
	}

	setLocalDescriptionSuccess = param => {
		console.log('local description success');
	}

	setRemoteDescriptionSuccess = param => {
		console.log('remote description success');
	}

	setSessionDescriptionError = (error) => {
		console.log('sesion error')
		console.log(error)
	}

	gotLocalMediaStream = stream => {
		var localVideo = document.querySelector("#localVideo");
		for (const track of stream.getTracks()) {
			this.localPeerConnection.addTrack(track, stream);
		}
		localVideo.srcObject = stream;
		localVideo.play();
		this.localPeerConnection.addStream(stream);
	}

	handleLocalMediaStreamError = error => {
		console.log(error);
	}

	handleConnection = event => {
		const peerConnection = event.target;
		const iceCandidate = event.candidate;
		console.log('new candidate')
		console.log(iceCandidate)
		//this.socket.emit('icecandidate', [iceCandidate]);
	}

	addIceCandidates = (iceCandidates) => {
		for(let i = 0; i < iceCandidates.length; i++) {
			var candidate = iceCandidates[i];
			this.addIceCandidate(candidate);
		}
	}

	addIceCandidate = (candidate) => {
		this.localPeerConnection.addIceCandidate(candidate)
			.then(() => {
				this.handleConnectionSuccess(this.localPeerConnection);
			}).catch((error) => {
				this.handleConnectionFailure(this.localPeerConnection, error);
			});
		console.log('added candidate');
	}

	handleConnectionSuccess = (peer) =>{
		console.log('handle connection success')
	}

	handleConnectionFailure = () =>{
		console.log('handle connection failure')
	}

	render() {
		return (
			<div id='room'>
			<textarea id='idpeer'></textarea>
			<textarea id='idroom'></textarea>
			<button onClick={this.connect}>Connect</button>
			<video id='localVideo'></video>
			<video id='remoteVideo' controls autoplay></video>
			</div>
		);
	}
}

export default RoomConnection;
