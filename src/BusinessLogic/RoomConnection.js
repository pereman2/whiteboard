import io from 'socket.io-client';
import adapter from 'webrtc-adapter';
import ws from 'ws';
import EventEmitter from 'events'
console.log(adapter.browserDetails.browser)
console.log(adapter.browserDetails.version)


const mediaConstraints = { 
	audio: true 
}
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

var makingOffer = false;
var ignoreOffer = false;
var polite = false;

class RoomConnection extends EventEmitter{
	constructor() {
		super();
		this.localPeerConnection = new RTCPeerConnection({
			iceServers: [
				{urls: 'stun:stun.l.google.com:19302'},
			],
			offerToReceiveAudio: true,
		});
		this.socket = this.getRemoteSocket();
	}

	connect = async (room) => {
		var localVideo = document.querySelector("#localVideo");
		try{
			const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
			for(const track of stream.getTracks()) {
				this.localPeerConnection.addTrack(track, stream);
			}
			localVideo.srcObject = stream;		
			localVideo.play()
			localVideo.style.display = 'inherit'
		} catch(error) {
			console.error(error);
		}
		this.socket.emit('create or join', room);
		this.setSocketEvents();
		this.localPeerConnection.ontrack = this.onTrackHandler;
		this.localPeerConnection.onnegotiationneeded = this.handleNegotation;
		this.localPeerConnection.addEventListener('icecandidate', this.handleConnection);
		this.iceCandidates = []
	}

	handleNegotation = async () => {
		//this.createOffer()

		try {
			makingOffer = true
			var offer = await this.localPeerConnection.createOffer();
			await this.localPeerConnection.setLocalDescription(offer);
			console.log('offer')
			this.socket.emit('offer', this.localPeerConnection.localDescription);
		} catch(error) {
			console.log(error);
		} finally {
			makingOffer = false
		}
		console.log(this.localPeerConnection.signalingState);
	}
	onTrackHandler = (event) => {
		console.log('ontrack');
		console.log(event)
		var remoteVideo = document.querySelector("#remoteVideo");
		event.track.onunmute = () => {
			if(remoteVideo.srcObject) return;
			remoteVideo.srcObject = event.streams[0];
			remoteVideo.play()
			remoteVideo.style.display = 'inherit'
		}
		//remoteVideo.srcObject = event.streams[0];
		//this.localPeerConnection.addTrack(event.track, event.streams[0]);
	}

	setSocketEvents = () => {
		this.socket.on('messages', async (description, candidate) => {
			console.log(description, candidate);
			try{
				if(description) {
					console.log('receiving offer');
					let offerCollision = description.type == 'offer' && 
											(makingOffer ||
											this.localPeerConnection.signalingState != 'stable');
					ignoreOffer = !polite && offerCollision;
					if(ignoreOffer) {
						console.log('ignored offer');
						console.log(makingOffer);
						console.log(this.localPeerConnection.signalingState);
						console.log(description.type);
						console.log(polite)
						return;
					}
					console.log(description)
					await this.localPeerConnection.setRemoteDescription(description)
					if(description.type == 'offer') {
						let answer = await this.localPeerConnection.createAnswer();
						await this.localPeerConnection.setLocalDescription(answer);
						console.log('answer')
						this.socket.emit('answer', this.localPeerConnection.localDescription);
					}
				} else if(candidate) {
					try{
						console.log('adding candidate');
						console.log(candidate)
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
			//this.dataChannel = this.localPeerConnection.createDataChannel('board');
			//this.setDataChannelEvents();
			//this.initiator = true
			polite = true;
		});

		this.socket.on('joined', (room, socketId, offer) => {
			//this.localPeerConnection.ondatachannel = (event) => {
			//	this.dataChannel = event.channel;
			//	this.setDataChannelEvents();
			//	this.dataChannel.send('xd');
			//}
			console.log(offer)
			//var rtcDescription = new RTCSessionDescription(offer);
			//this.createAnswer(rtcDescription)
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

	createOffer = async () => {
		await this.localPeerConnection.createOffer({ 
			offerToReceiveAudio: true, 
		})
			.then(this.createdOffer)
			.catch(this.setSessionDescriptionError);

	}

	createdOffer = async (description) => {
		console.log('setting local peer1');
		console.log(description)
		if(this.localPeerConnection.signalingState != 'stable') return;
		await this.localPeerConnection.setLocalDescription(description)
			.then(() => {
				this.setLocalDescriptionSuccess(this.localPeerConnection);
			}).catch(this.setSessionDescriptionError);
		await this.waitGathering()
		this.socket.emit('offer', this.localPeerConnection.localDescription);
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
		this.socket.send('geticecandidates', room, socketId);
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
		this.socket.emit('icecandidate', iceCandidate);
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
}

export default RoomConnection;
