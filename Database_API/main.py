# Import required modules
import os
import mysql.connector
import jwt
import dotenv
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from mysql.connector import errorcode

# Load environment variables
dotenv.load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# Allow frontend connection
origins = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection helper
def get_connection():
    try:
        return mysql.connector.connect(
            user=os.environ['MYSQL_USER'],
            password=os.environ['MYSQL_PASSWORD'],
            host=os.environ['MYSQL_HOST'],
            database=os.environ['MYSQL_DB'],
        )
    except mysql.connector.Error as err:
        print("Database connection error:", err)
        raise HTTPException(status_code=500, detail="Database connection failed")

# Pydantic model for login body
class LoginRequest(BaseModel):
    voter_id: str
    password: str

SECRET_KEY = os.environ["SECRET_KEY"]

# ✅ LOGIN ENDPOINT (POST)
@app.post("/login")
def login(credentials: LoginRequest):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        "SELECT role FROM voters WHERE voter_id = %s AND password = %s",
        (credentials.voter_id, credentials.password)
    )
    user = cursor.fetchone()
    cursor.close()
    conn.close()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid voter ID or password"
        )

    # Create JWT token
    token = jwt.encode(
        {
            "voter_id": credentials.voter_id,
            "role": user["role"]
        },
        SECRET_KEY,
        algorithm="HS256"
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user["role"]
    }

# ✅ Example protected route (optional)
@app.get("/verify")
def verify(token: str):
    try:
        data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return {"valid": True, "data": data}
    except jwt.exceptions.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
