const user = require('./user');
const pets = require('./pets');
const bookings = require('./bookings');
const products = require('./products');
const bills = require('./bills');

module.exports = {
    '/users': user,
    '/pets': pets,
    '/bookings': bookings,
    '/products': products,
    '/bills': bills
};
