import os
import logging
import pathlib
from fastapi import FastAPI, Form, HTTPException, Depends, File, UploadFile
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
from pydantic import BaseModel
from contextlib import asynccontextmanager
import json
import hashlib


# Define the path to the images & sqlite3 database
images = pathlib.Path(__file__).parent.resolve() / "images"
db = pathlib.Path(__file__).parent.resolve() / "db" / "mercari.sqlite3"


def get_db():
    if not db.exists():
        yield

    conn = sqlite3.connect(db)
    conn.row_factory = sqlite3.Row  # Return rows as dictionaries
    try:
        yield conn
    finally:
        conn.close()


# STEP 5-1: set up the database connection
def setup_database():
    pass


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_database()
    yield


app = FastAPI(lifespan=lifespan)

logger = logging.getLogger("uvicorn")
logger.level = logging.DEBUG
images = pathlib.Path(__file__).parent.resolve() / "images"
origins = [os.environ.get("FRONT_URL", "http://localhost:3000")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)


class HelloResponse(BaseModel):
    message: str


@app.get("/", response_model=HelloResponse)
def hello():
    return HelloResponse(**{"message": "Hello, world!"})


class AddItemResponse(BaseModel):
    message: str


# add_item is a handler to add a new item for POST /items .
@app.post("/items", response_model=AddItemResponse)
async def add_item(
    name: str = Form(...),
    category: str = Form(...),
    image: UploadFile = File(...),
    db: sqlite3.Connection = Depends(get_db),
):
    if not name:
        raise HTTPException(status_code=400, detail="name is required")
    
    # 画像をハッシュ化して保存する
    image_name = await hash_and_save_image(image)
    insert_item(Item(name=name, category=category, image_name=image_name))
    return AddItemResponse(**{"message": f"item received: {name}"})


class GetItemsResponse(BaseModel):
    items: list[dict]

@app.get("/items", response_model=GetItemsResponse)
def get_item():
    with open("items.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    return GetItemsResponse(**{"items": data["items"]})


@app.get("/items/{item_id}")
def get_nth_item(item_id: int):
    if item_id < 1:
        raise HTTPException(status_code=400, detail="ID should be larger than 1")
    
    with open("items.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    return data["items"][item_id - 1]


# get_image is a handler to return an image for GET /images/{filename} .
@app.get("/image/{image_name}")
async def get_image(image_name):
    # Create image path
    image = images / image_name

    if not image_name.endswith(".jpg"):
        raise HTTPException(status_code=400, detail="Image path does not end with .jpg")

    if not image.exists():
        logger.debug(f"Image not found: {image}")
        image = images / "default.jpg"

    return FileResponse(image)


class Item(BaseModel):
    name: str
    category: str
    image_name: str 

# 画像ファイルをSHA256ハッシュ化する
async def hash_and_save_image(image: UploadFile):
    if not image.filename.endswith(".jpg"):
        raise HTTPException(status_code=400, detail="Image path does not end with .jpg")

    # ハッシュ関数のインスタンスを作成する
    sha256 = hashlib.sha256()

    # アップロードされたimageのバイナリデータを非同期で取得する
    contents = await image.read()

    # ハッシュ計算を行う
    sha256.update(contents)

    # ファイル名をハッシュ値に変更
    res = f"{sha256.hexdigest()}.jpg"

    # 保存
    image_path = images / res
    with open(image_path, "wb") as f:
        f.write(contents)

    return res



def insert_item(item: Item):
    # STEP 4-1: add an implementation to store an item
    with open("items.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    new_item = {"name": item.name, "category": item.category, "image_name": item.image_name}
    data["items"].append(new_item)
    
    with open("items.json", "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)
    
    return