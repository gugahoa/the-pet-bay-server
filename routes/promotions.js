const express = require('express');
const router = express.Router();

const {
    couchdb,
    findDatabase,
    createDatabase,
    updateDocument
} = require('../utils/couchdb');
const rp = require('request-promise');

createDatabase('promotions')
    .then(() => {
        console.log("Created promotions database");
    })
    .catch((err) => {
        if (err.code == "EDBEXISTS") {
            return; // Ignore
        }

        console.log("Unexpected error creating promotions database+index: ", err);
    });

router.get('/', async (req, res) => {
    return res.json({
        dueDate: (new Date()).toLocaleDateString(),
        products: []
    });
});

module.exports = router;
