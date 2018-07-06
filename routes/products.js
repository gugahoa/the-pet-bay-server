const express = require('express');
const router = express.Router();

const {
    couchdb,
    findDatabase,
    createDatabase,
    updateDocument
} = require('../utils/couchdb');
const rp = require('request-promise');

createDatabase('products')
    .then(() => {
        console.log("Created products database");
    })
    .catch((err) => {
        if (err.code == "EDBEXISTS") {
            return; // Ignore
        }

        console.log("Unexpected error creating products database+index: ", err);
    });

router.get('/', (req, res) => {
    if (req.query.id) {
        return couchdb.get('products', req.query.id)
            .then(({data}) => {
                return res.status(200).json([{...data, id: data._id}]);
            })
            .catch((err) => (res.status(500).json({error: 'internal_server_error'})));
    }

    return rp({
        method: 'GET',
        uri: 'http://localhost:5984/products/_all_docs',
        json: true
    })
    .then(async (result) => {
        let products_promise = result.rows
            .map((doc) => (doc.id))
            .map((id) => (couchdb.get('products', id)));

        let products = (await Promise.all(products_promise))
            .map(({data}) => ({...data, id: data._id}));
        return res.status(200).json(products);
    })
    .catch((err) => {
        console.log(err);
        return res.status(500).json({error: 'internal_server_error'});
    });
});

router.patch('/:id', (req, res) => {
    return updateDocument('products', {
        id: req.params.id,
        ...req.body
    })
    .then((result) => {
        console.log(result);
        return res.status(200).json({success: true});
    })
    .catch(() => (res.status(500).json({success: false})));
});

router.post('/', (req, res) => {
    const { image, name, description, price, quantity } = req.body;
    return couchdb.insert('products', {
        image,
        name,
        description,
        price,
        quantity
    })
    .then(() => (res.status(201).json({success: true})))
    .catch((err) => {
        console.log(err);
        return res.status(500).json({success: false});
    });
});

module.exports = router;
