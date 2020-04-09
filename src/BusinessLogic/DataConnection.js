import io from 'socket.io-client';
import adapter from 'webrtc-adapter';
import ws from 'ws';
import EventEmitter from 'events'
console.log(adapter.browserDetails.browser)
console.log(adapter.browserDetails.version)

var makingOffer = false;
var ignoreOffer = false;
var polite = false;

class DataConnection extends EventEmitter{
	constructor(socket) {
		super();
		this.localPeerConnection = new RTCPeerConnection({
			rtcpMuxPolicy: "require",
			iceServers: [
				{urls: 'stun:stun.l.google.com:19302'},
			],
		});
		this.socket = socket;
		this.clientsInRoom = 1;
		this.connected = false;
	}

	connect = async (room) => {
		this.setSocketEvents();
		this.socket.emit('status');
		this.localPeerConnection.addEventListener('connectionstatechange', event => {
			console.log(this.localPeerConnection.iceConnectionState);
		})
		this.localPeerConnection.addEventListener('datachannel', event => {
			console.log('xdd')
			this.dataChannel = event.channel;
			this.dataChannel.onopen = () => { console.log('data channel connected'); this.connected = true; }
			this.dataChannel.onmessage = (data) => { this.handleDataMessage(data); }
		});
	}

	handleNegotation = async () => {
		try {
			makingOffer = true;
			console.log('making offer')
			let offer = await this.localPeerConnection.createOffer();
			console.log(offer)
			await this.localPeerConnection.setLocalDescription(offer);
			this.socket.emit('dataoffer', this.localPeerConnection.localDescription);
		} catch(error) {
			console.error(error);
		} finally {
			makingOffer = false;
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
			console.log(data)
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
			try {
				if (description) {
					let offerCollision = description.type == 'offer' &&
						(makingOffer ||
							this.localPeerConnection.signalingState != 'stable');
					ignoreOffer = !polite && offerCollision;
					if (ignoreOffer) {
						console.log(polite, makingOffer, this.localPeerConnection.signalingState);
						console.log(offerCollision, description.type);
						console.log('ignored')
						return;
					}
					console.log(description)
					console.log('setting remote description ' + description.type)
					let rtcDescription = new RTCSessionDescription(description);
					console.log(rtcDescription)
					await this.localPeerConnection.setRemoteDescription(rtcDescription)
						.then(() => console.log('remotedescp ok'))
						.catch(error => {console.log(error)});
					console.log(description.type, this.connected)
					if(description.type == 'answer' && !this.connected) { 
						console.log('newwannaoffer')
						this.localPeerConnection.restartIce();
						this.socket.emit('wannaoffer', 'ask');
					}
					this.remote = true;
					if (description.type == 'offer') {
						let answer = await this.localPeerConnection.createAnswer();
						console.log(answer)
						await this.localPeerConnection.setLocalDescription(answer);
						console.log('emitting answer')
						this.socket.emit('dataanswer', this.localPeerConnection.localDescription);
					}
				} else if (candidate) {
					try {
						if(this.remote) {
							console.log(candidate)
							await this.localPeerConnection.addIceCandidate(candidate);
						}
					} catch (error) {
						if (!ignoreOffer) throw error;
					}
				}
			} catch (error) {
				console.log('xd')
				this.error = true;
				console.error(error);
			} finally {
				console.log(this.error)
				if(this.error) {
				}
			}
		});

		this.socket.on('status', (room, clientsInRoom) => {
			if(this.clientsInRoom != clientsInRoom) {
				this.clientsInRoom = clientsInRoom;
				this.socket.emit('wannaoffer', 'ask');
			}
		});

		this.socket.on('wannaoffer', msg => {
			console.log(msg)
			if(msg == 'ask') {
				polite = true;
				this.socket.emit('wannaoffer', 'ok')

			} else {
				this.dataChannel = this.localPeerConnection.createDataChannel("data", {});
				this.dataChannel.onopen = () => { console.log('data channel connected'); this.connected = true; }
				this.dataChannel.onmessage = (data) => { this.handleDataMessage(data); }
				this.localPeerConnection.onnegotiationneeded = this.handleNegotation;
				this.localPeerConnection.addEventListener('icecandidate', this.handleConnection);
			}
		});

		this.socket.on('connect', function(data) {
			console.log('socket connect');
		});
		this.socket.on('connect_error', function(data) {
			console.log('socket connect error');
		});
		this.socket.on('error', function(data) {
			console.log('socket error');
		});

		this.socket.on('created', async (room, socketId) => {
			console.log('created')
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
    this.socket.emit('listening');

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
