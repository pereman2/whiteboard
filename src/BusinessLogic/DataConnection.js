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
	constructor(socket, rol, connectionId) {
		super();
		this.localPeerConnection = new RTCPeerConnection({
			iceServers: [
				{urls: 'stun:stun.l.google.com:19302'},
			],
		});
		this.rol = rol;
		this.connectionId = connectionId;
		this.socket = socket;
		this.connected = false;
		this.connectionType = 'data';
		this.initializeRol();
	}
	initializeRol = () => {
		if(this.rol == 'answerer') {
			polite = true;
		} else {
			this.socket.emit('wannaoffer', 'ask', this.rol, this.connectionId, 'data');
		}
	}
	connect = async (room) => {
		this.setSocketEvents();
		this.localPeerConnection.addEventListener('connectionstatechange', event => {
			console.log(this.localPeerConnection.iceConnectionState)
			if(this.localPeerConnection.iceConnectionState == 'failed') {
				this.localPeerConnection.restartIce();
			}
		})
		this.localPeerConnection.addEventListener('signalingstatechange', event => {
			console.log(this.localPeerConnection.signalingState)
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
			await this.localPeerConnection.setLocalDescription(offer);
			this.socket.emit('dataoffer', 
				this.localPeerConnection.localDescription,
				this.connectionId,
				'data'
			);
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
		this.socket.emit('dataicecandidate', iceCandidate, this.connectionId, this.rol, 'data');
	}

	start = () => {
		console.log('start')
		this.dataChannel = this.localPeerConnection.createDataChannel("data", {});
		this.dataChannel.onopen = () => { console.log('data channel connected'); this.connected = true; }
		this.dataChannel.onmessage = (data) => { this.handleDataMessage(data); }
		this.localPeerConnection.onnegotiationneeded = this.handleNegotation;
		this.localPeerConnection.addEventListener('icecandidate', this.handleConnection);

	}
	setSocketEvents = () => {
		this.socket.on('datamessages', async (description, candidate, connectionId, connectionType) => {
			console.log(connectionId, this.connectionId)
			if(connectionId == this.connectionId && connectionType == this.connectionType) {
				this.handleSocketMessage(description, candidate);
			}
		});
		this.socket.on('wannaoffer', (msg, connectionId, connectionType) => {
			if (connectionId == this.connectionId && connectionType == this.connectionType) {
				console.log(msg)
				if (msg == 'ask') {
					console.log('emitting ok')
					this.socket.emit('wannaoffer', 'ok', this.rol, this.connectionId, 'data');
					polite = true;
				} else {
					console.log('received ok')
					this.start();
				}
			}
		} );


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

	}

	handleSocketMessage = async (description, candidate) => {
		try {
			if (description) {
				let offerCollision = description.type == 'offer' &&
					(makingOffer ||
						this.localPeerConnection.signalingState != 'stable');
				ignoreOffer = !polite && offerCollision;
				if (ignoreOffer) {
					console.log('ignored')
					return;
				}
				console.log('setting remote description ' + description.type)
				let rtcDescription = new RTCSessionDescription(description);
				console.log(rtcDescription)
				await this.localPeerConnection.setRemoteDescription(rtcDescription)
					.then(() => console.log('remotedescp ok'))
					.catch(error => { console.log(error) });
				console.log(description.type, this.connected)
				if (description.type == 'answer' && !this.connected) {
					this.localPeerConnection.restartIce();
				}
				this.remote = true;
				if (description.type == 'offer') {
					let answer = await this.localPeerConnection.createAnswer();
					console.log(answer)
					await this.localPeerConnection.setLocalDescription(answer);
					console.log('emitting answer')
					this.socket.emit('dataanswer', 
						this.localPeerConnection.localDescription,
						this.connectionId,
						'data'
					);
				}
			} else if (candidate) {
				try {
						console.log('xdddddddd')
						console.log(candidate)
						await this.localPeerConnection.addIceCandidate(candidate);
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
			if (this.error) {
			}
		}

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
}

export default DataConnection;
