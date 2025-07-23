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

## Screenshots 

- Backend
  <img width="1920" height="982" alt="image" src="https://github.com/user-attachments/assets/f1cfc9f7-ccd5-4b9e-99e7-8b2fb685ee94" />
  <img width="1920" height="979" alt="image" src="https://github.com/user-attachments/assets/5e7de3ab-6a52-48f1-a0bc-edf4d57b3b6c" />
  <img width="1920" height="1033" alt="image" src="https://github.com/user-attachments/assets/120de746-666e-409e-b518-b29a2b2761c7" />

- Frontend
  <img width="1920" height="977" alt="image" src="https://github.com/user-attachments/assets/01df0e2e-d317-4890-93b3-53d93474d53d" />
  <img width="1920" height="1038" alt="image" src="https://github.com/user-attachments/assets/655be881-4159-4a59-8f9d-d6da7927a61f" />
  <img width="1920" height="991" alt="image" src="https://github.com/user-attachments/assets/306e607b-b97a-4639-be4f-cad1bc95f681" />




