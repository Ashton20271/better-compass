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
    .home-schoolLogo { filter:none!important; }

    [class^="MuiBox-root css-"] { filter:none!important; }

    img, video, canvas, svg { filter:invert(1) hue-rotate(180deg); }

    [class*="avatar" i],
    .MuiAvatar-root,
    .MuiAvatar-root img,
    .teacherContainer__profileImage,
    .teacherContainer__profileImage img {
      filter:none!important;
    }

    [class*="compass-day-calendar-day-bd-evt"] {
      filter:invert(1) hue-rotate(180deg)!important;
    }

    [class*="compass-day-calendar-day-bd-evt"] * {
      filter:none!important;
    }
  `;
  document.head.appendChild(style);

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
    Hue<input id="h" type="range" min="0" max="360">
    Sat<input id="s" type="range" min="0" max="100">
    Light<input id="l" type="range" min="0" max="100">
  `;

  document.body.appendChild(picker);

  let currentBlock = null;
  let pinnedBlock = null;
  let hideTimer = null;

  const h = picker.querySelector("#h");
  const s = picker.querySelector("#s");
  const l = picker.querySelector("#l");
  const preview = picker.querySelector("#preview");

  function getKey(el) {
    return "tt-" + el.innerText.trim();
  }

  function hsl() {
    return `hsl(${h.value},${s.value}%,${l.value}%)`;
  }

  function applyColor() {
    if (!currentBlock) return;
    const c = hsl();
    preview.style.background = c;
    currentBlock.style.backgroundColor = c;
    localStorage.setItem(getKey(currentBlock), c);
  }

  function show(block) {
    clearTimeout(hideTimer);
    currentBlock = block;

    const r = block.getBoundingClientRect();
    picker.style.top = r.top + window.scrollY + "px";
    picker.style.left = r.right + window.scrollX + 6 + "px";
    picker.style.display = "block";

    const saved = localStorage.getItem(getKey(block));
    if (saved) {
      const m = saved.match(/\d+/g);
      if (m) [h.value, s.value, l.value] = m;
    }

    applyColor();
  }

  function hideDelayed() {
    if (currentBlock === pinnedBlock) return;
    hideTimer = setTimeout(() => {
      picker.style.display = "none";
      currentBlock = null;
    }, 3000);
  }

  document.addEventListener("contextmenu", e => {
    if (
      e.target.closest(".menu-svg-icon") ||
      e.target.closest(".x-box-inner") ||
      e.target.closest(".x-box-target") ||
      e.target.closest(".x-toolbar")
    )
      return;

    const block = e.target.closest(
      '[class*="timetable"],[class*="calendar"],.event'
    );

    if (!block) return;

    e.preventDefault();
    pinnedBlock = block;
    show(block);
  });

  picker.onmouseenter = () => clearTimeout(hideTimer);
  picker.onmouseleave = hideDelayed;

  [h, s, l].forEach(x => x.addEventListener("input", applyColor));

  function restoreColors() {
    document
      .querySelectorAll('[class*="timetable"],[class*="calendar"],.event')
      .forEach(el => {
        const c = localStorage.getItem(getKey(el));
        if (c) el.style.backgroundColor = c;
      });
  }

  setTimeout(restoreColors, 1500);
  window.addEventListener("load", restoreColors);

  if (/login|auth|saml/i.test(location.href)) {
    function clickSaml() {
      const btn = document.getElementById("SamlLoginButton");
      if (!btn) return false;

      const r = btn.getBoundingClientRect();
      const x = r.left + r.width / 2;
      const y = r.top + r.height / 2;

      ["pointerdown", "mousedown", "pointerup", "mouseup", "click"].forEach(
        type => {
          btn.dispatchEvent(
            new MouseEvent(type, {
              bubbles: true,
              cancelable: true,
              view: window,
              clientX: x,
              clientY: y
            })
          );
        }
      );

      return true;
    }

    let tries = 0;
    const timer = setInterval(() => {
      tries++;
      if (clickSaml() || tries > 40) clearInterval(timer);
    }, 300);
  }
})();
