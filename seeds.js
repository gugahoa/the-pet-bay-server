const db = require('./db.json');
const { couchdb } = require('./utils/couchdb');

const createdDb = {};

const couchdb_dbs = ["products", "services", "serviceslanding", "promotions"];

const verifyDb = () => {
    return couchdb.listDatabases()
        .then(dbs => {
            couchdb_dbs.forEach(el => {
                if (!dbs.includes(el)) {
                    console.log("Missing database", el);
                    process.exit(1);
                }
            })
        })
        .catch(err => {
            console.log("Error listing databases", err);
            process.exit(1);
        });
}
const populateDb = (db_name, data) => {
    const promises = data[db_name]
        .map(item => {
            return couchdb.insert(db_name, item)
                .then(({data: createdItem}) => {
                    item.id = createdItem.id;
                    return item
                });
        })

    return Promise.all(promises);
}

verifyDb()
    .then(() => {
        populateDb('products', db)
            .then((products) => {
                db.promotions.products =
                    db.promotions.products.map((el) => {
                        return {...el, id: products[el.id - 1].id}
                    })
                couchdb.insert('promotions', db.promotions);
            });
        populateDb('services', db)
            .then((services) => {
                db.servicesLanding =
                    db.servicesLanding.map((el) => {
                        return { id: services[el.id - 1].id }
                    })

                db.serviceslanding = db.servicesLanding;
                populateDb('serviceslanding', db);
            });

    });
