const router = require("express").Router();

const {getSeats, bookSeats, deleteReservation, updateCustomer} = require('./handlers');

require('dotenv').config();

router.get("/api/seat-availability", getSeats);
router.post("/api/book-seat", bookSeats);
router.post('/api/deleteReservation', deleteReservation);
router.post('/api/updateCustomer', updateCustomer);

module.exports = router;
