(function () {
  const INVERT_KEY = "compass-invert-enabled";

  const inverted = localStorage.getItem(INVERT_KEY) !== "false";

  function applyInvert(state) {
    document.documentElement.style.filter = state
      ? "invert(1) hue-rotate(180deg)"
      : "none";
  }

  applyInvert(inverted);

  const toggle = document.createElement("button");
  toggle.textContent = inverted ? "Light Mode" : "Dark Mode";
  toggle.style.cssText = `
    position: fixed;
    bottom: 16px;
    right: 16px;
    z-index: 99999;
    background:#1f2937;
    color:white;
    border:none;
    padding:8px 12px;
    border-radius:6px;
    font-size:12px;
    cursor:pointer;
  `;
  document.body.appendChild(toggle);

  toggle.onclick = () => {
    const now = document.documentElement.style.filter === "none";
    applyInvert(now);
    localStorage.setItem(INVERT_KEY, now);
    toggle.textContent = now ? "Light Mode" : "Dark Mode";
  };

  const style = document.createElement("style");
  style.textContent = `
    img, video, canvas, svg {
      filter:invert(1) hue-rotate(180deg);
    }
  `;
  document.head.appendChild(style);


  function fixNews() {
    document.querySelectorAll(".MuiStack-root").forEach(stack => {
      if (!stack.innerText.includes("News")) return;

      stack.style.filter = "none";
      stack.style.backgroundColor = "#0e1621";
      stack.style.color = "#e6edf3";

      stack.querySelectorAll(".MuiPaper-root").forEach(card => {
        card.style.filter = "none";
        card.style.backgroundColor = "#0e1621";
        card.style.color = "#e6edf3";
        card.style.border = "1px solid rgba(255,255,255,0.08)";
      });

      stack.querySelectorAll(".MuiDivider-root").forEach(div => {
        div.style.backgroundColor = "rgba(255,255,255,0.12)";
      });

      stack.querySelectorAll("*").forEach(el => {
        el.style.filter = "none";
      });
    });
  }

  fixNews();
  setTimeout(fixNews, 300);
  setTimeout(fixNews, 1000);
  setTimeout(fixNews, 2500);

  new MutationObserver(fixNews).observe(document.body, {
    childList: true,
    subtree: true
  });

  const picker = document.createElement("div");
  picker.style.cssText = `
    position:absolute;
    z-index:99999;
    background:rgba(20,20,20,.95);
    color:white;
    padding:6px;
    border-radius:6px;
    font-size:10px;
    width:140px;
    display:none;
  `;

  picker.innerHTML = `
    <div id="preview" style="height:16px;margin-bottom:4px;border-radius:3px;"></div>
    Hue <input id="h" type="range" min="0" max="360">
    Sat <input id="s" type="range" min="0" max="100">
    Light <input id="l" type="range" min="0" max="100">
  `;

  document.body.appendChild(picker);

  const h = picker.querySelector("#h");
  const s = picker.querySelector("#s");
  const l = picker.querySelector("#l");
  const preview = picker.querySelector("#preview");

  let currentBlock = null;
  let pinnedBlock = null;

  function getKey(el) {
    if (!el) return null;
    if (el.dataset.colorKey) return el.dataset.colorKey;

    const key =
      "evt|" +
      (el.getAttribute("data-id") ||
        el.getAttribute("aria-label") ||
        el.textContent.replace(/\s+/g, " ").trim().slice(0, 80));

    el.dataset.colorKey = key;
    return key;
  }

  function hsl() {
    return `hsl(${h.value},${s.value}%,${l.value}%)`;
  }

  function applyColor() {
    if (!currentBlock) return;
    const key = getKey(currentBlock);
    if (!key) return;

    const color = hsl();
    currentBlock.style.backgroundColor = color;
    preview.style.background = color;
    localStorage.setItem(key, color);
  }

  function show(block) {
    currentBlock = block;

    const r = block.getBoundingClientRect();
    picker.style.top = r.top + window.scrollY + "px";
    picker.style.left = r.right + window.scrollX + 6 + "px";
    picker.style.display = "block";

    const key = getKey(block);
    const saved = key && localStorage.getItem(key);

    if (saved) {
      const m = saved.match(/\d+/g);
      if (m) [h.value, s.value, l.value] = m;
    }

    applyColor();
  }

  function closePicker() {
    picker.style.display = "none";
    currentBlock = null;
    pinnedBlock = null;
  }

  document.addEventListener("contextmenu", e => {
    const block = e.target.closest(
      '[class*="timetable"],[class*="calendar"],.event'
    );
    if (!block) return;

    e.preventDefault();
    pinnedBlock = block;
    show(block);
  });

  [h, s, l].forEach(x => x.addEventListener("input", applyColor));

  document.addEventListener(
    "pointerdown",
    e => {
      if (picker.style.display === "none") return;
      if (picker.contains(e.target)) return;

      const block = e.target.closest(
        '[class*="timetable"],[class*="calendar"],.event'
      );
      if (block === pinnedBlock) return;

      closePicker();
    },
    true
  );

  picker.addEventListener("pointerdown", e => e.stopPropagation());

  function restore(root = document) {
    root
      .querySelectorAll('[class*="timetable"],[class*="calendar"],.event')
      .forEach(el => {
        const key = getKey(el);
        const color = key && localStorage.getItem(key);
        if (color) el.style.backgroundColor = color;
      });
  }

  restore();
  window.addEventListener("load", restore);

  new MutationObserver(muts => {
    muts.forEach(m =>
      m.addedNodes.forEach(n => n.nodeType === 1 && restore(n))
    );
  }).observe(document.body, { childList: true, subtree: true });

  function autoClickLoginButton() {
    const loginButton = document.getElementById('SamlLoginButton');
    if (loginButton) {
      loginButton.click();
      console.log('SAML Sign-in button clicked automatically.');
    } else {
      console.log('SAML Sign-in button not found.');
    }
  }

  window.addEventListener('load', autoClickLoginButton);

  setTimeout(autoClickLoginButton, 5000);

  function observeAndClickLoginButton() {
    const observer = new MutationObserver(() => {
      const loginButton = document.getElementById('SamlLoginButton');
      if (loginButton) {
        loginButton.click();
        observer.disconnect();
        console.log('SAML Sign-in button clicked via MutationObserver.');
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  observeAndClickLoginButton();

})();
