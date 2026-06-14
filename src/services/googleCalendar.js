const GOOGLE_IDENTITY_SCRIPT_URL = 'https://accounts.google.com/gsi/client';
const GOOGLE_CALENDAR_EVENTS_URL = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
const GOOGLE_CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.readonly';
const STORAGE_PREFIX = 'unburn.googleCalendar';
const TOKEN_EXPIRY_BUFFER_MS = 60 * 1000;

let googleIdentityScriptPromise;

function getClientId() {
  return import.meta.env.VITE_GOOGLE_CLIENT_ID;
}

function getStorageKey(userId) {
  return `${STORAGE_PREFIX}.${userId}`;
}

function loadGoogleIdentityScript() {
  if (window.google?.accounts?.oauth2) {
    return Promise.resolve();
  }

  if (!googleIdentityScriptPromise) {
    googleIdentityScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector(`script[src="${GOOGLE_IDENTITY_SCRIPT_URL}"]`);

      if (existingScript) {
        existingScript.addEventListener('load', resolve, { once: true });
        existingScript.addEventListener('error', () => reject(new Error('Unable to load Google sign-in.')), {
          once: true,
        });
        return;
      }

      const script = document.createElement('script');
      script.src = GOOGLE_IDENTITY_SCRIPT_URL;
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error('Unable to load Google sign-in.'));
      document.head.appendChild(script);
    });
  }

  return googleIdentityScriptPromise;
}

function readStoredToken(userId) {
  if (!userId) return null;

  try {
    const storedValue = window.localStorage.getItem(getStorageKey(userId));
    return storedValue ? JSON.parse(storedValue) : null;
  } catch {
    return null;
  }
}

function storeToken(userId, tokenResponse) {
  const expiresInMs = Number(tokenResponse.expires_in ?? 0) * 1000;
  const token = {
    accessToken: tokenResponse.access_token,
    connectedAt: Date.now(),
    expiresAt: Date.now() + expiresInMs,
    scope: tokenResponse.scope,
  };

  window.localStorage.setItem(getStorageKey(userId), JSON.stringify(token));
  return token;
}

function getValidAccessToken(userId) {
  const token = readStoredToken(userId);

  if (!token?.accessToken || !token?.expiresAt) {
    return null;
  }

  if (token.expiresAt <= Date.now() + TOKEN_EXPIRY_BUFFER_MS) {
    return null;
  }

  return token.accessToken;
}

export function getGoogleCalendarConnection(userId) {
  const token = readStoredToken(userId);

  if (!token?.accessToken || !token?.expiresAt) {
    return { connected: false, expired: false };
  }

  const expired = token.expiresAt <= Date.now() + TOKEN_EXPIRY_BUFFER_MS;

  return {
    connected: !expired,
    connectedAt: token.connectedAt,
    expired,
    expiresAt: token.expiresAt,
  };
}

export async function connectGoogleCalendar(userId) {
  const clientId = getClientId();

  if (!userId) {
    throw new Error('You must be signed in before connecting Google Calendar.');
  }

  if (!clientId) {
    throw new Error('Missing VITE_GOOGLE_CLIENT_ID. Add it to your environment and restart Vite.');
  }

  await loadGoogleIdentityScript();

  return new Promise((resolve, reject) => {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: GOOGLE_CALENDAR_SCOPE,
      callback: (response) => {
        if (response.error) {
          reject(new Error(response.error_description || 'Google Calendar connection was cancelled.'));
          return;
        }

        resolve(storeToken(userId, response));
      },
    });

    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
}

export function disconnectGoogleCalendar(userId) {
  if (!userId) return;
  window.localStorage.removeItem(getStorageKey(userId));
}

export function normalizeCalendarEvent(event) {
  return {
    attendeeCount: event.attendees?.length ?? 0,
    creatorSelf: Boolean(event.creator?.self),
    id: event.id,
    end: event.end?.dateTime ?? event.end?.date,
    eventType: event.eventType,
    focusTimeProperties: event.focusTimeProperties ?? null,
    htmlLink: event.htmlLink,
    isAllDay: Boolean(event.start?.date),
    location: event.location,
    organizerSelf: Boolean(event.organizer?.self),
    outOfOfficeProperties: event.outOfOfficeProperties ?? null,
    recurrence: event.recurrence ?? [],
    recurringEventId: event.recurringEventId,
    start: event.start?.dateTime ?? event.start?.date,
    summary: event.summary || 'Untitled event',
    transparency: event.transparency,
    workingLocationProperties: event.workingLocationProperties ?? null,
  };
}

async function fetchCalendarEvents(userId, params) {
  const accessToken = getValidAccessToken(userId);

  if (!accessToken) {
    throw new Error('Google Calendar is not connected. Connect it from your profile.');
  }

  const response = await fetch(`${GOOGLE_CALENDAR_EVENTS_URL}?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 401) {
    disconnectGoogleCalendar(userId);
    throw new Error('Google Calendar connection expired. Reconnect it from your profile.');
  }

  if (!response.ok) {
    throw new Error('Unable to load Google Calendar events.');
  }

  const data = await response.json();
  return (data.items ?? []).map(normalizeCalendarEvent);
}

export async function fetchUpcomingCalendarEvents(userId, maxResults = 10) {
  const params = new URLSearchParams({
    maxResults: String(maxResults),
    orderBy: 'startTime',
    singleEvents: 'true',
    timeMin: new Date().toISOString(),
  });

  return fetchCalendarEvents(userId, params);
}

export async function fetchCalendarEventsForRange(userId, { timeMin, timeMax }) {
  const params = new URLSearchParams({
    orderBy: 'startTime',
    singleEvents: 'true',
    timeMax,
    timeMin,
  });

  return fetchCalendarEvents(userId, params);
}
