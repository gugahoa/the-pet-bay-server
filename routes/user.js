const express = require('express');
const jwt = require('express-jwt');
const guard = require('express-jwt-permissions')();
const router = express.Router();

const { couchdb, findDatabase, createDatabase } = require('../utils/couchdb');
const rp = require('request-promise');
const jwt_signer = require('jsonwebtoken');

createDatabase('users')
    .then(() => {
        console.log("Created users database");
        return rp({
            method: 'POST',
            uri: 'http://localhost:5984/users/_index',
            json: true,
            body: {
                type: 'json',
                name: 'email-index',
                index: {
                    fields: ['email']
                }
            }
        });
    })
    .catch((err) => {
        if (err.code == "EDBEXISTS") {
            return; // Ignore
        }

        console.log("Unexpected error creating users database+index: ", err);
    });

router.post('/', async (req, res) => {
    const { password, name, email, image } = req.body;
    if (!password || !name || !email) {
        return res.status(400).json({error: "malformed_body", message: "Missing required params"});
    }

    const user = {
        password,
        name,
        email,
        image
    };

    const mangoQuery = {
        selector: {
            email: {$eq: email}
        }
    };

    const users = await couchdb.mango('users', mangoQuery, {})
    .then(({data, headers, status}) => {
        return data;
    })
    .catch(err => {
        console.log("User query err", err);
        return {error: 'internal_server_error'};
    });

    if (users.docs && users.docs.length != 0) {
        return res.status(400).json({error: 'user_exists', message: 'email used already registered'});
    } else if (users.error) {
        return res.status(500).send({error: users.error});
    }

    return couchdb.insert('users', user)
        .then(({data, headers, status}) => {
            console.log("INSERT USER");
            console.log(data, headers, status);

            for (let header in headers) {
                if (headers.hasOwnProperty(header)) {
                    res.append(header, headers[header]);
                }
            }

            user.password = undefined;
            user.id = data.id;
            return res.status(status).json(user);
        });
});

router.get('/', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({error: 'malformed_body', message: 'Missing required params'});
    }

    const mangoQuery = {
        selector: {
            email: {$eq: email}
        }
    };

    const user = await couchdb.mango('users', mangoQuery, {})
          .then(({data, headers, status}) => {
              return data.docs.pop();
          })
          .catch(err => {
              console.log("User query err", err);
              return {error: 'internal_server_error'};
          });

    if (user.error) {
        return res.status(500).json({error: user.error});
    }

    console.log(user);
    if (user.password == password) {
        const token = jwt_signer.sign({user}, 'secret');
        return res.status(200).json({...user, token});
    }

    return res.status(401).json({error: 'wrong_combination', message: 'Wrong email and password combination'});
});

module.exports = router;
