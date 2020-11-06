'use strict';

//MongoDB stuff
require('dotenv').config();
const { MongoClient } = require('mongodb');
const assert = require('assert');
const { MONGO_URI } = process.env;
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const getSeats = async (req, res) => {
    const client = await MongoClient(MONGO_URI, options);
    try {
      await client.connect();
      const db = client.db('seats-db');
      const data = await db.collection('seats').find().toArray();
      
      const response = {};
      data.forEach((seat) => {
        response[seat._id] = seat;
      });
      console.log(response);

      res.status(200).json({
        seats: response,
        numOfRows: 8,
        seatsPerRow: 12 
      });

    } catch (err) {
      console.log(err.stack);
    }
    client.close();
};

const bookSeats = async (req, res) => {
  const client = await MongoClient(MONGO_URI, options);

  try {
    //All the info about the purchase
    const {seatId, fullName, email, creditCard, expiration} = req.body;
    if (!(fullName || email || creditCard || expiration)) {
      res.status(404).json({ status: 404, message: "Missing information fields in the form" });
    } else {
      const query = { _id: seatId };

      await client.connect();

      const db = client.db("seats-db");
      
      const selectedSeat = await db.collection("seats").findOne({ _id: seatId });

      // check if seat isBooked or not
      let seat
      if (selectedSeat.isBooked) {
        seat = await db.collection("seats").updateOne(query, { 
          $set: { isBooked: false } 
        });
      } else {
        seat = await db.collection("seats").updateOne(query, {
          $set: {
            isBooked: true,
            customer: {
              fullName,
              email,
            },
          },
        });
      }

      assert.equal(1, seat.matchedCount);
      assert.equal(1, seat.modifiedCount);
      //response
      res.status(204).json({ status: 204, success: true });
    }
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message });
  }
  client.close();
};

module.exports = { getSeats, bookSeats };
