const qrcode = require('qrcode-generator');
methods = {};

methods.createQrCode = function (data) {
    const qr = qrcode(4, 'L');
    qr.addData(data);
    qr.make();
    return qr.createDataURL();
}
exports.data = methods;