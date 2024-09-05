# Product Discovery Platform - resource fyi

Welcome to the **Product Discovery Platform Backend**. This is the server-side part of a web application inspired by [Product Hunt](https://www.producthunt.com), where users can submit, vote, and comment on products.

## Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

## Features

- **User Authentication**: Secure user registration and login using JWT.
- **Product Management**: CRUD operations for product creation, retrieval, updating, and deletion.
- **Voting System**: Users can upvote products.
- **Comments**: Users can post comments on products.
- **Payment Integration**: Payment processing using SSLCommerz.

## Technologies

- **Node.js**: JavaScript runtime for building the backend.
- **Express.js**: Web framework for Node.js.
- **MongoDB**: NoSQL database for storing user and product data.
- **Mongoose**: ODM library for MongoDB and Node.js.
- **JWT (JSON Web Tokens)**: For secure authentication.
- **SSLCommerz**: Payment gateway integration.
- **dotenv**: For environment variable management.

## Installation

### Prerequisites

- Node.js
- MongoDB (Local or MongoDB Atlas)
- Git

### Clone the Repository

```bash
git clone https://github.com/Khalid09dev/Product-Hunt-Server.git
cd Product-Hunt-Server
