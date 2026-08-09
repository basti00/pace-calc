/* TEMPORARY: swipe-feel tuning panel for pace-calc.
 *
 * index.html only fetches this file when the URL carries ?expo (or #expo), so a
 * normal load neither downloads it nor pays for it. It edits the page's TUNE object
 * in place — the defaults themselves live in index.html, and deleting this file
 * leaves them in force.
 *
 * Values tuned here persist in localStorage, but only ever apply to a ?expo load;
 * a plain load always uses the defaults compiled into index.html. Once a setting
 * feels right, move it into TUNE_DEFAULTS there.
 */
(() => {
  "use strict";

  const hook = window.__paceExpo;
  if (!hook) return;
  const TUNE = hook.tune, DEFAULTS = hook.defaults;

  const KEY = "paceSwipeTune2";  // bump the suffix whenever the defaults change
  try { Object.assign(TUNE, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (_) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(TUNE)); } catch (_) {} };

  /* ---------- chrome ---------- */
  const css = `
  #expoPanel {
    position: fixed; top: 6px; left: 6px; z-index: 50; width: 178px;
    background: var(--surface); border: 1px solid var(--axis); border-radius: 10px;
    box-shadow: var(--shadow); padding: 6px 8px 7px;
    font-family: var(--sans); font-size: 10px; line-height: 1.35; color: var(--ink-2);
  }
  #expoPanel h4 {
    margin: 0; font-size: 9.5px; font-weight: 640; color: var(--ink);
    letter-spacing: .08em; text-transform: uppercase;
    display: flex; align-items: center; gap: 6px;
  }
  #expoPanel h4 button {
    margin-left: auto; border: 0; background: none; color: var(--muted);
    font: inherit; font-size: 13px; line-height: 1; cursor: pointer; padding: 0 2px;
  }
  #expoPanel.min .ex-body { display: none; }
  .ex-body { display: grid; gap: 3px; margin-top: 6px; }
  .ex-row { display: grid; grid-template-columns: 48px 1fr 28px; align-items: center; gap: 5px; }
  .ex-row input[type=range] { height: 16px; }
  .ex-row input[type=range]::-webkit-slider-runnable-track { height: 3px; }
  .ex-row input[type=range]::-webkit-slider-thumb { width: 13px; height: 13px; border-width: 2px; margin-top: -5.5px; }
  .ex-row input[type=range]::-moz-range-thumb { width: 11px; height: 11px; border-width: 2px; }
  .ex-row i {
    font-family: var(--mono); font-style: normal; font-size: 9.5px;
    text-align: right; color: var(--ink);
  }
  .ex-toggle {
    display: flex; align-items: center; gap: 5px;
    font-size: 10.5px; font-weight: 620; color: var(--ink);
  }
  .ex-toggle input { width: 13px; height: 13px; margin: 0; accent-color: var(--accent); }
  .ex-meter {
    font-family: var(--mono); font-size: 9.5px; color: var(--muted);
    border-top: 1px solid var(--grid); margin-top: 4px; padding-top: 4px;
  }
  .ex-meter b { color: var(--accent); font-weight: 620; }
  .ex-note { color: var(--muted); font-size: 9px; line-height: 1.3; }
  .ex-note .nb { white-space: nowrap; font-family: var(--mono); }
  .ex-note button {
    font: inherit; font-size: 9px; color: var(--ink-2); cursor: pointer;
    background: var(--surface-2); border: 1px solid var(--hair);
    border-radius: 5px; padding: 1px 6px; margin-left: 2px;
  }`;
  document.head.append(Object.assign(document.createElement("style"), { textContent: css }));

  /* [id, TUNE key, min, max, step, label, formatter] */
  const FIELDS = [
    ["exPx",    "px",     3,   24,   1,    "px / step",  v => String(v)],
    ["exV0",    "v0",     20,  900,  10,   "start px/s", v => String(v)],
    ["exV1",    "v1",     200, 4000, 50,   "full px/s",  v => String(v)],
    ["exGmax",  "gmax",   1,   16,   0.5,  "max gain",   v => v.toFixed(1) + "×"],
    ["exCurve", "curve",  0.6, 5,    0.1,  "curve",      v => v.toFixed(1)],
    ["exEase",  "ease",   0.05, 1,   0.05, "smoothing",  v => v.toFixed(2)],
  ];

  const panel = document.createElement("aside");
  panel.id = "expoPanel";
  panel.innerHTML =
    '<h4>Swipe feel <button type="button" id="exMin" aria-label="collapse">–</button></h4>' +
    '<div class="ex-body">' +
      '<label class="ex-toggle"><input type="checkbox" id="exOn"> Expo acceleration</label>' +
      FIELDS.map(([id, , min, max, step, label]) =>
        `<div class="ex-row"><span>${label}</span>` +
        `<input type="range" id="${id}" min="${min}" max="${max}" step="${step}">` +
        `<i id="${id}V"></i></div>`).join("") +
      '<div class="ex-meter">v <b id="exSpd">0</b> px/s · gain <b id="exG">1.0</b>× ' +
        '· peak <b id="exPk">1.0</b>×</div>' +
      '<div class="ex-note">Off = plain linear scrub, for A/B. Tuned here only, and only ' +
        'for <span class="nb">?expo</span> — a plain load uses the built-in defaults. ' +
        '<button type="button" id="exReset">reset</button></div>' +
    '</div>';
  document.body.append(panel);

  const $ = id => document.getElementById(id);

  function sync() {
    $("exOn").checked = TUNE.on;
    FIELDS.forEach(([id, key, , , , , fmt]) => {
      $(id).value = String(TUNE[key]);
      $(id + "V").textContent = fmt(TUNE[key]);
    });
  }
  FIELDS.forEach(([id, key, , , , , fmt]) => {
    $(id).addEventListener("input", () => {
      TUNE[key] = Number($(id).value);
      $(id + "V").textContent = fmt(TUNE[key]);
      save();
    });
  });
  $("exOn").addEventListener("change", () => { TUNE.on = $("exOn").checked; save(); });
  $("exReset").addEventListener("click", () => {
    Object.assign(TUNE, DEFAULTS);
    try { localStorage.removeItem(KEY); } catch (_) {}
    sync();
  });
  $("exMin").addEventListener("click", () => {
    $("exMin").textContent = panel.classList.toggle("min") ? "+" : "–";
  });
  sync();

  // Live speed and gain, so a swipe that felt wrong can be read off afterwards.
  const spdEl = $("exSpd"), gEl = $("exG"), pkEl = $("exPk");
  let peak = 1;
  hook.onGain((sp, g, start) => {
    if (start) { peak = 1; pkEl.textContent = "1.0"; }
    if (g > peak) { peak = g; pkEl.textContent = peak.toFixed(1); }
    spdEl.textContent = String(Math.round(sp));
    gEl.textContent = g.toFixed(1);
  });
})();
