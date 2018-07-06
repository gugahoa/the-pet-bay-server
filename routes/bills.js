const express = require('express');
const router = express.Router();
const rp = require('request-promise');

const {
    couchdb,
    findDatabase,
    createDatabase,
    updateDocument
} = require('../utils/couchdb');

createDatabase('bills')
    .then(() => {
        console.log("Created bills database");
        return rp({
            method: 'POST',
            uri: 'http://localhost:5984/bills/_index',
            json: true,
            body: {
                type: 'json',
                name: 'user-index',
                index: {
                    fields: ['user']
                }
            }
        });
    })
    .catch((err) => {
        if (err.code == "EDBEXISTS") {
            return; // Ignore
        }

        console.log("Unexpected error creating bills database+index: ", err);
    });

router.post('/', (req, res) => {
    return couchdb.insert('bills', req.body)
        .then(() => (res.status(200).json({success: true})))
        .catch(() => (res.status(500).json({success: false})));
});

module.exports = router;
