import asyncio
import logging
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv

load_dotenv()
is_env_loaded = os.getenv("ENV_LOADED", "false")

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.FileHandler("log.log", "w", "utf-8"), logging.StreamHandler()],
    level=logging.INFO,
)
logger = logging.getLogger(__name__)
logging.getLogger('googleapiclient.discovery_cache').setLevel(logging.WARNING)
logger.info(f"Environment loaded: {is_env_loaded}")

from fastapi import FastAPI, Request
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from database.connection import Base, engine
from helpers.oauth import verify_oauth_token_on_startup
from helpers.otp_store import cleanup_expired_otps
from routes import otp, registration, submission


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up application and creating database tables")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Initializing OTP cleanup task")
    cleanup_task = asyncio.create_task(cleanup_expired_otps())

    await run_in_threadpool(verify_oauth_token_on_startup)

    yield
    logger.info("Shutting down application and cancelling OTP cleanup")
    cleanup_task.cancel()


app = FastAPI(
    title="ideasprint 2026 Backend", docs_url=None, redoc_url=None, lifespan=lifespan
)

limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])
app.state.limiter = limiter


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request, exc):
    return JSONResponse(
        status_code=429,
        content={"detail": "Too many requests. Please slow down and try again later."},
    )


origins = [
    "https://isportal.pages.dev",
    "https://isportal.hackx.lk",
    "http://localhost:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(registration.router)
app.include_router(submission.router)
app.include_router(otp.router)


@app.get("/")
@limiter.limit("10/minute")
def read_root(request: Request):
    return {
        "message": "Ah, you found the API. Now, what's your plan? 🙃",
        "dev": "Sasivarnasarma",
    }
