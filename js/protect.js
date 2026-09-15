/* ═══════════════════════════════════════════════════════
   PARADISE PROFILE — PROTECT.JS
   Proteções client-side para o site
   ═══════════════════════════════════════════════════════ */
(function () {
  "use strict";

  // ── 1. Bloqueio de botão direito ──────────────────────
  document.addEventListener("contextmenu", function (e) {
    e.preventDefault();
    return false;
  });

  // ── 2. Bloqueio de seleção de texto ──────────────────
  document.addEventListener("selectstart", function (e) {
    e.preventDefault();
    return false;
  });

  // ── 3. Bloqueio de drag de imagens ────────────────────
  document.addEventListener("dragstart", function (e) {
    if (e.target.tagName === "IMG") {
      e.preventDefault();
      return false;
    }
  });

  // ── 4. Bloqueio de atalhos de teclado ─────────────────
  document.addEventListener("keydown", function (e) {
    const key = e.key ? e.key.toLowerCase() : "";
    const ctrl = e.ctrlKey || e.metaKey;

    // F12 — DevTools
    if (e.keyCode === 123) { e.preventDefault(); return false; }

    // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C — DevTools
    if (ctrl && e.shiftKey && (key === "i" || key === "j" || key === "c")) {
      e.preventDefault(); return false;
    }

    // Ctrl+U — ver código fonte
    if (ctrl && key === "u") { e.preventDefault(); return false; }

    // Ctrl+S — salvar página
    if (ctrl && key === "s") { e.preventDefault(); return false; }

    // Ctrl+C — copiar (apenas bloqueia na página, não em inputs)
    if (ctrl && key === "c" && !isInput(e.target)) {
      e.preventDefault(); return false;
    }

    // Ctrl+A — selecionar tudo (fora de inputs)
    if (ctrl && key === "a" && !isInput(e.target)) {
      e.preventDefault(); return false;
    }

    // Ctrl+P — imprimir
    if (ctrl && key === "p") { e.preventDefault(); return false; }
  });

  function isInput(el) {
    return el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
  }

  // ── 5. Detecção de DevTools aberto ────────────────────
  (function detectDevTools() {
    let devToolsOpen = false;

    // Método 1: diferença de tamanho da janela
    const threshold = 160;
    function check() {
      const widthDiff  = window.outerWidth  - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;
      if (widthDiff > threshold || heightDiff > threshold) {
        if (!devToolsOpen) {
          devToolsOpen = true;
          onDevToolsOpen();
        }
      } else {
        devToolsOpen = false;
      }
    }

    setInterval(check, 1000);

    // Método 2: debugger timing
    function debuggerCheck() {
      const start = performance.now();
      // eslint-disable-next-line no-debugger
      debugger;
      const end = performance.now();
      if (end - start > 100) {
        onDevToolsOpen();
      }
    }

    // Roda o check de debugger a cada 3s
    setInterval(debuggerCheck, 3000);

    function onDevToolsOpen() {
      // Limpa o conteúdo visível sem redirecionar (menos agressivo)
      console.clear();
      console.log(
        "%c⚠️ Acesso restrito",
        "color:#e05555;font-size:18px;font-weight:bold"
      );
      console.log(
        "%cEste site é protegido. O uso indevido do código é proibido.",
        "color:#8a90a8;font-size:13px"
      );
    }
  })();

  // ── 6. Proteção de imagens via CSS pointer-events ─────
  // (aplicado via injeção de estilo)
  const style = document.createElement("style");
  style.textContent = `
    img {
      -webkit-user-drag: none;
      user-drag: none;
      -webkit-user-select: none;
      user-select: none;
      pointer-events: none;
    }
    /* Permite clique em links e botões mas não em imagens soltas */
    a img, button img, .social-btn img {
      pointer-events: auto;
    }
    /* Bloqueia seleção de texto globalmente */
    body {
      -webkit-user-select: none;
      -moz-user-select: none;
      user-select: none;
    }
    /* Permite seleção em inputs */
    input, textarea, [contenteditable] {
      -webkit-user-select: text;
      user-select: text;
    }
  `;
  document.head.appendChild(style);

  // ── 7. Sanitização de inputs (anti-XSS) ──────────────
  // Intercepta qualquer input antes de processar
  window.sanitize = function (str) {
    if (typeof str !== "string") return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;")
      .trim();
  };

  // ── 8. Bloqueia console em produção ──────────────────
  // Só ativa se não estiver em localhost
  if (location.hostname !== "localhost" && location.hostname !== "127.0.0.1") {
    const noop = function () {};
    const methods = ["log", "debug", "info", "warn", "dir", "dirxml", "table", "trace", "group", "groupCollapsed", "groupEnd", "time", "timeEnd", "profile", "profileEnd", "count"];
    // Mantém error e warn para debugs legítimos, sobrescreve o resto
    methods.forEach(function (method) {
      try { console[method] = noop; } catch (e) {}
    });
  }

})();
