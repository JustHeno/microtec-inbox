from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth_routes import router as auth_router
from app.api.chat_routes import router as chat_router
from app.api.contact_routes import router as contact_router
from app.api.facebook_routes import router as facebook_router
from app.api.staff_routes import router as staff_router

app = FastAPI(
    title="Microtec Chatbot API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Authentication
app.include_router(auth_router)

# Chatbot website
app.include_router(chat_router)

# Staff admin
app.include_router(staff_router)

# Facebook Messenger
app.include_router(facebook_router)

# Shopify / Contact Forms
app.include_router(contact_router)


@app.get("/")
def health():
    return {
        "status": "ok",
        "service": "Microtec Chatbot API",
        "version": "1.0.0",
    }


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "Microtec Chatbot API",
        "version": "1.0.0",
    }


@app.get("/routes")
def list_routes():
    return sorted(
        [
            {
                "path": route.path,
                "methods": list(route.methods),
            }
            for route in app.routes
        ],
        key=lambda x: x["path"],
    )