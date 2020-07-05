const url = require('url');
const fs = require("fs");
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const vash = require('vash');
const formidable = require('formidable');
const pdf = require('html-pdf');
const mongo = require('./mongo');
const cookies = require('./cookies');
const qrcode = require('./qrcode');

const app = express();
app.use(express.static('public'));
const jsonParser = bodyParser.json()


mongo.data.getCollections().then(result => {
    if (result.includes('counters') == false) {
        mongo.data.insertOne('counters', {
            '_id': 'visitorid',
            'seq': 1
        });
        mongo.data.insertOne('counters', {
            '_id': 'gateid',
            'seq': 1
        });
    }
    if (result.includes('authentication') == false) {
        mongo.data.insertOne('authentication', {
            'username': 'admin',
            'pass': 'admin'
        });
    }
});

app.get('/', function (res, req) {
    req.redirect('/login');
});

app.get('/login', function (req, res) {
    if (cookies.data.checkCookies(req, res) === true) {
        res.redirect('/visitors');
    } else {
        const pageName = 'pages/login.html';
        const pageContent = fs.readFileSync(pageName);
        res.status(200).write(pageContent);
        res.end();
    }
});

app.post('/login', jsonParser, async function (req, res) {
    const data = req.body;
    const existUsername = await mongo.data.findOne('authentication', {
        username: data.login
    });

    if (existUsername == null) {
        res.status(401).send('wrong username');
        return;
    }

    if (existUsername.pass === data.pass) {
        cookies.data.setCookies(req, res);
        res.status(200).send('success');
    } else {
        res.status(401).send('wrong password')
    }
});

app.get('/visitors', function (req, res) {
    if (cookies.data.checkCookies(req, res) == false) {
        res.redirect('/login');
        return;
    }

    mongo.data.find("visitors").then(r => {
        const htmlTemplate = fs.readFileSync('./pages/visitors.vash').toString();
        let vashTemplate = vash.compile(htmlTemplate);
        const htmlResult = vashTemplate(r);
        res.status(200).send(htmlResult);
    });
});

app.post('/visitors', jsonParser, async function (req, res) {
    const newVisitor = req.body;
    newVisitor.id = await mongo.data.getNextSequence("counters", "visitorid");
    const insertedCount = await mongo.data.insertOne("visitors", newVisitor);
    if (insertedCount > 0) {
        res.status(201).send();
    } else {
        res.status(400).send();
    }
});

app.put('/visitors', jsonParser, async function (req, res) {
    const data = req.body;
    const id = url.parse(req.url, true).query.id;
    const result = await mongo.data.findOneAndUpdate('visitors', id, data);
    if (result) {
        res.status(200).send();
    } else {
        res.status(400).send();
    }
});

app.delete('/visitors', async function (req, res) {
    const id = url.parse(req.url, true).query.id;
    const deletedCount = await mongo.data.remove('visitors', {
        id: `${id}`
    });
    if (deletedCount > 0) {
        res.status(200).send();
    } else {
        res.status(400).send();
    }
});

app.get('/gates', async function (req, res) {
    if (cookies.data.checkCookies(req, res) == false) {
        res.redirect('/login');
        return;
    }
    const gates = await mongo.data.find("gates");
    const htmlTemplate = fs.readFileSync('./pages/gates.vash').toString();
    const vashTemplate = vash.compile(htmlTemplate);
    const htmlResult = vashTemplate(gates);
    res.status(200).contentType('text/html').send(htmlResult);
});



app.post('/gates', jsonParser, async function (req, res) {
    const newGate = req.body;
    newGate.id = await mongo.data.getNextSequence("counters", "gateid");
    const insertedCount = await mongo.data.insertOne("gates", newGate);
    if (insertedCount > 0) {
        res.status(201).send();
    } else {
        res.status(500).send();
    }
});

app.put('/gates', jsonParser, async function (req, res) {
    const data = req.body;
    const id = url.parse(req.url, true).query.id;
    const result = await mongo.data.findOneAndUpdate('gates', id, data);
    if (result) {
        res.status(200).send();
    } else {
        res.status(400).send();
    }
});

app.delete('/gates', async function (req, res) {
    const id = url.parse(req.url, true).query.id;
    const deletedCount = await mongo.data.remove('gates', {
        id: `${id}`
    });
    if (deletedCount > 0) {
        res.status(200).send();
    } else {
        res.status(400).send();
    }
});

app.post('/fileUpload', function (req, res) {
    let form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
        const tempPath = files['up-img'].path;
        let newPath = './public/img/' + files['up-img'].name;
        var readStream = fs.createReadStream(tempPath);
        var writeStream = fs.createWriteStream(newPath);
        readStream.pipe(writeStream);
        readStream.on('end', function () {
            fs.unlinkSync(tempPath);
        });
        let path = '/img/' + files['up-img'].name;
        res.status(200).send(path);
    });
});

app.get('/pass', async function (req, res) {
    let id = url.parse(req.url, true).query.id;
    const visitor = await mongo.data.findOne('visitors', {
        id: `${id}`
    });
    let imgSrc = 'file://' + __dirname + `/public/${visitor.photo}`;
    imgSrc = path.normalize(imgSrc);
    visitor.photo = imgSrc;
    const qrJsonData = JSON.stringify({
        id: `${visitor.id}`,
        fullName: `${visitor.name} ${visitor.surname}`
    });
    visitor.qrCodeSrc = qrcode.data.createQrCode(qrJsonData);
    let htmlTemplate = fs.readFileSync('./public/template/pass-pdf.vash').toString();
    let vashTemplate = vash.compile(htmlTemplate);
    const htmlResult = vashTemplate(visitor);

    pdf.create(htmlResult).toBuffer(function (err, buffer) {
        if (err) throw err;
        res.status(200).contentType('application/pdf').send(buffer);
    });
});

app.post('/check', jsonParser, async function (req, res) {
    const data = req.body;
    const visitors = await mongo.data.findOne('visitors', {
        id: data.visitorId
    });
    var gArr = visitors.gates.split(",");
    for (const g of gArr) {
        if (g == data.gateId) {
            res.status(200).send({
                "result": true
            });
            return;
        }
    }
    res.status(200).send({
        "result": false
    });

})

app.post('/logout', function (req, res) {
    cookies.data.expireKey(req, res);
    res.status(200).send();
});

app.get('/visitors/gates', async function (req, res) {
    if (cookies.data.checkCookies(req, res) == false) {
        res.redirect('/login');
        return;
    }
    const gates = await mongo.data.find("gates");
    res.status(200).contentType('application/json').send(JSON.stringify(gates));
});

app.use(function (req, res, next) {
    res.status(404);
    const page = fs.readFileSync('./pages/404-page.html');
    res.contentType('text/html').send(page);
});


app.listen(8080, () => {
    console.log(`App listening at http://localhost:${8080}`);
});