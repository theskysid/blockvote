# BlockVOTE - Blockchain-Style Voting System

A simple, locally runnable voting system prototype built with **Spring Boot** (backend) and **React** (frontend) for college-level demonstration purposes.

## 🎯 Project Overview

This is a **basic prototype** that simulates a blockchain-style voting system with:

- OTP-based authentication (hardcoded)
- Role-based access (Admin & Voter)
- Simulated wallet addresses (no real MetaMask)
- One-time voting with duplicate prevention
- Real-time vote counting

## 📋 Tech Stack

### Backend

- **Spring Boot 3.2.0** (Java 17)
- **Spring Data JPA**
- **H2 Database** (in-memory, default)
- **MySQL** (optional, configurable)
- **Maven**

### Frontend

- **React 18**
- **React Router v6**
- **Axios**
- **CSS3**

## 🚀 Quick Start Guide

### Prerequisites

Make sure you have the following installed:

- **Java 17** or higher
- **Node.js 16+** and **npm**
- **Maven 3.6+**
- **MySQL** (optional, if not using H2)

### 1️⃣ Backend Setup

```bash
# Navigate to backend directory
cd backend

# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

**Backend will start on:** `http://localhost:8080`

**H2 Console (optional):** `http://localhost:8080/h2-console`

- JDBC URL: `jdbc:h2:mem:blockvote`
- Username: `sa`
- Password: (leave empty)

### 2️⃣ Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

**Frontend will start on:** `http://localhost:3000`

## 🔐 Login Credentials

All users use the same OTP: **123456**

| Role    | Mobile Number | Wallet Address |
| ------- | ------------- | -------------- |
| Admin   | 9999999999    | 0xADMIN123     |
| Voter 1 | 8888888888    | 0xVOTER123     |
| Voter 2 | 7777777777    | 0xVOTER456     |
| Voter 3 | 6666666666    | 0xVOTER789     |

## 📱 Features

### Admin Features

1. **Login** with mobile + OTP
2. **Create Election**
3. **Add Candidates** (name + party)
4. **Start Election**
5. **Stop Election**
6. **View Live Results** (vote counts, percentages)

### Voter Features

1. **Login** with mobile + OTP
2. **View Candidate List**
3. **Cast Vote** (only once)
4. **Blocked from voting twice**

## 🏗️ Project Structure

```
BlockVOTE/
├── backend/
│   ├── src/main/java/com/blockvote/
│   │   ├── BlockVoteApplication.java
│   │   ├── config/
│   │   │   ├── CorsConfig.java
│   │   │   └── DataInitializer.java
│   │   ├── controller/
│   │   │   ├── AuthController.java
│   │   │   ├── AdminController.java
│   │   │   └── VoterController.java
│   │   ├── dto/
│   │   │   ├── LoginRequest.java
│   │   │   ├── LoginResponse.java
│   │   │   ├── CandidateRequest.java
│   │   │   ├── VoteRequest.java
│   │   │   └── ApiResponse.java
│   │   ├── entity/
│   │   │   ├── User.java
│   │   │   ├── Candidate.java
│   │   │   ├── Vote.java
│   │   │   └── Election.java
│   │   ├── repository/
│   │   │   ├── UserRepository.java
│   │   │   ├── CandidateRepository.java
│   │   │   ├── VoteRepository.java
│   │   │   └── ElectionRepository.java
│   │   └── service/
│   │       ├── AuthService.java
│   │       ├── AdminService.java
│   │       └── VoterService.java
│   ├── src/main/resources/
│   │   └── application.yml
│   └── pom.xml
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js
│   │   │   ├── AdminDashboard.js
│   │   │   └── VoterDashboard.js
│   │   ├── App.js
│   │   ├── index.js
│   │   ├── index.css
│   │   └── api.js
│   └── package.json
│
└── README.md
```

## 🔌 API Endpoints

### Authentication

- `POST /auth/login` - Login with mobile + OTP

### Admin APIs

- `POST /admin/create-election` - Create new election
- `POST /admin/add-candidate` - Add candidate
- `POST /admin/start-election` - Start voting
- `POST /admin/stop-election` - Stop voting
- `GET /admin/results` - Get live results
- `GET /admin/election-status` - Get election status

### Voter APIs

- `GET /voter/candidates` - Get candidate list
- `POST /voter/vote` - Cast vote
- `GET /voter/has-voted/{mobile}` - Check if voted

## 🎬 How to Use

### Admin Workflow

1. Login as admin (9999999999 / 123456)
2. Create an election
3. Add candidates (e.g., "Candidate A" - "Party X")
4. Start the election
5. Monitor live results
6. Stop the election when done

### Voter Workflow

1. Login as voter (8888888888 / 123456)
2. View available candidates
3. Cast your vote (only once allowed)
4. See confirmation message

## ⚙️ Configuration

### Switch to MySQL (Optional)

Edit `backend/src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/blockvote?createDatabaseIfNotExist=true
    driver-class-name: com.mysql.cj.jdbc.Driver
    username: root
    password: your_password

  jpa:
    hibernate:
      ddl-auto: create-drop
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQLDialect
```

Then comment out H2 configuration.

## 🐛 Troubleshooting

### Backend Issues

**Port 8080 already in use:**

```bash
# Change port in application.yml
server:
  port: 8081
```

**Java version mismatch:**

```bash
# Check Java version
java -version

# Should be Java 17 or higher
```

### Frontend Issues

**Port 3000 already in use:**

```bash
# Kill the process or use different port
PORT=3001 npm start
```

**CORS errors:**

- Make sure backend is running on port 8080
- Check CorsConfig.java allows http://localhost:3000

**API connection failed:**

- Verify backend is running: `curl http://localhost:8080/admin/election-status`
- Check api.js has correct base URL

## 📝 Important Notes

1. **This is a PROTOTYPE** - not production-ready
2. **No real blockchain** - simulated functionality
3. **Hardcoded OTP** - for demo purposes only
4. **No security layers** - simplified authentication
5. **In-memory database** - data resets on restart (H2)
6. **No real MetaMask** - wallet addresses are hardcoded

## 🎓 Educational Purpose

This project demonstrates:

- Full-stack development (Spring Boot + React)
- RESTful API design
- Role-based access control
- Database relationships (JPA)
- State management (React hooks)
- Form handling and validation
- CORS configuration
- Basic authentication flow

## 📄 License

This is a college project for educational purposes.

## 👨‍💻 Developer Notes

- Database resets on each restart (H2 in-memory mode)
- Sample users are auto-created on startup
- OTP is hardcoded as "123456" for all users
- Wallet addresses are stored in the User entity
- Vote duplication is prevented at both frontend and backend levels

## 🔮 Future Enhancements (Not Implemented)

- Real SMS OTP integration
- Actual blockchain integration
- Real MetaMask wallet connection
- Enhanced security (JWT tokens)
- Vote encryption
- Audit trail
- Mobile responsive design improvements
- Docker containerization

---

**Happy Voting! 🗳️**
