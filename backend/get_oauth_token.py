import base64
import json
import os

from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/spreadsheets",
]


def main():
    print("Welcome to the Google OAuth Token Generator!")
    print("This script will guide you through authenticating your application.")
    print(
        "Ensure you have your 'credentials.json' from Google Cloud Console in this directory.\n"
    )

    if not os.path.exists("credentials.json"):
        print("Error: 'credentials.json' not found in the current directory.")
        print("Please download it from the Google Cloud Console and try again.")
        return

    try:
        flow = InstalledAppFlow.from_client_secrets_file("credentials.json", SCOPES)
        print("Opening browser to authorize...")
        creds = flow.run_local_server(port=0, access_type='offline', prompt='consent')
        print("\nAuthentication successful!")

        token_data = {
            "token": creds.token,
            "refresh_token": creds.refresh_token,
            "token_uri": creds.token_uri,
            "client_id": creds.client_id,
            "client_secret": creds.client_secret,
            "scopes": creds.scopes,
        }

        token_json = json.dumps(token_data)
        with open("token.json", "w") as token_file:
            token_file.write(token_json)
        token_b64 = base64.b64encode(token_json.encode("utf-8")).decode("utf-8")

        print("\n\n" + "=" * 80)
        print("SUCCESS! Your OAuth Token has been generated.")
        print("=" * 80)
        print("\nPlease copy the following text and paste it in your backend/.env")
        print("as the value for GOOGLE_OAUTH_TOKEN_B64:\n")
        print(f"GOOGLE_OAUTH_TOKEN_B64={token_b64}\n")
        print("=" * 80)
    except Exception as e:
        print(f"\nAn error occurred during authentication: {e}")


if __name__ == "__main__":
    main()
