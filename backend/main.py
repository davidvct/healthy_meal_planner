from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.exceptions import HTTPException as FastAPIHTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.requests import Request
from fastapi.responses import JSONResponse

from .db import init_db
from .routers import auth, caretakers, dishes, health, mealplan, shopping_list, users
from .security import verify_access_token


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield


app = FastAPI(title="MealWise FastAPI Backend", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def require_jwt_for_api(request: Request, call_next):
    path = request.url.path
    if (
        request.method == "OPTIONS"
        or not path.startswith("/api")
        or path.startswith("/api/auth")
        or path.startswith("/api/health")
    ):
        return await call_next(request)

    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return JSONResponse(status_code=401, content={"error": "Missing bearer token"})

    token = auth_header[len("Bearer ") :].strip()
    try:
        payload = verify_access_token(token)
        request.state.auth = payload
    except Exception:
        return JSONResponse(status_code=401, content={"error": "Invalid or expired token"})

    return await call_next(request)

app.include_router(dishes.router, prefix="/api")
app.include_router(mealplan.router, prefix="/api")
app.include_router(shopping_list.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(caretakers.router, prefix="/api")
app.include_router(health.router, prefix="/api")
app.include_router(auth.router, prefix="/api")


@app.exception_handler(FastAPIHTTPException)
async def http_exception_handler(_: Request, exc: FastAPIHTTPException) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content={"error": str(exc.detail)})
