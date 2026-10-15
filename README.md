# ProductHub — React SPA

## Project Overview
ProductHub is a responsive product management application built with React and React Router. It communicates with a REST API using the Fetch API.

## Features
- View products
- Add new products
- Edit existing products
- Delete products
- Search products by name or category
- Client-side routing
- Loading and error states

## Tech Stack
- React
- Vite
- React Router DOM
- JavaScript
- CSS
- Fetch API
- Node.js and Express REST API
- MongoDB

## Setup Instructions

1. Install Node.js and MongoDB.
2. Start the ProductHub backend and confirm that the API is available at `http://localhost:5000`.
3. Open this frontend folder in a terminal.
4. Install dependencies:

   `npm install`

5. Start the development server:

   `npm run dev`

6. Open the local URL shown in the terminal, normally `http://localhost:5173`.

## API Configuration
The frontend expects the API base URL to be `http://localhost:5000/api` by default. You can configure it using a `.env` file in the frontend root:

`VITE_API_URL=http://localhost:5000/api`

Restart Vite after changing environment variables.

## Testing
Verify product listing, creation, editing, deletion, search, loading states, and error handling against a running backend and MongoDB instance.



## Project Links
- GitHub Repository: Add your repository URL
- Live Demo: Add your deployed frontend URL, if available
