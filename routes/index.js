const user = require('./user');
const pets = require('./pets');
const bookings = require('./bookings');

module.exports = {
    '/users': user,
    '/pets': pets,
    '/bookings': bookings
};
