# BlockVOTE Frontend

React frontend for the BlockVOTE voting system.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start
```

App runs on: **http://localhost:3000**

## Features

### Login Page

- Mobile number + OTP authentication
- Auto-redirect based on role

### Admin Dashboard

- Create/Start/Stop elections
- Add candidates
- View live results

### Voter Dashboard

- View candidates
- Cast vote (one-time only)
- Wallet verification

## Sample Credentials

All users use OTP: **123456**

- Admin: 9999999999
- Voter 1: 8888888888
- Voter 2: 7777777777
- Voter 3: 6666666666

## Configuration

Backend API URL is set in `src/api.js`:

```javascript
const API_BASE_URL = "http://localhost:8080";
```

Change this if backend runs on different port.
