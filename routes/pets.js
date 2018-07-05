const express = require('express');
const jwt = require('express-jwt');
const guard = require('express-jwt-permissions')();
const router = express.Router();

const { couchdb, findDatabase, createDatabase } = require('../utils/couchdb');
const rp = require('request-promise');
const jwt_signer = require('jsonwebtoken');

createDatabase('pets')
    .then(() => {
        console.log("Created pets database");
        return rp({
            method: 'POST',
            uri: 'http://localhost:5984/pets/_index',
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

        console.log("Unexpected error creating pets database+index: ", err);
    });

router.get('/', /*jwt({secret: 'secret'}),*/ (req, res) => {
    // if (req.user._id !== req.query.user) {
    //     return res.status(401).json({error: 'unauthorized'});
    // }

    return res.status(200).json([]);
});

module.exports = router;
