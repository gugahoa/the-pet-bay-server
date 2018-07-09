const user = require('./user');
const pets = require('./pets');
const bookings = require('./bookings');
const products = require('./products');
const bills = require('./bills');
const promotions = require('./promotions');
const servicesLanding = require('./servicesLanding');
const services = require('./services');

module.exports = {
    '/users': user,
    '/pets': pets,
    '/bookings': bookings,
    '/products': products,
    '/bills': bills,
    '/promotions': promotions,
    '/servicesLanding': servicesLanding,
    '/services': services
};
