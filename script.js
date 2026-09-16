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
        throw new Error("SUSPENDED"); // Para a execução
      }
    } catch(e) {
      if (e.message === "SUSPENDED") throw e;
    }
  })();

  // ── Lê parâmetros da URL e sobrescreve CONFIG ──
  (function applyUrlParams() {
    const p = new URLSearchParams(window.location.search);

    // ── Caso 1: URL com parâmetros (?name=...) ──
    if (p.get("name")) {
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
      CONFIG.audio.enabled = !!audioUrl;
      CONFIG.audio.url     = audioUrl;
      CONFIG.audio.title   = get("audioTitle", "Minha música");
      CONFIG.audio.artist  = get("audioArtist", "Artista");

      // ── Auto-registra o perfil no ADMIN_DATA para aparecer no painel ──
      try {
        if (typeof registerProfile === "function") {
          registerProfile({
            name:       get("name"),
            username:   get("username", get("name")),
            desc:       get("desc"),
            status:     get("status"),
            location:   get("location"),
            title:      get("title"),
            avatar:     get("avatar"),
            mainbg:     get("mainbg"),
            entrancebg: get("entrancebg"),
            spotify:    get("spotify"),
            instagram:  get("instagram"),
            tiktok:     get("tiktok"),
            pinterest:  get("pinterest"),
            twitter:    get("twitter"),
            youtube:    get("youtube"),
            audio:      audioUrl,
            audioTitle: get("audioTitle"),
            audioArtist:get("audioArtist"),
          });
        }
      } catch(e) {}

      return;
    }

    // ── Caso 2: URL limpa — procura no ADMIN_DATA pelo username do config ──
    // Isso garante que alterações feitas em "Minha Conta" aparecem no perfil
    try {
      const saved = localStorage.getItem("paradise_admin_data");
      if (!saved) return;
      const adminData = JSON.parse(saved);
      if (!adminData.profiles || !adminData.profiles.length) return;

      // Busca pelo username ou nome configurado no config.js
      const configUsername = (CONFIG.profile.username || CONFIG.profile.name || "").toLowerCase().replace(/^@/,"").trim();
      const profile = adminData.profiles.find(pr =>
        (pr.username || "").toLowerCase().replace(/^@/,"").trim() === configUsername ||
        (pr.id       || "").toLowerCase().replace(/^@/,"").trim() === configUsername
      );

      if (!profile || !profile.data) return;
      const d = profile.data;

      if (d.name)        CONFIG.profile.name        = d.name;
      if (d.username)    CONFIG.profile.username     = d.username;
      if (d.desc)        CONFIG.profile.description  = d.desc;
      if (d.status)      CONFIG.profile.status       = d.status;
      if (d.location)    CONFIG.profile.location     = d.location;
      if (d.title)       CONFIG.ui.pageTitle         = d.title;
      if (d.avatar)    { CONFIG.images.avatar        = d.avatar; CONFIG.images.cardAvatar = d.avatar; }
      if (d.mainbg)      CONFIG.images.mainBg        = d.mainbg;
      if (d.entrancebg)  CONFIG.images.entranceBg    = d.entrancebg;

      const socials = ["spotify","instagram","tiktok","pinterest","twitter","youtube"];
      socials.forEach(s => {
        if (d[s]) CONFIG.socials[s] = { enabled: true, url: d[s], label: s.charAt(0).toUpperCase() + s.slice(1) };
        else      CONFIG.socials[s] = { enabled: false, url: "", label: s.charAt(0).toUpperCase() + s.slice(1) };
      });

      if (d.audio) {
        CONFIG.audio.enabled = true;
        CONFIG.audio.url     = d.audio;
        CONFIG.audio.title   = d.audioTitle  || "Música";
        CONFIG.audio.artist  = d.audioArtist || "Artista";
      }
    } catch(e) {}
  })();

  // ── Aguarda DOM ──────────────────────────────────────
  document.addEventListener("DOMContentLoaded", init);

  function init() {
    applyConfig();
    setupCustomCursor();
    setupEntrance();
    setupSecretAdmin();
    setupOwnerConfig();
    setupStoryRing();
    setupSearch();
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
      const player = document.getElementById("music-player");
      player.classList.remove("hidden");

      // Monta playlist: slot principal + slots extras do localStorage
      const playlist = [];
      if (C.audio.url) {
        playlist.push({ url: C.audio.url, title: C.audio.title || "Música", artist: C.audio.artist || "" });
      }
      // Slots extras do perfil salvo no localStorage
      try {
        const saved = localStorage.getItem("paradise_admin_data");
        if (saved) {
          const ad = JSON.parse(saved);
          const configUsername = (C.profile.username || C.profile.name || "").toLowerCase().replace(/^@/,"").trim();
          const profile = (ad.profiles || []).find(pr =>
            (pr.username||"").toLowerCase().replace(/^@/,"").trim() === configUsername ||
            (pr.id||"").toLowerCase().replace(/^@/,"").trim() === configUsername
          );
          if (profile && profile.data && profile.data.extraSlots) {
            profile.data.extraSlots.forEach(slot => {
              if (slot.url) playlist.push({ url: slot.url, title: slot.title || "Música", artist: slot.artist || "" });
            });
          }
        }
      } catch(e) {}

      // Configura playlist global
      window._playlist      = playlist;
      window._playlistIndex = 0;

      // Mostra/esconde botões prev/next
      const prevBtn = document.getElementById("music-prev");
      const nextBtn = document.getElementById("music-next");
      if (playlist.length > 1) {
        if (prevBtn) prevBtn.classList.remove("hidden");
        if (nextBtn) nextBtn.classList.remove("hidden");
        if (prevBtn) prevBtn.addEventListener("click", () => changeTrack(-1));
        if (nextBtn) nextBtn.addEventListener("click", () => changeTrack(1));
      }

      // Carrega primeira faixa
      loadTrack(0);
    }

    // ── Efeitos: cursor ──
    if (!C.effects.customCursor) {
      document.getElementById("custom-cursor").style.display = "none";
    }
  }

  // ═══════════════════════════════════════════════════
  // 1b. PLAYLIST — carregar faixa e navegar
  // ═══════════════════════════════════════════════════
  function loadTrack(index) {
    const playlist = window._playlist || [];
    if (!playlist.length) return;
    index = ((index % playlist.length) + playlist.length) % playlist.length;
    window._playlistIndex = index;

    const track = playlist[index];
    const url   = track.url || "";

    document.getElementById("music-title").textContent  = track.title  || "Música";
    document.getElementById("music-artist").textContent = track.artist || "";

    // Indicador de faixa se tiver mais de 1
    if (playlist.length > 1) {
      document.getElementById("music-artist").textContent =
        (track.artist || "") + (track.artist ? "  " : "") + `[${index + 1}/${playlist.length}]`;
    }

    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/);
    const audio   = document.getElementById("bg-audio");

    // Para o que estava tocando
    if (ytPlayer && typeof ytPlayer.stopVideo === "function") {
      try { ytPlayer.stopVideo(); } catch(e) {}
    }
    if (audio) { audio.pause(); audio.src = ""; }

    // Reseta estado do botão
    const iconPlay  = document.getElementById("icon-play");
    const iconPause = document.getElementById("icon-pause");
    const player    = document.getElementById("music-player");
    if (iconPlay)  iconPlay.classList.remove("hidden");
    if (iconPause) iconPause.classList.add("hidden");
    if (player)    player.classList.add("paused");

    // Limpa listeners antigos do toggle
    const toggle = document.getElementById("music-toggle");
    const newToggle = toggle.cloneNode(true);
    toggle.parentNode.replaceChild(newToggle, toggle);

    if (ytMatch) {
      if (audio) audio.style.display = "none";
      // Destroi player anterior se existir
      ytPlayer = null; ytReady = false; ytPendingPlay = false;
      const container = document.getElementById("yt-player-container");
      if (container) container.innerHTML = '<div id="yt-player"></div>';
      setupYouTubePlayer(ytMatch[1], CONFIG.audio.volume, CONFIG.audio.loop);
    } else if (url && !/spotify\.com|soundcloud\.com|deezer\.com/i.test(url)) {
      if (audio) {
        audio.style.display = "";
        audio.src    = url;
        audio.loop   = CONFIG.audio.loop;
        audio.volume = CONFIG.audio.volume;
      }
    }

    // Bind toggle na nova faixa
    function toggleTrack(e) {
      e.preventDefault();
      if (ytMatch) {
        if (!ytPlayer) return;
        const state = ytPlayer.getPlayerState();
        if (state === YT.PlayerState.PLAYING) ytPlayer.pauseVideo();
        else ytPlayer.playVideo();
      } else {
        if (!audio) return;
        if (audio.paused) {
          audio.play().then(() => {
            iconPlay && iconPlay.classList.add("hidden");
            iconPause && iconPause.classList.remove("hidden");
            player && player.classList.remove("paused");
          });
        } else {
          audio.pause();
          iconPlay && iconPlay.classList.remove("hidden");
          iconPause && iconPause.classList.add("hidden");
          player && player.classList.add("paused");
        }
      }
    }
    newToggle.addEventListener("click",    toggleTrack);
    newToggle.addEventListener("touchend", toggleTrack);
  }

  function changeTrack(direction) {
    const playlist = window._playlist || [];
    if (playlist.length <= 1) return;
    const newIndex = (window._playlistIndex || 0) + direction;
    loadTrack(newIndex);
    // Autoplay na troca
    setTimeout(() => {
      const url = (playlist[window._playlistIndex] || {}).url || "";
      const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/);
      if (ytMatch) {
        if (ytReady && ytPlayer) ytPlayer.playVideo();
        else ytPendingPlay = true;
      } else {
        const audio = document.getElementById("bg-audio");
        if (audio && audio.src) audio.play().catch(() => {});
      }
    }, 400);
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

  // Injeta a YouTube IFrame API uma única vez
  function loadYouTubeAPI() {
    if (document.getElementById("yt-api-script")) return;
    const tag = document.createElement("script");
    tag.id  = "yt-api-script";
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  }

  function setupYouTubePlayer(videoId, volume, loop) {
    loadYouTubeAPI();

    // Container invisível
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

    // Se a API já carregou, cria direto
    if (window.YT && window.YT.Player) {
      createYTPlayer();
    }
    // Caso contrário a callback onYouTubeIframeAPIReady vai criar
  }

  window.onYouTubeIframeAPIReady = function() {
    if (window._ytVideoId) createYTPlayer();
  };

  function createYTPlayer() {
    ytPlayer = new YT.Player("yt-player", {
      videoId: window._ytVideoId,
      playerVars: {
        autoplay:       0,
        controls:       0,
        disablekb:      1,
        fs:             0,
        modestbranding: 1,
        rel:            0,
        loop:           window._ytLoop ? 1 : 0,
        playlist:       window._ytVideoId,
      },
      events: {
        onReady: function(e) {
          ytReady = true;
          e.target.setVolume(window._ytVolume || 50);
          if (ytPendingPlay) {
            e.target.playVideo();
            ytPendingPlay = false;
          }
        },
        onStateChange: function(e) {
          const iconPlay  = document.getElementById("icon-play");
          const iconPause = document.getElementById("icon-pause");
          const player    = document.getElementById("music-player");
          if (e.data === YT.PlayerState.PLAYING) {
            iconPlay.classList.add("hidden");
            iconPause.classList.remove("hidden");
            player.classList.remove("paused");
          } else if (e.data === YT.PlayerState.PAUSED || e.data === YT.PlayerState.ENDED) {
            iconPlay.classList.remove("hidden");
            iconPause.classList.add("hidden");
            player.classList.add("paused");
          }
        }
      }
    });
  }

  function isYouTubeMode() {
    return !!window._ytVideoId;
  }

  function startAudio() {
    // loadTrack já configurou o toggle — só precisa dar play
    const url = ((window._playlist || [])[0] || {}).url || "";
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/);

    if (ytMatch) {
      if (ytReady && ytPlayer) ytPlayer.playVideo();
      else ytPendingPlay = true;
      return;
    }

    const audio     = document.getElementById("bg-audio");
    const iconPlay  = document.getElementById("icon-play");
    const iconPause = document.getElementById("icon-pause");
    const player    = document.getElementById("music-player");

    if (audio && audio.src) {
      audio.play().then(() => {
        if (iconPlay)  iconPlay.classList.add("hidden");
        if (iconPause) iconPause.classList.remove("hidden");
        if (player)    player.classList.remove("paused");
      }).catch(() => {});
    }
  }

  // ═══════════════════════════════════════════════════
  // 4. PARTÍCULAS / PÉTALAS
  // ═══════════════════════════════════════════════════
  function createParticles() {
    const container = document.getElementById("particles-container");
    const count     = CONFIG.effects.particleCount || 18;

    // Emojis da pasta /emoji — selecionados para combinar com o estilo do perfil
    const emojiFiles = [
      "emoji/dream.png",
      "emoji/gelzin_liox.png",
      "emoji/emu_liox.png",
      "emoji/_ghost_emoji.png",
      "emoji/_star_emoji.png",
      "emoji/_diamond_emoji.png",
      "emoji/_crown_emoji.png",
      "emoji/dindin_emoji.png",
      "emoji/_money_emoji.png",
      "emoji/defense_emoji.png",
      "emoji/_flag_emoji.png",
      "emoji/flag_emoji.png",
      "emoji/_staff_emoji.png",
      "emoji/brand_emoji.png",
    ];

    for (let i = 0; i < count; i++) {
      const petal = document.createElement("div");
      petal.classList.add("petal");

      // 85% imagens da pasta, 15% 😶‍🌫️
      const useImg = Math.random() > 0.15;

      if (useImg) {
        const src = emojiFiles[Math.floor(Math.random() * emojiFiles.length)];
        const img = document.createElement("img");
        img.src = src;
        img.alt = "";
        img.style.cssText = "width:100%;height:100%;object-fit:contain;pointer-events:none;";
        img.onerror = () => { petal.textContent = "😶‍🌫️"; img.remove(); petal.style.fontSize = "12px"; };
        petal.appendChild(img);
        const size = 14 + Math.random() * 20;
        petal.style.width  = size + "px";
        petal.style.height = size + "px";
        petal.style.fontSize = "0";
      } else {
        petal.textContent = "😶‍🌫️";
        petal.style.fontSize = `${10 + Math.random() * 14}px`;
      }

      petal.style.left             = `${Math.random() * 100}%`;
      const duration               = 6 + Math.random() * 12;
      petal.style.animationDuration = `${duration}s`;
      petal.style.animationDelay   = `${Math.random() * duration}s`;
      petal.style.opacity          = `${0.4 + Math.random() * 0.5}`;

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

  // ═══════════════════════════════════════════════════
  // 6. BOTÃO ADMIN SECRETO (clique triplo rápido no logo/nome)
  // ═══════════════════════════════════════════════════
  function setupSecretAdmin() {
    let clickCount = 0;
    let clickTimer = null;

    document.addEventListener("click", function(e) {
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
            setTimeout(() => { btn.style.display = "none"; }, 8000);
          }
        }
      }
    });
  }

  // ═══════════════════════════════════════════════════
  // 7. BOTÃO ⚙️ DO DONO DO PERFIL
  // ═══════════════════════════════════════════════════
  function setupOwnerConfig() {
    try {
      // ── Cria o botão ⚙️ — aparece sempre ──
      // Ao clicar: se já logado e é o dono, vai direto para minha-conta
      // Se não logado, vai para minha-conta onde faz login
      const btn = document.createElement("button");
      btn.id          = "owner-config-btn";
      btn.title       = "Configurar meu perfil";
      btn.textContent = "⚙️";
      btn.style.cssText = `
        position: fixed;
        top: 16px;
        right: 16px;
        z-index: 300;
        background: rgba(0,0,0,0.45);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255,255,255,0.25);
        border-radius: 50%;
        width: 46px;
        height: 46px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        cursor: pointer;
        box-shadow: 0 4px 18px rgba(0,0,0,0.35);
        transition: transform 0.2s, background 0.2s;
        line-height: 1;
        padding: 0;
      `;

      btn.addEventListener("mouseenter", () => {
        btn.style.background = "rgba(0,0,0,0.7)";
        btn.style.transform  = "scale(1.12) rotate(22deg)";
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.background = "rgba(0,0,0,0.45)";
        btn.style.transform  = "scale(1) rotate(0deg)";
      });

      btn.addEventListener("click", () => {
        window.location.href = "minha-conta.html";
      });

      document.body.appendChild(btn);

    } catch(e) {}
  }

  // ═══════════════════════════════════════════════════
  // 9. BARRA DE PESQUISA DE PERFIS
  // ═══════════════════════════════════════════════════
  function setupSearch() {
    const input    = document.getElementById("search-input");
    const results  = document.getElementById("search-results");
    const clearBtn = document.getElementById("search-clear");
    if (!input) return;

    input.addEventListener("input", () => {
      const q = input.value.trim().toLowerCase();
      clearBtn.style.display = q ? "" : "none";
      if (!q) { results.style.display = "none"; return; }
      buscarPerfis(q).catch(() => {});
    });

    // Fecha ao clicar fora — usa mousedown para não interferir no clique dos resultados
    document.addEventListener("mousedown", e => {
      const wrap = document.getElementById("search-bar-wrap");
      if (wrap && !wrap.contains(e.target)) {
        if (results) results.style.display = "none";
      }
    });
  }

  function limparBusca() {
    const input   = document.getElementById("search-input");
    const results = document.getElementById("search-results");
    const clrBtn  = document.getElementById("search-clear");
    if (input)   input.value = "";
    if (results) results.style.display = "none";
    if (clrBtn)  clrBtn.style.display  = "none";
  }

  // Cache em memória dos perfis remotos para não buscar toda hora
  let _profilesCache = null;
  let _profilesCacheTime = 0;
  const PROFILES_CACHE_TTL = 60 * 1000; // 1 minuto

  // URL do profiles-db.json no GitHub (raw)
  const PROFILES_DB_URL = "https://raw.githubusercontent.com/vaguinhoraquel2019-art/Perfil/main/profiles-db.json";

  async function carregarPerfisRemotos() {
    const now = Date.now();
    if (_profilesCache && (now - _profilesCacheTime) < PROFILES_CACHE_TTL) {
      return [..._profilesCache];
    }
    try {
      const res = await fetch(PROFILES_DB_URL + "?t=" + now, { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const json = await res.json();
      _profilesCache = json.profiles || [];
      _profilesCacheTime = now;
      return [..._profilesCache];
    } catch(e) {
      // fallback: localStorage
      try {
        const saved = localStorage.getItem("paradise_admin_data");
        if (saved) {
          const parsed = JSON.parse(saved);
          return parsed.profiles || [];
        }
      } catch(e2) {}
      return [];
    }
  }

  async function buscarPerfis(query) {
    const results = document.getElementById("search-results");
    if (!results) return;

    results.innerHTML = `<div class="search-no-result" style="opacity:0.5">🔍 Buscando...</div>`;
    results.style.display = "";

    // Carrega perfis remotos
    let profiles = await carregarPerfisRemotos();

    // Mescla com localStorage
    try {
      const saved = localStorage.getItem("paradise_admin_data");
      if (saved) {
        const localProfiles = JSON.parse(saved).profiles || [];
        localProfiles.forEach(lp => {
          if (!profiles.find(rp => rp.id === lp.id)) profiles.push(lp);
        });
      }
    } catch(e) {}

    // Filtra
    const q = query.toLowerCase().replace(/^@/, "");
    const matches = profiles.filter(p => {
      const name = (p.name     || "").toLowerCase();
      const user = (p.username || "").toLowerCase().replace(/^@/, "");
      return name.includes(q) || user.includes(q);
    }).slice(0, 8);

    results.innerHTML = "";

    if (matches.length === 0) {
      results.innerHTML = `<div class="search-no-result">Nenhum perfil encontrado</div>`;
      results.style.display = "";
      return;
    }

    matches.forEach(p => {
      const d = p.data || {};
      const item = document.createElement("a");
      item.className = "search-result-item";

      // Monta URL do perfil
      const base   = window.location.origin + window.location.pathname;
      const params = new URLSearchParams();
      const set = (k, v) => { if (v) params.set(k, v); };
      set("name",        d.name        || p.name);
      set("username",    d.username    || p.username);
      set("desc",        d.desc        || "");
      set("status",      d.status      || "");
      set("location",    d.location    || "");
      set("title",       d.title       || d.name || p.name);
      set("avatar",      d.avatar      || "");
      set("mainbg",      d.mainbg      || "");
      set("entrancebg",  d.entrancebg  || d.mainbg || "");
      set("spotify",     d.spotify     || "");
      set("instagram",   d.instagram   || "");
      set("tiktok",      d.tiktok      || "");
      set("audio",       d.audio       || "");
      set("audioTitle",  d.audioTitle  || "");
      set("audioArtist", d.audioArtist || "");
      item.href = base + "?" + params.toString();

      // Avatar
      const avatar = document.createElement("img");
      avatar.className = "sri-avatar";
      avatar.src = d.avatar || "";
      avatar.onerror = () => { avatar.style.background = "rgba(255,255,255,0.1)"; avatar.src = ""; };

      // Info
      const info = document.createElement("div");
      info.className = "sri-info";
      info.innerHTML = `
        <div class="sri-name">${escSearch(p.name || d.name || "Sem nome")}</div>
        <div class="sri-username">@${escSearch((p.username || d.username || "").replace(/^@/,""))}</div>
      `;

      item.appendChild(avatar);
      item.appendChild(info);
      results.appendChild(item);
    });

    results.style.display = "";
  }

  function escSearch(s) {
    return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  }

  // ═══════════════════════════════════════════════════
  // 8. CÍRCULO DE STORY NO AVATAR
  // ═══════════════════════════════════════════════════
  function setupStoryRing() {
    try {
      const p              = new URLSearchParams(window.location.search);
      const urlUsername    = (p.get("username") || p.get("name") || "").trim();
      const configUsername = (CONFIG.profile.username || CONFIG.profile.name || "").trim();

      // Tenta todos os candidatos de username
      const candidates = [urlUsername, configUsername,
        configUsername.replace(/^@/,""),
        configUsername.toLowerCase(),
        configUsername.replace(/^@/,"").toLowerCase()
      ].filter(Boolean);

      // Recarrega o ADMIN_DATA do localStorage agora (pode ter sido atualizado)
      try {
        const saved = localStorage.getItem("paradise_admin_data");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.stories) ADMIN_DATA.stories = parsed.stories;
        }
      } catch(e) {}

      // Encontra qual username tem story ativo
      let profileUsername = null;
      for (const cand of candidates) {
        if (cand && typeof hasActiveStory === "function" && hasActiveStory(cand)) {
          profileUsername = cand;
          break;
        }
      }

      // Mesmo sem story, faz o clique funcionar no avatar (abre viewer que mostra "sem stories")
      const avatarContainer = document.getElementById("avatar-container");
      const avatarRing      = document.getElementById("avatar-ring");
      if (!avatarContainer || !avatarRing) return;

      if (profileUsername) {
        // Tem story — mostra o círculo preto
        avatarContainer.classList.add("has-story");
        avatarRing.classList.add("story-clickable");
        avatarRing.title = "Ver story";
      }

      // Clique sempre funciona (com ou sem círculo)
      const targetUser = profileUsername || candidates[0] || configUsername;
      function openStory(e) {
        e.preventDefault();
        e.stopPropagation();
        const returnUrl = encodeURIComponent(window.location.href);
        window.location.href =
          `story-viewer.html?username=${encodeURIComponent(targetUser)}&return=${returnUrl}`;
      }

      if (profileUsername) {
        // Só adiciona listener se tem story
        avatarRing.addEventListener("click",    openStory);
        avatarRing.addEventListener("touchend", openStory);
      }

    } catch(e) {}
  }

})();