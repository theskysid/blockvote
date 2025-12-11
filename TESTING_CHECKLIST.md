# BlockVOTE - Testing Checklist

## 🧪 Complete Testing Guide

Use this checklist to verify all features are working correctly.

---

## ✅ Pre-Testing Setup

- [ ] Java 17+ installed (`java -version`)
- [ ] Node.js 16+ installed (`node -v`)
- [ ] Maven installed (`mvn -v`)
- [ ] Backend started successfully (port 8080)
- [ ] Frontend started successfully (port 3000)
- [ ] No console errors in terminal

---

## 🔐 Authentication Tests

### Test 1: Admin Login ✓

- [ ] Navigate to http://localhost:3000
- [ ] Enter mobile: `9999999999`
- [ ] Enter OTP: `123456`
- [ ] Click "Login"
- [ ] Verify redirect to `/admin`
- [ ] Verify wallet address displayed: `0xADMIN123`

### Test 2: Voter Login ✓

- [ ] Open new incognito/private window
- [ ] Navigate to http://localhost:3000
- [ ] Enter mobile: `8888888888`
- [ ] Enter OTP: `123456`
- [ ] Click "Login"
- [ ] Verify redirect to `/voter`
- [ ] Verify wallet address displayed: `0xVOTER123`

### Test 3: Invalid Login ✓

- [ ] Try mobile: `1111111111` (not in system)
- [ ] OTP: `123456`
- [ ] Verify error: "User not found"
- [ ] Try mobile: `9999999999`
- [ ] OTP: `000000` (wrong OTP)
- [ ] Verify error: "Invalid OTP"

---

## 👨‍💼 Admin Feature Tests

### Test 4: Create Election ✓

- [ ] Login as Admin
- [ ] Click "Create Election"
- [ ] Verify success message
- [ ] Verify status badge shows "CREATED"
- [ ] Verify creation timestamp displayed

### Test 5: Add Candidates ✓

- [ ] Enter name: "Alice Johnson"
- [ ] Enter party: "Democratic Party"
- [ ] Click "Add Candidate"
- [ ] Verify success message
- [ ] Repeat for "Bob Smith" - "Republican Party"
- [ ] Repeat for "Charlie Wilson" - "Independent"
- [ ] Verify all 3 candidates appear in results table

### Test 6: Start Election ✓

- [ ] Click "Start Election"
- [ ] Verify success message
- [ ] Verify status changes to "ACTIVE"
- [ ] Verify started timestamp displayed
- [ ] Try clicking "Start Election" again
- [ ] Verify error (already started)

### Test 7: View Live Results ✓

- [ ] Check results table shows 3 candidates
- [ ] Verify initial vote counts are 0
- [ ] Verify "Total Votes: 0"
- [ ] Click "Refresh" button
- [ ] Verify data reloads

### Test 8: Stop Election ✓

- [ ] Click "Stop Election"
- [ ] Verify success message
- [ ] Verify status changes to "STOPPED"
- [ ] Verify stopped timestamp displayed
- [ ] Try clicking "Stop Election" again
- [ ] Verify error (already stopped)

### Test 9: Create Second Election ✓

- [ ] After stopping first election
- [ ] Click "Create Election" again
- [ ] Verify new election created
- [ ] Verify old candidates still visible
- [ ] Add new candidate if needed

---

## 🗳️ Voter Feature Tests

### Test 10: View Candidates (Inactive Election) ✓

- [ ] Login as Voter (8888888888)
- [ ] Try to vote before admin starts election
- [ ] Verify error: "Election is not active"

### Test 11: Cast First Vote ✓

- [ ] Ensure admin has started election
- [ ] Login as Voter 1 (8888888888)
- [ ] View candidate list
- [ ] Click "Vote" on "Alice Johnson"
- [ ] Verify confirmation dialog appears
- [ ] Click "Yes" to confirm
- [ ] Verify success message
- [ ] Verify "Already Voted" status appears
- [ ] Verify all Vote buttons become disabled

### Test 12: Attempt Duplicate Vote (Same Session) ✓

- [ ] After voting, stay logged in
- [ ] Try clicking any Vote button
- [ ] Verify buttons are disabled
- [ ] Verify "Already Voted" alert visible

### Test 13: Attempt Duplicate Vote (New Session) ✓

- [ ] Logout from Voter 1
- [ ] Login again as Voter 1 (8888888888)
- [ ] Verify "Already Voted" status persists
- [ ] Verify all Vote buttons disabled
- [ ] Try voting anyway (should fail)

### Test 14: Multiple Voters ✓

- [ ] Open 3 different browsers/windows
- [ ] Login as Voter 1 (8888888888) → Vote for Alice
- [ ] Login as Voter 2 (7777777777) → Vote for Bob
- [ ] Login as Voter 3 (6666666666) → Vote for Alice
- [ ] Verify each vote succeeds once

### Test 15: View Updated Vote Counts ✓

- [ ] After 3 votes, login as any voter
- [ ] Click "Refresh"
- [ ] Verify Alice: 2 votes
- [ ] Verify Bob: 1 vote
- [ ] Verify Charlie: 0 votes

### Test 16: Vote After Election Stopped ✓

- [ ] Admin stops election
- [ ] Login as new voter (any unused account)
- [ ] Try to vote
- [ ] Verify error: "Election is not active"

---

## 📊 Results & Reporting Tests

### Test 17: Admin View Results (During Voting) ✓

- [ ] Admin dashboard
- [ ] View results while election is ACTIVE
- [ ] Verify real-time vote counts
- [ ] Click "Refresh" to update
- [ ] Verify percentages calculate correctly

### Test 18: Admin View Final Results ✓

- [ ] After stopping election
- [ ] View final results table
- [ ] Verify total votes count correct
- [ ] Verify percentages sum to 100% (or close)
- [ ] Verify candidate count correct

### Test 19: Results Accuracy ✓

- [ ] Count manual votes cast
- [ ] Compare with total in results
- [ ] Verify each candidate's count
- [ ] Check percentage calculation:
  - Alice: 2/3 = 66.67%
  - Bob: 1/3 = 33.33%
  - Charlie: 0/3 = 0.00%

---

## 🔄 Workflow Integration Tests

### Test 20: Complete Admin-Voter Flow ✓

- [ ] Admin: Create election
- [ ] Admin: Add 2 candidates
- [ ] Admin: Start election
- [ ] Voter 1: Cast vote
- [ ] Admin: Check results (1 vote)
- [ ] Voter 2: Cast vote
- [ ] Admin: Check results (2 votes)
- [ ] Admin: Stop election
- [ ] Voter 3: Try to vote (should fail)

### Test 21: Parallel Voting ✓

- [ ] Admin: Start election with 3 candidates
- [ ] Open 3 voter windows simultaneously
- [ ] All 3 voters vote at the same time
- [ ] Verify all votes recorded
- [ ] Verify no votes lost
- [ ] Verify total count = 3

---

## 🚨 Error Handling Tests

### Test 22: Backend Down ✓

- [ ] Stop backend server
- [ ] Try to login
- [ ] Verify connection error shown
- [ ] Try to vote
- [ ] Verify error message

### Test 23: Invalid Data ✓

- [ ] Admin: Try adding candidate with empty name
- [ ] Verify validation error
- [ ] Admin: Try adding candidate with empty party
- [ ] Verify validation error

### Test 24: Session Persistence ✓

- [ ] Login as voter
- [ ] Refresh page (F5)
- [ ] Verify still logged in
- [ ] Close tab and reopen
- [ ] Navigate to /voter
- [ ] Verify redirects to login (session lost)

---

## 🔧 Technical Tests

### Test 25: Database Persistence (H2) ✓

- [ ] Admin: Create election and add candidates
- [ ] Note the data
- [ ] Restart backend server
- [ ] Login as admin
- [ ] Verify data is reset (H2 in-memory)
- [ ] Data should be empty

### Test 26: API Direct Testing ✓

Using curl or Postman:

```bash
# Login
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"mobileNumber":"9999999999","otp":"123456"}'

# Get candidates
curl http://localhost:8080/voter/candidates

# Get results
curl http://localhost:8080/admin/results
```

### Test 27: CORS ✓

- [ ] Verify frontend (3000) can call backend (8080)
- [ ] No CORS errors in browser console
- [ ] Check network tab for successful requests

### Test 28: H2 Console ✓

- [ ] Navigate to http://localhost:8080/h2-console
- [ ] Use credentials: sa / (empty)
- [ ] JDBC URL: `jdbc:h2:mem:blockvote`
- [ ] Click "Connect"
- [ ] Query users: `SELECT * FROM USERS`
- [ ] Query votes: `SELECT * FROM VOTES`
- [ ] Verify data matches application

---

## 🎨 UI/UX Tests

### Test 29: Responsive Design ✓

- [ ] Resize browser window
- [ ] Check mobile view (350px width)
- [ ] Check tablet view (768px width)
- [ ] Check desktop view (1920px width)
- [ ] Verify elements don't overlap

### Test 30: Visual Feedback ✓

- [ ] Verify success messages appear (green)
- [ ] Verify error messages appear (red)
- [ ] Verify loading states on buttons
- [ ] Verify disabled states visible
- [ ] Verify hover effects work

### Test 31: User Experience ✓

- [ ] Login credentials clearly displayed
- [ ] Wallet address visible to users
- [ ] Election status clearly indicated
- [ ] Vote counts update properly
- [ ] Confirmation dialog for voting
- [ ] Logout works correctly

---

## 🔒 Security Tests (Basic)

### Test 32: Wallet Verification ✓

- [ ] Login as Voter 1
- [ ] Note wallet: 0xVOTER123
- [ ] Try manually sending vote with wrong wallet
- [ ] Verify error: "Wallet address does not match"

### Test 33: Role Protection ✓

- [ ] Login as voter
- [ ] Try accessing `/admin` directly
- [ ] Verify redirect (if implemented)
- [ ] Try admin API as voter
- [ ] Verify appropriate response

### Test 34: Vote Integrity ✓

- [ ] Cast 3 votes
- [ ] Check database via H2 console
- [ ] Verify 3 vote records exist
- [ ] Verify voter mobile numbers recorded
- [ ] Verify timestamps recorded

---

## 📈 Performance Tests (Basic)

### Test 35: Multiple Simultaneous Users ✓

- [ ] Open 5 browser windows
- [ ] Login as 4 voters + 1 admin
- [ ] All vote simultaneously
- [ ] Admin refreshes results rapidly
- [ ] Verify no errors
- [ ] Verify all votes counted

### Test 36: Rapid Operations ✓

- [ ] Admin: Create election
- [ ] Immediately start election
- [ ] Voter: Vote immediately
- [ ] Admin: Stop immediately
- [ ] Verify all operations succeed

---

## 🐛 Edge Case Tests

### Test 37: Empty Candidate List ✓

- [ ] Admin: Start election with no candidates
- [ ] Voter: Try to view candidates
- [ ] Verify empty state message
- [ ] Verify no errors

### Test 38: Zero Votes ✓

- [ ] Admin: Start and stop election
- [ ] No voters participate
- [ ] View results
- [ ] Verify shows 0 votes
- [ ] Verify percentages show 0%

### Test 39: All Vote Same Candidate ✓

- [ ] 3 voters all vote for Alice
- [ ] Verify Alice: 3 votes (100%)
- [ ] Verify others: 0 votes (0%)

### Test 40: Browser Compatibility ✓

- [ ] Test on Chrome
- [ ] Test on Firefox
- [ ] Test on Safari (Mac)
- [ ] Test on Edge
- [ ] Verify all features work

---

## 📋 Summary Checklist

### Core Functionality

- [ ] Authentication works (4 users)
- [ ] Admin can manage elections
- [ ] Admin can add candidates
- [ ] Voters can view candidates
- [ ] Voters can cast votes (once)
- [ ] Results display correctly
- [ ] Logout works

### Security & Validation

- [ ] OTP validation works
- [ ] Duplicate vote prevention works
- [ ] Wallet verification works
- [ ] Election status checked
- [ ] Error messages shown

### Data Integrity

- [ ] Vote counts accurate
- [ ] Percentages calculate correctly
- [ ] Database records match UI
- [ ] No duplicate votes in DB

### User Experience

- [ ] UI is intuitive
- [ ] Messages are clear
- [ ] Buttons work correctly
- [ ] Navigation works
- [ ] No broken links

---

## 🎯 Final Verification

After completing all tests:

- [ ] All 40 tests passed
- [ ] No console errors
- [ ] No broken features
- [ ] Documentation matches behavior
- [ ] Ready for demonstration

---

## 📝 Test Results Template

```
Test Date: _______________
Tester Name: _____________

Passed: ____ / 40
Failed: ____ / 40

Failed Tests:
1. Test #__ - _______________ (Reason: _______)
2. Test #__ - _______________ (Reason: _______)

Notes:
_________________________________
_________________________________
```

---

**Complete this checklist to ensure BlockVOTE is fully functional!** ✅
