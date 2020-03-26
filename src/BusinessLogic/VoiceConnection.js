import Peer from 'simple-peer';
import wrtc from 'wrtc'
import RoomCreator from '../Persistence/RoomCreator'
import RoomReceiver from '../Persistence/RoomReceiver';

const constraints = window.constraints = {
	video: true,
	audio: true
}

class VoiceConnection {

	constructor(localVideo) {
		console.log(localVideo)
		var stream = navigator.mediaDevices.getUserMedia(constraints);
		console.log(typeof stream)
		console.log(stream)
		window.stream = stream;
		localVideo.srcObject = stream;
	}

	addStream = function (stream) {
		this.peer.addStream(stream)
	}
}

export default VoiceConnection;
