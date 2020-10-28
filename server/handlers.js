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
      const data = await db.collection("seats").find().toArray();
      
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

getSeats();

module.exports = { getSeats };
