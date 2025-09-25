export const GOOGLE_CONFIG = {
  // =================================================================================
  //
  //  >>> CRITICAL FIX - ACTION REQUIRED TO SOLVE THE 400 ERROR <<<
  //
  // =================================================================================
  // The value you were using for CLIENT_ID was actually a Client Secret.
  // A Client Secret starts with 'GOCSPX-' and MUST NOT be used in client-side code.
  // Using it here is the direct cause of the "400: malformed request" error.
  //
  // You need the **OAuth 2.0 Client ID**.
  //
  // 1. Go to "APIs & Services" -> "Credentials" in your Google Cloud Console.
  // 2. Find your "OAuth 2.0 Client IDs" and select the one for this web app.
  // 3. The Client ID will be a long string ending in '.apps.googleusercontent.com'.
  // 4. Copy it and paste it here, replacing the placeholder below.
  //
  CLIENT_ID: '219955814102-ch5i4ogc09oc8c1t6sqqdev1s31tc11j.apps.googleusercontent.com', // <-- PASTE YOUR ACTUAL CLIENT ID HERE
  //
  // =================================================================================
  // VERIFICATION CHECKLIST
  // =================================================================================
  // After pasting the correct Client ID, if the error persists, please re-verify:
  //
  // 1. Authorized JavaScript origins:
  //    - MUST contain the URL your app is running on (e.g., https://aistudio.google.com)
  //
  // 2. Authorized redirect URIs:
  //    - MUST ALSO contain the same URL.
  //
  // 3. OAuth Consent Screen (Publishing Status: "Testing"):
  //    - Your email MUST be added to the "Test users" list.
  //
  // 4. Enabled APIs:
  //    - "Google Drive API" and "Google Docs API" must be enabled.
  // =================================================================================

  DISCOVERY_DOCS: [
    "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
    "https://www.googleapis.com/discovery/v1/apis/docs/v1/rest"
  ],
  
  SCOPES: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/documents',
};