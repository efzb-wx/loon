// YouTube HD Plus - Loon injector
// Fetches the original UserScript from GreasyFork and injects it into YouTube web pages.
// Intended for Safari / web YouTube under Loon MITM.

const SOURCE =
  "https://update.greasyfork.org/scripts/508784/YouTube%20HD%20Plus.user.js";

const headers = Object.assign({}, $response.headers || {});
let body = $response.body || "";

function getHeader(name) {
  const key = Object.keys(headers).find(
    k => k.toLowerCase() === name.toLowerCase()
  );
  return key ? headers[key] : undefined;
}

function deleteHeader(name) {
  for (const k of Object.keys(headers)) {
    if (k.toLowerCase() === name.toLowerCase()) delete headers[k];
  }
}

function finish(newBody) {
  deleteHeader("content-security-policy");
  deleteHeader("content-security-policy-report-only");
  deleteHeader("content-length");
  deleteHeader("content-encoding");

  $done({
    response: {
      status: $response.status,
      headers,
      body: newBody
    }
  });
}

const contentType = String(getHeader("content-type") || "").toLowerCase();
const isHtml =
  contentType.includes("text/html") || /<html[\s>]/i.test(body);

if (!isHtml || !body) {
  $done({});
} else if (body.includes('id="loon-youtube-hd-plus"')) {
  $done({});
} else {
  $httpClient.get(
    {
      url: SOURCE,
      timeout: 10000
    },
    function (error, response, data) {
      if (error || !data) {
        console.log("[YouTube HD Plus] download failed: " + error);
        $done({});
        return;
      }

      // Strip the UserScript metadata block.
      let source = data.replace(
        /^\s*\/\/ ==UserScript==[\s\S]*?\/\/ ==\/UserScript==\s*/,
        ""
      );

      // GM.getValue / GM.setValue compatibility shim.
      // Stored per-origin with localStorage.
      const gmShim = `
window.GM = window.GM || {};
window.GM.getValue = async function(key, defaultValue) {
  try {
    const raw = localStorage.getItem("__loon_ythdp_" + key);
    return raw === null ? defaultValue : JSON.parse(raw);
  } catch (e) {
    return defaultValue;
  }
};
window.GM.setValue = async function(key, value) {
  try {
    localStorage.setItem("__loon_ythdp_" + key, JSON.stringify(value));
  } catch (e) {}
};
`;

      const injected =
        '<script id="loon-youtube-hd-plus">' +
        gmShim +
        "\n" +
        source +
        "\n</script>";

      if (/<\/body>/i.test(body)) {
        body = body.replace(/<\/body>/i, injected + "</body>");
      } else {
        body += injected;
      }

      finish(body);
    }
  );
}
