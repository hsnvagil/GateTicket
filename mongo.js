const url = 'mongodb://localhost:27017';
const MongoClient = require('mongodb').MongoClient;

const methods = {};
const dbName = "gate-ticket";

async function m_connectDb() {
    const client = await MongoClient.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        .catch(err => {
            console.log(err);
        });

    if (!client) {
        return null;
    }
    return client;
}

async function m_getCollection(col) {
    const client = await m_connectDb();
    try {
        const db = client.db(dbName);
        let collection = db.collection(col);
        return await collection.find().toArray();

    } catch (err) {
        return null;
    } finally {
        await client.close();
    }
}

async function m_findOne(col, query) {
    const client = await m_connectDb();
    try {
        const db = client.db(dbName);
        let collection = db.collection(col);
        return await collection.findOne(query).then(u => {
            return u;
        });

    } catch (err) {
        return null;

    } finally {
        await client.close();
    }
}

async function m_findOneAndUpdate(col, id, query) {
    const client = await m_connectDb();
    try {
        const db = client.db(dbName);
        let collection = db.collection(col);
        return await collection.findOneAndUpdate({
            "id": `${id}`
        }, {
            $set: query
        }).then(result => {
            return result.lastErrorObject.updatedExisting;
        });

    } catch (err) {
        return null;

    } finally {
        await client.close();
    }
}

async function m_remove(col, query) {
    const client = await m_connectDb();
    try {
        const db = client.db(dbName);
        let collection = db.collection(col);
        return await collection.deleteOne(query).then(result => {
            return result.deletedCount;
        });

    } catch (err) {
        return null;
    } finally {
        await client.close();
    }
}

async function m_insert(col, newData) {
    const client = await m_connectDb();
    try {
        const db = client.db(dbName);
        let collection = db.collection(col);
        return await collection.insertOne(newData).then(result => {
            return result.insertedCount;
        });

    } catch (err) {
        return null;

    } finally {
        await client.close();
    }
}

methods.getCollections = async function(){
    const client = await m_connectDb();
    try {
        const db = client.db('gate-ticket');
        var list = await db.listCollections().toArray();
        let collectionsName = [];
        for (const e of list) {
            collectionsName.push(e.name)
        }
        return collectionsName;
    } catch (err) {
        return null;

    } finally {
        await client.close();
    }
}

async function m_getNextSequence(col, seqName) {
    const client = await m_connectDb();
    try {
        const db = client.db(dbName);
        let collection = db.collection(col);
        return await collection.findOneAndUpdate({
            "_id": `${seqName}`
        }, {
            $inc: {
                "seq": 1
            }
        }).then(result => {
            return result.value.seq.toString();
        })

    } catch (err) {
        return null;

    } finally {
        await client.close();
    }
}

methods.findOne = async function (collectionName, query) {
    return m_findOne(collectionName, query);
}

methods.find = async function (collectionName) {
    return m_getCollection(collectionName);
}

methods.findOneAndUpdate = async function (collectionName, id, query) {
    return m_findOneAndUpdate(collectionName, id, query);
}

methods.remove = async function (collectionName, query) {
    return m_remove(collectionName, query);
}

methods.insertOne = async function (collectionName, newData) {
    return m_insert(collectionName, newData);
}

methods.getNextSequence = async function (collectionName, seqName) {
    return m_getNextSequence(collectionName, seqName);
}

exports.data = methods;
