const form = document.getElementById("searchForm");
const status = document.getElementById("status");
const result = document.getElementById("result");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  status.className = "status running";
  status.textContent = "正在查询...";
  result.textContent = "";

  const query = form.query.value.trim();
  if (!query) {
    status.className = "status error";
    status.textContent = "请输入关键词。";
    return;
  }

  try {
    let response;
    let data;

    const urlMatch = query.match(/\/item\/(m[0-9a-zA-Z]+)/);
    if (urlMatch) {
      const itemId = urlMatch[1];
      response = await fetch(`http://127.0.0.1:8000/api/item?id=${encodeURIComponent(itemId)}`);
      data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "查询失败");
      }
      status.className = "status success";
      status.textContent = "商品详情查询成功。";
      result.textContent = `ID：${data.id}\n名称：${data.name}\n价格：¥${data.price}\n描述：${data.description || '无'}\nURL：${data.url || '无'}`;
      return;
    }

    response = await fetch(`http://127.0.0.1:8000/api/search?q=${encodeURIComponent(query)}`);
    data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || "查询失败");
    }

    status.className = "status success";
    status.textContent = `查询成功，最新 ${data.count} 件（最多 10 件）`;

    if (!data.items || data.items.length === 0) {
      result.textContent = "未找到商品。";
      return;
    }

    const rows = data.items.map((item) => {
      const url = item.url || "";
      const safeName = item.name.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      return `<div class="result-item" data-item-id="${item.id}" data-item-url="${url}"><div style="display:flex;align-items:center;justify-content:space-between;"><strong>${safeName}</strong><button class="like-btn" type="button">♡ いいね</button></div><div>ID：${item.id}</div><div>价格：¥${item.price}</div><div><a href="${url}" target="_blank">${url}</a></div></div>`;
    });

    result.innerHTML = rows.join("");

    // attach like click events
    const likeButtons = result.querySelectorAll('.like-btn');
    likeButtons.forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const card = btn.closest('.result-item');
        const itemId = card?.dataset.itemId;
        const itemUrl = card?.dataset.itemUrl;
        if (!itemId) return;

        try {
          const likeResp = await fetch('http://127.0.0.1:8000/api/like', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ item_id: itemId, item_url: itemUrl }),
          });
          const likeData = await likeResp.json();
          if (!likeResp.ok) {
            throw new Error(likeData.detail || 'いいね失敗');
          }
          btn.textContent = '❤️ いいね済み';
          btn.disabled = true;
          status.className = 'status success';
          status.textContent = `已對商品 ${itemId} 送出いいね`; 
          window.open(itemUrl, '_blank');
        } catch (error) {
          status.className = 'status error';
          status.textContent = 'いいね失敗：' + (error.message || error);
        }
      });
    });
  } catch (err) {
    status.className = "status error";
    status.textContent = "查询失败：" + (err.message || err);
    result.textContent = "";
  }
});
