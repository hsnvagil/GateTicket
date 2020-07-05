const Cookies = require('cookies');
const methods = {};

function makeKey(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result.toString();
}

methods.checkCookies = function (req, res) {
    const cookie = new Cookies(req, res);
    const key = cookie.get('key');
    if (typeof key === 'undefined') {
        return false;
    }
    return true;
}

methods.setCookies = function (req, res) {
    const cookie = new Cookies(req, res);
    const key = makeKey(8);
    cookie.set('key', key);
    return true;
}

methods.expireKey = function (req, res) {
    const cookie = new Cookies(req, res);
    cookie.set('key', null);
    return true;
}

exports.data = methods;