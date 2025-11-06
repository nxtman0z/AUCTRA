# 🧪 Profile & KYC System Testing Guide

## Prerequisites
- ✅ Backend server running on http://localhost:5000
- ✅ Frontend server running on http://localhost:3000
- ✅ MongoDB connected
- ✅ MetaMask wallet installed

---

## 🔄 Testing Workflow

### 1. Start Backend Server
```bash
cd d:\AUCTRA1\backend
npm start
```
Expected output: `Server running on port 5000` and `MongoDB connected`

### 2. Start Frontend Server
```bash
cd d:\AUCTRA1\frontend
npm start
```
Expected output: Frontend opens at http://localhost:3000

---

## 📋 Test Cases

### ✅ Test 1: User Signup & Login
1. Go to http://localhost:3000
2. Click "Sign Up"
3. Create new user account
4. Login with credentials
5. **Expected**: User dashboard loads with header

### ✅ Test 2: Access Profile Page
1. After login, click profile dropdown (top right)
2. Click "My Profile"
3. **Expected**: Profile page opens at `/profile`
4. **Verify**: 
   - Profile form is visible
   - Fields: Full Name, Email, Phone, Address, City, State, Pincode, Country
   - Profile picture placeholder visible
   - KYC status card shows "pending"
   - "Complete KYC" button visible
   - "Apply for Admin Role" button visible

### ✅ Test 3: Update Profile
1. Fill in the profile form:
   - Full Name: "Test User"
   - Phone: "9876543210" (10 digits)
   - Address: "123 Test Street"
   - City: "Mumbai"
   - State: "Maharashtra"
   - Pincode: "400001" (6 digits)
   - Country: "India" (default)
2. Click "Save Profile"
3. **Expected**: "Profile updated successfully!" message
4. **Verify**: Refresh page, data should persist

### ✅ Test 4: Navigate to KYC Page
1. From profile page, click "Complete KYC" button OR
2. From header dropdown, click "KYC Verification"
3. **Expected**: KYC page opens at `/profile/kyc`
4. **Verify**:
   - Aadhaar input field visible
   - PAN input field visible
   - 4 file upload sections visible
   - Submit button visible

### ✅ Test 5: Submit KYC Documents
1. Enter Aadhaar number: "123456789012" (12 digits)
2. Enter PAN number: "ABCDE1234F" (10 characters, uppercase)
3. Upload 4 images:
   - Aadhaar Front: Any image < 5MB
   - Aadhaar Back: Any image < 5MB
   - PAN Card: Any image < 5MB
   - Selfie: Any image < 5MB
4. Click "Submit KYC"
5. **Expected**: 
   - "KYC submitted successfully!" message
   - Auto-redirect to profile page after 2 seconds
6. **Verify**: 
   - Profile page shows KYC status as "submitted" (blue badge)

### ✅ Test 6: Try to Create Auction (Before KYC Approval)
1. Click "Create Auction" from header
2. **Expected**: 
   - Warning page appears
   - Message: "KYC Verification Required"
   - Status badge shows "Under Review"
   - Button: "View KYC Status"
   - Cannot access auction creation form

### ✅ Test 7: Admin Login
1. Logout from user account
2. Go to login page
3. Click "Admin Login" tab
4. Enter username and admin key: "obito"
5. **Expected**: Admin dashboard loads

### ✅ Test 8: Admin Approve KYC (via API)
Since admin UI for KYC approval is not yet built, test via API:

#### Using Postman/Thunder Client:
```
GET http://localhost:5000/api/users/kyc-pending
Headers:
  Authorization: Bearer <admin_jwt_token>

Response should show users with KYC status "submitted"
```

Copy the user `_id` from response, then:
```
PUT http://localhost:5000/api/users/<user_id>/kyc-review
Headers:
  Authorization: Bearer <admin_jwt_token>
Body (JSON):
{
  "status": "approved"
}

Response: "KYC approved successfully"
```

### ✅ Test 9: Create Auction (After KYC Approval)
1. Logout from admin
2. Login as the user whose KYC was approved
3. Click "Create Auction" from header
4. **Expected**: 
   - Auction creation form loads normally
   - No KYC warning
   - Can fill and submit auction

### ✅ Test 10: Apply for Admin Role
1. Go to profile page
2. Scroll to bottom
3. Click "Apply for Admin Role" button
4. **Expected**: 
   - Success message: "Admin role application submitted"
   - Button changes to "Application Pending"
5. **Verify via API**:
   ```
   GET http://localhost:5000/api/users/admin-applications
   Headers:
     Authorization: Bearer <admin_jwt_token>
   
   Should show the application
   ```

### ✅ Test 11: Reject KYC (Edge Case)
Test rejection flow:
```
PUT http://localhost:5000/api/users/<user_id>/kyc-review
Headers:
  Authorization: Bearer <admin_jwt_token>
Body:
{
  "status": "rejected",
  "rejectionReason": "Documents not clear"
}
```

Then login as user and check:
- Profile shows KYC status as "rejected" (red badge)
- Rejection reason visible
- Can resubmit KYC

---

## 🔍 What to Check

### Profile Page (`/profile`)
- ✅ All form fields visible
- ✅ Form validation works (phone 10 digits, pincode 6 digits)
- ✅ Profile picture upload area visible
- ✅ KYC status card with correct color:
  - Yellow: Pending
  - Blue: Submitted
  - Green: Approved
  - Red: Rejected
- ✅ Buttons work correctly
- ✅ Success/error messages appear
- ✅ Black background with dark theme

### KYC Page (`/profile/kyc`)
- ✅ Input validation:
  - Aadhaar: Exactly 12 digits
  - PAN: Exactly 10 characters, uppercase
- ✅ File upload preview works
- ✅ 5MB file size validation
- ✅ Status-based UI (different content for different statuses)
- ✅ Form submission works
- ✅ Auto-redirect after submission
- ✅ Black background with dark theme

### Create Auction Page (`/create-auction`)
- ✅ KYC check on page load
- ✅ Shows warning if KYC not approved
- ✅ Shows form if KYC approved
- ✅ Auto-redirect to KYC page when needed

### Backend API
- ✅ All endpoints return proper JSON
- ✅ JWT authentication works
- ✅ Data saves to MongoDB
- ✅ Validation errors return proper messages
- ✅ Admin-only endpoints are protected

---

## 🐛 Common Issues & Solutions

### Issue 1: "Failed to fetch" error
**Solution**: Make sure backend server is running on port 5000

### Issue 2: JWT token errors
**Solution**: 
1. Clear localStorage
2. Logout and login again
3. Check if token is being sent in headers

### Issue 3: KYC status not updating
**Solution**: 
1. Check MongoDB - verify kyc.status field
2. Make sure you're using the correct user ID
3. Clear browser cache

### Issue 4: File upload not working
**Solution**: Currently files are stored as placeholder paths. For real file upload:
1. Install multer: `npm install multer`
2. Configure multer in backend
3. Update endpoints to handle multipart/form-data

### Issue 5: Admin endpoints returning 403
**Solution**: 
1. Make sure you're logged in as admin
2. Check JWT token has role: "admin"
3. Verify restrictTo middleware is working

---

## 📊 Database Verification

### Check User Profile in MongoDB:
```javascript
db.users.findOne({ email: "test@example.com" })
```

Should show:
```json
{
  "_id": "...",
  "username": "testuser",
  "email": "test@example.com",
  "profile": {
    "fullName": "Test User",
    "phone": "9876543210",
    "address": "123 Test Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "country": "India"
  },
  "kyc": {
    "status": "approved",
    "aadhaarNumber": "123456789012",
    "panNumber": "ABCDE1234F",
    "submittedAt": "2024-01-01T00:00:00.000Z",
    "reviewedAt": "2024-01-01T01:00:00.000Z",
    "reviewedBy": "admin_user_id"
  },
  "adminApplication": {
    "status": "pending",
    "appliedAt": "2024-01-01T02:00:00.000Z"
  }
}
```

---

## ✅ Success Criteria

All tests pass if:
1. ✅ User can update profile successfully
2. ✅ User can submit KYC documents
3. ✅ KYC status displays correctly
4. ✅ Auction creation is blocked until KYC approved
5. ✅ Admin can approve/reject KYC via API
6. ✅ After KYC approval, user can create auctions
7. ✅ User can apply for admin role
8. ✅ All pages have consistent dark theme
9. ✅ All API endpoints work correctly
10. ✅ Data persists in MongoDB

---

## 🎯 Quick Test Sequence

### Express Testing (5 minutes):
1. Signup → Login → Profile
2. Fill profile → Save
3. KYC page → Fill KYC → Submit
4. Try Create Auction → See warning
5. Admin API approve KYC
6. Try Create Auction → Success

**If all these work, system is ready! 🚀**
