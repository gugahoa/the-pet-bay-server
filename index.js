const NodeCouchDb = require('node-couchdb');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('./config');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.options('*', cors());

const createDatabase = (couchdb, name) => {
    if (!name) {
        return Promise.reject({error: "invalid_name"});
    }

    return couchdb.createDatabase(name)
        .then(() => {
            return Promise.resolve();
        }, err => {
            return Promise.reject(err);
        });
};

const findDatabase = (couchdb, name) => {
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
        });
};

const couchdb = new NodeCouchDb();
findDatabase(couchdb, config.dbname)
    .catch(err => {
        return createDatabase(couchdb, config.dbname);
    });


app.listen(3000, () => {
    console.log("Listening at 3000");
});
