const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Userroutes = require('./routes/Userroutes');  // Ensure this is the correct path
const Postroutes=require('./routes/Postroutes')

// Initialize the app
const app = express();

// Load environment variables from .env file
dotenv.config();

const corsOptions = {
  origin: ['https://riseacre.vercel.app', 'http://localhost:3000'],
  credentials: true,
};

app.use(cors(corsOptions));


// Define the port
const PORT = 4000;

// MongoDB URI from the .env file
const mongodb_url = process.env.MONGODB_URL;
console.log("MongoDB URL:", process.env.MONGODB_URL);


// Connect to MongoDB
mongoose.connect(mongodb_url)
  .then(() => {
    console.log('MongoDB is successfully connected.');
  })
  .catch((error) => {
    console.error('MongoDB failed to connect. Error:', error);
  });

// Use express.json() to parse JSON request bodies
app.use(express.json());  // Replaces body-parser.json() for JSON parsing

// Define routes
app.use('/user', Userroutes);  // Routes prefixed with "/user"
app.use('/listings',Postroutes);

// Start the server
app.listen(PORT, () => {
  console.log(`The server is running on http://localhost:${PORT}`);
});

