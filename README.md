# URL Shortener Project

A simple URL shortener application with backend API and React frontend.

## Project Structure

- `logging-middleware/` - Reusable logging package
- `backend-submission/` - Express.js backend API
- `frontend-submission/` - React frontend with Material UI

## Setup Instructions

### Backend
```bash
cd backend-submission
npm install
npm start
```
Server runs on http://localhost:8080

### Frontend
```bash
cd frontend-submission
npm install
npm run dev
```
App runs on http://localhost:3000

## Features

- Shorten URLs with custom validity periods
- Optional custom shortcodes
- URL redirection
- Basic click statistics
- Responsive React UI with Material UI

## API Endpoints

- `POST /shorturls` - Create short URL
- `GET /shorturls/:shortcode` - Get URL statistics
- `GET /:shortcode` - Redirect to original URL
