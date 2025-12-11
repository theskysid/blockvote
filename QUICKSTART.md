# BlockVOTE - Quick Start Guide

## Prerequisites Check

```bash
# Check Java (needs 17+)
java -version

# Check Node.js (needs 16+)
node -v

# Check Maven
mvn -v
```

## Option 1: Automated Start (Linux/Mac)

```bash
# Make script executable
chmod +x start.sh

# Run
./start.sh
```

## Option 2: Manual Start

### Terminal 1 - Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### Terminal 2 - Frontend

```bash
cd frontend
npm install
npm start
```

## Access Points

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8080
- **H2 Console**: http://localhost:8080/h2-console

## Login Credentials

All users use OTP: `123456`

| Role  | Mobile     |
| ----- | ---------- |
| Admin | 9999999999 |
| Voter | 8888888888 |
| Voter | 7777777777 |
| Voter | 6666666666 |

## Testing the Application

### As Admin:

1. Login with `9999999999` / `123456`
2. Click "Create Election"
3. Add candidates (e.g., "John Doe" - "Party A")
4. Click "Start Election"
5. View live results

### As Voter:

1. Login with `8888888888` / `123456`
2. View candidate list
3. Click "Vote" on your choice
4. Confirm vote
5. See success message

## Troubleshooting

### Backend won't start

```bash
# Kill process on port 8080
sudo lsof -ti:8080 | xargs kill -9

# Or change port in application.yml
```

### Frontend won't start

```bash
# Kill process on port 3000
sudo lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm start
```

### Database issues

- Delete `backend/target` folder
- Restart backend
- Check H2 console

## Common Issues

**"User not found"**: Make sure backend started and initialized users

**CORS errors**: Ensure backend is on port 8080 and frontend on 3000

**OTP invalid**: Use `123456` for all users

**Can't vote twice**: This is intentional - each voter can only vote once
