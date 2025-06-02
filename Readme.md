
<p align="center">
    <img src="https://raw.githubusercontent.com/PKief/vscode-material-icon-theme/ec559a9f6bfd399b82bb44393651661b08aaf7ba/icons/folder-markdown-open.svg" align="center" width="30%">
</p>
<p align="center"><h1 align="center">RISEACRE_BACKEND</h1></p>
<p align="center">
  <em><code>❯ The robust API powering the Riseacre platform.</code></em>
</p>
<p align="center">
  <img src="https://img.shields.io/github/license/UjwalAkula/Riseacre_backend?style=default&logo=opensourceinitiative&logoColor=white&color=0080ff" alt="license">
  <img src="https://img.shields.io/github/last-commit/UjwalAkula/Riseacre_backend?style=default&logo=git&logoColor=white&color=0080ff" alt="last-commit">
  <img src="https://img.shields.io/github/languages/top/UjwalAkula/Riseacre_backend?style=default&color=0080ff" alt="repo-top-language">
  <img src="https://img.shields.io/github/languages/count/UjwalAkula/Riseacre_backend?style=default&color=0080ff" alt="repo-language-count">
</p>
<p align="center">
  <a href="https://render.com/deploy?repo=https://github.com/UjwalAkula/Riseacre_backend">
    <img src="https://render.com/images/button-deploy-to-render.svg" alt="Deploy to Render">
  </a>
  <a href="https://riseacre.onrender.com">
    <img src="https://img.shields.io/badge/Live%20Demo-Riseacre%20Backend-blue?style=for-the-badge&logo=render&logoColor=white" alt="Live Demo">
  </a>
</p>
<br>

## Table of Contents

- [ Overview](#-overview)
- [ Features](#-features)
- [ Technologies Used](#-technologies-used)
- [ Project Structure](#-project-structure)
  - [ Project Index](#-project-index)
- [ Getting Started](#-getting-started)
  - [ Prerequisites](#-prerequisites)
  - [ Installation](#-installation)
  - [ Environment Variables](#-environment-variables)
  - [ Usage](#-usage)
  - [ API Endpoints](#-api-endpoints)
  - [ Testing](#-testing)
- [ Deployment](#-deployment)
- [ Project Roadmap](#-project-roadmap)
- [ Contributing](#-contributing)
- [ License](#-license)
- [ Acknowledgments](#-acknowledgments)

---

##  Overview

This repository houses the **Riseacre Backend API**, built to serve as the robust and scalable foundation for the Riseacre platform. It handles all core functionalities including user authentication, property listing management, user profiles, ratings, and integrates with mapping services for location-based features. This API is designed to be consumed by a separate frontend application, ensuring a clean separation of concerns and independent deployment.

---

##  Features

The Riseacre Backend provides a comprehensive set of features to support the platform's operations:

* **User Authentication & Session Management:** Secure user registration, login, and robust session management using cookies. Includes middleware for protecting routes, ensuring only authenticated users can access certain resources.
* **Property Listing Management:** Full CRUD (Create, Read, Update, Delete) functionality for property listings, allowing users to add, view, modify, and remove properties.
* **User Profile Management:** APIs for creating, viewing, and updating user profiles, including associated listings and ratings.
* **Ratings & Reviews System:** Functionality to submit and retrieve ratings for properties or users.
* **Location Services Integration:** Utilizes Google Maps AutoComplete API for efficient location input and data.
* **Image Uploads:** Handles storage of property photos or user avatars.
* **Robust Error Handling:** Comprehensive error management to provide meaningful responses.
* **Secure Password Hashing:** Uses `bcrypt` for secure storage of user passwords.

---

## 🛠️ Technologies Used

* **Node.js**: Asynchronous event-driven JavaScript runtime.
* **Express.js**: Fast, unopinionated, minimalist web framework for Node.js.
* **MongoDB**: NoSQL database for flexible data storage.
* **Mongoose**: MongoDB object data modeling (ODM) library for Node.js.
* **Express-session**: Middleware for managing user sessions (server-side sessions).
* **Cookie-parser**: Middleware to parse cookies attached to the client request.
* **Bcrypt**: For hashing passwords securely.
* **CORS**: Middleware to enable Cross-Origin Resource Sharing.
* **Dotenv**: To load environment variables from a `.env` file.
* **Google Maps API**: For location auto-completion (via `GmapsAutoComplete.js`).
* **Multer**: For handling `multipart/form-data`, primarily for file uploads (images).

---

##  Project Structure

```sh
└── Riseacre_backend/
    ├── controllers             # Contains the core logic for handling requests and interacting with models.
    │   ├── Authcontroller.js   # Handles user registration, login, and authentication.
    │   ├── GmapsAutoComplete.js# Logic for Google Maps Places Autocomplete API integration.
    │   ├── ListingController.js# Manages CRUD operations for property listings.
    │   ├── Ratings.js          # Handles logic for user and listing ratings.
    │   └── Usercontroller.js   # Manages user profile operations.
    ├── index.js                # The main entry point of the application, setting up the server and database connection.
    ├── middlewares             # Express middleware functions.
    │   └── Authorization.js    # Middleware for protecting routes with session-based authentication.
    ├── models                  # Defines Mongoose schemas and models for database interactions.
    │   ├── Authmodel.js        # User authentication schema (e.g., email, password).
    │   ├── Listingmodel.js     # Schema for property listings.
    │   └── Usermodel.js        # Schema for user profiles.
    ├── package-lock.json       # Records the exact versions of dependencies.
    ├── package.json            # Project metadata and dependencies.
    ├── routes                  # Defines API routes and links them to controller functions.
    │   ├── Postroutes.js       # Routes related to listing creation and management.
    │   └── Userroutes.js       # Routes for user authentication and profile management.
    └── uploads                 # Directory for storing uploaded files (e.g., property images).
        ├── photo1.jpg          # Example uploaded photo.
        ├── photo2.jpg          # Example uploaded photo.
        ├── photos-....jpg      # Placeholder for dynamically uploaded images.
        └── photos-....jpeg     # Placeholder for dynamically uploaded images.
````

###  Project Index

\<details open\>
  \<summary\>\<b\>\<code\>RISEACRE\_BACKEND/\</code\>\</b\>\</summary\>
  \<details\>     \<summary\>\<b\>**root**\</b\>\</summary\>
    \<blockquote\>
      \<table\>
      \<tr\>
        \<td\>\<b\>\<a href='https://github.com/UjwalAkula/Riseacre\_backend/blob/master/package-lock.json'\>package-lock.json\</a\>\</b\>\</td\>
        \<td\>\<code\>This file is automatically generated for any operation where npm modifies either the `node_modules` tree or `package.json`. It describes the exact dependency tree.\</code\>\</td\>
      \</tr\>
      \<tr\>
        \<td\>\<b\>\<a href='https://github.com/UjwalAkula/Riseacre\_backend/blob/master/index.js'\>index.js\</a\>\</b\>\</td\>
        \<td\>\<code\>The main entry point of the backend application, responsible for setting up the Express server, connecting to the database, and defining global middleware.\</code\>\</td\>
      \</tr\>
      \<tr\>
        \<td\>\<b\>\<a href='https://github.com/UjwalAkula/Riseacre\_backend/blob/master/package.json'\>package.json\</a\>\</b\>\</td\>
        \<td\>\<code\>Contains project metadata (name, version, description) and lists all project dependencies and scripts.\</code\>\</td\>
      \</tr\>
      \</table\>
    \</blockquote\>
  \</details\>
  \<details\>     \<summary\>\<b\>middlewares\</b\>\</summary\>
    \<blockquote\>
      \<table\>
      \<tr\>
        \<td\>\<b\>\<a href='https://github.com/UjwalAkula/Riseacre\_backend/blob/master/middlewares/Authorization.js'\>Authorization.js\</a\>\</b\>\</td\>
        \<td\>\<code\>Middleware function to verify user sessions and protect authenticated routes, ensuring only authorized users can access certain resources.\</code\>\</td\>
      \</tr\>
      \</table\>
    \</blockquote\>
  \</details\>
  \<details\>     \<summary\>\<b\>controllers\</b\>\</summary\>
    \<blockquote\>
      \<table\>
      \<tr\>
        \<td\>\<b\>\<a href='https://github.com/UjwalAkula/Riseacre\_backend/blob/master/controllers/Usercontroller.js'\>Usercontroller.js\</a\>\</b\>\</td\>
        \<td\>\<code\>Manages operations related to user profiles, including fetching user details and updates.\</code\>\</td\>
      \</tr\>
      \<tr\>
        \<td\>\<b\>\<a href='https://github.com/UjwalAkula/Riseacre\_backend/blob/master/controllers/Ratings.js'\>Ratings.js\</a\>\</b\>\</td\>
        \<td\>\<code\>Handles logic for submitting and retrieving ratings for properties or users.\</code\>\</td\>
      \</tr\>
      \<tr\>
        \<td\>\<b\>\<a href='https://github.com/UjwalAkula/Riseacre\_backend/blob/master/controllers/ListingController.js'\>ListingController.js\</a\>\</b\>\</td\>
        \<td\>\<code\>Contains the business logic for creating, reading, updating, and deleting property listings.\</code\>\</td\>
      \</tr\>
      \<tr\>
        \<td\>\<b\>\<a href='https://github.com/UjwalAkula/Riseacre\_backend/blob/master/controllers/GmapsAutoComplete.js'\>GmapsAutoComplete.js\</a\>\</b\>\</td\>
        \<td\>\<code\>Integrates with Google Maps Autocomplete API to provide location suggestions for listings.\</code\>\</td\>
      \</tr\>
      \<tr\>
        \<td\>\<b\>\<a href='https://github.com/UjwalAkula/Riseacre\_backend/blob/master/controllers/Authcontroller.js'\>Authcontroller.js\</a\>\</b\>\</td\>
        \<td\>\<code\>Handles user registration, login, and session management.\</code\>\</td\>
      \</tr\>
      \</table\>
    \</blockquote\>
  \</details\>
  \<details\>     \<summary\>\<b\>models\</b\>\</summary\>
    \<blockquote\>
      \<table\>
      \<tr\>
        \<td\>\<b\>\<a href='https://github.com/UjwalAkula/Riseacre\_backend/blob/master/models/Authmodel.js'\>Authmodel.js\</a\>\</b\>\</td\>
        \<td\>\<code\>Defines the Mongoose schema for user authentication data (e.g., email, password hash).\</code\>\</td\>
      \</tr\>
      \<tr\>
        \<td\>\<b\>\<a href='https://github.com/UjwalAkula/Riseacre\_backend/blob/master/models/Listingmodel.js'\>Listingmodel.js\</a\>\</b\>\</td\>
        \<td\>\<code\>Defines the Mongoose schema for property listings, including fields like title, description, location, price, and images.\</code\>\</td\>
      \</tr\>
      \<tr\>
        \<td\>\<b\>\<a href='https://github.com/UjwalAkula/Riseacre\_backend/blob/master/models/Usermodel.js'\>Usermodel.js\</a\>\</b\>\</td\>
        \<td\>\<code\>Defines the Mongoose schema for user profiles, including fields like name, contact information, and possibly linked listings.\</code\>\</td\>
      \</tr\>
      \</table\>
    \</blockquote\>
  \</details\>
  \<details\>     \<summary\>\<b\>routes\</b\>\</summary\>
    \<blockquote\>
      \<table\>
      \<tr\>
        \<td\>\<b\>\<a href='https://github.com/UjwalAkula/Riseacre\_backend/blob/master/routes/Postroutes.js'\>Postroutes.js\</a\>\</b\>\</td\>
        \<td\>\<code\>Defines the API routes related to property listings, including creating, fetching, updating, and deleting listings.\</code\>\</td\>
      \</tr\>
      \<tr\>
        \<td\>\<b\>\<a href='https://github.com/UjwalAkula/Riseacre\_backend/blob/master/routes/Userroutes.js'\>Userroutes.js\</a\>\</b\>\</td\>
        \<td\>\<code\>Defines the API routes for user authentication (login, register) and user profile management.\</code\>\</td\>
      \</tr\>
      \</table\>
    \</blockquote\>
  \</details\>
\</details\>

-----

##  Getting Started

Follow these instructions to set up and run the Riseacre Backend locally on your machine.

###  Prerequisites

Before you begin, ensure your runtime environment meets the following requirements:

  * **Programming Language:** JavaScript
  * **Node.js**: (LTS version recommended, e.g., 18.x or 20.x)
  * **npm**: (usually comes with Node.js) or **Yarn**
  * **MongoDB Instance**: Either a local installation of MongoDB or a cloud service like [MongoDB Atlas](https://www.mongodb.com/atlas/database) for your database.
  * **Google Cloud Project**: If you plan to use the Google Maps Autocomplete feature, you'll need a Google Cloud project with the Places API enabled and a valid API key.

###  Installation

Install Riseacre\_backend using the following method:

**Build from source:**

1.  **Clone the Riseacre\_backend repository:**

    ```sh
    git clone [https://github.com/UjwalAkula/Riseacre_backend.git](https://github.com/UjwalAkula/Riseacre_backend.git)
    ```

2.  **Navigate to the project directory:**

    ```sh
    cd Riseacre_backend
    ```

3.  **Install the project dependencies:**

    **Using `npm`**   [\<img align="center" src="https://img.shields.io/badge/npm-CB3837.svg?style=default\&logo=npm\&logoColor=white" /\>](https://www.npmjs.com/)

    ```sh
    npm install
    ```

###  Environment Variables

Create a `.env` file in the root directory of the project and add the following environment variables. Replace the placeholder values with your actual credentials.

```dotenv
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/<database-name>?retryWrites=true&w=majority
SESSION_SECRET=your_super_secret_session_key_here
Maps_API_KEY=your_Maps_api_key_here # Required for Gmaps Autocomplete
```

  * **`PORT`**: The port number on which the backend server will run (e.g., `5000`).
  * **`MONGO_URI`**: Your MongoDB connection string. You can obtain this from your MongoDB Atlas dashboard or by setting up a local MongoDB instance.
  * **`SESSION_SECRET`**: A strong, random string used for signing the session cookie. This is crucial for security. You can generate one using an online tool or programmatically.
  * **`Maps_API_KEY`**: Your Google Maps API key with the Places API enabled.

###  Usage

To start the development server:
**Using `npm`**   [\<img align="center" src="https://img.shields.io/badge/npm-CB3837.svg?style=default\&logo=npm\&logoColor=white" /\>](https://www.npmjs.com/)

```sh
npm run dev
```

The server should now be running at `http://localhost:[YOUR_PORT]`.

###  API Endpoints

The Riseacre Backend provides the following RESTful API endpoints:

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

*(Note: API endpoint paths are illustrative and may vary slightly based on your actual routes configuration in `routes/` folder.)*

###  Testing

Run the test suite using the following command:
**Using `npm`**   [\<img align="center" src="https://img.shields.io/badge/npm-CB3837.svg?style=default\&logo=npm\&logoColor=white" /\>](https://www.npmjs.com/)

```sh
npm test
```

*(If you have tests, ensure this command is accurate and provide details on what types of tests are run.)*

-----

## 🚀 Deployment

The Riseacre Backend is currently deployed and live on **Render**.

  * **Live Backend URL:** [https://riseacre.onrender.com](https://www.google.com/url?sa=E&source=gmail&q=https://riseacre.onrender.com)

-----

##  Project Roadmap

  - [X] **User Authentication**: \<strike\>Implement secure user registration and login with session management.\</strike\>
  - [X] **Property Listing CRUD**: \<strike\>Develop APIs for creating, reading, updating, and deleting property listings.\</strike\>
  - [X] **Image Uploads**: \<strike\>Add functionality for uploading and serving property images.\</strike\>
  - [ ] **Advanced Search & Filtering**: Implement more sophisticated search capabilities for listings.
  - [ ] **Real-time Notifications**: Integrate real-time features for user interactions (e.g., new messages, listing updates).
  - [ ] **Admin Dashboard API**: Develop APIs for administrative tasks and data management.
  - [ ] **Payment Integration**: Implement a secure payment gateway for transactions.

-----

##  Contributing

We welcome contributions to the Riseacre Backend\! To contribute:

  - **💬 [Join the Discussions](https://www.google.com/search?q=https://github.com/UjwalAkula/Riseacre_backend/discussions)**: Share your insights, provide feedback, or ask questions.
  - **🐛 [Report Issues](https://www.google.com/search?q=https://github.com/UjwalAkula/Riseacre_backend/issues)**: Submit bugs found or log feature requests for the `Riseacre_backend` project.
  - **💡 [Submit Pull Requests](https://www.google.com/search?q=https://github.com/UjwalAkula/Riseacre_backend/blob/main/CONTRIBUTING.md)**: Review open PRs, and submit your own PRs.

\<details closed\>
\<summary\>Contributing Guidelines\</summary\>

1.  **Fork the Repository**: Start by forking the project repository to your GitHub account.
2.  **Clone Locally**: Clone the forked repository to your local machine using a git client.
    ```sh
    git clone [https://github.com/UjwalAkula/Riseacre_backend.git](https://github.com/UjwalAkula/Riseacre_backend.git)
    ```
3.  **Create a New Branch**: Always work on a new branch, giving it a descriptive name.
    ```sh
    git checkout -b feature/your-new-feature
    ```
4.  **Make Your Changes**: Develop and test your changes locally.
5.  **Commit Your Changes**: Commit with a clear message describing your updates.
    ```sh
    git commit -m 'feat: Implemented new feature X functionality'
    ```
6.  **Push to GitHub**: Push the changes to your forked repository.
    ```sh
    git push origin feature/your-new-feature
    ```
7.  **Submit a Pull Request**: Create a PR against the original project repository's `main` branch. Clearly describe the changes and their motivations.
8.  **Review**: Once your PR is reviewed and approved, it will be merged into the main branch. Congratulations on your contribution\!

\</details\>

\<details closed\>
\<summary\>Contributor Graph\</summary\>
\<br\>
\<p align="left"\>
   \<a href="https://github.com/UjwalAkula/Riseacre\_backend/graphs/contributors"\>
      \<img src="https://contrib.rocks/image?repo=UjwalAkula/Riseacre\_backend"\>
   \</a\>
\</p\>
\</details\>

-----

##  License

This project is protected under the [SELECT-A-LICENSE](https://choosealicense.com/licenses) License. For more details, refer to the [LICENSE](https://www.google.com/search?q=LICENSE) file.

-----

##  Acknowledgments

  - List any resources, contributors, inspiration, etc. here.

-----