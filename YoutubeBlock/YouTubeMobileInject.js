/**
 * YouTube Mobile userscript -> Loon response injector
 * Source basis: YouTube 脚本手机版 v0.5.1 by sl00p
 * Target: https://m.youtube.com/*
 */

(function () {
  'use strict';

  var body = $response.body;
  if (typeof body !== 'string' || !body || body.indexOf('<html') === -1) {
    $done({});
    return;
  }

  // Prevent duplicate injection if the HTML is processed more than once.
  if (body.indexOf('id="loon-youtube-mobile-051"') !== -1) {
    $done({});
    return;
  }

  var headers = {};
  var originalHeaders = $response.headers || {};
  Object.keys(originalHeaders).forEach(function (key) {
    headers[key] = originalHeaders[key];
  });

  // The body length changes after injection.
  Object.keys(headers).forEach(function (key) {
    if (key.toLowerCase() === 'content-length') {
      delete headers[key];
    }
  });

  // Reuse an existing YouTube CSP nonce where possible so the injected script
  // can execute without weakening the page CSP.
  var nonce = '';
  var nonceMatch = body.match(/<script\b[^>]*\bnonce=(['"])([^'"]+)\1/i);
  if (nonceMatch && nonceMatch[2]) {
    nonce = nonceMatch[2];
  } else {
    // Fallback for pages without a usable nonce: remove CSP headers that would
    // otherwise block the injected inline script.
    Object.keys(headers).forEach(function (key) {
      var lower = key.toLowerCase();
      if (lower === 'content-security-policy' || lower === 'content-security-policy-report-only') {
        delete headers[key];
      }
    });
  }

  var pageScript = String.raw`(function() {
    'use strict';

    if (window.__LOON_YT_MOBILE_051__) return;
    window.__LOON_YT_MOBILE_051__ = true;

    // Display-ad containers from the original userscript.
    var adContainers = [
      '.GoogleActiveViewElement',
      '.companion-ad-container',
      'ytm-companion-ad-renderer'
    ];

    // Elements whose presence indicates that a video ad is playing.
    var adMarkers = [
      'ytp-ad-skip-button-container',
      'ytp-ad-skip-button-modern',
      'ytp-skip-ad-button',
      'ytp-ad-preview-container',
      'ytp-ad-timed-pie-countdown-container',
      'ytp-ad-text'
    ];

    var DOWNLOAD_ICON_PATH = 'M12 3a1 1 0 0 1 1 1v9.59l3.3-3.3a1 1 0 1 1 1.4 1.42l-5 5a1 1 0 0 1-1.4 0'
      + 'l-5-5a1 1 0 1 1 1.4-1.42l3.3 3.3V4a1 1 0 0 1 1-1ZM5 19a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H6a1 1 0 0 1-1-1Z';

    function removeAds() {
      adContainers.forEach(function(sel) {
        Array.prototype.forEach.call(document.querySelectorAll(sel), function(node) {
          try { node.remove(); } catch (e) {}
        });
      });
    }

    function skipAds() {
      var video = document.querySelector('video');
      if (!video || !isFinite(video.duration) || video.duration <= 0) return;

      var isAd = adMarkers.some(function(cls) {
        return document.getElementsByClassName(cls).length > 0;
      });

      if (isAd) {
        try {
          video.currentTime = video.duration;
        } catch (e) {}
      }
    }

    function buildDownloadIcon() {
      var ns = 'http://www.w3.org/2000/svg';
      var svg = document.createElementNS(ns, 'svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('width', '24');
      svg.setAttribute('height', '24');
      svg.setAttribute('focusable', 'false');
      svg.setAttribute('aria-hidden', 'true');
      svg.style.cssText = 'pointer-events:none;display:inherit;width:100%;height:100%';

      var path = document.createElementNS(ns, 'path');
      path.setAttribute('d', DOWNLOAD_ICON_PATH);
      svg.appendChild(path);
      return svg;
    }

    function injectDownloadButton() {
      // Keep the original behavior: do not inject on Shorts pages.
      if (window.location.href.indexOf('/shorts') !== -1) return;

      var bar = document.querySelector('.slim-video-action-bar-actions');
      if (!bar || bar.querySelector('[data-ytdl]')) return;

      var buttons = bar.querySelectorAll(':scope > button-view-model');
      if (!buttons || buttons.length < 1) return;

      var template = buttons[buttons.length - 1];
      var download = template.cloneNode(true);
      download.setAttribute('data-ytdl', '1');

      var innerButton = download.querySelector('button');
      if (innerButton) {
        innerButton.setAttribute('aria-label', '下载');
        innerButton.setAttribute('title', '下载');
      }

      var oldIcon = download.querySelector('svg');
      if (oldIcon) oldIcon.replaceWith(buildDownloadIcon());

      download.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        var target = 'https://yt5s.com/en50?q=' + encodeURIComponent(window.location.href);
        window.open(target, '_blank');
      }, true);

      if (template.parentElement) {
        template.parentElement.appendChild(download);
      }
    }

    function tick() {
      removeAds();
      skipAds();
      injectDownloadButton();
    }

    // The mobile site is an SPA, so keep checking after in-page navigation.
    setInterval(tick, 500);
    tick();
  })();`;

  var nonceAttr = nonce ? ' nonce="' + nonce.replace(/&/g, '&amp;').replace(/"/g, '&quot;') + '"' : '';
  var injection = '<script id="loon-youtube-mobile-051"' + nonceAttr + '>' + pageScript + '</script>';

  if (/<\/body>/i.test(body)) {
    body = body.replace(/<\/body>/i, injection + '</body>');
  } else if (/<\/html>/i.test(body)) {
    body = body.replace(/<\/html>/i, injection + '</html>');
  } else {
    body += injection;
  }

  $done({ body: body, headers: headers });
})();
