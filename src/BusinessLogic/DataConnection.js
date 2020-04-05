import io from 'socket.io-client';
import adapter from 'webrtc-adapter';
import ws from 'ws';
import EventEmitter from 'events'
console.log(adapter.browserDetails.browser)
console.log(adapter.browserDetails.version)

const mediaConstraints = { 
	video: {width:200,height:200},
	audio: true 
}
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

var makingOffer = false;
var ignoreOffer = false;
var polite = false;

class DataConnection extends EventEmitter{
	constructor(socket) {
		super();
		this.localPeerConnection = new RTCPeerConnection({
			iceServers: [
				{urls: 'stun:stun.l.google.com:19302'},
			],
		});
		this.socket = socket;
	}

	connect = async (room) => {
		this.setSocketEvents();
		this.dataChannel = this.localPeerConnection.createDataChannel("data", {"negotiated":true, "id":0});
		this.dataChannel.onopen = () => {console.log('data channel connected');this.connected = true;}
		this.dataChannel.onmessage = (data) => {this.handleDataMessage(data);}
		this.localPeerConnection.onnegotiationneeded = this.handleNegotation;
		this.localPeerConnection.addEventListener('icecandidate', this.handleConnection);
	}

	handleNegotation = async () => {
		try {
			let offer = await this.localPeerConnection.createOffer();
			await this.localPeerConnection.setLocalDescription(offer);
			this.socket.emit('dataoffer', this.localPeerConnection.localDescription);
		} catch(error) {
			console.error(error);
		}
	}
	updateCanvas = (canvas) => {
		this.sendData('canvas', canvas);
	}
	sendData = (type, data) => {
		if(this.connected) {
			this.dataChannel.send(JSON.stringify({"type": type, "data": data}));
		}
	}
	handleDataMessage = (message) => {
		var data = JSON.parse(message.data);
		if(data.type == "canvas") {
			this.emit('canvas', data.data);
		}
	}

	handleConnection = event => {
		const peerConnection = event.target;
		const iceCandidate = event.candidate;
		this.socket.emit('dataicecandidate', iceCandidate);
	}
	setSocketEvents = () => {
		this.socket.on('datamessages', async (description, candidate) => {
			try{
				if(description) {
					await this.localPeerConnection.setRemoteDescription(description)
					if(description.type == 'offer') {
						let answer = await this.localPeerConnection.createAnswer();
						await this.localPeerConnection.setLocalDescription(answer);
						this.socket.emit('dataanswer', this.localPeerConnection.localDescription);
					}
				} else if(candidate) {
					try{
						await this.localPeerConnection.addIceCandidate(candidate);
					} catch (error) {
						if(!ignoreOffer) throw error;
					}
				}
			} catch(error) {
				console.error(error);
			}
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
			polite = true;
		});

		this.socket.on('joined', (room, socketId, offer) => {
		});

		this.socket.on('dataanswer', (room, socketId, answer) => {
			var rtcDescription = new RTCSessionDescription(answer);
			this.gotAnswer(rtcDescription);
		});

		this.socket.on('datanewicecandidates', (room, socketId, iceCandidates) => {
			this.addIceCandidates(iceCandidates);
		});

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
	}

	handleConnectionSuccess = (peer) =>{
		console.log('handle connection success')
	}

	handleConnectionFailure = () =>{
		console.log('handle connection failure')
	}

	setDataChannelEvents = () => {
		this.dataChannel.onmessage = (message) => { console.log(message) };
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

	getLocalConnection = () => {
		var socket = io.connect('ws://localhost:8000',
			{
				reconnect: true,
				transports: ['websocket'],
				path: '/socket.io',
				protocol: window.location.protocol === 'https:' ? 'wss' : 'ws',

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
	getMediaConstraints = async () => {
		let permissions = await this.getMediaPermissions();	
		if(permissions.video) {
			permissions.video = {width:200,height:200}
		} 
		return permissions
	}
	getMediaPermissions = async () => {
		let permissions = {}
		let video;
		let audio; 
		await navigator.permissions.query({name: "camera"})
			.then((result) => {video = result.state});
		await navigator.permissions.query({name: "microphone"})
			.then((result) => {audio = result.state});
		audio = this.getDevicePermissions(audio);
		video = this.getDevicePermissions(video);
		permissions['video'] = video
		permissions['audio'] = audio
		return permissions
	}
	getDevicePermissions = (media) => {
		return media == 'granted' ? true : false;	
	}
}

export default DataConnection;
