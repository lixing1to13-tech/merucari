import sys
import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

# If mercapi is installed from PyPI, no need to insert path.
# Keep local path fallback for development where mercapi is local.
sys.path.insert(0, "/home/leecy/work/mercapi")

from mercapi import Mercapi

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="."), name="static")

@app.get("/")
async def root():
    return {"status": "ok", "message": "Mercari API server is running"}

@app.get("/app")
async def app_page():
    return FileResponse("index.html")

class OrderRequest(BaseModel):
    productUrl: str
    username: str
    password: str
    quantity: int

@app.get("/api/search")
async def search(q: str):
    m = Mercapi()
    data = await m.search(q)
    items = [
        {
            "id": item.id_,
            "name": item.name,
            "price": item.price,
            "url": f"https://jp.mercari.com/item/{item.id_}",
        }
        for item in data.items[:10]
    ]
    return {"count": len(items), "items": items}

@app.get("/api/item")
async def item(id: str):
    m = Mercapi()
    item_data = await m.item(id)
    if not item_data:
        raise HTTPException(status_code=404, detail="Item not found")
    return {
        "id": item_data.id_,
        "name": item_data.name,
        "price": item_data.price,
        "description": item_data.description,
        "url": f"https://jp.mercari.com/item/{item_data.id_}",
    }

@app.post("/api/order")
async def order(req: OrderRequest):
    if req.quantity <= 0:
        raise HTTPException(status_code=400, detail="quantity must be positive")

    # 将 URL 的最后 id 解析为 mercari id，例如 /items/m123...
    try:
        item_id = req.productUrl.rstrip("/").split("/")[-1]
    except Exception:
        raise HTTPException(status_code=400, detail="invalid productUrl")

    m = Mercapi()
    item_data = await m.item(item_id)
    if item_data is None:
        raise HTTPException(status_code=404, detail="item not found")

    # 这里仅模拟下单，实际下单不是 mercapi 提供的
    return {
        "success": True,
        "orderId": f"ORD-{int(asyncio.get_running_loop().time())}",
        "productName": item_data.name,
        "totalPrice": item_data.price * req.quantity,
        "quantity": req.quantity,
        "note": "此为模拟下单（mercapi 仅支持查询）",
    }

class LikeRequest(BaseModel):
    item_id: str
    item_url: str = None

@app.post("/api/like")
async def like(req: LikeRequest):
    # 這裡只是模擬いいね動作。實際 mercari API 可能需要登錄和 CSRF，且 mercapi 目前不支持。
    return {
        "success": True,
        "message": f"已對商品 {req.item_id} 送出いいね",
        "item_id": req.item_id,
        "item_url": req.item_url,
    }
