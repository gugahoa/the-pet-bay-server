const express = require('express');
const router = express.Router();

const {
    couchdb,
    createDatabase,
} = require('../utils/couchdb');
const rp = require('request-promise');

createDatabase('services')
    .then(() => {
        console.log("Created services database");
    })
    .catch((err) => {
        if (err.code == "EDBEXISTS") {
            return; // Ignore
        }

        console.log("Unexpected error creating services database+index: ", err);
    });

router.get('/:id', (req, res) => {
    return couchdb.get('services', req.params.id)
        .then(({data}) => {
            return res.status(200).json({...data, id: data._id});
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).json({error: 'not_found'});
        });
});

router.get('/', async (req, res) => {
    const result = await rp({
        method: 'GET',
        json: true,
        uri: 'http://localhost:5984/services/_all_docs'
    })
    .then(result => {
        return result.rows.map(el => ({...el, id: el._id}));
    })
    .catch(err => {
        return { error: 'internal_server_error' };
    });

    if (result.error) {
        return res.status(500).json(result);
    }

    const docsPromise = result.map(el => {
        return couchdb.get('services', el.key)
            .then(({data}) => ({...data, id: data._id}));
    });

    const docs = await Promise.all(docsPromise);

    return res.json(docs);
});

router.post('/', (req, res) => {
    const { name, short, long, image } = req.body;
    return couchdb.insert('services', {
        name,
        short,
        long,
        image
    })
    .then(() => (res.status(201).json({success: true})))
    .catch((err) => (res.status(500).json({success: false})));
});

module.exports = router;
