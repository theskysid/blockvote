# 🚀 Quick Start Guide - MetaMask Integration

## Prerequisites

1. **Install MetaMask**: Download from [metamask.io](https://metamask.io) and create an account
2. **Java 21**: Ensure Java 21 is installed (`java -version`)
3. **Node.js**: Version 14+ required (`node -v`)
4. **Maven**: For backend build (`mvn -v`)

## Installation & Setup

### 1. Start Backend Server

```bash
cd backend
mvn clean install
java -jar target/voting-system-1.0.0.jar
```

**Expected Output**:

```
Started BlockVoteApplication in 4.666 seconds
Tomcat started on port 8080 (http)
Sample Users Initialized:
  Admin - Mobile: 9999999999
  Voter 1 - Mobile: 8888888888
  ...
```

### 2. Start Frontend

```bash
cd frontend
npm install
npm start
```

**Expected Output**:

```
Compiled successfully!
Local: http://localhost:3000
```

## Testing the New Flow

### Scenario 1: New User Registration with MetaMask

**Step 1**: Register New Voter

1. Navigate to `http://localhost:3000`
2. Click **"Register as New Voter"**
3. Enter mobile: `5555555555`
4. Click **"Generate"** for wallet (or enter manually)
5. Click **"Register"**
6. ✅ Success: "Registration successful!"

**Step 2**: Login with OTP

1. Click **"Back to Login"**
2. Enter mobile: `5555555555`
3. Enter OTP: `123456`
4. Click **"Login"**
5. ✅ Redirects to wallet connect page

**Step 3**: Connect MetaMask

1. Page shows: "🔐 Connect Your Wallet"
2. Click **"🦊 Connect MetaMask"**
3. MetaMask popup appears
4. Click **"Next"** → **"Connect"**
5. ✅ Shows: "Connected: 0xABC..."

**Step 4**: Sign Message

1. Page shows: "Please sign the message in MetaMask..."
2. MetaMask popup shows challenge message
3. Click **"Sign"** in MetaMask
4. ✅ Shows: "Verifying signature..."
5. ✅ Success: "Wallet verified successfully!"
6. Auto-redirects to voter dashboard after 2 seconds

**Step 5**: Cast Vote

1. Voter dashboard loads
2. View available candidates
3. Click **"Vote"** on preferred candidate
4. Confirm vote in popup
5. ✅ Vote recorded with your verified wallet!

---

### Scenario 2: Existing User (Already Registered Wallet)

1. Login with mobile: `5555555555`, OTP: `123456`
2. Wallet connect page shows: "Wallet already registered: 0xABC..."
3. ✅ Auto-redirects to dashboard (no need to reconnect)
4. Can vote immediately

---

### Scenario 3: Wallet Mismatch Detection

1. Complete Scenario 1 with MetaMask account A
2. Logout
3. Switch to different MetaMask account B (click MetaMask icon → switch account)
4. Login again with same mobile `5555555555`
5. Try to connect account B
6. ❌ Error: "Wallet mismatch! This mobile is linked to: [Account A]"
7. ✅ Security: Cannot vote with different wallet

---

### Scenario 4: Prevent Duplicate Wallet

1. Register user with mobile `5555555555` and wallet A
2. Logout
3. Register new user with mobile `4444444444`
4. Try to connect same wallet A
5. ❌ Error: "This wallet is already registered to another mobile number"
6. ✅ Security: One wallet = one user enforced

---

## Demo Credentials

| Type    | Mobile     | OTP    | Wallet Status      |
| ------- | ---------- | ------ | ------------------ |
| Admin   | 9999999999 | 123456 | Can skip wallet    |
| Voter 1 | 8888888888 | 123456 | Must verify wallet |
| Voter 2 | 7777777777 | 123456 | Must verify wallet |
| Voter 3 | 6666666666 | 123456 | Must verify wallet |

## Troubleshooting

### Issue: "MetaMask Not Detected"

**Solution**:

- Install MetaMask from [metamask.io](https://metamask.io)
- Refresh page after installation
- Check browser console: `typeof window.ethereum` should not be `undefined`

### Issue: "Signature Verification Failed"

**Possible Causes**:

- Network error during submission
- Nonce expired (request new challenge)
- Signed with wrong account

**Solution**:

- Click "Try Again"
- Ensure correct MetaMask account is selected
- Sign with the account you connected

### Issue: Backend Error - "No active challenge found"

**Cause**: Nonce expired or page was refreshed during signing

**Solution**:

- Navigate back to login
- Complete OTP verification again
- Fresh challenge will be generated

### Issue: Vote Rejected - "Wallet not verified"

**Cause**: Skipped wallet connection or session expired

**Solution**:

- Navigate to `/wallet-connect` manually
- Or logout and login again (will prompt wallet connect)

## Testing with Multiple Wallets

To test wallet mismatch scenarios:

1. **Create 2+ MetaMask accounts**:

   - Click MetaMask icon
   - Click circular icon (top right)
   - Click "Add account" or "Import account"

2. **Switch between accounts**:

   - Click MetaMask icon
   - Click circular icon
   - Select different account

3. **Test scenarios**:
   - Register with Account 1
   - Logout
   - Login
   - Try to connect Account 2
   - ✅ Should be rejected

## API Testing with cURL

### Test Challenge Generation

```bash
curl -X POST http://localhost:8080/auth/wallet-init \
  -H "Content-Type: application/json" \
  -d '{"mobileNumber":"8888888888"}'
```

**Expected Response**:

```json
{
  "success": true,
  "message": "Challenge generated...",
  "data": {
    "message": "BlockVOTE Wallet Verification\n\n...",
    "nonce": "a1b2c3d4...",
    "alreadyRegistered": false
  }
}
```

### Test Vote Submission (Backend Validation)

```bash
curl -X POST http://localhost:8080/voter/vote \
  -H "Content-Type: application/json" \
  -d '{
    "mobileNumber": "8888888888",
    "candidateId": 1,
    "walletAddress": "0xWRONGWALLET"
  }'
```

**Expected Response** (if wallet not verified):

```json
{
  "success": false,
  "message": "Wallet not verified! Please connect and verify your MetaMask wallet."
}
```

## Browser Console Debugging

Open DevTools (F12) and check:

**Check MetaMask**:

```javascript
console.log(typeof window.ethereum); // Should be "object"
console.log(window.ethereum.isMetaMask); // Should be true
```

**Check Session Storage**:

```javascript
console.log(sessionStorage.getItem("walletVerified"));
console.log(sessionStorage.getItem("walletAddress"));
```

**Request Accounts**:

```javascript
window.ethereum
  .request({ method: "eth_requestAccounts" })
  .then((accounts) => console.log("Connected:", accounts[0]));
```

**Sign Message (Manual Test)**:

```javascript
const message = "Test message";
const accounts = await window.ethereum.request({
  method: "eth_requestAccounts",
});
const signature = await window.ethereum.request({
  method: "personal_sign",
  params: [message, accounts[0]],
});
console.log("Signature:", signature);
```

## Database Verification

**Check User Wallet Status**:

```sql
-- H2 Console: http://localhost:8080/h2-console
-- JDBC URL: jdbc:h2:mem:blockvote
-- Username: sa
-- Password: (leave empty)

SELECT
  mobile_number,
  wallet_address,
  registered_wallet_address,
  wallet_verified,
  has_voted
FROM users;
```

**Expected Output**:

```
MOBILE_NUMBER | WALLET_ADDRESS | REGISTERED_WALLET_ADDRESS | WALLET_VERIFIED | HAS_VOTED
8888888888    | 0xVOTER123     | 0x1234abcd...            | true            | false
```

## Next Steps

1. ✅ **Test basic flow**: Register → Login → Connect Wallet → Vote
2. ✅ **Test security**: Try wallet mismatch, duplicate wallet
3. ✅ **Read documentation**: See `METAMASK_INTEGRATION.md` for details
4. ✅ **Customize**: Modify challenge message, add branding
5. ✅ **Deploy**: Follow production deployment guide

## Production Checklist

Before deploying to production:

- [ ] Replace hardcoded OTP with real SMS service
- [ ] Implement nonce TTL (Redis with 5-minute expiry)
- [ ] Add rate limiting on authentication endpoints
- [ ] Enable HTTPS (required for MetaMask)
- [ ] Add logging and monitoring
- [ ] Implement wallet unbinding workflow (admin approval)
- [ ] Add CAPTCHA to prevent bot attacks
- [ ] Conduct security audit
- [ ] Load testing with concurrent users
- [ ] Consider Aadhaar integration (see Future Scope)

## Resources

- **Full Documentation**: `METAMASK_INTEGRATION.md`
- **Project Summary**: `PROJECT_SUMMARY.md`
- **MetaMask Docs**: https://docs.metamask.io
- **Web3j Docs**: https://docs.web3j.io
- **Ethereum Signature Docs**: https://eips.ethereum.org/EIPS/eip-191

---

**Happy Testing! 🎉**

For issues or questions, check the troubleshooting section or review `METAMASK_INTEGRATION.md`.
