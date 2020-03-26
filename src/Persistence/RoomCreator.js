const axios = require('axios');

const url = 'http://localhost:7000/api/create_room'

class RoomCreator {
    constructor(offer) {
        this.offer = offer;
    }
    createRoom() {
        let data = {
            _id: 1,
            offer: this.offer
        }
        let res = axios.post(url, data);
        return res;
    }
}

export default RoomCreator;