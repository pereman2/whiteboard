const axios = require('axios');
const sha256 = require('js-sha256').sha256;

//const urlLogin = 'http://localhost:9000/user/checklogin'
//const urlRegister = 'http://localhost:9000/user/register'
const urlLogin = 'https://boardbackend.herokuapp.com/user/checklogin'
const urlRegister = 'https://boardbackend.herokuapp.com/user/register'

class User {
    constructor(username, password, email=null) {
        this.username = username;
        this.password = this.hashPassword(password);
        this.email = email;
    }

    async checkLogin() {
        let data = {
            params: {
                username: this.username,
                password: this.password,
                email: this.email,
            }
        }
        let res;
        await axios.get(urlLogin, data)
            .then((response) => {res = response.data; });
        return res;
    }

    async register() {
        let data = {
            username: this.username,
            password: this.password,
            email: this.email,
        }
        let res;
        await axios.post(urlRegister, data)
            .then((response) => {res = response.data; });
        console.log(res)
        return res;

    }

    hashPassword(msg) {
        if(!msg) { return null; } 
        let password = sha256.hex(msg);
        return password;
    }
}

export default User;