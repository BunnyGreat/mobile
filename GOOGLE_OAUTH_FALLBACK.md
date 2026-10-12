# Google OAuth browser fallback

Native Google Sign-In remains the primary method. The app starts the browser
fallback only for Android Google Play Services unavailable/invalid errors, then
uses the existing Firebase credential and resident-authentication flow.
Firebase remains the resident identity provider; the existing secondary
Supabase Auth session, Firestore account-status handling, OTP, and navigation
behavior are unchanged.

The installed `@react-native-google-signin/google-signin` 16.1.5 Android
`hasPlayServices()` implementation maps non-success Google Play Services
availability to the `PLAY_SERVICES_NOT_AVAILABLE` error code. It includes the
underlying status in its diagnostic message; status 9 is `SERVICE_INVALID`.
The app recognizes the package error code and narrowly recognizes explicit
`SERVICE_INVALID`/Google Play Services status-9 diagnostics. It does not invoke
the fallback for cancellation, Firebase credential errors, or unrelated native
errors.

The broker uses Cloudflare Workers and D1 because Supabase Edge Function
invocation records can include request and response bodies. The configured
account subdomain is `nadurajohnlloyd8.workers.dev`, and the configured Worker
name is `barangay-google-oauth`. The resulting configured origin is
`https://barangay-google-oauth.nadurajohnlloyd8.workers.dev`, with callback
`https://barangay-google-oauth.nadurajohnlloyd8.workers.dev/oauth/callback`.
This is derived from the Wrangler route configuration; it is not evidence that
the Worker is deployed or reachable. Confirm the exact route from Wrangler or
the Cloudflare dashboard after deployment before changing Google's redirect
URI or enabling device tests.

## Before deployment

1. Wrangler is authenticated to the selected Cloudflare account. The account
   subdomain is `nadurajohnlloyd8.workers.dev`.
2. The D1 database `barangay-google-oauth` has been created and its ID is
   configured in `cloudflare/google-oauth-worker/wrangler.jsonc`. Migration
   `0001_google_oauth_broker.sql` is applied and verified in the remote D1.
3. The Worker name is configured as `barangay-google-oauth`. After deployment,
   confirm its actual HTTPS route matches the configured origin above and set
   that exact origin as `OAUTH_PUBLIC_BASE_URL`.
4. In Google Cloud Console, use the existing **Web application** OAuth client
   (the `client_type: 3` entry in `google-services.json`), not an Android
   client. Add this exact Authorized redirect URI after the real hostname is
   available:

   `https://barangay-google-oauth.nadurajohnlloyd8.workers.dev/oauth/callback`

   Do not register or change the URI until the deployed route is confirmed.
   Do not use the Supabase callback or `barangay://` as Google's redirect URI.
5. Verify that the Google OAuth consent-screen audience, publishing/testing
   status, and user limits permit the intended residents. The broker requests
   only `openid email profile`.
6. In Firebase Console, verify Google sign-in is enabled for the same Firebase
   project configured in `google-services.json`. Confirm that the Web OAuth
   client is the same client used by the broker. These remote settings cannot
   be verified from this repository.
7. Set the app's public broker URL in local `.env` and the build environment as
   `EXPO_PUBLIC_GOOGLE_OAUTH_BROKER_URL=https://barangay-google-oauth.nadurajohnlloyd8.workers.dev`.
   This URL is public configuration, not a secret. It must be the HTTPS Worker
   origin only (no path, query, or trailing configuration segments). The app
   rejects non-`workers.dev` hosts.

Do not enable physical-device testing until D1 and the Worker have been
provisioned, the actual Google redirect URI is registered, and the deployed
routes have been verified. Do not claim Xiaomi support until tested on the
affected device.

The app must contact `/oauth/start` before opening the browser because the
broker creates state, nonce, and PKCE material and returns the authorization
URL. If the Worker is unavailable at that point, the browser cannot safely be
opened; the app displays a clear temporary-service-unavailable error instead.
The configured Worker is currently not deployed, so this branch is not ready
for a live sign-in test.

## Local validation

From the repository root, run:

```powershell
npm run test:oauth
npx tsc --noEmit
npx expo install --check
git diff --check
```

The OAuth tests execute the D1 migration against Node's local SQLite engine and
exercise the Worker using a transactional D1-compatible test adapter. Wrangler
local development can be used after Wrangler is available:

```powershell
Set-Location cloudflare/google-oauth-worker
npx wrangler d1 migrations apply barangay-google-oauth --local
npx wrangler dev
```

Local SQLite tests do not validate deployed Cloudflare behavior or Google
Console configuration.

## Deployment (pending review and secrets)

The account is authenticated and D1 is provisioned and migrated. Do not rerun
database creation or apply the migration again. Verify the active account with:

```powershell
npx wrangler whoami
```

The Worker is not deployed, so neither the configured callback nor the
Cloudflare dashboard's runtime logging state has been verified on a live
Worker. Do not deploy until the security review is complete. Once deployment is
authorized, first create the Worker:

```powershell
Set-Location cloudflare/google-oauth-worker
npx wrangler deploy
```

Then set the required runtime values through Wrangler's secure interactive
secret prompt or the Cloudflare dashboard. The Worker must exist before secrets
can be attached through Wrangler. Use the Google Web application's client ID
and matching client secret; create an independent high-entropy encryption key
(at least 32 characters) with a password manager or a local cryptographically
secure generator. Do not put secret values in commands, tracked files, Expo
variables, logs, or chat:

```powershell
npx wrangler secret put GOOGLE_OAUTH_CLIENT_ID
npx wrangler secret put GOOGLE_OAUTH_CLIENT_SECRET
npx wrangler secret put OAUTH_DATA_ENCRYPTION_KEY
npx wrangler secret put OAUTH_PUBLIC_BASE_URL
```

`OAUTH_PUBLIC_BASE_URL` must be
`https://barangay-google-oauth.nadurajohnlloyd8.workers.dev` if the deployed
route matches the current configuration. It is not secret in itself, but is
set as a Worker secret to prevent accidental mismatch. Confirm deployment
output and check the deployed Worker URL, D1 binding, migration status, and
secrets before building the app with its public URL.

Cloudflare free-plan availability, quotas, and limits can change. Verify current
Workers and D1 plan limits in the Cloudflare dashboard before production use.
The free `workers.dev` hostname avoids purchasing a domain or separate hosting;
it does not guarantee unlimited capacity or availability.

## Broker security design

- `POST /oauth/start` generates random state, nonce, and Google PKCE verifier,
  stores encrypted state with a five-minute expiry, and returns the Google
  authorization URL with only `openid email profile`.
- Google posts its authorization response to `/oauth/callback` using
  `response_mode=form_post`; the route rejects query parameters, malformed or
  duplicate fields, and oversized bodies. It atomically claims unexpired state,
  exchanges the code server-side with the Web client secret and PKCE verifier,
  validates the Google ID-token signature via Google's JWKS and checks issuer,
  audience, expiry, nonce, and required identity claims. It encrypts the token
  server-side, then redirects to `barangay://oauth/google` with only an opaque
  90-second, single-use ticket.
- `POST /oauth/redeem` binds ticket redemption to the initiating app's
  SHA-256 challenge, checks expiry, and deletes/returns the row atomically.
  The verifier is never put in the app return URL. Only the successful
  redemption response contains the Google ID token.
- State, nonce, PKCE material, tickets, and ID tokens are generated or handled
  server-side and are never intentionally logged. State payloads and retained
  ID tokens are encrypted in D1 using AES-GCM; stored state and ticket
  identifiers are hashes. Expired records are pruned during broker operations.
- D1 `batch()` groups rate-limit cleanup and counter updates transactionally.
  Rate limits are service-wide per operation, not per IP or user. Cloudflare
  request IP headers are deliberately not trusted by this Worker. The global
  cap can be exhausted, temporarily denying sign-in; it reduces aggregate abuse
  but is not a distributed-denial-of-service defense.
- Wrangler explicitly sets `observability.enabled = false` and
  `observability.logs.invocation_logs = false`. These documented settings
  disable Workers Observability and invocation logs for this Worker; they are
  not proof that Cloudflare performs no internal processing, retention, or
  security logging. Review Cloudflare's current platform documentation,
  account-level settings, and data-processing terms before production use.
  Avoid adding application logs containing OAuth inputs, tokens, or secrets.
- The OAuth broker does not use Supabase Auth. Supabase remains in the app for
  unrelated existing functionality. The old, undeployed Supabase Google broker
  functions and SQL migration remain in the repository as legacy artifacts;
  do not deploy those functions or apply that migration.

## Device verification

After all configuration is complete, test on both a certified Android device
where native Google Sign-In succeeds and the affected Xiaomi device:

1. On the certified device, confirm native sign-in still completes without
   opening the browser.
2. On Xiaomi, confirm native sign-in's specific Play Services unavailable
   error starts the browser fallback. Confirm cancellations and unrelated
   native/Firebase errors do not start it.
3. Complete a Google sign-in and verify Firebase UID continuity, existing
   Firestore resident lookup, pending/approved/rejected behavior, registration
   OTP, and the established secondary Supabase Auth session.
4. Cancel Google consent, wait for browser timeout, interrupt network access,
   and try expired, malformed, wrong-verifier, and replayed tickets. Confirm
   loading state is cleared and no partial Firebase/Supabase authentication
   state or duplicate resident record is created.
5. Verify the app build contains only the public Worker origin and no OAuth
   secret. Verify no authorization code, ID token, ticket, verifier, or secret
   appears in application logs or configured Cloudflare Workers Logs.
