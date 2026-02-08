/**
 * Loon Script: 捕获 request body 中的 accountId: xxxx，并保存到持久化键 hqcsh
 * 适配：纯文本多行、JSON/URL 编码混合等情况（尽量容错）
 */

(function () {
  try {
    const req = $request || {};
    let body = req.body || "";

    if (!body) {
      console.log("[hqcsh] request body 为空，跳过");
      $done({});
      return;
    }

    // 尝试对 URL 编码内容做一次解码（不保证一定是编码的，失败就忽略）
    const candidates = [body];
    try {
      const decoded = decodeURIComponent(body);
      if (decoded && decoded !== body) candidates.push(decoded);
    } catch (e) {}

    // 也尝试把 + 当空格的场景
    if (body.includes("+")) {
      candidates.push(body.replace(/\+/g, " "));
    }

    // 统一在候选文本里找 accountId: xxxx
    // 你的例子是 16进制哈希串，因此优先匹配 [0-9a-f]
    // 同时也兼容带引号、带逗号、空格等
    const patterns = [
      /(?:^|\n|\r)\s*accountId\s*:\s*([0-9a-fA-F]{16,})\s*(?:\r?\n|$)/, // 行首 accountId:
      /accountId\s*:\s*([0-9a-fA-F]{16,})/                                // 任意位置兜底
    ];

    let accountId = "";

    for (const text of candidates) {
      for (const re of patterns) {
        const m = text.match(re);
        if (m && m[1]) {
          accountId = m[1].trim();
          break;
        }
      }
      if (accountId) break;
    }

    if (!accountId) {
      console.log("[hqcsh] 未在请求体中找到 accountId: 开头的数据");
      $done({});
      return;
    }

    const ok = $persistentStore.write(accountId, "hqcsh");

    if (ok) {
      console.log(`[hqcsh] 已写入 hqcsh = ${accountId}`);
    } else {
      console.log("[hqcsh] 写入持久化失败");
    }

    $done({});
  } catch (err) {
    console.log("[hqcsh] 脚本异常: " + String(err));
    $done({});
  }
})();
