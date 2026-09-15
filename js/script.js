/* ═══════════════════════════════════════════════════════
   😶‍🌫️ PARADISE PROFILE — SCRIPT.JS
   ═══════════════════════════════════════════════════════ */

(function () {
  "use strict";

  // ── Verifica suspensão antes de tudo ──
  (function checkSuspension() {
    const p = new URLSearchParams(window.location.search);
    const username = p.get("username") || p.get("name");
    if (!username) return;

    try {
      const saved = localStorage.getItem("paradise_admin_data");
      if (!saved) return;
      const adminData = JSON.parse(saved);
      if (!adminData.suspensions) return;

      const now = Date.now();
      const suspension = adminData.suspensions.find(s =>
        s.id === username && (!s.until || s.until > now)
      );

      if (suspension) {
        document.body.innerHTML = `
          <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0a0c14;font-family:Inter,sans-serif;text-align:center;padding:20px">
            <div style="max-width:400px">
              <div style="font-size:60px;margin-bottom:20px">🚫</div>
              <h1 style="color:#e8eaf0;font-size:22px;margin-bottom:10px">Perfil Suspenso</h1>
              <p style="color:#8a90a8;font-size:14px;line-height:1.6;margin-bottom:16px">
                Este perfil está temporariamente suspenso e não pode ser acessado.
              </p>
              ${suspension.reason ? `<div style="background:rgba(224,85,85,0.1);border:1px solid rgba(224,85,85,0.25);border-radius:8px;padding:12px;color:#e05555;font-size:13px;margin-bottom:16px"><strong>Motivo:</strong> ${suspension.reason}</div>` : ""}
              ${suspension.until ? `<p style="color:#4a5070;font-size:12px">Suspensão até: ${new Date(suspension.until).toLocaleString("pt-BR")}</p>` : `<p style="color:#4a5070;font-size:12px">Suspensão permanente</p>`}
            </div>
          </div>`;
        throw new Error("SUSPENDED");
      }
    } catch(e) {
      if (e.message === "SUSPENDED") throw e;
    }
  })();

  // ── Lê parâmetros da URL e sobrescreve CONFIG ──
  (function applyUrlParams() {
    const p = new URLSearchParams(window.location.search);
    if (!p.get("name")) return; // sem parâmetros, usa config.js normal

    const get = (k, def) => (p.get(k) && p.get(k).trim()) ? p.get(k).trim() : (def || "");

    CONFIG.profile.name        = get("name");
    CONFIG.profile.username    = get("username", "usuario.123");
    CONFIG.profile.description = get("desc", "⁺˖ ୨ minha frase ୧˖⁺");
    CONFIG.profile.status      = get("status", "meu status");
    CONFIG.profile.location    = get("location", "Minha cidade");
    CONFIG.ui.pageTitle        = get("title", get("name") + " ♡");
    CONFIG.images.avatar       = get("avatar");
    CONFIG.images.cardAvatar   = get("avatar");
    CONFIG.images.mainBg       = get("mainbg", "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1600&q=80");
    CONFIG.images.entranceBg   = get("entrancebg") || CONFIG.images.mainBg;

    const socials = ["spotify","instagram","tiktok","pinterest","twitter","youtube"];
    socials.forEach(s => {
      const url = get(s);
      CONFIG.socials[s] = { enabled: !!url, url: url, label: s.charAt(0).toUpperCase() + s.slice(1) };
    });

    const audioUrl = get("audio");
    CONFIG.audio.enabled     = !!audioUrl;
    CONFIG.audio.url         = audioUrl;
    CONFIG.audio.title       = get("audioTitle", "Minha música");
    CONFIG.audio.artist      = get("audioArtist", "Artista");
  })();

  // ── Aguarda DOM ──────────────────────────────────────
  document.addEventListener("DOMContentLoaded", init);

  function init() {
    applyConfig();
    setupCustomCursor();
    setupEntrance();
    setupSecretAdmin();
    setupOwnerConfig();
  }

  // ═══════════════════════════════════════════════════
  // 1. APLICAR CONFIGURAÇÕES
  // ═══════════════════════════════════════════════════
  function applyConfig() {
    const C = CONFIG;

    // ── Título e favicon ──
    document.getElementById("page-title").textContent = C.ui.pageTitle;

    // Atualiza favicon com emoji configurado
    const faviconSvg = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>${C.ui.faviconEmoji}</text></svg>`;
    let favicon = document.querySelector("link[rel='icon']");
    if (!favicon) {
      favicon = document.createElement("link");
      favicon.rel = "icon";
      document.head.appendChild(favicon);
    }
    favicon.href = faviconSvg;

    // ── Variáveis CSS do tema ──
    const root = document.documentElement;
    root.style.setProperty("--primary",           C.theme.primary);
    root.style.setProperty("--secondary",         C.theme.secondary);
    root.style.setProperty("--accent",            C.theme.accent);
    root.style.setProperty("--text",              C.theme.textColor);
    root.style.setProperty("--text-light",        C.theme.textLight);
    root.style.setProperty("--card-bg",           C.theme.cardBg);
    root.style.setProperty("--card-border",       C.theme.cardBorder);
    root.style.setProperty("--entrance-overlay",  C.theme.entranceOverlay);
    root.style.setProperty("--font-title",        `'${C.fonts.titleFont}', serif`);
    root.style.setProperty("--font-body",         `'${C.fonts.bodyFont}', sans-serif`);
    root.style.setProperty("--font-decor",        `'${C.fonts.decorFont}', cursive`);

    // ── Imagens ──
    if (C.images.entranceBg) {
      document.getElementById("entrance-bg").style.backgroundImage = `url('${C.images.entranceBg}')`;
    }
    if (C.images.mainBg) {
      document.getElementById("main-bg").style.backgroundImage = `url('${C.images.mainBg}')`;
    }
    if (C.images.avatar) {
      document.getElementById("avatar-img").src   = C.images.avatar;
      document.getElementById("avatar-img").alt   = C.profile.name;
    }
    if (C.images.cardAvatar) {
      document.getElementById("card-avatar").src  = C.images.cardAvatar;
      document.getElementById("card-avatar").alt  = C.profile.username;
    }

    // ── Blur da tela de entrada ──
    if (C.effects.entranceBlur) {
      document.getElementById("entrance-bg").style.filter = `blur(${C.effects.entranceBlur})`;
    }

    // ── Overlay de entrada ──
    document.getElementById("entrance-overlay").style.background = C.theme.entranceOverlay;

    // ── Texto de entrada ──
    document.getElementById("entrance-text").textContent = C.ui.enterText;

    // ── Perfil ──
    document.getElementById("profile-name").textContent        = C.profile.name;
    document.getElementById("profile-description").textContent = C.profile.description;
    document.getElementById("location-text").textContent       = C.profile.location;
    document.getElementById("card-username").textContent       = C.profile.username;
    document.getElementById("card-status").textContent         = C.profile.status;

    // Ícones do cartão
    const iconsEl = document.getElementById("card-icons");
    iconsEl.textContent = "";
    if (C.profile.cardIcons && C.profile.cardIcons.length) {
      C.profile.cardIcons.forEach(icon => {
        const span = document.createElement("span");
        span.textContent = icon;
        iconsEl.appendChild(span);
      });
    }

    // ── Redes sociais ──
    const socials = C.socials;
    Object.keys(socials).forEach(key => {
      const el = document.getElementById(`social-${key}`);
      if (!el) return;
      const data = socials[key];
      if (!data.enabled) {
        el.classList.add("hidden");
      } else {
        el.classList.remove("hidden");
        el.href  = data.url || "#";
        el.title = data.label || key;
      }
    });

    // ── Música ──
    if (C.audio.enabled) {
      const audio   = document.getElementById("bg-audio");
      const player  = document.getElementById("music-player");
      const url     = C.audio.url || "";

      document.getElementById("music-title").textContent  = C.audio.title;
      document.getElementById("music-artist").textContent = C.audio.artist;
      player.classList.remove("hidden");

      const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/);

      if (ytMatch) {
        audio.style.display = "none";
        setupYouTubePlayer(ytMatch[1], C.audio.volume, C.audio.loop);
      } else if (url && !/spotify\.com|soundcloud\.com|deezer\.com/i.test(url)) {
        audio.src    = url;
        audio.loop   = C.audio.loop;
        audio.volume = C.audio.volume;
      } else if (url) {
        document.getElementById("music-artist").textContent = "⚠️ link inválido — use .mp3 ou YouTube";
        document.getElementById("music-artist").style.color = "#e07070";
        document.getElementById("music-toggle").disabled = true;
        document.getElementById("music-toggle").style.opacity = "0.4";
      }
    }

    // ── Efeitos: cursor ──
    if (!C.effects.customCursor) {
      document.getElementById("custom-cursor").style.display = "none";
    }
  }

  // ═══════════════════════════════════════════════════
  // 2. TELA DE ENTRADA
  // ═══════════════════════════════════════════════════
  function setupEntrance() {
    const screen = document.getElementById("entrance-screen");
    screen.addEventListener("click", enterSite, { once: true });
    screen.addEventListener("touchend", enterSite, { once: true });
  }

  function enterSite() {
    const screen   = document.getElementById("entrance-screen");
    const mainPage = document.getElementById("main-page");
    const C        = CONFIG;

    // Fade out da tela de entrada
    screen.classList.add("fading-out");

    // Mostra a página principal
    setTimeout(() => {
      screen.classList.add("hidden");
      mainPage.classList.remove("hidden");

      if (C.effects.fadeIn) {
        mainPage.classList.add("fade-in");
      }

      // Inicia música se configurado
      if (C.audio.enabled && C.audio.autoplay) {
        startAudio();
      }

      // Inicia partículas
      if (C.effects.particles) {
        createParticles();
      }

    }, 900);
  }

  // ═══════════════════════════════════════════════════
  // 3. SISTEMA DE ÁUDIO
  // ═══════════════════════════════════════════════════

  let ytPlayer = null;
  let ytReady  = false;
  let ytPendingPlay = false;

  function loadYouTubeAPI() {
    if (document.getElementById("yt-api-script")) return;
    const tag = document.createElement("script");
    tag.id  = "yt-api-script";
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  }

  function setupYouTubePlayer(videoId, volume, loop) {
    loadYouTubeAPI();
    let container = document.getElementById("yt-player-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "yt-player-container";
      container.style.cssText = "position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;bottom:0;left:0;z-index:-1";
      document.body.appendChild(container);
    }
    container.innerHTML = '<div id="yt-player"></div>';
    window._ytVideoId = videoId;
    window._ytVolume  = Math.round((volume || 0.5) * 100);
    window._ytLoop    = loop !== false;
    if (window.YT && window.YT.Player) createYTPlayer();
  }

  window.onYouTubeIframeAPIReady = function() {
    if (window._ytVideoId) createYTPlayer();
  };

  function createYTPlayer() {
    ytPlayer = new YT.Player("yt-player", {
      videoId: window._ytVideoId,
      playerVars: { autoplay:0, controls:0, disablekb:1, fs:0, modestbranding:1, rel:0, loop: window._ytLoop ? 1 : 0, playlist: window._ytVideoId },
      events: {
        onReady: function(e) {
          ytReady = true;
          e.target.setVolume(window._ytVolume || 50);
          if (ytPendingPlay) { e.target.playVideo(); ytPendingPlay = false; }
        },
        onStateChange: function(e) {
          const iconPlay  = document.getElementById("icon-play");
          const iconPause = document.getElementById("icon-pause");
          const player    = document.getElementById("music-player");
          if (e.data === YT.PlayerState.PLAYING) {
            iconPlay.classList.add("hidden"); iconPause.classList.remove("hidden"); player.classList.remove("paused");
          } else if (e.data === YT.PlayerState.PAUSED || e.data === YT.PlayerState.ENDED) {
            iconPlay.classList.remove("hidden"); iconPause.classList.add("hidden"); player.classList.add("paused");
          }
        }
      }
    });
  }

  // ═══════════════════════════════════════════════════
  // 7. BOTÃO ⚙️ DO DONO DO PERFIL
  // ═══════════════════════════════════════════════════
  function setupOwnerConfig() {
    const p = new URLSearchParams(window.location.search);
    if (!p.get("name")) return;

    try {
      const sessionStr = sessionStorage.getItem("paradise_user_session");
      if (!sessionStr) return;
      const session = JSON.parse(sessionStr);

      const profileUsername = p.get("username") || p.get("name");
      if (session.profileId !== profileUsername && session.username !== profileUsername) return;

      const btn = document.createElement("a");
      btn.id        = "owner-config-btn";
      btn.href      = "minha-conta.html";
      btn.title     = "Configurar meu perfil";
      btn.textContent = "⚙️";
      btn.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 200;
        background: rgba(255,248,240,0.35);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(201,168,124,0.4);
        border-radius: 50%;
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        text-decoration: none;
        box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        transition: all 0.2s;
      `;
      btn.addEventListener("mouseenter", () => {
        btn.style.background = "rgba(255,248,240,0.65)";
        btn.style.transform  = "translateX(-50%) scale(1.1)";
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.background = "rgba(255,248,240,0.35)";
        btn.style.transform  = "translateX(-50%) scale(1)";
      });

      document.getElementById("main-page").appendChild(btn);
    } catch(e) {}
  }

  function isYouTubeMode() { return !!window._ytVideoId; }

  function startAudio() {
    const toggle    = document.getElementById("music-toggle");
    const player    = document.getElementById("music-player");
    const iconPlay  = document.getElementById("icon-play");
    const iconPause = document.getElementById("icon-pause");

    if (isYouTubeMode()) {
      if (ytReady && ytPlayer) { ytPlayer.playVideo(); } else { ytPendingPlay = true; }
      function toggleYT(e) {
        e.preventDefault();
        if (!ytPlayer) return;
        const state = ytPlayer.getPlayerState();
        if (state === YT.PlayerState.PLAYING) { ytPlayer.pauseVideo(); } else { ytPlayer.playVideo(); }
      }
      toggle.addEventListener("click",    toggleYT);
      toggle.addEventListener("touchend", toggleYT);
      return;
    }

    const audio = document.getElementById("bg-audio");
    audio.play().then(() => {
      iconPlay.classList.add("hidden"); iconPause.classList.remove("hidden"); player.classList.remove("paused");
    }).catch(() => { console.log("Autoplay bloqueado."); });

    function toggleAudio(e) {
      e.preventDefault();
      if (audio.paused) {
        audio.play().then(() => { iconPlay.classList.add("hidden"); iconPause.classList.remove("hidden"); player.classList.remove("paused"); });
      } else {
        audio.pause(); iconPlay.classList.remove("hidden"); iconPause.classList.add("hidden"); player.classList.add("paused");
      }
    }
    toggle.addEventListener("click",    toggleAudio);
    toggle.addEventListener("touchend", toggleAudio);
  }

  // ═══════════════════════════════════════════════════
  // 4. PARTÍCULAS / PÉTALAS
  // ═══════════════════════════════════════════════════
  function createParticles() {
    const container = document.getElementById("particles-container");
    const count     = CONFIG.effects.particleCount || 18;
    const petals    = ["😶‍🌫️"];

    for (let i = 0; i < count; i++) {
      const petal = document.createElement("div");
      petal.classList.add("petal");

      const emoji    = petals[Math.floor(Math.random() * petals.length)];
      petal.textContent = emoji;

      // Posição horizontal aleatória
      petal.style.left     = `${Math.random() * 100}%`;
      // Duração aleatória
      const duration       = 6 + Math.random() * 12;
      petal.style.animationDuration  = `${duration}s`;
      // Delay aleatório para não aparecerem todas ao mesmo tempo
      petal.style.animationDelay     = `${Math.random() * duration}s`;
      // Tamanho variado
      petal.style.fontSize = `${10 + Math.random() * 14}px`;
      // Opacidade variada
      petal.style.opacity  = `${0.4 + Math.random() * 0.5}`;

      container.appendChild(petal);
    }
  }

  // ═══════════════════════════════════════════════════
  // 5. CURSOR PERSONALIZADO
  // ═══════════════════════════════════════════════════
  function setupCustomCursor() {
    if (!CONFIG.effects.customCursor) return;

    const cursor = document.getElementById("custom-cursor");
    document.body.classList.add("custom-cursor-active");

    let mouseX = -100, mouseY = -100;
    let curX   = -100, curY   = -100;

    document.addEventListener("mousemove", e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    // Suavização com RAF
    function animateCursor() {
      curX += (mouseX - curX) * 0.18;
      curY += (mouseY - curY) * 0.18;
      cursor.style.left = curX + "px";
      cursor.style.top  = curY + "px";
      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Efeito ao clicar
    document.addEventListener("mousedown", () => {
      cursor.style.transform = "translate(-50%, -50%) scale(1.4)";
    });
    document.addEventListener("mouseup", () => {
      cursor.style.transform = "translate(-50%, -50%) scale(1)";
    });

    // Esconde em dispositivos touch
    document.addEventListener("touchstart", () => {
      cursor.style.display = "none";
      document.body.classList.remove("custom-cursor-active");
    }, { once: true });
  }

})();

  // ═══════════════════════════════════════════════════
  // 6. BOTÃO ADMIN SECRETO (clique triplo rápido no logo/nome)
  // ═══════════════════════════════════════════════════
  function setupSecretAdmin() {
    let clickCount = 0;
    let clickTimer = null;

    // Clique triplo rápido no nome do perfil revela o botão admin
    document.addEventListener("click", function(e) {
      // Só ativa se clicar no nome ou na descrição
      const target = e.target;
      if (
        target.id === "profile-name" ||
        target.id === "profile-description" ||
        target.id === "profile-location"
      ) {
        clickCount++;
        clearTimeout(clickTimer);
        clickTimer = setTimeout(() => { clickCount = 0; }, 600);

        if (clickCount >= 3) {
          clickCount = 0;
          const btn = document.getElementById("admin-btn");
          if (btn) {
            btn.style.display = "flex";
            // Esconde após 8 segundos se não clicar
            setTimeout(() => {
              btn.style.display = "none";
            }, 8000);
          }
        }
      }
    });
  }
