const router = require("express").Router();

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

// Code that is generating the seats.
// ----------------------------------
const seats = {};
const row = ["A", "B", "C", "D", "E", "F", "G", "H"];
for (let r = 0; r < row.length; r++) {
  for (let s = 1; s < 13; s++) {
    seats[`${row[r]}-${s}`] = {
      price: 225,
      isBooked: false,
    };
  }
}
// console.log("Seats:", seats);

//Seats as an array
const seatsArr = [];
Object.keys(seats).forEach((seat) => {
  seatsArr.push({
    _id: seat,
    ...seats[seat],
  })
})
// console.log("seatsArr:", seatsArr);

// ----------------------------------
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

router.get("/api/seat-availability", async (req, res) => {
  if (!state) {
    state = {
      bookedSeats: randomlyBookSeats(30),
    };
  }

  return res.json({
    seats: seats,
    bookedSeats: state.bookedSeats,
    numOfRows: 8,
    seatsPerRow: 12,
  });
});

let lastBookingAttemptSucceeded = false;

router.post("/api/book-seat", async (req, res) => {
  const { seatId, creditCard, expiration } = req.body;

  if (!state) {
    state = {
      bookedSeats: randomlyBookSeats(30),
    };
  }

  await delay(Math.random() * 3000);

  const isAlreadyBooked = !!state.bookedSeats[seatId];
  if (isAlreadyBooked) {
    return res.status(400).json({
      message: "This seat has already been booked!",
    });
  }

  if (!creditCard || !expiration) {
    return res.status(400).json({
      status: 400,
      message: "Please provide credit card information!",
    });
  }

  if (lastBookingAttemptSucceeded) {
    lastBookingAttemptSucceeded = !lastBookingAttemptSucceeded;

    return res.status(500).json({
      message: "An unknown error has occurred. Please try your request again.",
    });
  }

  lastBookingAttemptSucceeded = !lastBookingAttemptSucceeded;

  state.bookedSeats[seatId] = true;

  return res.status(200).json({
    status: 200,
    success: true,
  });
});

const seatImport = async () => {
  const client = await MongoClient(MONGO_URI, options);
  try {
    
    await client.connect();

    const db = client.db('seats-db');
    console.log('connected');

    const r = await db.collection('seats').insertMany(seatsArr);
    assert.equal(seats.length, r.insertedCount);
    console.log('succes');
  } catch (err) {
    console.log(err.stack);
  }
  client.close();
  console.log('disconnected');
};

seatImport();


module.exports = router;
