const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("."));

app.post("/api/order", async (req, res) => {
  const { productUrl, username, password, quantity } = req.body;

  if (!productUrl || !username || !password || !quantity || quantity <= 0) {
    return res.status(400).json({ success: false, error: "参数不全，必须包含 productUrl, username, password, quantity (>0)" });
  }

  try {
    // 模拟登录
    const loginOK = await login(username, password);
    if (!loginOK) {
      return res.status(403).json({ success: false, error: "登录失败，请检查账号密码" });
    }

    // 解析商品页（示例）
    const parsed = parseProductUrl(productUrl);
    if (!parsed) {
      return res.status(400).json({ success: false, error: "商品页地址解析失败" });
    }

    // 模拟下单
    const order = await checkout(parsed.productName, quantity);

    return res.json({
      success: true,
      orderId: order.orderId,
      productName: parsed.productName,
      totalPrice: order.totalPrice,
      quantity,
      note: "后端模拟下单成功"
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: "服务器出错：" + (err.message || err) });
  }
});

async function login(username, password) {
  // TODO: 如果你有真实 API，修改这段调用接口
  await delay(200);
  return username.length >= 1 && password.length >= 1;
}

function parseProductUrl(productUrl) {
  try {
    const u = new URL(productUrl);
    const segments = u.pathname.split("/").filter(Boolean);
    const productName = segments.length > 0 ? decodeURIComponent(segments[segments.length - 1]) : "煤炉商品";
    return { productId: productName, productName: productName || "煤炉商品", price: 1280 };
  } catch {
    return null;
  }
}

async function checkout(productName, quantity) {
  await delay(250);
  const unit = 1280;
  return { orderId: `ORD-${Date.now()}`, totalPrice: unit * quantity };
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});
