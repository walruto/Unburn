# Google Calendar Setup

Unburn uses the existing Supabase-authenticated user and requests a short-lived Google OAuth access token in the browser. The token is stored in `localStorage` under the current Supabase `user.id` and is used only for read-only Google Calendar API calls.

This is the simplest hackathon MVP path. For production, store Google refresh tokens server-side with Supabase Row Level Security and exchange authorization codes on a backend or Supabase Edge Function.

## Environment Variables

Add these values to `.env` and restart Vite:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
```

`VITE_GOOGLE_CLIENT_ID` is the OAuth 2.0 Web client ID from Google Cloud.

## Google Cloud Configuration

1. Open Google Cloud Console.
2. Create or select a project.
3. Go to APIs & Services > Library.
4. Enable Google Calendar API.
5. Go to APIs & Services > OAuth consent screen.
6. Configure the app name, support email, and developer contact email.
7. Add the scope `https://www.googleapis.com/auth/calendar.readonly`.
8. If the app is in testing mode, add your Google account under Test users.
9. Go to APIs & Services > Credentials.
10. Create OAuth client ID with Application type `Web application`.
11. Add authorized JavaScript origins:
    - `http://localhost:5173`
    - Your deployed app origin, for example `https://your-domain.com`
12. Copy the client ID into `VITE_GOOGLE_CLIENT_ID`.

No redirect URI is required for the current Google Identity Services token flow.

## App Flow

1. Sign in with the existing Supabase auth flow.
2. Open Profile.
3. Click Connect Calendar.
4. Approve read-only Google Calendar access.
5. Open Calendar to see upcoming primary calendar events.

## Testing

Run the app locally:

```bash
npm run dev
```

Then verify:

1. Profile shows Google Calendar as disconnected before connecting.
2. Connect Calendar opens the Google consent flow.
3. Profile changes to connected after consent succeeds.
4. Calendar shows loading, then upcoming events.
5. Disconnect removes the local connection status.
6. Calendar shows the disconnected state after disconnecting.

If events fail to load, check that the Calendar API is enabled, the OAuth consent screen has the readonly scope, the current origin is authorized, and the Vite dev server was restarted after editing `.env`.
