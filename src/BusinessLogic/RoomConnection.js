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
	constructor(socket) {
		super();
		this.localPeerConnection = new RTCPeerConnection({
			iceServers: [
				{urls: 'stun:stun.l.google.com:19302'},
			],
			offerToReceiveVideo: true,
			offerToReceiveAudio: true,
		});
		this.socket = socket;
	}

	connect = async (room) => {
		var localVideo = document.querySelector("#localVideo");
		try{
			//let constraints = await this.getMediaConstraints();
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
			await this.localPeerConnection.setLocalDescription();
			this.socket.emit('offer', this.localPeerConnection.localDescription);
		} catch(error) {
			console.log(error);
		} finally {
			makingOffer = false
		}
	}
	onTrackHandler = (event) => {
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
			try{
				if(description) {
					let offerCollision = description.type == 'offer' && 
											(makingOffer ||
											this.localPeerConnection.signalingState != 'stable');
					ignoreOffer = !polite && offerCollision;
					if(ignoreOffer) {
						console.log('ignored')
						return;
					}
					await this.localPeerConnection.setRemoteDescription(description)
					if(description.type == 'offer') {
						let answer = await this.localPeerConnection.createAnswer();
						await this.localPeerConnection.setLocalDescription(answer);
						this.socket.emit('answer', this.localPeerConnection.localDescription);
					}
				} else if(candidate) {
					try{
						await this.localPeerConnection.addIceCandidate(candidate);
					} catch (error) {
						if(!ignoreOffer) throw error;
					}
				}
			} catch(error) {
				console.log(description)
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
    this.socket.emit('listening');
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
