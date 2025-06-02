
# RISEACRE\_BACKEND

The robust API powering the Riseacre platform.

-----

## Overview

This repository contains the **Riseacre Backend API**, a robust and scalable service for the Riseacre platform. It handles user authentication, property listing management, user profiles, ratings, and integrates with mapping services. This API is designed to be consumed by a separate frontend application.

-----

## Features

  * **User Authentication & Session Management:** Secure user registration, login, and session management using cookies.
  * **Property Listing Management:** Full CRUD (Create, Read, Update, Delete) functionality for property listings.
  * **Ratings & Reviews System:** Functionality to submit and retrieve ratings.
  * **Location Services Integration:** Uses Google Maps Autocomplete API for location input.
  * **Image Uploads:** Handles storage of property photos.
  * **Secure Password Hashing:** Uses `bcrypt` for password security.

-----

## 🛠️ Technologies Used

  * **Node.js**
  * **Express.js**
  * **MongoDB** (with Mongoose)
  * **Bcrypt**
  * **CORS**
  * **Dotenv**
  * **Google Maps API**
  * **Multer**

-----

## Getting Started

Follow these instructions to set up and run the backend locally.

### Prerequisites

  * **Node.js** (LTS recommended)
  * **npm** 
  * **MongoDB Instance** (local or cloud like MongoDB Atlas)
  * **Google Cloud Project** with Places API enabled (for maps functionality)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/UjwalAkula/Riseacre_backend.git
    cd Riseacre_backend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```

### Environment Variables

Create a `.env` file in the root directory and add:

```dotenv
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/<database-name>?retryWrites=true&w=majority
SESSION_SECRET=your_super_secret_session_key_here
Maps_API_KEY=your_Maps_api_key_here
```

### Usage

To start the development server:

```bash
npm run dev
```

The server will run at `http://localhost:[YOUR_PORT]`.

### API Endpoints

| Method | Endpoint                            | Description                                        | Authentication Required |
| :----- | :---------------------------------- | :------------------------------------------------- | :---------------------- |
| `POST` | `/api/auth/register`                | Registers a new user account.                      | No                      |
| `POST` | `/api/auth/login`                   | Logs in a user, establishing a session.            | No                      |
| `GET`  | `/api/users/:id`                    | Retrieves a user's profile by ID.                  | No                      |
| `PUT`  | `/api/users/:id`                    | Updates a user's profile.                          | Yes (via session cookie)|
| `GET`  | `/api/listings`                     | Retrieves all property listings.                   | No                      |
| `GET`  | `/api/listings/:id`                 | Retrieves a specific property listing by ID.       | No                      |
| `POST` | `/api/listings`                     | Creates a new property listing.                    | Yes (via session cookie)|
| `PUT`  | `/api/listings/:id`                 | Updates a specific property listing.               | Yes (via session cookie)|
| `DELETE`| `/api/listings/:id`                 | Deletes a specific property listing.               | Yes (via session cookie)|
| `GET`  | `/api/listings/user/:userId`        | Retrieves all listings by a specific user.         | No                      |
| `POST` | `/api/ratings`                      | Submits a new rating/review.                       | Yes (via session cookie)|
| `GET`  | `/api/ratings/:entityId`            | Retrieves ratings for a specific entity (user/listing).| No                      |
| `GET`  | `/api/gmaps/autocomplete`           | Provides location suggestions via Google Maps Autocomplete API. | No                      |

-----

## 🚀 Deployment

The Riseacre Backend is deployed live on **Render** at [https://riseacre.onrender.com](https://riseacre.onrender.com).

-----

## 💡 Inspiration
This project was inspired by the functionality and features commonly found in online real estate platforms like Housing.com.

-----