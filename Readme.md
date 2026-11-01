
# RISEACRE\_BACKEND

---

## Overview

This repository contains the **Riseacre Backend API** for user authentication, property listing management, user profiles, a calculated location convenience index, and location autocomplete. It is consumed by the Riseacre frontend.

---

## Features

* **User Authentication & Session Management:** Secure user registration, login, and session management using cookies.
* **Property Listing Management:** Full CRUD (Create, Read, Update, Delete) functionality for property listings.
* **Location Convenience Index:** A versioned score derived from lister-entered distances to public transit and daily services. Riseacre does not currently have a user-submitted review system.
* **Location Services Integration:** Uses Google Maps Autocomplete API for location input.
* **Image Uploads:** Handles storage of property photos.
* **Secure Password Hashing:** Uses `bcrypt` for password security.

---

## 🛠️ Technologies Used

* **Node.js**
* **Express.js**
* **MongoDB** (with Mongoose)
* **Bcrypt**
* **CORS**
* **Dotenv**
* **Google Maps API**
* **Multer**

## Location Convenience Index v1.0

The index is a consistent comparison aid, not an independent certification or a safety, quality, or value guarantee. Distances are entered by the listing author and are not verified by the calculation. A score is shown only when metro, bus, and railway distances plus at least one school or hospital distance are present. Coverage is 80% when one daily-service distance is present and 100% when both are present.

The transit subscore is the mean of metro, bus, and railway scores. The daily-needs subscore is the mean of the provided school and hospital scores. The final score is `transit × 0.60 + daily needs × 0.40`, rounded to one decimal. Airport distance is excluded because it is not a day-to-day convenience measure. Each distance is scored on fixed monotonic bands:

| Distance factor | Score 5 | Score 4 | Score 3 | Score 2 | Score 1 |
| --- | ---: | ---: | ---: | ---: | ---: |
| Metro | ≤1 km | ≤3 km | ≤5 km | ≤10 km | >10 km |
| Bus station | ≤0.5 km | ≤1 km | ≤3 km | ≤5 km | >5 km |
| Railway station | ≤2 km | ≤5 km | ≤10 km | ≤20 km | >20 km |
| School or hospital | ≤1 km | ≤3 km | ≤5 km | ≤10 km | >10 km |

The version is stored with the calculated score so a future methodology change can be identified. The thresholds are Riseacre's published scoring rules; they have not been externally certified or empirically calibrated against travel-time outcomes.

---

## Getting Started

Follow these instructions to set up and run the backend locally.

### Prerequisites

* **Node.js** (LTS recommended)
* **npm**
* **MongoDB Instance** (local or cloud like MongoDB Atlas)
* **Google Cloud Project** with Places API enabled (for maps functionality)

### Installation

To set up the project:

1.  **Obtain the source code:** Get a copy of this repository on your local machine.
2.  **Navigate to the project directory:**
    ```bash
    cd Riseacre_backend
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```

### Environment Variables

Create a `.env` file in the backend directory and configure:

```dotenv
PORT=4000
MONGODB_URL=mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/<database-name>?retryWrites=true&w=majority
FIREBASE_CONFIG_JSON={"type":"service_account", ...}
MAPS_API_KEY=your_geoapify_api_key
CORS_ORIGINS=https://riseacre.vercel.app,http://localhost:5173
UPLOADS_DIR=./uploads
GMAIL_USER=your-gmail-address@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
FRONTEND_URL=https://riseacre.vercel.app
```

`MONGO_URI` and `gmaps_api_key` are also accepted as legacy aliases. Never commit real credentials.

For owner enquiry emails, set `GMAIL_USER` and `GMAIL_APP_PASSWORD` in the backend environment. The Gmail account must have 2-Step Verification enabled to create an App Password. Keep the App Password server-side and never commit it. The app sends enquiries from that Gmail account and sets the seeker's email as the reply-to address. If these settings are absent or delivery fails, the lead is still recorded and the UI offers the owner's phone call link.

### Usage

To start the development server:

```bash
npm run dev
```

The server will run at `http://localhost:[YOUR_PORT]`.

### API Endpoints

| Method | Endpoint | Description | Authentication Required |
| :----- | :---------------------------------- | :------------------------------------------------- | :---------------------- |
| `POST` | `/api/auth/register` | Registers a new user account. | No |
| `POST` | `/api/auth/login` | Logs in a user, establishing a session. | No |
| `GET` | `/api/users/:id` | Retrieves a user's profile by ID. | No |
| `PUT` | `/api/users/:id` | Updates a user's profile. | Yes (via session cookie) |
| `GET` | `/api/listings` | Retrieves all property listings. | No |
| `GET` | `/api/listings/:id` | Retrieves a specific property listing by ID. | No |
| `POST` | `/api/listings` | Creates a new property listing. | Yes (via session cookie) |
| `PUT` | `/api/listings/:id` | Updates a specific property listing. | Yes (via session cookie) |
| `DELETE`| `/api/listings/:id` | Deletes a specific property listing. | Yes (via session cookie) |
| `GET` | `/api/listings/user/:userId` | Retrieves all listings by a specific user. | No |
| `GET` | `/api/gmaps/autocomplete` | Provides location suggestions via Google Maps Autocomplete API. | No |

---

## 🚀 Deployment

The Riseacre Backend is deployed live on **Render** at [https://riseacre.onrender.com](https://riseacre.onrender.com).

### Persistent listing photos

Configure a Render persistent disk mounted at `/var/data` and set `UPLOADS_DIR=/var/data/uploads` in the backend service environment. The API creates the upload folder when needed. Production startup fails if `UPLOADS_DIR` is missing, because Render's deploy filesystem is ephemeral and would otherwise lose uploaded photos on redeploy.

---

## 💡 Inspiration

This project was conceived to address the common challenges and needs within the online real estate market, aiming to provide a streamlined solution for property listing and discovery.

---
