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
invocation records can include request and response bodies. The Worker is named
`barangay-google-oauth`; its new preferred custom origin is
`https://auth.barangay-san-isidro.help`, with callback
`https://auth.barangay-san-isidro.help/oauth/callback`. The previous
`https://barangay-google-oauth.nadurajohnlloyd8.workers.dev` origin remains
allowed for the transition. Keep Cloudflare's `workers.dev` route enabled until
the custom-domain flow has been verified.

The Worker has no root route, so a JSON `{"error":"not_found"}` at `/` is
expected and does not mean the deployment is missing. Its supported routes are
`POST /oauth/start` (app request), `POST /oauth/redeem` (app request), and
`POST /oauth/callback` (Google `form_post` callback). `/oauth/callback` is the
correct Google redirect path. The Worker selects the callback origin from the
incoming request only after validating it against the exact custom and legacy
host allowlist. That keeps requests using the old `workers.dev` URL paired with
the old callback while new requests use the custom-domain callback.

## Before deployment

1. Wrangler is authenticated to the selected Cloudflare account. The existing
   `workers.dev` route remains enabled while the custom domain is verified.
2. The D1 database `barangay-google-oauth` has been created and its ID is
   configured in `cloudflare/google-oauth-worker/wrangler.jsonc`. Migration
   `0001_google_oauth_broker.sql` is applied and verified in the remote D1.
3. The Worker name is configured as `barangay-google-oauth`, and the custom
   domain `auth.barangay-san-isidro.help` is attached in Cloudflare. Set
   `OAUTH_PUBLIC_BASE_URL` to `https://auth.barangay-san-isidro.help` only as
   part of the cutover after the Google redirect URI is registered. The Worker
   validation allows this exact custom hostname and the exact legacy Worker
   hostname; it rejects other hosts.
4. In Google Cloud Console, use the existing **Web application** OAuth client
   (the `client_type: 3` entry in `google-services.json`), not an Android
   client. Add this Authorized redirect URI and keep the old redirect URI
   registered until the new flow is verified:

   `https://auth.barangay-san-isidro.help/oauth/callback`

   Keep the existing
   `https://barangay-google-oauth.nadurajohnlloyd8.workers.dev/oauth/callback`
   URI registered until that verification is complete.

   Do not use the Supabase callback or `barangay://` as Google's redirect URI.
5. Verify that the Google OAuth consent-screen audience, publishing/testing
   status, and user limits permit the intended residents. The broker requests
   only `openid email profile`.
6. In Firebase Console, verify Google sign-in is enabled for the same Firebase
   project configured in `google-services.json`. Confirm that the Web OAuth
   client is the same client used by the broker. These remote settings cannot
   be verified from this repository.
7. Set the app's public broker URL in local `.env` and the build environment as
   `EXPO_PUBLIC_GOOGLE_OAUTH_BROKER_URL=https://auth.barangay-san-isidro.help`.
   This URL is public configuration, not a secret. It must be the HTTPS Worker
   origin only (no path, query, or trailing configuration segments). The app
   accepts only the exact custom host and exact legacy Worker host during the
   transition.

## Public Google sign-in identity

Google's “Continue to” prompt host comes from the OAuth redirect URI, not the
OAuth app display name. The custom domain supplied for this Worker is
`auth.barangay-san-isidro.help`; once the custom-domain callback is registered
in Google Cloud Console and the Worker is configured with that public base URL,
the resulting redirect host is no longer the personal `workers.dev` subdomain.
The app name shown in Google Auth Platform > Branding is a separate setting and
may be set to **San Isidro**.

Do not enable physical-device testing until D1 and the Worker have been
provisioned, the actual Google redirect URI is registered, and the deployed
routes have been verified. Do not claim Xiaomi support until tested on the
affected device.

The app must contact `/oauth/start` before opening the browser because the
broker creates state, nonce, and PKCE material and returns the authorization
URL. If the Worker is unavailable at that point, the browser cannot safely be
opened; the app displays a clear temporary-service-unavailable error instead.
The custom domain is attached according to the Cloudflare configuration; a
root-path `not_found` is expected. The actual Google OAuth round trip still
requires the custom callback URI to be registered and the Worker runtime base
URL to be updated.

## Diagnosing OAuth-start HTTP errors

The previous `/oauth/start` implementation returned `service_unavailable` for
missing OAuth credentials, an invalid `OAUTH_PUBLIC_BASE_URL`, encryption
configuration/runtime failures, and D1 errors. That response alone cannot
identify which Production condition caused a 503. A successful invalid-body
probe returning `invalid_request` shows the request passed the rate-limit
storage step, but does not verify later attempt insertion or encryption.

The updated Worker reports only safe categories (`oauth_configuration_error`,
`encryption_configuration_error`, `encryption_unavailable`,
`storage_unavailable`, or `service_unavailable`) and attaches an `X-Request-ID`
to `/oauth/start` responses. The same ID is included in its corresponding
structured diagnostic log. The app logs that ID and presents configuration,
service, and connectivity failures differently. It never logs OAuth values.
Workers Logs are enabled in Wrangler, while invocation logs remain disabled to
avoid collecting request metadata unnecessarily.

After the Worker update is deployed, inspect **Workers & Pages →
barangay-google-oauth → Settings → Variables and Secrets** and confirm the
Production environment has non-empty `GOOGLE_OAUTH_CLIENT_ID` and
`GOOGLE_OAUTH_CLIENT_SECRET`, an `OAUTH_DATA_ENCRYPTION_KEY` at least 32
characters long, and `OAUTH_PUBLIC_BASE_URL` exactly set to
`https://auth.barangay-san-isidro.help`. Do not reveal or paste secret values.
Under **Bindings**, confirm `DB` is bound to the expected D1 database and that
the existing migration has been applied remotely. Under **Deployments**, verify
the active version includes this diagnostic update. Then reproduce one sign-in
attempt, find its request ID under the Worker’s **Observability** logs, and
inspect only its stage/category. Do not enable invocation logs or copy secrets,
request bodies, authorization URLs, or tokens into diagnostics.

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

## Deployment and custom-domain cutover

Do not recreate the D1 database or reapply its existing migration. Verify the
active Cloudflare account before changing the deployed Worker:

```powershell
npx wrangler whoami
```

Before deploying the updated hostname validation, first add the custom
callback URI in Google Cloud Console and verify that the custom hostname is
attached to this Worker. Keep the old Worker hostname and redirect URI
available during the transition. The existing deployment procedure requires a
security review before deploying; that review and deployment have not been
performed as part of this configuration change.

After the review is complete, deploy the Worker from:
```powershell
Set-Location cloudflare/google-oauth-worker
npx wrangler deploy
```

Initially retain the currently configured valid `OAUTH_PUBLIC_BASE_URL` while
testing. The updated Worker derives the callback origin from the incoming
request after exact-host validation, so legacy and custom-domain requests keep
their respective callback URIs. After a complete sign-in succeeds through the
custom domain, update `OAUTH_PUBLIC_BASE_URL` to the custom HTTPS origin using
Wrangler's secure prompt or the Cloudflare dashboard. Do not re-enter or
change the Google OAuth client credentials or encryption key for this
hostname-only update. The base URL is public, but remains a Worker secret in
the existing deployment configuration:

```powershell
npx wrangler secret put OAUTH_PUBLIC_BASE_URL
```

Enter `https://auth.barangay-san-isidro.help` when prompted. Do not remove the
old `workers.dev` route or old Google redirect URI until a complete sign-in
succeeds through the custom domain.

Cloudflare plan availability, quotas, and limits can change. Verify current
Workers and D1 plan limits in the Cloudflare dashboard before production use.

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
- Wrangler enables Workers Observability to retain the Worker's safe,
  structured diagnostic categories and request IDs; invocation logs remain
  disabled. Application diagnostics contain only categories, statuses,
  request IDs, and field-presence flags. Do not add OAuth inputs, tokens,
  authorization URLs, or secrets to logs. Review Cloudflare's current platform
  documentation, account-level settings, and data-processing terms before
  production use.
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
