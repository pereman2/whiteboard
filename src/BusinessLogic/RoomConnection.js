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

class RoomConnection extends EventEmitter{
	constructor(socket, rol, connectionId, stream) {
		super();
		this.localPeerConnection = new RTCPeerConnection({
			iceServers: [
				{urls: 'stun:stun.l.google.com:19302'},
			],
			offerToReceiveVideo: true,
			offerToReceiveAudio: true,
		});
		this.socket = socket;
		this.connectionId = connectionId;
		this.rol = rol;
		this.connectionType = 'media';
		console.log('constructor')
		for(const track of stream.getTracks()) {
			console.log(track)
			this.localPeerConnection.addTrack(track, stream);
		}
		let remoteVideo = document.createElement("video");
		remoteVideo.className = "remoteVideo"+connectionId;
		remoteVideo.classList.add("box");
		this.remoteVideo = remoteVideo
		document.querySelector("#room").appendChild(remoteVideo);
		this.initializeRol();
		this.localPeerConnection._negotiating = false;
	}

	initializeRol = () => {
		if(this.rol == 'answerer') {
			polite = true;
		} else {
		}
	}

	connect = async (room) => {
		console.log('connect')
		this.setSocketEvents();
		this.localPeerConnection.ontrack = this.onTrackHandler;
		this.localPeerConnection.onnegotiationneeded = this.handleNegotation;
		this.localPeerConnection.addEventListener('icecandidate', this.handleConnection);
		this.localPeerConnection.onsignalingstatechange = (e) => {
			this.localPeerConnection._negotiating = 
				(this.localPeerConnection.signalingState != "stable");
		}
		this.iceCandidates = []
	}

	start = () => {
	}

	handleNegotation = async () => {
		console.log(this.rol)
		if(this.localPeerConnection._negotiating || this.rol == 'answerer') return;
		try {
			console.log('---> CREATING OFFER')
			makingOffer = true
			let offer = this.localPeerConnection.createOffer();
			await this.localPeerConnection.setLocalDescription(offer);
			this.socket.emit('dataoffer', 
				this.localPeerConnection.localDescription,
				this.connectionId,
				this.connectionType
			);
		} catch(error) {
			console.log(error);
		} finally {
			makingOffer = false
		}
	}
	onTrackHandler = (event) => {
		var remoteVideo = this.remoteVideo;
		console.log('track')
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
		this.socket.on('datamessages', async (description, candidate, connectionId, connectionType) => {
			console.log(description, candidate)
			if(connectionId == this.connectionId && connectionType == this.connectionType) {
				this.handleSocketMessage(description, candidate);
			}
		});

		this.socket.on('wannaoffer', (msg, connectionId, connectionType) => {
			if (connectionId == this.connectionId && connectionType == this.connectionType) {
				console.log(msg)
				if (msg == 'ask') {
					console.log('emitting ok')
					this.socket.emit('wannaoffer', 'ok', this.rol, this.connectionId, this.connectionType);
					polite = true;
				} else {
					console.log('received ok')
					this.start();
				}
			}
		} );
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
			console.log('created')
			polite = true;
		});

		this.socket.on('joined', (room, socketId, offer) => {
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
		this.socket.emit('dataicecandidate', iceCandidate, this.connectionId, this.rol, this.connectionType);
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

	handleSocketMessage = async (description, candidate) => {
		try {
			if (description) {
				console.log(description.type)
				let offerCollision = description.type == 'offer' &&
					(makingOffer ||
						this.localPeerConnection.signalingState != 'stable');
				ignoreOffer = !polite && offerCollision;
				if (ignoreOffer) {
					console.log('ignored')
					return;
				}
				await this.localPeerConnection.setRemoteDescription(description)
					.then(() => console.log('remoteok'))
				if (description.type == 'offer') {
					let answer = await this.localPeerConnection.createAnswer();
					console.log(this.localPeerConnection.signalingState)
					console.log(this.localPeerConnection.connectionState)
					await this.localPeerConnection.setLocalDescription(answer);
					this.socket.emit('dataanswer',
						this.localPeerConnection.localDescription,
						this.connectionId,
						this.connectionType
					);
				}
			} else if (candidate) {
				try {
					console.log(candidate)
					await this.localPeerConnection.addIceCandidate(candidate);
				} catch (error) {
					if (!ignoreOffer) throw error;
				}
			}
		} catch (error) {
			console.error(error);
		}
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

export default RoomConnection;
