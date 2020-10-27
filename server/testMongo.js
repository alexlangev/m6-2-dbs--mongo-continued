const { MongoClient } = require("mongodb");
require('dotenv').config();
const { MONGO_URI } = process.env;
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const dbFunction = async (req, res) => {
  // creates a new client
  const client = await MongoClient(MONGO_URI, options);

  // connect to the client
  await client.connect();

  // connect to the database (dbName is provided as an argument to the function)
  const db = client.db('seats-db');
  console.log("connected!");

  await db.collection('seats').insertOne({ name: "alex " });

  // close the connection to the database server
  client.close();
  console.log("disconnected!");
};

dbFunction();