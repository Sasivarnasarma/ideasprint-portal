# Complete Guide: Obtaining Google OAuth Credentials 🚀

This project uses **User OAuth 2.0 Credentials**. This approach authenticates as a standard Google User, which has vastly higher quotas for Google Drive and Google Sheets APIs.

This guide will walk you through the **exact steps** to generate an OAuth Token using the Google Cloud Console and the provided Python script.

---

## Phase 1: Create a Google Cloud Project & Enable APIs

First, we need a Google Cloud Project with the Drive and Sheets APIs enabled.

1. Go to the **[Google Cloud Console](https://console.cloud.google.com/)** and sign in with your Google account.
2. In the top navigation bar, click on the **Project Dropdown** (next to the Google Cloud logo) and click **New Project**.
3. Give your project a name (e.g., `IdeaSprint-OAuth-Backend`) and click **Create**.
4. Once the project is created, make sure it is selected in the top navigation bar.
5. In the left sidebar menu, navigate to **APIs & Services > Library**.
6. Search for **Google Drive API** and click the **Enable** button.
7. Go back to the Library, search for **Google Sheets API**, and click **Enable**.

---

## Phase 2: Configure the OAuth Consent Screen 🛡️

Before Google lets you create credentials, you must tell it who is allowed to authenticate. 

1. From the left sidebar, navigate to **APIs & Services > OAuth consent screen**.
2. Under **User Type**:
   - Select **External** (unless you are using a Google Workspace organization account, in which case you can select Internal).
   - Click **Create**.
3. **App Information**:
   - **App name:** Enter a recognizable name (e.g., `IdeaSprint Portal Backend`).
   - **User support email:** Choose your email address from the dropdown.
   - **Developer contact info:** Enter your email address again at the very bottom.
   - Click **Save and Continue**.
4. **Scopes** (Permissions your app will request):
   - Click **Add or Remove Scopes**.
   - In the filter under *Manually add scopes*, paste `https://www.googleapis.com/auth/drive` and click **Add to Table**.
   - Paste `https://www.googleapis.com/auth/spreadsheets` and click **Add to Table**.
   - Click **Update**, then scroll down and click **Save and Continue**.
5. **Test Users** (CRITICAL STEP):
   - Because your app is in "Testing" mode (not published), **only specific test users can log in**.
   - Click **Add Users**.
   - Type in the **exact Google Email Address** you plan to use to authenticate (e.g., your personal Gmail).
   - Click **Add**, then click **Save and Continue**.
6. Review the summary and click **Back to Dashboard**.

---

## Phase 3: Create the OAuth Client ID 🔑

Now you will generate the actual credentials file for the backend script.

1. In the left sidebar, navigate to **APIs & Services > Credentials**.
2. At the top of the page, click **+ Create Credentials** and select **OAuth client ID**.
3. Under **Application type**, select **Desktop app** from the dropdown.
   *(⚠️ Warning: Do NOT select "Web application" – our Python script requires the Desktop app flow to capture the token locally).*
4. Give it a name like `Backend Python Script` and click **Create**.
5. A modal will pop up with your Client ID and Client Secret. Click the **Download JSON** button to download the file.
6. **Rename** the downloaded file exactly to **`credentials.json`**.
7. **Move** `credentials.json` into the **`backend/`** folder of this project directory.

---

## Phase 4: Generate the OAuth Base64 Token 💻

You now have the credentials, but you need to authorize them with your account to get the final usable Token.

1. Open your terminal and navigate to the backend folder:
   ```bash
   cd ideasprint-portal\backend
   ```
2. Ensure your virtual environment is activated and the dependencies (`google-auth-oauthlib`) are installed.
3. Run the provided token generation script:
   ```bash
   python get_oauth_token.py
   ```
4. A web browser window will automatically open asking you to **Choose an account**. Select the email address you added as a Test User in Phase 2.
5. Google will show a warning saying **"Google hasn’t verified this app"**.
   - Click **Advanced**.
   - Click **Go to IdeaSprint Portal Backend (unsafe)**.
6. Click **Continue** or **Allow** to grant the app access to your Google Drive and Google Sheets.
7. Return to your terminal. If the authentication was successful, the script will output a large Base64 encoded string.

---

## Phase 5: Update your `.env` File 🛠️

1. **Copy** the `GOOGLE_OAUTH_TOKEN_B64=...` line output by the terminal script.
2. Open the `backend/.env` file.
3. If it exists, **delete** the old `GOOGLE_SERVICE_ACCOUNT_B64=` line.
4. **Paste** the newly copied line into `.env`:
   ```env
   GOOGLE_OAUTH_TOKEN_B64=ey...[your_long_base64_string]...
   ```
5. **Security Cleanup**: Delete `credentials.json` and `token.json` from your backend folder, as you no longer need them and they shouldn't be committed to version control.
6. **Restart your backend**. The API will now initialize directly from your Base64 token on startup and automatically handle your Drive uploads and Sheets row insertions!
