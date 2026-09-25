(function () {
  // Fixed at the working deployment's exec URL — updating the Apps Script
  // project's code and redeploying the SAME deployment (Manage deployments
  // > Edit > New version) keeps this URL valid; only "New deployment"
  // would require changing it here.
  const TRACKING_URL = 'https://script.google.com/macros/s/AKfycbzZe_DRuDA4KSnbAzXH65pvx70Hh1-trKNRX8Rj_UIPQeI11sqVysk5roSe_WUbV21K/exec';

  // Must match the TOKEN constant in apps-script/Code.gs exactly.
  const TRACKING_TOKEN = 'VlyuETgLI98jSA0KT6Jg74jpZnW2xgSOytHJv2nU';

  // Same storage key/shape as access-control.js's storeAccess(): {mode, email, ...}.
  const ACCESS_STORAGE_KEY = 'accessToken';

  function getStudentEmail() {
    try {
      const raw = SiteStorage.device.get(ACCESS_STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      // Visitor mode stores email:null on purpose — never logged.
      return (data && data.mode === 'full' && data.email) ? data.email : null;
    } catch (e) {
      return null;
    }
  }

  // Fire-and-forget by design: never awaited, never throws past this
  // function, never blocks or slows down the student. A flaky school wifi
  // dropping the request is silently a no-op.
  //
  // mode:'no-cors' with a plain string body (no explicit Content-Type) is
  // deliberate: Apps Script web apps only implement doGet/doPost, not
  // doOptions, so a request that triggers a CORS preflight (e.g. an
  // explicit 'application/json' header) would fail. This keeps it a
  // "simple request" — no preflight, response is opaque and unread, which
  // is fine since nothing here needs to read it back.
  window.logEvent = function (eventName, data) {
    try {
      const email = getStudentEmail();
      if (!email) return; // no account => no log, ever (visitors included)
      const payload = {
        token: TRACKING_TOKEN,
        email: email,
        page: location.pathname,
        event: eventName,
        data: data || {}
      };
      fetch(TRACKING_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify(payload)
      }).catch(function () {});
    } catch (e) {
      // Never let a tracking bug surface to the student.
    }
  };

  // Same payload shape as logEvent, but for events fired as the page is
  // being hidden/closed (pagehide, visibilitychange): a fetch() there can be
  // aborted mid-flight, while sendBeacon() is designed to keep running after
  // the page is gone. Falls back to a keepalive fetch on the rare browser
  // without sendBeacon support (or if it rejects the payload, e.g. over its
  // ~64KB queue limit).
  window.logEventBeacon = function (eventName, data) {
    try {
      const email = getStudentEmail();
      if (!email) return;
      const payload = {
        token: TRACKING_TOKEN,
        email: email,
        page: location.pathname,
        event: eventName,
        data: data || {}
      };
      const body = JSON.stringify(payload);
      const sent = navigator.sendBeacon && navigator.sendBeacon(TRACKING_URL, body);
      if (!sent) {
        fetch(TRACKING_URL, {
          method: 'POST',
          mode: 'no-cors',
          keepalive: true,
          body: body
        }).catch(function () {});
      }
    } catch (e) {
      // Never let a tracking bug surface to the student.
    }
  };
})();
