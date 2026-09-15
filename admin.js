/* ═══════════════════════════════════════════════════════
   😶‍🌫️ PARADISE PROFILE — ADMIN.JS
   ═══════════════════════════════════════════════════════ */

(function () {
  "use strict";

  // ── Estado atual (carregado do CONFIG ou localStorage) ──
  let state = {};

  document.addEventListener("DOMContentLoaded", () => {
    loadState();
    populateFields();
    bindNavigation();
    bindButtons();
    bindLivePreview();
    bindMobileMenu();
    updateGeneratedCode();
  });

  // ═══════════════════════════════════════════════════════
  // 1. CARREGAR ESTADO
  // ═══════════════════════════════════════════════════════
  function loadState() {
    // Tenta carregar do localStorage primeiro (salvo anteriormente)
    const saved = localStorage.getItem("paradise_config");
    if (saved) {
      try {
        state = JSON.parse(saved);
        return;
      } catch (e) { /* usa CONFIG padrão */ }
    }
    // Copia profunda do CONFIG padrão
    state = deepClone(CONFIG);
  }

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  // ═══════════════════════════════════════════════════════
  // 2. POPULAR CAMPOS DO FORMULÁRIO
  // ═══════════════════════════════════════════════════════
  function populateFields() {
    const s = state;

    // ── Imagens ──
    setVal("img-entranceBg",   s.images.entranceBg);
    setVal("img-mainBg",       s.images.mainBg);
    setVal("img-avatar",       s.images.avatar);
    setVal("img-cardAvatar",   s.images.cardAvatar);
    updateImgPreview("img-entranceBg",  "prev-entranceBg");
    updateImgPreview("img-mainBg",      "prev-mainBg");
    updateImgPreview("img-avatar",      "prev-avatar");
    updateImgPreview("img-cardAvatar",  "prev-cardAvatar");

    // ── Perfil ──
    setVal("profile-name",        s.profile.name);
    setVal("profile-description", s.profile.description);
    setVal("profile-location",    s.profile.location);
    setVal("card-username",       s.profile.username);
    setVal("card-status",         s.profile.status);
    setVal("card-icons",          (s.profile.cardIcons || []).join(" "));

    // ── Redes sociais ──
    const socials = ["spotify","instagram","pinterest","tiktok","twitter","youtube","patreon"];
    socials.forEach(key => {
      const data = s.socials[key];
      if (!data) return;
      setChecked(`social-${key}-enabled`, data.enabled);
      setVal(`social-${key}-url`, data.url);
    });

    // ── Áudio ──
    setChecked("audio-enabled",  s.audio.enabled);
    setVal("audio-url",          s.audio.url);
    setVal("audio-title",        s.audio.title);
    setVal("audio-artist",       s.audio.artist);
    setVal("audio-volume",       Math.round(s.audio.volume * 100));
    setChecked("audio-loop",     s.audio.loop);
    setChecked("audio-autoplay", s.audio.autoplay);
    updateVolumeDisplay();

    // ── Tema ──
    setVal("theme-primary",     s.theme.primary);
    setVal("theme-primary-hex", s.theme.primary);
    setVal("theme-secondary",     s.theme.secondary);
    setVal("theme-secondary-hex", s.theme.secondary);
    setVal("theme-accent",     s.theme.accent);
    setVal("theme-accent-hex", s.theme.accent);
    setVal("theme-cardBg",          s.theme.cardBg);
    setVal("theme-cardBorder",      s.theme.cardBorder);
    setVal("theme-entranceOverlay", s.theme.entranceOverlay);

    // ── Fontes ──
    setSelectVal("font-title", s.fonts.titleFont);
    setSelectVal("font-body",  s.fonts.bodyFont);
    setSelectVal("font-decor", s.fonts.decorFont);
    updateFontPreviews();

    // ── Efeitos ──
    setChecked("effect-particles",     s.effects.particles);
    setVal("effect-particleCount",     s.effects.particleCount);
    setChecked("effect-customCursor",  s.effects.customCursor);
    setChecked("effect-socialGlow",    s.effects.socialGlow);
    setChecked("effect-fadeIn",        s.effects.fadeIn);
    setVal("effect-entranceBlur",      parseInt(s.effects.entranceBlur) || 6);
    updateParticleDisplay();

    // ── UI ──
    setVal("ui-enterText",     s.ui.enterText);
    setVal("ui-pageTitle",     s.ui.pageTitle);
    setVal("ui-faviconEmoji",  s.ui.faviconEmoji);
  }

  // ═══════════════════════════════════════════════════════
  // 3. NAVEGAÇÃO ENTRE SEÇÕES
  // ═══════════════════════════════════════════════════════
  function bindNavigation() {
    const navItems  = document.querySelectorAll(".nav-item");
    const sections  = document.querySelectorAll(".config-section");
    const titleEl   = document.getElementById("section-title");

    navItems.forEach(item => {
      item.addEventListener("click", () => {
        const target = item.dataset.section;

        navItems.forEach(n => n.classList.remove("active"));
        sections.forEach(s => s.classList.remove("active"));

        item.classList.add("active");
        const sec = document.getElementById(`section-${target}`);
        if (sec) sec.classList.add("active");

        titleEl.textContent = item.textContent.trim().replace(/^[^\w\s]*\s*/, "").trim();

        // Fecha sidebar em mobile
        document.getElementById("sidebar").classList.remove("open");
      });
    });
  }

  // ═══════════════════════════════════════════════════════
  // 4. BOTÕES SALVAR / RESETAR
  // ═══════════════════════════════════════════════════════
  function bindButtons() {
    document.getElementById("btn-save").addEventListener("click", saveConfig);
    document.getElementById("btn-reset").addEventListener("click", resetConfig);
    document.getElementById("copy-code-btn").addEventListener("click", copyCode);
  }

  function saveConfig() {
    collectState();
    localStorage.setItem("paradise_config", JSON.stringify(state));
    generateConfigFile();
    showToast("✓ Configurações salvas! Atualize o config.js com o código gerado.", "success");
  }

  function resetConfig() {
    if (!confirm("Resetar todas as configurações para o padrão? Esta ação não pode ser desfeita.")) return;
    localStorage.removeItem("paradise_config");
    state = deepClone(CONFIG);
    populateFields();
    updateGeneratedCode();
    showToast("↺ Configurações resetadas para o padrão.", "success");
  }

  function copyCode() {
    const textarea = document.getElementById("generated-code");
    textarea.select();
    document.execCommand("copy");
    showToast("📋 Código copiado! Cole no arquivo config.js.", "success");
  }

  // ═══════════════════════════════════════════════════════
  // 5. COLETAR ESTADO DOS CAMPOS
  // ═══════════════════════════════════════════════════════
  function collectState() {
    const s = state;

    // Imagens
    s.images.entranceBg  = getVal("img-entranceBg");
    s.images.mainBg      = getVal("img-mainBg");
    s.images.avatar      = getVal("img-avatar");
    s.images.cardAvatar  = getVal("img-cardAvatar");

    // Perfil
    s.profile.name        = getVal("profile-name");
    s.profile.description = getVal("profile-description");
    s.profile.location    = getVal("profile-location");
    s.profile.username    = getVal("card-username");
    s.profile.status      = getVal("card-status");
    s.profile.cardIcons   = getVal("card-icons").split(/\s+/).filter(Boolean);

    // Sociais
    ["spotify","instagram","pinterest","tiktok","twitter","youtube","patreon"].forEach(key => {
      if (!s.socials[key]) s.socials[key] = {};
      s.socials[key].enabled = getChecked(`social-${key}-enabled`);
      s.socials[key].url     = getVal(`social-${key}-url`);
    });

    // Áudio
    s.audio.enabled  = getChecked("audio-enabled");
    s.audio.url      = getVal("audio-url");
    s.audio.title    = getVal("audio-title");
    s.audio.artist   = getVal("audio-artist");
    s.audio.volume   = parseInt(getVal("audio-volume")) / 100;
    s.audio.loop     = getChecked("audio-loop");
    s.audio.autoplay = getChecked("audio-autoplay");

    // Tema
    s.theme.primary          = getVal("theme-primary-hex") || getVal("theme-primary");
    s.theme.secondary        = getVal("theme-secondary-hex") || getVal("theme-secondary");
    s.theme.accent           = getVal("theme-accent-hex") || getVal("theme-accent");
    s.theme.cardBg           = getVal("theme-cardBg");
    s.theme.cardBorder       = getVal("theme-cardBorder");
    s.theme.entranceOverlay  = getVal("theme-entranceOverlay");

    // Fontes
    s.fonts.titleFont = getSelectVal("font-title");
    s.fonts.bodyFont  = getSelectVal("font-body");
    s.fonts.decorFont = getSelectVal("font-decor");

    // Efeitos
    s.effects.particles      = getChecked("effect-particles");
    s.effects.particleCount  = parseInt(getVal("effect-particleCount")) || 18;
    s.effects.customCursor   = getChecked("effect-customCursor");
    s.effects.socialGlow     = getChecked("effect-socialGlow");
    s.effects.fadeIn         = getChecked("effect-fadeIn");
    s.effects.entranceBlur   = `${getVal("effect-entranceBlur") || 6}px`;

    // UI
    s.ui.enterText    = getVal("ui-enterText");
    s.ui.pageTitle    = getVal("ui-pageTitle");
    s.ui.faviconEmoji = getVal("ui-faviconEmoji");
  }

  // ═══════════════════════════════════════════════════════
  // 6. GERAR CÓDIGO DO CONFIG.JS
  // ═══════════════════════════════════════════════════════
  function generateConfigFile() {
    const s = state;
    const iconsArr = (s.profile.cardIcons || []).map(i => `"${i}"`).join(", ");

    const code = `/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║              😶‍🌫️ PAINEL DE CONFIGURAÇÃO 😶‍🌫️                   ║
 * ║   Altere as informações abaixo para personalizar seu perfil  ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 *  Para editar visualmente, acesse admin.html no seu navegador.
 */

const CONFIG = {

  // ──────────────────────────────────────────────
  // 🖼️  IMAGENS
  // ──────────────────────────────────────────────
  images: {
    entranceBg:  "${esc(s.images.entranceBg)}",
    mainBg:      "${esc(s.images.mainBg)}",
    avatar:      "${esc(s.images.avatar)}",
    cardAvatar:  "${esc(s.images.cardAvatar)}",
  },

  // ──────────────────────────────────────────────
  // 👤  PERFIL
  // ──────────────────────────────────────────────
  profile: {
    name:        "${esc(s.profile.name)}",
    description: "${esc(s.profile.description)}",
    location:    "${esc(s.profile.location)}",
    username:    "${esc(s.profile.username)}",
    status:      "${esc(s.profile.status)}",
    cardIcons:   [${iconsArr}],
  },

  // ──────────────────────────────────────────────
  // 🔗  REDES SOCIAIS
  // ──────────────────────────────────────────────
  socials: {
    spotify:   { enabled: ${s.socials.spotify.enabled},   url: "${esc(s.socials.spotify.url)}",   label: "Spotify"   },
    instagram: { enabled: ${s.socials.instagram.enabled}, url: "${esc(s.socials.instagram.url)}", label: "Instagram" },
    pinterest: { enabled: ${s.socials.pinterest.enabled}, url: "${esc(s.socials.pinterest.url)}", label: "Pinterest" },
    tiktok:    { enabled: ${s.socials.tiktok.enabled},    url: "${esc(s.socials.tiktok.url)}",    label: "TikTok"    },
    twitter:   { enabled: ${s.socials.twitter.enabled},   url: "${esc(s.socials.twitter.url)}",   label: "Twitter"   },
    youtube:   { enabled: ${s.socials.youtube.enabled},   url: "${esc(s.socials.youtube.url)}",   label: "YouTube"   },
    patreon:   { enabled: ${s.socials.patreon.enabled},   url: "${esc(s.socials.patreon.url)}",   label: "Patreon"   },
  },

  // ──────────────────────────────────────────────
  // 🎵  MÚSICA
  // ──────────────────────────────────────────────
  audio: {
    enabled:  ${s.audio.enabled},
    url:      "${esc(s.audio.url)}",
    title:    "${esc(s.audio.title)}",
    artist:   "${esc(s.audio.artist)}",
    volume:   ${s.audio.volume.toFixed(2)},
    loop:     ${s.audio.loop},
    autoplay: ${s.audio.autoplay},
  },

  // ──────────────────────────────────────────────
  // 🎨  CORES E TEMA
  // ──────────────────────────────────────────────
  theme: {
    primary:          "${esc(s.theme.primary)}",
    secondary:        "${esc(s.theme.secondary)}",
    accent:           "${esc(s.theme.accent)}",
    textColor:        "${esc(s.theme.textColor || "#2d2d2d")}",
    textLight:        "${esc(s.theme.textLight || "#f5f0e8")}",
    cardBg:           "${esc(s.theme.cardBg)}",
    cardBorder:       "${esc(s.theme.cardBorder)}",
    entranceOverlay:  "${esc(s.theme.entranceOverlay)}",
  },

  // ──────────────────────────────────────────────
  // 🔤  FONTES
  // ──────────────────────────────────────────────
  fonts: {
    titleFont: "${esc(s.fonts.titleFont)}",
    bodyFont:  "${esc(s.fonts.bodyFont)}",
    decorFont: "${esc(s.fonts.decorFont)}",
  },

  // ──────────────────────────────────────────────
  // ✨  EFEITOS VISUAIS
  // ──────────────────────────────────────────────
  effects: {
    particles:      ${s.effects.particles},
    particleCount:  ${s.effects.particleCount},
    customCursor:   ${s.effects.customCursor},
    socialGlow:     ${s.effects.socialGlow},
    fadeIn:         ${s.effects.fadeIn},
    entranceBlur:   "${esc(s.effects.entranceBlur)}",
    parallax:       false,
  },

  // ──────────────────────────────────────────────
  // 📝  TEXTOS DA INTERFACE
  // ──────────────────────────────────────────────
  ui: {
    enterText:    "${esc(s.ui.enterText)}",
    pageTitle:    "${esc(s.ui.pageTitle)}",
    faviconEmoji: "${esc(s.ui.faviconEmoji)}",
  },

};

// Exporta para uso nos outros arquivos
if (typeof module !== "undefined") module.exports = CONFIG;
`;

    document.getElementById("generated-code").value = code;

    // Mostra a seção de código automaticamente
    showCodeSection();
  }

  function showCodeSection() {
    // Adiciona botão na nav se não existir
    if (!document.querySelector('[data-section="code"]')) {
      const nav = document.getElementById("sidebar-nav");
      const btn = document.createElement("button");
      btn.className = "nav-item";
      btn.dataset.section = "code";
      btn.innerHTML = '<span class="nav-icon">📋</span> Código Gerado';
      nav.appendChild(btn);
      btn.addEventListener("click", () => {
        document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
        document.querySelectorAll(".config-section").forEach(s => s.classList.remove("active"));
        btn.classList.add("active");
        document.getElementById("section-code").classList.add("active");
        document.getElementById("section-title").textContent = "Código Gerado";
      });
    }
  }

  function updateGeneratedCode() {
    collectState();
    generateConfigFile();
  }

  function esc(str) {
    return String(str || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  }

  // ═══════════════════════════════════════════════════════
  // 7. LIVE PREVIEW (atualiza enquanto digita)
  // ═══════════════════════════════════════════════════════
  function bindLivePreview() {
    // Preview de imagens
    bindImgPreview("img-entranceBg",  "prev-entranceBg");
    bindImgPreview("img-mainBg",      "prev-mainBg");
    bindImgPreview("img-avatar",      "prev-avatar");
    bindImgPreview("img-cardAvatar",  "prev-cardAvatar");

    // Volume display
    document.getElementById("audio-volume").addEventListener("input", updateVolumeDisplay);

    // Particle count display
    document.getElementById("effect-particleCount").addEventListener("input", updateParticleDisplay);

    // Color pickers — sincroniza picker <-> hex input
    bindColorPair("theme-primary");
    bindColorPair("theme-secondary");
    bindColorPair("theme-accent");

    // Fontes preview
    document.getElementById("font-title").addEventListener("change", updateFontPreviews);
    document.getElementById("font-decor").addEventListener("change", updateFontPreviews);

    // Temas prontos
    document.querySelectorAll(".preset-btn").forEach(btn => {
      btn.addEventListener("click", () => applyPreset(btn.dataset.preset));
    });
  }

  function bindImgPreview(inputId, previewId) {
    const input   = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    if (!input || !preview) return;

    input.addEventListener("input", () => {
      const url = input.value.trim();
      if (url) {
        preview.src   = url;
        preview.style.display = "block";
      } else {
        preview.style.display = "none";
      }
    });
  }

  function updateImgPreview(inputId, previewId) {
    const input   = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    if (!input || !preview) return;
    const url = input.value.trim();
    if (url) {
      preview.src = url;
      preview.style.display = "block";
    } else {
      preview.style.display = "none";
    }
  }

  function updateVolumeDisplay() {
    const val = document.getElementById("audio-volume").value;
    document.getElementById("volume-display").textContent = `${val}%`;
  }

  function updateParticleDisplay() {
    const val = document.getElementById("effect-particleCount").value;
    document.getElementById("particle-count-display").textContent = val;
  }

  function bindColorPair(id) {
    const picker = document.getElementById(id);
    const hex    = document.getElementById(`${id}-hex`);
    if (!picker || !hex) return;

    picker.addEventListener("input", () => {
      hex.value = picker.value;
    });

    hex.addEventListener("input", () => {
      const val = hex.value.trim();
      if (/^#[0-9a-fA-F]{3,6}$/.test(val)) {
        picker.value = val;
      }
    });
  }

  function updateFontPreviews() {
    const titleFont = getSelectVal("font-title");
    const decorFont = getSelectVal("font-decor");

    // Carrega as fontes dinamicamente se necessário
    loadGoogleFont(titleFont);
    loadGoogleFont(decorFont);

    setTimeout(() => {
      const prevTitle = document.getElementById("preview-title-font");
      const prevDecor = document.getElementById("preview-decor-font");
      if (prevTitle) prevTitle.style.fontFamily = `'${titleFont}', serif`;
      if (prevDecor) prevDecor.style.fontFamily = `'${decorFont}', cursive`;
    }, 300);
  }

  function loadGoogleFont(fontName) {
    const id = `font-${fontName.replace(/\s+/g, "-")}`;
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id   = id;
    link.rel  = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@400;600;700&display=swap`;
    document.head.appendChild(link);
  }

  // ═══════════════════════════════════════════════════════
  // 8. TEMAS PRONTOS
  // ═══════════════════════════════════════════════════════
  const PRESETS = {
    paradise: { primary: "#4a7c59", secondary: "#8faf7e", accent: "#c9a87c" },
    rose:     { primary: "#9b4f6e", secondary: "#d4849f", accent: "#e8b4c0" },
    lavender: { primary: "#6b5b95", secondary: "#a89cc8", accent: "#d4c5e8" },
    ocean:    { primary: "#2e6b8a", secondary: "#5fa8c8", accent: "#a8d4e8" },
    sakura:   { primary: "#c96a8a", secondary: "#e8a4b8", accent: "#f5d0dc" },
    golden:   { primary: "#8b6914", secondary: "#c4940a", accent: "#e8c85a" },
  };

  function applyPreset(preset) {
    const p = PRESETS[preset];
    if (!p) return;

    ["primary", "secondary", "accent"].forEach(key => {
      setVal(`theme-${key}`,     p[key]);
      setVal(`theme-${key}-hex`, p[key]);
    });

    // Marca o botão ativo
    document.querySelectorAll(".preset-btn").forEach(b => b.style.borderColor = "");
    const activeBtn = document.querySelector(`[data-preset="${preset}"]`);
    if (activeBtn) activeBtn.style.borderColor = "var(--accent)";

    showToast(`✓ Tema "${preset}" aplicado! Salve para confirmar.`, "success");
  }

  // ═══════════════════════════════════════════════════════
  // 9. MOBILE MENU
  // ═══════════════════════════════════════════════════════
  function bindMobileMenu() {
    const toggle  = document.getElementById("menu-toggle");
    const sidebar = document.getElementById("sidebar");

    toggle.addEventListener("click", () => {
      sidebar.classList.toggle("open");
    });

    // Fecha ao clicar fora
    document.addEventListener("click", e => {
      if (!sidebar.contains(e.target) && e.target !== toggle) {
        sidebar.classList.remove("open");
      }
    });
  }

  // ═══════════════════════════════════════════════════════
  // 10. TOAST
  // ═══════════════════════════════════════════════════════
  let toastTimer = null;

  function showToast(msg, type = "success") {
    const toast   = document.getElementById("toast");
    const msgEl   = document.getElementById("toast-msg");
    const iconEl  = document.getElementById("toast-icon");

    toast.classList.remove("hidden", "hiding", "error");
    msgEl.textContent = msg;
    iconEl.textContent = type === "success" ? "✓" : "✕";
    if (type === "error") toast.classList.add("error");

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.add("hiding");
      setTimeout(() => toast.classList.add("hidden"), 320);
    }, 3500);
  }

  // ═══════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════
  function getVal(id)            { const el = document.getElementById(id); return el ? el.value : ""; }
  function setVal(id, val)       { const el = document.getElementById(id); if (el) el.value = val ?? ""; }
  function getChecked(id)        { const el = document.getElementById(id); return el ? el.checked : false; }
  function setChecked(id, val)   { const el = document.getElementById(id); if (el) el.checked = !!val; }
  function getSelectVal(id)      { const el = document.getElementById(id); return el ? el.value : ""; }
  function setSelectVal(id, val) {
    const el = document.getElementById(id);
    if (!el) return;
    for (let i = 0; i < el.options.length; i++) {
      if (el.options[i].value === val) { el.selectedIndex = i; return; }
    }
    // Se não encontrar a opção exata, adiciona
    const opt = document.createElement("option");
    opt.value = val; opt.text = val;
    el.add(opt);
    el.value = val;
  }

})();
