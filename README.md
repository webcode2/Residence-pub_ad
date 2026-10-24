# Estate caretaker dashboard

This web app is for estate caretakers. Residents, landlords, guards, and platform owners without the caretaker role cannot enter `/dashboard`. Each caretaker's authenticated `app_id` determines the estate they can access.

## Local setup

1. Copy `.env.example` to `.env.local` and set a random `SESSION_SECRET` of at least 32 characters.
2. Set `NEXT_PUBLIC_BACKEND_API_URL` to the backend API root, including `/api/v1/`.
3. Run `npm ci`, then `npm run dev`.
4. Sign in using the estate App ID and an account with the `caretaker` role.

## Conversation Logs

Open `/dashboard/conversations` to review resident–guard threads. Search resident names, units, officer names, badges, posts, subjects, or message text. Filter open, resolved, and closed threads; page through the archive and select a thread to read its full ordered history.

The archive uses `/chat/audit/threads` and `/chat/audit/threads/{id}`. Server actions derive the estate and bearer token from the signed session. The backend independently validates the authenticated user's role and estate. Audit views do not mark messages read, clear unread counters, or join participant rooms. There are no reply, resolve, edit, or delete controls and no periodic polling; use Refresh for the latest history.

Removing an account that participated in chat revokes that account and clears its FCM token while retaining the account reference and conversation history. This preserves resident and officer attribution. Records already deleted before this behavior was introduced cannot be reconstructed by the archive.

## Verification

Run `npx tsc --noEmit` and `npm run build`. Backend authorization, search, pagination, read-state preservation, and account-removal coverage is in `backend/tests/test_chat.py`.

## Separate admin experiences

- `/owner/login` and `/owner`: SaaS-owner sign-in and platform console. Uses the separate `owner_session` cookie and the backend's dedicated SaaS-owner JWT signing key. No tenant App ID is required at owner sign-in.
- `/owner/estates`: estate search and suspension/reactivation.
- `/owner/subscriptions`: plan, expiry, status, verification quota, retention, RFID, and alert overrides.
- `/owner/users`: cross-estate account search and revocation/reinstatement; platform-owner accounts are protected.
- `/owner/plans`: backend-configured plan defaults and monthly USD prices.
- `/owner/audit`: attributed administrative changes.
- `/login` and `/dashboard`: estate caretaker sign-in and the estate-scoped workspace.
- `/dashboard/subscription`: the caretaker's own subscription, usage, expiry, and entitlements.

Owner access never grants caretaker conversation access. Each backend API independently checks the appropriate token and role.
