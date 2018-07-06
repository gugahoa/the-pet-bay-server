const NodeCouchDb = require('node-couchdb');
const config = require('../config');

const couchdb = new NodeCouchDb();

const createDatabase = (name) => {
    if (!name) {
        return Promise.reject({error: "invalid_name"});
    }

    return couchdb.createDatabase(name)
        .then((obj) => (Promise.resolve(obj)), (err) => (Promise.reject(err)));
};

const findDatabase = (name) => {
    if (!name) {
        return Promise.reject({error: "invalid_name"});
    }

    return couchdb.listDatabases()
        .then(dbs => {
            const db = dbs.find((db) => db == name);
            if (db) {
                return Promise.resolve(db);
            }

            return Promise.reject({error: "not_found"});
        }, (err) => (Promise.reject(err)));
};

const updateDocument = async (db, newDoc) => {
    return couchdb.get(db, newDoc.id)
        .then(({data: oldDoc}) => {
            return couchdb.update(db, {...oldDoc, ...newDoc});
        });
};

module.exports = {
    couchdb,
    createDatabase,
    findDatabase,
    updateDocument
};
