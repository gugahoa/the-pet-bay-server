const express = require('express');
const router = express.Router();

const {
    couchdb,
    createDatabase,
} = require('../utils/couchdb');
const rp = require('request-promise');

createDatabase('serviceslanding')
    .then(() => {
        console.log("Created servicesLanding database");
    })
    .catch((err) => {
        if (err.code == "EDBEXISTS") {
            return; // Ignore
        }

        console.log("Unexpected error creating servicesLanding database+index: ", err);
    });

router.get('/', async (req, res) => {
    const result = await rp({
        method: 'GET',
        json: true,
        uri: 'http://localhost:5984/serviceslanding/_all_docs'
    })
    .then(result => {
        return result.rows.map(el => ({...el, id: el.key}));
    })
    .catch(err => {
        return { error: 'internal_server_error' };
    });

    if (result.error) {
        return res.status(500).json(result);
    }

    const promises = result.map(el => {
        return couchdb.get('serviceslanding', el.key)
            .then(({data}) => (data));
    });

    const services = await Promise.all(promises);

    return res.json(services);
});

module.exports = router;
