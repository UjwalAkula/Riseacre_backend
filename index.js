const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '.env') });

const Userroutes = require('./routes/Userroutes');
const Postroutes = require('./routes/Postroutes');
const userActivityRoutes = require('./routes/UserActivityRoutes');

const app = express();
const allowedOrigins = (process.env.CORS_ORIGINS || 'https://riseacre.vercel.app,http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));


const PORT = Number(process.env.PORT) || 4000;
const mongodbUrl = process.env.MONGODB_URL || process.env.MONGO_URI;

// Use express.json() to parse JSON request bodies
app.use(express.json());  // Replaces body-parser.json() for JSON parsing

// Define routes
app.use('/user', Userroutes);  // Routes prefixed with "/user"
app.use('/listings',Postroutes);
app.use("/api/activity", userActivityRoutes);

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  const errorMessage = typeof error === 'string' ? error : error.message || '';
  const isUploadError = error.name === 'MulterError' || /Only JPEG, JPG, and PNG images are allowed/i.test(errorMessage);
  const status = error.code === 'LIMIT_FILE_SIZE' ? 413 : isUploadError ? 400 : Number.isInteger(error.status) ? error.status : 500;
  const message = status === 413
    ? 'Each property photo must be 5 MB or smaller.'
    : isUploadError
      ? 'Upload up to five JPG or PNG photos.'
      : status === 500 ? 'An unexpected server error occurred.' : 'The request could not be processed.';
  if (status === 500) console.error('Unhandled API error:', errorMessage);
  return res.status(status).json({ message });
});

const startServer = async () => {
  if (!mongodbUrl) throw new Error('Set MONGODB_URL (or MONGO_URI) before starting the API.');
  if (process.env.NODE_ENV === 'production' && !process.env.UPLOADS_DIR) {
    throw new Error('Set UPLOADS_DIR to a persistent mounted volume in production so listing photos survive deploys.');
  }
  await mongoose.connect(mongodbUrl);
  console.log('MongoDB is successfully connected.');
  app.listen(PORT, () => console.log(`The server is listening on port ${PORT}.`));
};

startServer().catch((error) => {
  console.error('Backend startup failed:', error.message);
  process.exit(1);
});

