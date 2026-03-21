# IdeaSprint 2026 Portal

A sleek, robust, and modern portal for **IdeaSprint 2026**, handling complex team registration logic and large-file proposal submissions. It is designed around maximum performance, security, and fully automated administrative features.

---

## 🚀 Key Features & Flow

### 1. Advanced Team Registration
- **Email OTP Verification**: Enforces email ownership using memory-stored, short-lived verification codes sent via Resend API.
- **Security & Anti-Bot**: Integrated with **Cloudflare Turnstile** and backed by strict `SlowAPI` IP-based rate limiting on sensitive routes.
- **Instant Admin Alerts**: Telegram Bot posts formatted alerts to the admin chat detailing new team formations.
- **Data Synchronization**: Synchronizes registration details instantly with Google Sheets.

### 2. Scalable Proposal Submission
The platform supports large video links and PDF presentations without overloading the backend:
- **Cloudflare R2 Presigned URLs**: Clients dynamically request a secure, time-limited presigned URL from the backend to stream large PDF uploads directly to an S3-compatible R2 bucket.
- **Background Google Drive Archiving**: Once the client finishes the R2 upload, the backend triggers a background task to download the R2 object into a tempfile, compress/stream it into Google Drive, update the Google Sheet with the new viewing URLs, and post the final document directly to the Telegram admin group.

### 3. Integrated User OAuth 2.0
- Instead of constrained Service Accounts, this project leverages a **Desktop User OAuth 2.0** flow allowing the backend server to impersonate an actual Google Workspace/Gmail user. This grants high Quotas for Drive uploads and Sheets modifications. *(See [OAUTH_GUIDE.md](OAUTH_GUIDE.md) for full instructions on setting this up).*

---

## 🛠️ Tech Stack

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **Database**: PostgreSQL asynchronously managed via [SQLAlchemy](https://www.sqlalchemy.org/) & `asyncpg`.
- **Storage/S3**: Cloudflare R2 via `boto3`.
- **Google Integrations**: Google Drive API & Google Sheets API authorized via User OAuth.
- **Notifications**: Telegram Bot API and Resend Email API.
- **Security**: SlowlyAPI Rate limiting, Passlib, and custom Turnstile verification.

### Frontend
- **Framework & Build**: React 19 + Vite + `pnpm`.
- **Routing & Networking**: React Router 7 + Axios.

---

## 📁 Project Architecture

```text
ideadsprint-portal/
├── backend/
│   ├── database/           # Async SQLAlchemy Engine & Sessions
│   ├── helpers/
│   │   ├── drive.py        # Stream uploads/deletes Google Drive via OAuth
│   │   ├── email.py        # Resend & SMTP mailing templates
│   │   ├── sheets.py       # Google Sheet Appending & Cell Modifying
│   │   ├── storage.py      # Cloudflare R2 Presigned URL Generation
│   │   ├── telegram.py     # Admin alerts and PDF Document sending
│   │   └── turnstile.py    # Cloudflare CAPTCHA Validation
│   ├── models/             # SQLAlchemy ORM (User, Team)
│   ├── routes/             # Distinct routers for OTP, Registration, Submissions
│   ├── schemas/            # Pydantic rigorous type validation
│   ├── get_oauth_token.py  # Utility script to generate Base64 User OAuth Token
│   └── main.py             # FastAPI App Entrypoint & Lifespans
├── frontend-user/          # React Single Page Application
│   └── src/                # Contexts, Hooks, Multi-Step Registration forms
├── OAUTH_GUIDE.md          # Step-by-step setup for Google Cloud Credentials
└── README.md               # You are here!
```

---

## ⚙️ Getting Started

### Prerequisites
- **Python 3.10+**
- **Node.js & pnpm**
- **PostgreSQL** Database running locally or remote.
- A generated **Google OAuth Base64 Token**. Follow the `OAUTH_GUIDE.md` precisely to generate this before starting the backend.

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Virtual Environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # Windows: .venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy environment variables and fill them out (see the **Environment Variables** section below):
   ```bash
   cp .env.example .env
   ```
5. Run the server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend-user
   ```
2. Install packages:
   ```bash
   pnpm install
   ```
3. Setup variables:
   ```bash
   cp .env.example .env
   ```
4. Start development mode:
   ```bash
   pnpm dev
   ```

---

## 🔑 Environment Variables Reference

### Backend (`backend/.env`)
| Variable | Description |
|----------|-------------|
| `ENV_LOADED` | Set to 'true' to signal environment is ready |
| `DATABASE_URL` | Async PostgreSQL string (e.g. `postgresql+asyncpg://user:pass@localhost/db`) |
| `DB_ECHO` | If true, SQLAlchemy will log raw SQL queries |
| `JWT_SECRET_KEY` | Secret for generating internal system tokens |
| `JWT_ALGORITHM` | Algorithm for JWT (e.g., HS256) |
| `SMTP_SERVER`, `SMTP_PORT` | SMTP routing for standard mailing |
| `SMTP_USER`, `SMTP_PASSWORD`| Credentials for the SMTP user |
| `SMTP_FROM_EMAIL` | Origin email for SMTP emails sent out |
| `TURNSTILE_SECRET_KEY` | Backend secret matching the frontend UI Site Key |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Account credentials for Resend OTP deliveries |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | Bot identifying token and the group chat ID |
| `GOOGLE_DRIVE_FOLDER_ID` | Drive folder where PDFs are archived |
| `GOOGLE_SHEET_ID` | Target Spreadsheet for appending rows |
| `GOOGLE_OAUTH_TOKEN_B64` | **Critical:** The Base64 string from `OAUTH_GUIDE.md` |
| `CLOUDFLARE_ACCOUNT_ID` | ID on your Cloudflare R2 dashboard |
| `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` | R2 API Keys with Write abilities |
| `R2_BUCKET_NAME` | The exact name of your bucket for presigned operations |

### Frontend (`frontend-user/.env`)
| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend URL (e.g., `http://localhost:8000`) |
| `VITE_TURNSTILE_SITE_KEY` | Public Frontend Key for Cloudflare Widget |

---

## 🐳 Docker Deployment

The entire stack (backend and frontend) is fully containerized and runs seamlessly using Docker Compose.

1. Create a `Data/Submissions` directory in the root if you want to inspect downloaded PDFs locally.
2. From the root directory, start the services:
   ```bash
   docker-compose up --build -d
   ```
3. **Access points:**
   - **Frontend**: `http://localhost:5995`
   - **Backend API**: `http://localhost:5990`

---
<center>Built with ❤️ for <b>ideasprint 2026</b> By <b>Sasivarnasarma</b>.</center>
