from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ReturnDocument
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
import bcrypt
import jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


def get_required_env(name: str) -> str:
    value = os.getenv(name)
    if not value or not value.strip():
        raise RuntimeError(f"Variável de ambiente obrigatória ausente: {name}")
    return value.strip()


MONGO_URL = get_required_env("MONGO_URL")
DB_NAME = get_required_env("DB_NAME")
JWT_SECRET = get_required_env("JWT_SECRET")

JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

raw_allowed_origins = os.getenv("ALLOWED_ORIGINS", "")
ALLOWED_ORIGINS = [origin.strip() for origin in raw_allowed_origins.split(",") if origin.strip()]

if not ALLOWED_ORIGINS:
    logger.warning("ALLOWED_ORIGINS está vazio. Configure pelo menos uma origem permitida.")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="DM Motors API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer()


class AdminCreate(BaseModel):
    username: str
    password: str


class AdminLogin(BaseModel):
    username: str
    password: str


class SubmissionCreate(BaseModel):
    type: str
    client_name: str
    phone: str
    brand: str
    model: str
    year: int
    mileage: int
    color: str
    observations: Optional[str] = ""
    photos: List[str] = []


class Submission(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str
    client_name: str
    phone: str
    brand: str
    model: str
    year: int
    mileage: int
    color: str
    observations: Optional[str] = ""
    photos: List[str] = []
    status: str = "pending"
    created_at: datetime = Field(default_factory=datetime.utcnow)


class SubmissionUpdate(BaseModel):
    status: str


class VehicleCreate(BaseModel):
    brand: str
    model: str
    year: int
    mileage: int
    color: str
    price: float
    description: str
    photos: List[str] = []


class Vehicle(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    brand: str
    model: str
    year: int
    mileage: int
    color: str
    price: float
    description: str
    photos: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)


class VehicleUpdate(BaseModel):
    brand: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    mileage: Optional[int] = None
    color: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None
    photos: Optional[List[str]] = None


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))


def create_token(username: str) -> str:
    payload = {
        "sub": username,
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        username = payload.get("sub")

        if not username:
            raise HTTPException(status_code=401, detail="Token inválido")

        admin = await db.admins.find_one({"username": username})
        if not admin:
            raise HTTPException(status_code=401, detail="Admin não encontrado")

        return username
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")


async def init_admin():
    first_admin_username = os.getenv("FIRST_ADMIN_USERNAME")
    first_admin_password = os.getenv("FIRST_ADMIN_PASSWORD")

    if not first_admin_username or not first_admin_password:
        logger.warning("Admin inicial não configurado. Seed de admin ignorada.")
        return

    admin_exists = await db.admins.find_one({"username": first_admin_username})
    if admin_exists:
        logger.info("Admin inicial já existe.")
        return

    hashed_pw = hash_password(first_admin_password)
    await db.admins.insert_one(
        {
            "username": first_admin_username,
            "password": hashed_pw,
            "created_at": datetime.utcnow(),
        }
    )
    logger.info("Admin inicial criado com sucesso.")


@api_router.get("/")
async def root():
    return {"message": "DM Motors API"}


@api_router.post("/auth/login")
async def login(admin: AdminLogin):
    db_admin = await db.admins.find_one({"username": admin.username})

    if not db_admin or not verify_password(admin.password, db_admin["password"]):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")

    token = create_token(admin.username)
    return {"token": token, "username": admin.username}


@api_router.post("/submissions", response_model=Submission)
async def create_submission(submission: SubmissionCreate):
    submission_obj = Submission(**submission.dict())
    submission_data = submission_obj.dict()
    submission_data["_id"] = submission_data["id"]

    await db.submissions.insert_one(submission_data)
    return submission_obj


@api_router.get("/submissions", response_model=List[Submission])
async def get_submissions(current_admin: str = Depends(get_current_admin)):
    submissions = await db.submissions.find().sort("created_at", -1).to_list(1000)
    return [Submission(**sub) for sub in submissions]


@api_router.put("/submissions/{submission_id}", response_model=Submission)
async def update_submission(
    submission_id: str,
    update: SubmissionUpdate,
    current_admin: str = Depends(get_current_admin),
):
    result = await db.submissions.find_one_and_update(
        {"id": submission_id},
        {"$set": {"status": update.status}},
        return_document=ReturnDocument.AFTER,
    )

    if not result:
        raise HTTPException(status_code=404, detail="Solicitação não encontrada")

    return Submission(**result)


@api_router.delete("/submissions/{submission_id}")
async def delete_submission(
    submission_id: str,
    current_admin: str = Depends(get_current_admin),
):
    result = await db.submissions.delete_one({"id": submission_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Solicitação não encontrada")

    return {"message": "Solicitação excluída com sucesso"}


@api_router.get("/vehicles", response_model=List[Vehicle])
async def get_vehicles():
    vehicles = await db.vehicles.find().sort("created_at", -1).to_list(1000)
    return [Vehicle(**vehicle) for vehicle in vehicles]


@api_router.get("/vehicles/{vehicle_id}", response_model=Vehicle)
async def get_vehicle(vehicle_id: str):
    vehicle = await db.vehicles.find_one({"id": vehicle_id})

    if not vehicle:
        raise HTTPException(status_code=404, detail="Veículo não encontrado")

    return Vehicle(**vehicle)


@api_router.post("/vehicles", response_model=Vehicle)
async def create_vehicle(
    vehicle: VehicleCreate,
    current_admin: str = Depends(get_current_admin),
):
    vehicle_obj = Vehicle(**vehicle.dict())
    vehicle_data = vehicle_obj.dict()
    vehicle_data["_id"] = vehicle_data["id"]

    await db.vehicles.insert_one(vehicle_data)
    return vehicle_obj


@api_router.put("/vehicles/{vehicle_id}", response_model=Vehicle)
async def update_vehicle(
    vehicle_id: str,
    update: VehicleUpdate,
    current_admin: str = Depends(get_current_admin),
):
    update_data = {k: v for k, v in update.dict().items() if v is not None}

    if not update_data:
        raise HTTPException(status_code=400, detail="Nenhum dado para atualizar")

    result = await db.vehicles.find_one_and_update(
        {"id": vehicle_id},
        {"$set": update_data},
        return_document=ReturnDocument.AFTER,
    )

    if not result:
        raise HTTPException(status_code=404, detail="Veículo não encontrado")

    return Vehicle(**result)


@api_router.delete("/vehicles/{vehicle_id}")
async def delete_vehicle(
    vehicle_id: str,
    current_admin: str = Depends(get_current_admin),
):
    result = await db.vehicles.delete_one({"id": vehicle_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Veículo não encontrado")

    return {"message": "Veículo excluído com sucesso"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

 
@app.on_event("startup")
async def startup_event():
    await init_admin()
    logger.info("API iniciada com sucesso.")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
    logger.info("Conexão com MongoDB encerrada.")