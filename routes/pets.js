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

router.get('/', /*jwt({secret: 'secret'}),*/ async (req, res) => {
    // if (req.user._id !== req.query.user) {
    //     return res.status(401).json({error: 'unauthorized'});
    // }

    const mangoQuery = {
        selector: {
            user: {$eq: req.query.user}
        }
    };

    const pets = await couchdb.mango('pets', mangoQuery)
        .then(({data}) => (data.docs.map((pet) => ({...pet, id: pet._id}))))
        .catch((err) => ([]));

    return res.status(200).json(pets);
});

router.post('/', (req, res) => {
    const { user, name, species, image } = req.body;
    return couchdb.insert('pets', {
        user,
        name,
        species,
        image
    })
    .then(() => (res.status(201).json({success: true})))
    .catch(() => (res.status(500).json({success: false})));
});

router.delete('/:id', async (req, res) => {
    const petId = req.params.id;

    const result = await couchdb.get('pets', petId)
          .then(({data}) => (data))
          .catch((err) => ({error: 'internal_server_error'}));
    if (result.error) {
        return res.status(500).json(result);
    }

    return couchdb.del('pets', petId, result._rev)
        .then(() => (res.status(200).json({success: true})))
        .catch(() => (res.status(500).json({success: false})));
});

router.patch('/:id', async (req, res) => {
    const petId = req.params.id;
    const result = await couchdb.get('pets', petId)
          .then(({data}) => (data))
          .catch((err) => {
              console.log("Error getting pet", err);
              return {error: 'internal_server_error'};
          });

    if (result.error) {
        return res.status(500).json(result);
    }

    const newPet = req.body;

    const updateResult = await couchdb.update('pets', { ...result, ...newPet })
          .then(({data}) => (data))
          .catch((err) => {
              console.log("Error updateing pet", err);
              return {error: 'internal_server_error'};
          });

    if (updateResult.error) {
        return res.status(500).json(updateResult);
    }

    return res.status(200).json({
        ...result,
        ...newPet,
        ...updateResult
    });
});

module.exports = router;
