# IdeaSprint 2026 Portal

A sleek and modern registration portal for **IdeaSprint 2026**, designed to handle team registrations with a seamless user experience, robust security, and automated admin notifications.

## 🚀 Features

- **Multi-Step Registration**: A user-friendly, step-by-step form for individual and team details.
- **Email OTP Verification**: Secure registration process with mandatory email verification via OTP.
- **Security & Anti-Abuse**:
  - **Cloudflare Turnstile**: Integrated CAPTCHA protection against bots.
  - **Rate Limiting**: Backend protection using `SlowAPI` to prevent brute-force attacks.
- **Automated Integrations**:
  - **Email Notifications**: Welcome emails sent via **Resend**.
  - **Admin Alerts**: Instant notifications to admins via **Telegram Bot**.
  - **Data Logging**: Automatic synchronization of registration data with **Google Sheets**.
- **Modern UI/UX**: Built with React 19 and a clean, responsive design.

## 🛠️ Tech Stack

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **Database**: PostgreSQL with [SQLAlchemy](https://www.sqlalchemy.org/) (Asynchronous)
- **Authentication**: JWT & OTP-based verification.
- **Security**: Passlib (Argon2), SlowAPI, Cloudflare Turnstile.
- **Communication**: Resend (Email), Telegram Bot API.
- **Other**: Google Auth (for Sheets integration), Pydantic.

### Frontend
- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Routing**: React Router 7
- **API Client**: Axios
- **Package Manager**: pnpm

## 📁 Project Structure

```text
ideadsprint-portal/
├── backend/                # FastAPI Application
│   ├── database/           # DB Connection & Base Models
│   ├── helpers/            # Utilities (Email, Sheets, Telegram, Security)
│   ├── models/             # SQLAlchemy Models (User, Team)
│   ├── routes/             # API Endpoints (Auth, Registration)
│   ├── schemas/            # Pydantic Models
│   ├── templates/          # Email Templates
│   ├── main.py             # Entry Point
│   └── requirements.txt    # Python Dependencies
├── frontend-user/          # React Application
│   ├── src/
│   │   ├── assets/         # Styles & Images
│   │   ├── components/     # UI Components
│   │   ├── context/        # Auth Context
│   │   ├── pages/          # Main Views (Register, Success)
│   │   └── App.jsx         # Root Component
│   ├── package.json        # Frontend Dependencies
│   └── vite.config.js      # Vite Configuration
└── README.md               # You are here!
```

## ⚙️ Getting Started

### Prerequisites
- Python 3.10+
- Node.js & pnpm
- PostgreSQL

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment and activate it:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables (refer to `.env.example`).
5. Run the server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend-user
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Configure environment variables (refer to `.env.example`).
4. Start the development server:
   ```bash
   pnpm dev
   ```

## 🔑 Environment Variables

### Backend (`backend/.env`)
| Variable | Description |
|----------|-------------|
| `ENV_LOADED` | Set to 'true' to signal environment is ready |
| `DATABASE_URL` | PostgreSQL connection string |
| `DB_ECHO` | If true, SQLAlchemy will log SQL queries |
| `JWT_SECRET_KEY` | Secret for generating JWT tokens |
| `SMTP_SERVER` | SMTP server for OTP emails |
| `SMTP_PORT` | SMTP port (e.g., 587) |
| `SMTP_USER` | SMTP username |
| `SMTP_PASSWORD` | SMTP password |
| `SMTP_FROM_EMAIL` | Sender email address for SMTP |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret key |
| `RESEND_API_KEY` | API key for Resend service |
| `RESEND_FROM_EMAIL` | Sender email address for Resend |
| `TELEGRAM_BOT_TOKEN` | Bot token for admin notifications |
| `TELEGRAM_CHAT_ID` | Chat ID for the admin group |
| `GOOGLE_SHEET_ID` | Spreadsheet ID for registration logging |
| `GOOGLE_SERVICE_ACCOUNT_B64` | Base64 encoded Google Service Account JSON |

### Frontend (`frontend-user/.env`)
| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend API root URL |
| `VITE_TURNSTILE_SITE_KEY` | Cloudflare Turnstile site key |

## 🐳 Docker Deployment

The backend is ready to be containerized. To build and run:
```bash
cd backend
docker build -t ideasprint-backend .
docker run -p 8000:8000 --env-file .env ideasprint-backend
```

---
Built with ❤️ for IdeaSprint 2026.
