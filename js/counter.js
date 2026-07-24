/* =========================================================================
   VIEW COUNTER
   -------------------------------------------------------------------------
   GitHub Pages only serves static files — there's no server to keep a
   real global counter for you. This uses a free third-party counting API
   (CounterAPI, https://counterapi.dev) to get a real "how many people
   have viewed my portfolio" number across all visitors.

   If that service is ever unreachable, it falls back to a counter stored
   in the visitor's own browser (localStorage) so the page never breaks —
   it's just labeled "(this browser)" so it isn't mistaken for a global
   count.

   To use your own counter (recommended): sign up free at counterapi.dev,
   create a workspace, and replace WORKSPACE below with its name.
   ========================================================================= */
(function () {
  const WORKSPACE = "your-portfolio-workspace"; // <- replace with your CounterAPI workspace
  const COUNTER_NAME = "portfolio-views";
  const API_URL = `https://api.counterapi.dev/v1/${WORKSPACE}/${COUNTER_NAME}/up`;
  const LOCAL_KEY = "portfolio_local_view_count";

  function renderCount(value, isLocal) {
    const label = isLocal ? `${value} (this browser)` : String(value);
    document.querySelectorAll("#view-count, #footer-view-count").forEach((el) => {
      el.textContent = label;
    });
  }

  function localFallback() {
    let n = parseInt(localStorage.getItem(LOCAL_KEY) || "0", 10);
    n += 1;
    localStorage.setItem(LOCAL_KEY, String(n));
    renderCount(n, true);
  }

  async function bump() {
    try {
      const res = await fetch(API_URL, { method: "GET" });
      if (!res.ok) throw new Error("counter api unavailable");
      const data = await res.json();
      const count = data?.data?.up_count ?? data?.count;
      if (typeof count !== "number") throw new Error("unexpected response shape");
      renderCount(count, false);
    } catch (err) {
      localFallback();
    }
  }

  document.addEventListener("DOMContentLoaded", bump);
})();
