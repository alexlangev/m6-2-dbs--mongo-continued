const router = require("express").Router();

const {getSeats, bookSeats} = require('./handlers');

//MongoDB stuff
require('dotenv').config();
const { MongoClient } = require('mongodb');
const assert = require('assert');
const { MONGO_URI } = process.env;
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

//Seats constants
const NUM_OF_ROWS = 8;
const SEATS_PER_ROW = 12;

//////// HELPERS
const getRowName = (rowIndex) => {
  return String.fromCharCode(65 + rowIndex);
};

const randomlyBookSeats = (num) => {
  const bookedSeats = {};

  while (num > 0) {
    const row = Math.floor(Math.random() * NUM_OF_ROWS);
    const seat = Math.floor(Math.random() * SEATS_PER_ROW);

    const seatId = `${getRowName(row)}-${seat + 1}`;

    bookedSeats[seatId] = true;

    num--;
  }

  return bookedSeats;
};

let state;

router.get("/api/seat-availability", getSeats);

let lastBookingAttemptSucceeded = false;

router.post("/api/book-seat", bookSeats);

module.exports = router;
