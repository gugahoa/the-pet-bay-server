const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./routes');

const app = express();

app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(cors());
app.options('*', cors());

for (let key in routes) {
    if (routes.hasOwnProperty(key)) {
        console.log(`Binding route ${key}`);
        app.use(key, routes[key]);
    }
}

/*
  Authentication + Authorization error handling
*/
app.use((err, req, res, next) => {
    if (err.name == 'pemission_denied') {
        res.status(403).json(err.inner);
    } else if (err.name == 'UnauthorizedError') {
        res.status(401).json(err.inner);
    } else {
        console.log(err);
        next();
    }
});
/* End */

app.listen(4000, () => {
    console.log("Listening at 4000");
});
