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

const couchdb_wrapper = {};
couchdb_wrapper.mango = (db, query, params) => {
    return couchdb.mango(db, query, params)
        .then((obj) => Promise.resolve(obj), (err) => Promise.reject(err));
};

couchdb_wrapper.get = (db, id) => {
    return couchdb.get(db, id)
        .then((obj) => Promise.resolve(obj), (err) => Promise.reject(err));
};

couchdb_wrapper.insert = (db, doc) => {
    return couchdb.insert(db, doc)
        .then((obj) => Promise.resolve(obj), (err) => Promise.reject(err));
};

module.exports = {
    couchdb,
    createDatabase,
    findDatabase
};
