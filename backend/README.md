# BlockVOTE Backend

Spring Boot backend for the BlockVOTE voting system.

## Quick Start

```bash
# Build
mvn clean install

# Run
mvn spring-boot:run
```

Server runs on: **http://localhost:8080**

## Sample Users (Auto-created)

| Role  | Mobile     | OTP    | Wallet     |
| ----- | ---------- | ------ | ---------- |
| Admin | 9999999999 | 123456 | 0xADMIN123 |
| Voter | 8888888888 | 123456 | 0xVOTER123 |
| Voter | 7777777777 | 123456 | 0xVOTER456 |
| Voter | 6666666666 | 123456 | 0xVOTER789 |

## H2 Console

Access at: **http://localhost:8080/h2-console**

- JDBC URL: `jdbc:h2:mem:blockvote`
- Username: `sa`
- Password: (empty)

## API Documentation

### Auth

- `POST /auth/login` - Login

### Admin

- `POST /admin/create-election` - Create election
- `POST /admin/add-candidate` - Add candidate
- `POST /admin/start-election` - Start voting
- `POST /admin/stop-election` - Stop voting
- `GET /admin/results` - View results
- `GET /admin/election-status` - Check status

### Voter

- `GET /voter/candidates` - List candidates
- `POST /voter/vote` - Cast vote
- `GET /voter/has-voted/{mobile}` - Check vote status
