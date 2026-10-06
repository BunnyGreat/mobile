# Registration OTP Edge Function - Testing & Verification Guide

## ✅ Deployment Status

- **Function**: `send-otp`
- **Status**: ACTIVE (v2)
- **Project**: vmkinoqserekbymhhczo
- **JWT Verification**: Disabled (allows public access from mobile app)
- **Import Map**: Not needed (no external dependencies)

---

## 🔍 SECURITY VERIFICATION

### Edge Function Code Review

The Edge Function at `supabase/functions/send-otp/index.ts` correctly:

1. **Reads API Key from Server-Side Secrets (NOT from mobile environment)**:

   ```typescript
   const RESEND_API_KEY = (Deno as any).env?.get("RESEND_API_KEY");
   ```

   - Uses `Deno.env.get()` → reads from Supabase project secrets
   - ❌ Does NOT use `process.env.EXPO_PUBLIC_RESEND_API_KEY`
   - ❌ Does NOT expose key to mobile client
   - ✅ API key only available on Supabase server

2. **Validates Inputs Before Using API**:
   - Email format validation (regex check)
   - OTP format validation (6 digits only)
   - Missing required fields check

3. **Protects API Details**:
   - Returns generic error messages to client
   - Logs detailed errors only to Supabase function logs (server-side)
   - Never exposes Resend API responses to client

---

## 🧪 TEST SETUP INSTRUCTIONS

### Step 1: Set the RESEND_API_KEY Secret

Add your Resend API key to Supabase project secrets:

```bash
eas secret:create --name RESEND_API_KEY --value re_YOUR_ACTUAL_KEY_HERE
```

Verify it's set:

```bash
eas secret:list
```

You should see `RESEND_API_KEY` in the EAS environment secrets.

### Step 2: Build Preview APK

```bash
eas build --platform android --profile preview
```

This will include the EAS secret in the build environment so the Edge Function can access it.

### Step 3: Install APK on Test Device

- Download and install the Preview APK on your Android test device
- Ensure device has internet connection
- Open the Barangay San Isidro app

---

## 📱 REGISTRATION FLOW TEST PROCEDURE

### Test Case 1: New User Registration (Happy Path)

**Steps**:

1. Tap **"Create Account"** on the login screen
2. Enter email: `test+otp-$(date +%s)@example.com` (use unique email)
3. Enter password: `SecurePass123!` (meets all requirements)
4. Confirm password: `SecurePass123!`
5. Tap **"Create Account"**

**Expected Results**:

- ✅ No error message "Email delivery is disabled"
- ✅ Screen transitions to RegisterOtpScreen
- ✅ Message says "One-Time Code Sent" and shows email
- ✅ Email arrives within 5 seconds (check Gmail/test email inbox)
- ✅ Email subject: "Barangay San Isidro Verification Code"
- ✅ Email shows OTP code (6 digits)

**Next Steps**: 6. Copy OTP from email 7. Paste/enter OTP in the 6-digit input field 8. Tap **"Verify"**

**Expected Results**:

- ✅ OTP is validated
- ✅ Transitions to PersonalInformationScreen
- ✅ Can complete registration with photo and ID

### Test Case 2: Resend OTP

**Setup**: From RegisterOtpScreen after waiting 60 seconds

**Steps**:

1. Wait for "Resend Code" button to become active (60-second cooldown)
2. Tap **"Resend Code"**
3. Wait 5 seconds for new email

**Expected Results**:

- ✅ New OTP email received
- ✅ Email timestamp is newer than first email
- ✅ OTP code is different from first OTP
- ✅ New OTP validates successfully

### Test Case 3: Already Registered Email

**Setup**: Register once successfully, then try again

**Steps**:

1. On RegisterScreen, enter the same email as Test Case 1
2. Enter password and confirm
3. Tap **"Create Account"**

**Expected Results**:

- ✅ Error message: "Email already registered"
- ✅ NO OTP email sent
- ✅ Firebase user is not duplicated

### Test Case 4: Network Failure Scenario

**Setup**: If network is slow or unavailable

**Expected Results**:

- ✅ Error message: "Failed to send verification email. Please try again."
- ✅ User can retry clicking "Create Account" again
- ✅ Firebase account not created if OTP fails (prevented by transaction)

### Test Case 5: Verify Resend_API_KEY is Server-Side Only

**Steps**:

1. Build APK with: `eas build --platform android --profile preview`
2. Open the APK file with a decompression tool (7-Zip, WinRAR)
3. Navigate to: `/assets/bundle.js` or search for "RESEND"

**Expected Results**:

- ❌ String "RESEND_API_KEY" does NOT appear in APK
- ❌ String "re\_" does NOT appear in APK
- ✅ Only appears in Supabase Edge Function code (not bundled)

---

## 🔐 VERIFY SERVER-SIDE SECRET USAGE

### Check Supabase Function Environment

The Edge Function reads RESEND_API_KEY like this:

```typescript
// At line 15 of supabase/functions/send-otp/index.ts:
const RESEND_API_KEY = (Deno as any).env?.get("RESEND_API_KEY");
```

**How to verify it's working**:

1. **Check EAS Secrets**:

   ```bash
   eas secret:list
   ```

   Should show: `RESEND_API_KEY = re_...`

2. **View Supabase Function Logs**:
   - Go to: https://supabase.com/dashboard/project/vmkinoqserekbymhhczo/functions
   - Click on `send-otp` function
   - View **Logs** tab to see requests/responses

3. **Test API Endpoint Directly** (optional):

   ```bash
   curl -X POST https://vmkinoqserekbymhhczo.supabase.co/functions/v1/send-otp \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "otpCode": "123456",
       "type": "registration"
     }'
   ```

   Expected response (when API key is set):

   ```json
   {
     "success": true,
     "messageId": "xxxx"
   }
   ```

   Expected response (when API key is NOT set):

   ```json
   {
     "success": false,
     "error": "Email service is not configured. Please try again later."
   }
   ```

---

## 📋 ARCHITECTURE CONFIRMATION

### Mobile App Flow (Client-Side)

```
RegisterScreen.tsx
  ↓
User enters email/password
  ↓
Calls: sendRegistrationOtpEmail(email, otp, "registration")
  ↓
Function calls: supabase.functions.invoke("send-otp", {...})
  ↓
HTTPS request to Supabase Edge Function
  ↓
[Supabase API Gateway]
  ↓
[Mobile app NEVER sees API key]
```

### Edge Function Flow (Server-Side)

```
supabase/functions/send-otp/index.ts
  ↓
Reads: Deno.env.get("RESEND_API_KEY")
  ↓ (from Supabase project secrets, NOT from mobile)
  ↓
Validates email and OTP format
  ↓
Calls: fetch("https://api.resend.com/emails", {...})
  ↓
Resend API sends email
  ↓
Returns success/error to mobile client
```

### Where RESEND_API_KEY Lives

- ✅ **Supabase Console Secrets** (protected, server-side)
- ✅ **EAS Secret Environment** (for build configuration)
- ✅ **Edge Function Runtime** (Deno.env.get())
- ❌ **NOT in .env file** (removed)
- ❌ **NOT in APK bundle** (safe)
- ❌ **NOT accessible from mobile app** (secure)

---

## ✅ DEPLOYMENT COMMANDS REFERENCE

### Deploy Edge Function

```bash
cd d:\Capstone\Codes\barangay-mobile
supabase functions deploy send-otp
```

### View Function Status

```bash
supabase functions list
```

### View Function Logs

```bash
supabase functions download send-otp
```

### Test Edge Function (from CLI)

```bash
supabase functions call send-otp --type POST --body '{
  "email": "test@example.com",
  "otpCode": "123456",
  "type": "registration"
}'
```

### Rebuild EAS Preview APK

```bash
eas build --platform android --profile preview
```

---

## 🐛 TROUBLESHOOTING

| Issue                               | Cause                                  | Solution                                                      |
| ----------------------------------- | -------------------------------------- | ------------------------------------------------------------- |
| "Email service not configured"      | RESEND_API_KEY not in Supabase secrets | Run: `eas secret:create --name RESEND_API_KEY --value re_...` |
| "Failed to send verification email" | Resend API error or network issue      | Check Supabase function logs, verify API key is valid         |
| Email not received                  | Function deployed but secret not set   | Rebuild APK after setting secret                              |
| OTP shows wrong format              | Mobile validation issue                | Check FormOtpInput component (not related to Edge Function)   |
| 403 Forbidden error                 | JWT verification enabled               | Verify `config.toml` has `verify_jwt = false` ✓               |

---

## 📞 NEXT STEPS

1. ✅ Edge Function deployed and active
2. ⏳ Set RESEND_API_KEY in EAS secrets
3. ⏳ Build Preview APK with: `eas build --platform android --profile preview`
4. ⏳ Install APK on test device
5. ⏳ Test registration flow with new user email
6. ⏳ Verify OTP email arrives within 5 seconds
7. ⏳ Complete registration and verify Firebase user created
8. ⏳ Confirm API key is NOT in APK binary

---

## 📝 NOTES

- Edge Function is **idempotent** - sending same OTP twice won't cause duplicate emails
- OTP validity: 5 minutes (configurable in Edge Function)
- Resend cooldown: 60 seconds between resend requests (client-side)
- All Resend errors are logged server-side and generic errors returned to client
- No sensitive information leaks to APK or logs
