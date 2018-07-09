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
    const lastDoc = await rp({
        method: 'GET',
        json: true,
        uri: 'http://localhost:5984/promotions/_changes?descending=true&limit=1'
    })
    .then((response) => (response.results.pop().id));

    const promotions = await couchdb.get('promotions', lastDoc)
          .then(({data}) => (data))
          .catch((err) => ({ error: 'internal_server_error' }));

    if (promotions.error) {
        return res.status(500).json(promotions);
    }

    console.log(promotions);
    promotions.products.map((product) => {
        product.oldPrice = Number(product.oldPrice);
    });

    return res.json(promotions);
});

module.exports = router;
