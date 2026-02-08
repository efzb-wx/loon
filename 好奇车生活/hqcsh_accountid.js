/**
 * Loon Script
 * 目标：GET https://channel.cheryfs.cn/archer/activity-api/cherycar/getEncryptKey
 * 从请求头里读取 accountId: xxxx，并写入持久化键 hqcsh
 */

(function () {
  try {
    const req = $request || {};
    const headers = req.headers || {};

    // 不区分大小写读取 header
    function getHeaderValueInsensitive(hs, key) {
      if (!hs) return "";
      const target = key.toLowerCase();
      for (const k in hs) {
        if (String(k).toLowerCase() === target) {
          return String(hs[k] ?? "").trim();
        }
      }
      return "";
    }

    const accountId = getHeaderValueInsensitive(headers, "accountId");

    if (!accountId) {
      console.log("[hqcsh] 请求头中未找到 accountId，跳过");
      $done({});
      return;
    }

    const ok = $persistentStore.write(accountId, "hqcsh");

    if (ok) {
      console.log(`[hqcsh] 写入成功：hqcsh = ${accountId}`);

      // ✅ 成功通知
      $notification.post(
            "获取到好奇车生活accountId",
            "",
            ""
      );
    } else {
      console.log("[hqcsh] 写入失败（persistentStore.write 返回 false）");
    }

    $done({});
  } catch (e) {
    console.log("[hqcsh] 脚本异常: " + String(e));
    $done({});
  }
})();
