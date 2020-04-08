const roomPersists = require('../Persistence/Room');
class Room {
    constructor(username, password=null, email=null){
        this.userPersists = new userPersists.default(username, password, email);
        this.username = username;
        this.password = password;
        this.email = email;
    }
    async getIdRoom() {
        var isValidLogin = await this.userPersists.checkLogin();
        return isValidLogin;
    }


}
export default Room;