const axios = require('axios');

const url = 'http://localhost:7000/api/get_room'

class RoomReceiver {
    constructor(offer) {
        this.offer = offer;
    }
    receiveRoom() {
        let params = {
            params: { 
                id: 1
            }
        }
        let res = axios.get(url, params);
        return res;
    }
}

export default RoomReceiver;