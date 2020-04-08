const userPersists = require('../Persistence/User');
class User {
    constructor(username, password=null, email=null){
        this.userPersists = new userPersists.default(username, password, email);
        this.username = username;
        this.password = password;
        this.email = email;
    }
    async checkLogin() {
        var isValidLogin = await this.userPersists.checkLogin();
        return isValidLogin;
    }

    async register() {
        let res = await this.userPersists.register();
        console.log(res)
        return res;
    }

}
export default User;