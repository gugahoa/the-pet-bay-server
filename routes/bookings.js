const express = require('express');
const jwt = require('express-jwt');
const guard = require('express-jwt-permissions')();
const router = express.Router();

const { couchdb, findDatabase, createDatabase } = require('../utils/couchdb');
const rp = require('request-promise');
const jwt_signer = require('jsonwebtoken');

createDatabase('bookings')
    .then(() => {
        console.log("Created bookings database");
        return rp({
            method: 'POST',
            uri: 'http://localhost:5984/bookings/_index',
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

        console.log("Unexpected error creating bookings database+index: ", err);
    });

router.get('/', async (req, res) => {
    const mangoQuery = {
        selector: {
            user: {$eq: req.query.user}
        }
    };

    const bookings = await couchdb.mango('bookings', mangoQuery, {})
          .then(({data, headers, status}) => {
              return data.docs;
          })
          .catch(err => {
              console.log("User query err", err);
              return {error: 'internal_server_error'};
          });

    return res.status(200).json(bookings.map(el => ({...el, id: el._id})));
});

router.post('/', (req, res) => {
    const { user, pet, service, date, time } = req.body;
    return couchdb.insert('bookings', {
        user,
        pet,
        service,
        date,
        time
    })
        .then(() => (res.json({success: true})))
        .catch(() => (res.status(500).json({success: false})));
});

router.delete('/:id', async (req, res) => {
    const booking = await couchdb.get('bookings', req.params.id)
          .then(({data}) => (data))
          .catch((err) => {
              console.log(err);
              return { error: 'internal_server_error' };
          });

    if (booking.error) {
        return res.status(500).json(booking);
    }

    return couchdb.del('bookings', booking._id, booking._rev)
        .then(() => (res.status(200).json({success: true})))
        .catch(err => {
            console.log(err);
            return res.status(500).json({success: false});
        });
});

module.exports = router;

