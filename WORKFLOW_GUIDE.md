# BlockVOTE - Visual Workflow Guide

## 🎯 Complete Application Flow

### 1️⃣ ADMIN WORKFLOW

```
┌─────────────────────────────────────────────────────────┐
│                    ADMIN LOGIN                          │
│  Mobile: 9999999999  |  OTP: 123456                    │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│              ADMIN DASHBOARD                            │
│                                                         │
│  [Create Election] ────────► Creates new election      │
│                               Status: CREATED           │
│                                                         │
│  [Add Candidate] ──────────► Add candidates            │
│   Name: John Doe              (Repeat for multiple)    │
│   Party: Party A                                       │
│                                                         │
│  [Start Election] ─────────► Changes status to ACTIVE  │
│                               Voting now allowed        │
│                                                         │
│  [View Results] ───────────► See live vote counts      │
│   - Total votes                                        │
│   - Vote per candidate                                 │
│   - Percentage breakdown                               │
│                                                         │
│  [Stop Election] ──────────► Changes status to STOPPED │
│                               No more voting            │
│                                                         │
│  [Logout] ─────────────────► Return to login           │
└─────────────────────────────────────────────────────────┘
```

### 2️⃣ VOTER WORKFLOW

```
┌─────────────────────────────────────────────────────────┐
│                   VOTER LOGIN                           │
│  Mobile: 8888888888  |  OTP: 123456                    │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│              VOTER DASHBOARD                            │
│                                                         │
│  Wallet Address: 0xVOTER123                            │
│                                                         │
│  ┌─────────────────────────────────────────┐          │
│  │  Candidate: John Doe                    │          │
│  │  Party: Party A                         │          │
│  │  Current Votes: 5          [Vote]       │          │
│  └─────────────────────────────────────────┘          │
│                                                         │
│  ┌─────────────────────────────────────────┐          │
│  │  Candidate: Jane Smith                  │          │
│  │  Party: Party B                         │          │
│  │  Current Votes: 3          [Vote]       │          │
│  └─────────────────────────────────────────┘          │
│                                                         │
│  Click [Vote] ──────► Confirmation Dialog              │
│                       "Are you sure?"                   │
│                       [Yes] [Cancel]                    │
│                         │                               │
│                         ▼                               │
│                   Vote Recorded                         │
│                   Status: Already Voted                 │
│                   Cannot vote again                     │
│                                                         │
│  [Logout] ─────────────────► Return to login           │
└─────────────────────────────────────────────────────────┘
```

## 🔄 Backend Data Flow

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│              │      │              │      │              │
│  Controller  │─────►│   Service    │─────►│  Repository  │
│              │      │              │      │              │
└──────────────┘      └──────────────┘      └──────────────┘
       │                     │                     │
       │                     │                     │
       ▼                     ▼                     ▼
   REST API          Business Logic          Database
   Endpoints         Validations             H2/MySQL
   (JSON)            Transactions            (Tables)
```

### Request Flow Example: Cast Vote

```
1. Frontend (React)
   POST /voter/vote
   {
     mobileNumber: "8888888888",
     candidateId: 1,
     walletAddress: "0xVOTER123"
   }

   ↓

2. Backend (Controller)
   VoterController.castVote()
   → Receives request
   → Validates input

   ↓

3. Service Layer
   VoterService.castVote()
   → Check election is ACTIVE
   → Verify user exists
   → Verify wallet matches
   → Check if already voted
   → Increment vote count
   → Mark user as voted
   → Record vote

   ↓

4. Repository Layer
   → Update Candidate (voteCount++)
   → Update User (hasVoted = true)
   → Insert Vote record

   ↓

5. Response
   {
     success: true,
     message: "Vote cast successfully",
     data: { vote details }
   }
```

## 📊 Database Relationships

```
┌─────────────────┐
│     USERS       │
├─────────────────┤
│ id              │◄─────┐
│ mobileNumber    │      │
│ role            │      │ One User
│ walletAddress   │      │ can have
│ hasVoted        │      │ One Vote
└─────────────────┘      │
                         │
                    ┌────┴──────────┐
                    │     VOTES     │
                    ├───────────────┤
                    │ id            │
                    │ voterMobile   │
                    │ candidateId   │──►┌─────────────────┐
                    │ walletAddress │   │   CANDIDATES    │
                    │ votedAt       │   ├─────────────────┤
                    └───────────────┘   │ id              │
                                        │ name            │
┌─────────────────┐                    │ party           │
│   ELECTIONS     │                    │ voteCount       │
├─────────────────┤                    └─────────────────┘
│ id              │                         ▲
│ status          │                         │
│ createdAt       │                    Many Votes
│ startedAt       │                    can be for
│ stoppedAt       │                    One Candidate
└─────────────────┘
```

## 🎨 Frontend Component Structure

```
App.js (Main Router)
│
├─► Login.js
│   ├─ Mobile input
│   ├─ OTP input
│   ├─ Login button
│   └─ Credentials display
│
├─► AdminDashboard.js
│   ├─ Header (logout, refresh)
│   ├─ Election status card
│   ├─ Election controls
│   │  ├─ Create election
│   │  ├─ Start election
│   │  └─ Stop election
│   ├─ Add candidate form
│   └─ Results display
│      ├─ Stats cards
│      └─ Results table
│
└─► VoterDashboard.js
    ├─ Header (logout, refresh)
    ├─ Wallet info
    ├─ Vote status alert
    └─ Candidate list
       └─ Candidate cards
          ├─ Name & party
          ├─ Vote count
          └─ Vote button
```

## 🔐 Security Flow (Simplified)

```
┌─────────────┐
│   Login     │
│  Attempt    │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  Validate Mobile    │
│  In Database?       │
└──────┬──────┬───────┘
       │      │
      Yes    No
       │      │
       ▼      ▼
   ┌───────┐  ┌──────┐
   │ Check │  │Error │
   │  OTP  │  └──────┘
   └───┬───┘
       │
       ▼
  Is "123456"?
       │
      Yes
       │
       ▼
┌──────────────┐
│ Store User   │
│ in LocalStr  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Redirect    │
│  by Role     │
└──────┬───────┘
       │
   ┌───┴────┐
   │        │
  ADMIN   VOTER
   │        │
   ▼        ▼
 /admin   /voter
```

## 🚦 Election Status States

```
┌─────────────┐
│   CREATED   │  (Election initialized)
└──────┬──────┘
       │ Admin clicks "Start Election"
       ▼
┌─────────────┐
│   ACTIVE    │  (Voting allowed)
└──────┬──────┘
       │ Admin clicks "Stop Election"
       ▼
┌─────────────┐
│   STOPPED   │  (Voting ended)
└─────────────┘
       │ Admin can create new election
       ▼
   (Back to CREATED)
```

## ⚠️ Vote Prevention Logic

```
Voter Attempts to Vote
         │
         ▼
┌────────────────────┐
│ Check Election     │
│ Status = ACTIVE?   │
└────┬───────┬───────┘
    Yes     No
     │       └──► Error: "Election not active"
     ▼
┌────────────────────┐
│ Check User         │
│ hasVoted flag?     │
└────┬───────┬───────┘
    No      Yes
     │       └──► Error: "Already voted"
     ▼
┌────────────────────┐
│ Check Vote         │
│ record exists?     │
└────┬───────┬───────┘
    No      Yes
     │       └──► Error: "Already voted"
     ▼
┌────────────────────┐
│ Check Wallet       │
│ address matches?   │
└────┬───────┬───────┘
    Yes     No
     │       └──► Error: "Wallet mismatch"
     ▼
┌────────────────────┐
│  ALLOW VOTE        │
│  - Increment count │
│  - Set hasVoted    │
│  - Record vote     │
└────────────────────┘
```

## 📱 UI State Management

```
localStorage
    │
    └─► {
          message: "Login successful",
          role: "ADMIN" | "VOTER",
          mobileNumber: "9999999999",
          walletAddress: "0xADMIN123",
          hasVoted: false
        }
         │
         ├─► Used for authentication
         ├─► Used for role-based routing
         ├─► Used for API requests
         └─► Cleared on logout
```

## 🎯 Testing Scenarios

### Scenario 1: Complete Admin Flow

```
1. Login as Admin (9999999999 / 123456)
2. Create Election → Status: CREATED
3. Add Candidate: "Alice" - "Party X"
4. Add Candidate: "Bob" - "Party Y"
5. Start Election → Status: ACTIVE
6. View Results → 0 votes
7. (Voters vote in parallel)
8. Refresh Results → See updated counts
9. Stop Election → Status: STOPPED
```

### Scenario 2: Complete Voter Flow

```
1. Login as Voter 1 (8888888888 / 123456)
2. View Candidates
3. Click "Vote" on Alice
4. Confirm vote
5. See success message
6. Status shows "Already Voted"
7. Try voting again → Blocked (UI)
8. Logout
9. Login again → Still shows "Already Voted"
```

### Scenario 3: Multiple Voters

```
Terminal 1: Voter 1 votes for Alice
Terminal 2: Voter 2 votes for Bob
Terminal 3: Voter 3 votes for Alice
Terminal 4: Admin views results
Result: Alice: 2, Bob: 1, Total: 3
```

### Scenario 4: Error Handling

```
❌ Try voting without active election → Error
❌ Try voting twice → Error
❌ Use wrong OTP → Error
❌ Use wrong wallet → Error
❌ Start already started election → Error
```

## 🔧 Configuration Points

### Backend (application.yml)

```yaml
server.port: 8080 # Change if port conflict
datasource.url: H2/MySQL # Switch database
cors.origins: 3000 # Frontend URL
```

### Frontend (api.js)

```javascript
API_BASE_URL: localhost: 8080; // Backend URL
```

### Data Initialization (DataInitializer.java)

```java
// Add more users
// Change wallet addresses
// Modify OTP (in AuthService)
```

---

**This visual guide shows the complete flow of the application!** 🎉
