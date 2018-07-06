const express = require('express');
const router = express.Router();

const { couchdb, findDatabase, createDatabase } = require('../utils/couchdb');
const rp = require('request-promise');

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

router.get('/', async (req, res) => {
    if (req.query.id) {
        return couchdb.get('pets', req.query.id)
            .then(({data: pet}) => {
                return res.status(200).json([{...pet, id: pet._id}]);
            })
            .catch((err) => {
                console.log("error getting pet", err);
                return res.status(500).json({error: 'internal_server_error'});
            });
    }

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
