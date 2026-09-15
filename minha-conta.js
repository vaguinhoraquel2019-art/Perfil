/* ═══════════════════════════════════════════════════════
   PARADISE PROFILE — MINHA-CONTA.JS
   ═══════════════════════════════════════════════════════ */

let currentAccount = null; // conta logada

// ═══════════════════════════════════════════════════════
// LOGIN / LOGOUT
// ═══════════════════════════════════════════════════════
function doLogin() {
  const user = document.getElementById("login-user").value.trim();
  const pass = document.getElementById("login-pass").value;

  const account = loginUserAccount(user, pass);

  if (!account) {
    const err = document.getElementById("login-error");
    err.style.display = "block";
    document.getElementById("login-pass").value = "";
    return;
  }

  currentAccount = account;
  setUserSession(account);
  showPanel();
}

function doLogout() {
  currentAccount = null;
  clearUserSession();
  document.getElementById("user-panel").style.display   = "none";
  document.getElementById("login-screen").style.display = "";
  document.getElementById("login-user").value = "";
  document.getElementById("login-pass").value = "";
}

// Restaura sessão
(function () {
  const s = getUserSession();
  if (s) {
    // Valida que a conta ainda existe e senha não mudou
    const valid = loginUserAccount(s.username, s.password);
    if (valid) {
      currentAccount = valid;
      showPanel();
      return;
    }
    clearUserSession();
  }
})();

// Enter no login
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("login-pass").addEventListener("keydown", e => {
    if (e.key === "Enter") doLogin();
  });
  document.getElementById("login-user").addEventListener("keydown", e => {
    if (e.key === "Enter") document.getElementById("login-pass").focus();
  });
});

// ═══════════════════════════════════════════════════════
// MOSTRAR PAINEL
// ═══════════════════════════════════════════════════════
function showPanel() {
  document.getElementById("login-screen").style.display = "none";
  document.getElementById("user-panel").style.display   = "";

  document.getElementById("uc-username").textContent = "@" + currentAccount.username;

  // Recarrega dados frescos do localStorage
  try {
    const saved = localStorage.getItem("paradise_admin_data");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.profiles)      ADMIN_DATA.profiles      = parsed.profiles;
      if (parsed.user_accounts) ADMIN_DATA.user_accounts = parsed.user_accounts;
    }
  } catch(e) {}

  // Carrega dados do perfil nos campos
  const norm = s => (s||"").toLowerCase().replace(/^@/,"").trim();
  const profile =
    ADMIN_DATA.profiles.find(p => p.id === currentAccount.profileId) ||
    ADMIN_DATA.profiles.find(p => p.id === currentAccount.username)  ||
    ADMIN_DATA.profiles.find(p => norm(p.username) === norm(currentAccount.username)) ||
    ADMIN_DATA.profiles.find(p => norm(p.id) === norm(currentAccount.username));

  if (profile && profile.data) {
    fillForm(profile.data);
    updateViewBtn(profile.data);
  } else {
    // Sem perfil registrado — tenta carregar do CONFIG (perfil padrão do site)
    try {
      if (typeof CONFIG !== "undefined" && CONFIG.profile) {
        const C = CONFIG;
        const defaultData = {
          name:        C.profile.name        || "",
          username:    C.profile.username    || "",
          desc:        C.profile.description || "",
          status:      C.profile.status      || "",
          location:    C.profile.location    || "",
          title:       C.ui.pageTitle        || C.profile.name + " ♡",
          avatar:      C.images.avatar       || "",
          mainbg:      C.images.mainBg       || "",
          entrancebg:  C.images.entranceBg   || "",
          spotify:     C.socials.spotify     && C.socials.spotify.enabled   ? C.socials.spotify.url   : "",
          instagram:   C.socials.instagram   && C.socials.instagram.enabled ? C.socials.instagram.url : "",
          tiktok:      C.socials.tiktok      && C.socials.tiktok.enabled    ? C.socials.tiktok.url    : "",
          pinterest:   C.socials.pinterest   && C.socials.pinterest.enabled ? C.socials.pinterest.url : "",
          twitter:     C.socials.twitter     && C.socials.twitter.enabled   ? C.socials.twitter.url   : "",
          youtube:     C.socials.youtube     && C.socials.youtube.enabled   ? C.socials.youtube.url   : "",
          audio:       C.audio.enabled ? C.audio.url    : "",
          audioTitle:  C.audio.title   || "",
          audioArtist: C.audio.artist  || "",
        };
        fillForm(defaultData);
        updateViewBtn(defaultData);
        // Registra automaticamente para salvar no sistema
        registerProfile(defaultData);
      } else {
        updateViewBtn({ name: currentAccount.username, username: currentAccount.username });
      }
    } catch(e) {
      updateViewBtn({ name: currentAccount.username, username: currentAccount.username });
    }
  }

  goTab("perfil");
}

function fillForm(d) {
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ""; };
  set("e-name",        d.name);
  set("e-username",    d.username);
  set("e-desc",        d.desc);
  set("e-status",      d.status);
  set("e-location",    d.location);
  set("e-title",       d.title);
  set("e-avatar",      d.avatar);
  set("e-mainbg",      d.mainbg);
  set("e-entrancebg",  d.entrancebg);
  set("e-spotify",     d.spotify);
  set("e-instagram",   d.instagram);
  set("e-tiktok",      d.tiktok);
  set("e-pinterest",   d.pinterest);
  set("e-twitter",     d.twitter);
  set("e-youtube",     d.youtube);
  // Slot 1 (padrão)
  set("e-audio",       d.audio);
  set("e-audioTitle",  d.audioTitle);
  set("e-audioArtist", d.audioArtist);
  // Slots extras (music_slot_2, music_slot_3...)
  if (d.extraSlots && Array.isArray(d.extraSlots)) {
    d.extraSlots.forEach((slot, i) => {
      const n = i + 2;
      const urlEl   = document.getElementById(`e-audio-${n}`);
      const titEl   = document.getElementById(`e-audioTitle-${n}`);
      const artEl   = document.getElementById(`e-audioArtist-${n}`);
      if (urlEl) urlEl.value   = slot.url    || "";
      if (titEl) titEl.value   = slot.title  || "";
      if (artEl) artEl.value   = slot.artist || "";
    });
  }

  // Previews
  if (d.avatar)  previewImg("e-avatar",  "prev-avatar");
  if (d.mainbg)  previewImg("e-mainbg",  "prev-mainbg");
}

function updateViewBtn(d) {
  // Monta só os parâmetros relevantes (exclui campos vazios)
  const keys = ["name","username","desc","status","location","title",
                "avatar","mainbg","entrancebg",
                "spotify","instagram","tiktok","pinterest","twitter","youtube",
                "audio","audioTitle","audioArtist"];
  const params = new URLSearchParams();
  keys.forEach(k => { if (d[k]) params.set(k, d[k]); });
  const base = window.location.origin + window.location.pathname.replace("minha-conta.html", "index.html");
  document.getElementById("uc-view-btn").href = base + "?" + params.toString();
}

// ═══════════════════════════════════════════════════════
// ABAS
// ═══════════════════════════════════════════════════════
function goTab(name) {
  document.querySelectorAll(".uc-tab-content").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".uc-tab").forEach(b => b.classList.remove("active"));
  document.getElementById("tab-" + name).classList.add("active");
  document.querySelector(`[data-tab="${name}"]`).classList.add("active");

  // Esconde footer de salvar na aba senha e loja e stories
  document.getElementById("uc-footer").style.display =
    (name === "senha" || name === "loja" || name === "stories") ? "none" : "";

  if (name === "loja")    renderLoja();
  if (name === "musica")  renderMusicSlots();
  if (name === "stories") renderStoriesMC();
}

// ═══════════════════════════════════════════════════════
// SALVAR PERFIL
// ═══════════════════════════════════════════════════════
function saveProfile() {
  if (!currentAccount) return;

  const get = id => { const el = document.getElementById(id); return el ? el.value.trim() : ""; };

  const name       = get("e-name");
  const mainbg     = get("e-mainbg");
  const entrancebg = get("e-entrancebg") || mainbg;

  if (!name) { showToast("Preencha pelo menos o nome.", "red"); return; }

  const newData = {
    name,
    username:    get("e-username"),
    desc:        get("e-desc"),
    status:      get("e-status"),
    location:    get("e-location"),
    title:       get("e-title") || name + " ♡",
    avatar:      get("e-avatar"),
    mainbg,
    entrancebg,
    spotify:     get("e-spotify"),
    instagram:   get("e-instagram"),
    tiktok:      get("e-tiktok"),
    pinterest:   get("e-pinterest"),
    twitter:     get("e-twitter"),
    youtube:     get("e-youtube"),
    audio:       get("e-audio"),
    audioTitle:  get("e-audioTitle"),
    audioArtist: get("e-audioArtist"),
    // Slots extras de música
    extraSlots:  getExtraMusicSlots(),
  };

  // Bloqueia música inválida
  if (newData.audio && /spotify\.com|soundcloud\.com|deezer\.com/i.test(newData.audio)) {
    showToast("⚠️ Spotify não funciona. Use YouTube ou .mp3.", "red");
    return;
  }

  // Salva no registro de perfis
  registerProfile(newData);

  // Atualiza o botão "Ver meu perfil"
  // Se o username bater com o config.js (perfil padrão), usa URL limpa
  try {
    const saved = localStorage.getItem("paradise_admin_data");
    const adminParsed = saved ? JSON.parse(saved) : {};
    // Verifica se este é o perfil padrão do site (mesmo username do config.js)
    // Se sim, o link de "Ver perfil" deve ser a URL raiz, não com parâmetros
    const isDefaultProfile = typeof CONFIG !== "undefined" &&
      (CONFIG.profile.username || "").toLowerCase().replace(/^@/,"") ===
      (newData.username || "").toLowerCase().replace(/^@/,"");

    if (isDefaultProfile) {
      const base = window.location.origin + window.location.pathname.replace("minha-conta.html","index.html");
      document.getElementById("uc-view-btn").href = base;
    } else {
      updateViewBtn(newData);
    }
  } catch(e) { updateViewBtn(newData); }

  const status = document.getElementById("save-status");
  status.textContent = "✅ Salvo!";
  setTimeout(() => { status.textContent = ""; }, 3000);
  showToast("✅ Perfil atualizado!", "green");
}

// ═══════════════════════════════════════════════════════
// ALTERAR SENHA
// ═══════════════════════════════════════════════════════
function changePassword() {
  const atual = document.getElementById("e-pass-atual").value;
  const nova  = document.getElementById("e-pass-nova").value;
  const conf  = document.getElementById("e-pass-conf").value;

  if (!atual || !nova || !conf) { showToast("Preencha todos os campos.", "red"); return; }
  if (nova.length < 4)           { showToast("Senha muito curta (mín. 4 caracteres).", "red"); return; }
  if (nova !== conf)             { showToast("As senhas não conferem.", "red"); return; }

  const valid = loginUserAccount(currentAccount.username, atual);
  if (!valid) { showToast("Senha atual incorreta.", "red"); return; }

  // Atualiza senha
  const idx = ADMIN_DATA.user_accounts.findIndex(a => a.username === currentAccount.username);
  if (idx >= 0) {
    ADMIN_DATA.user_accounts[idx].password = nova;
    saveAdminData();
    currentAccount.password = nova;
    setUserSession(currentAccount);
  }

  document.getElementById("e-pass-atual").value = "";
  document.getElementById("e-pass-nova").value  = "";
  document.getElementById("e-pass-conf").value  = "";
  showToast("✅ Senha alterada com sucesso!", "green");
}

// ═══════════════════════════════════════════════════════
// PREVIEW DE IMAGENS
// ═══════════════════════════════════════════════════════
function previewImg(inputId, prevId) {
  const url  = document.getElementById(inputId).value.trim();
  const wrap = document.getElementById(prevId);
  if (!wrap) return;

  if (url) {
    wrap.innerHTML = `<img src="${url}" onerror="this.parentElement.innerHTML='<span>❌</span>'" />`;
  } else {
    wrap.innerHTML = prevId === "prev-avatar" ? "<span>👤</span>" : "<span>🌿</span>";
  }
}

// ═══════════════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════════════
let toastTimer = null;
function showToast(msg, type) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = "mc-toast" + (type ? " " + type : "");
  t.style.display = "";
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.style.display = "none"; }, 3000);
}

// ═══════════════════════════════════════════════════════
// LOJA
// ═══════════════════════════════════════════════════════
function renderLoja() {
  // Recarrega dados do localStorage (garante dados mais recentes)
  try {
    const saved = localStorage.getItem("paradise_admin_data");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.products)   ADMIN_DATA.products   = parsed.products;
      if (parsed.categories) ADMIN_DATA.categories = parsed.categories;
      if (parsed.orders)     ADMIN_DATA.orders     = parsed.orders;
      if (parsed.user_accounts) ADMIN_DATA.user_accounts = parsed.user_accounts;
    }
  } catch(e) {}
  const container = document.getElementById("loja-grid");
  const empty     = document.getElementById("loja-empty");
  const comprasEl = document.getElementById("loja-compras");
  if (!container) return;

  container.innerHTML = "";

  const username  = currentAccount ? currentAccount.username : "";
  const produtos  = (ADMIN_DATA.products   || []).filter(p => p.active);
  const categorias = ADMIN_DATA.categories || [];

  if (produtos.length === 0) {
    empty.style.display    = "";
    container.style.display = "none";
  } else {
    empty.style.display    = "none";
    container.style.display = "";

    // Agrupa produtos por categoria
    const grupos = [];
    categorias.forEach(cat => {
      const prods = produtos.filter(p => p.categoryId === cat.id);
      if (prods.length > 0) grupos.push({ cat, prods });
    });
    // Produtos sem categoria válida
    const semCat = produtos.filter(p => !categorias.find(c => c.id === p.categoryId));
    if (semCat.length > 0) grupos.push({ cat: { id: "", name: "Outros", icon: "🛍️", desc: "" }, prods: semCat });

    grupos.forEach(({ cat, prods }) => {
      // ── Cabeçalho da categoria ──
      const header = document.createElement("div");
      header.style.cssText = `
        display:flex;align-items:flex-start;gap:12px;
        padding:16px 0 10px;
        border-bottom:1px solid rgba(255,255,255,0.07);
        margin-bottom:14px;
        ${grupos.indexOf(arguments[0]) > 0 ? "margin-top:28px;" : ""}
      `;
      header.innerHTML = `
        <div style="font-size:28px;line-height:1">${escHtml(cat.icon || "🛍️")}</div>
        <div>
          <div style="font-size:15px;font-weight:700;color:#e8eaf0">${escHtml(cat.name)}</div>
          ${cat.desc ? `<div style="font-size:12px;color:#9ba3bc;margin-top:3px;line-height:1.4">${escHtml(cat.desc)}</div>` : ""}
        </div>
      `;
      container.appendChild(header);

      // ── Grid de produtos desta categoria ──
      const grid = document.createElement("div");
      grid.style.cssText = "display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:14px;margin-bottom:6px";
      container.appendChild(grid);

      prods.forEach(p => {
        const jaTem = (typeof hasFeature === "function" && p.feature
          ? hasFeature(username, p.feature) : false)
          // também bloqueia se já tem pedido aprovado para este produto
          || !!(ADMIN_DATA.orders || []).find(o =>
            o.username === username && o.productId === p.id && o.status === "approved"
          );
        const pedidoPendente = (ADMIN_DATA.orders || []).find(o =>
          o.username === username && o.productId === p.id && o.status === "pending"
        );

        const card = document.createElement("div");
        card.style.cssText = `
          background:#13151f;border:1px solid rgba(255,255,255,0.07);
          border-radius:14px;overflow:hidden;display:flex;flex-direction:column;
          transition:border-color 0.15s;
        `;
        card.onmouseenter = () => { card.style.borderColor = "rgba(126,207,160,0.3)"; };
        card.onmouseleave = () => { card.style.borderColor = "rgba(255,255,255,0.07)"; };

        // Foto
        const fotoDiv = document.createElement("div");
        fotoDiv.style.cssText = "width:100%;height:120px;background:#0f1118;display:flex;align-items:center;justify-content:center;font-size:36px;overflow:hidden;flex-shrink:0";
        if (p.photo) {
          fotoDiv.innerHTML = `<img src="${escHtml(p.photo)}" style="width:100%;height:100%;object-fit:cover" onerror="this.parentElement.textContent='${escHtml(cat.icon||"🛍️")}'" />`;
        } else {
          fotoDiv.textContent = cat.icon || "🛍️";
        }

        // Info
        const infoDiv = document.createElement("div");
        infoDiv.style.cssText = "padding:12px 14px;flex:1;display:flex;flex-direction:column;gap:5px";
        infoDiv.innerHTML = `
          <div style="font-size:13px;font-weight:700;color:#e8eaf0;line-height:1.3">${escHtml(p.name)}</div>
          ${p.desc ? `<div style="font-size:11px;color:#9ba3bc;line-height:1.4">${escHtml(p.desc)}</div>` : ""}
          <div style="font-size:17px;font-weight:700;color:#7ecfa0;margin-top:auto;padding-top:6px">R$ ${parseFloat(p.price||0).toFixed(2)}</div>
        `;

        // Botão
        const btnDiv = document.createElement("div");
        btnDiv.style.cssText = "padding:0 14px 14px";

        if (jaTem) {
          btnDiv.innerHTML = `<div style="text-align:center;padding:8px;background:rgba(126,207,160,0.08);border:1px solid rgba(126,207,160,0.25);border-radius:8px;color:#7ecfa0;font-size:11px;font-weight:600">✅ Você já possui</div>`;
        } else if (pedidoPendente) {
          btnDiv.innerHTML = `<div style="text-align:center;padding:8px;background:rgba(201,168,124,0.08);border:1px solid rgba(201,168,124,0.25);border-radius:8px;color:#c9a87c;font-size:11px;font-weight:600">🕐 Aguardando aprovação</div>`;
        } else {
          const btn = document.createElement("button");
          btn.textContent = "🛒 Comprar";
          btn.style.cssText = "width:100%;padding:9px;background:linear-gradient(135deg,#4a7c59,#7ecfa0);border:none;border-radius:8px;color:#fff;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;transition:opacity 0.15s";
          btn.onmouseenter = () => { btn.style.opacity = "0.82"; };
          btn.onmouseleave = () => { btn.style.opacity = "1"; };
          btn.onclick = () => abrirModalCompra(p);
          btnDiv.appendChild(btn);
        }

        card.appendChild(fotoDiv);
        card.appendChild(infoDiv);
        card.appendChild(btnDiv);
        grid.appendChild(card);
      });
    });
  }

  renderMinhasCompras(comprasEl);
}

function renderMinhasCompras(container) {
  if (!container || !currentAccount) return;
  const username = currentAccount.username;
  const pedidos  = (ADMIN_DATA.orders || [])
    .filter(o => o.username === username)
    .sort((a, b) => b.createdAt - a.createdAt);

  if (pedidos.length === 0) {
    container.innerHTML = "";
    return;
  }

  const statusLabel = { pending: "🕐 Aguardando aprovação", approved: "✅ Aprovado — produto liberado!", rejected: "❌ Recusado" };
  const statusColor = { pending: "#c9a87c", approved: "#7ecfa0", rejected: "#e05555" };

  container.innerHTML = `<div style="font-size:13px;font-weight:600;color:rgba(255,255,255,0.5);margin-bottom:12px;text-transform:uppercase;letter-spacing:0.05em">🧾 Minhas compras</div>`;
  pedidos.forEach(o => {
    const item = document.createElement("div");
    item.style.cssText = "background:#13151f;border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:12px 14px;display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:8px";
    item.innerHTML = `
      <div>
        <div style="font-size:13px;font-weight:600;color:#e8eaf0">${escHtml(o.productName)}</div>
        <div style="font-size:11px;color:#9ba3bc;margin-top:2px">${new Date(o.createdAt).toLocaleString("pt-BR")}</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:13px;font-weight:700;color:#7ecfa0">R$ ${parseFloat(o.price||0).toFixed(2)}</div>
        <div style="font-size:11px;font-weight:600;color:${statusColor[o.status]||"#9ba3bc"};margin-top:2px">${statusLabel[o.status]||o.status}</div>
      </div>
    `;
    container.appendChild(item);
  });
}

// ── Modal de compra ─────────────────────────────────────
let produtoAtual = null;
let qrInstance   = null;

function abrirModalCompra(produto) {
  produtoAtual = produto;
  const modal = document.getElementById("modal-compra");

  document.getElementById("mc-prod-nome").textContent  = produto.name;
  document.getElementById("mc-prod-preco").textContent = "R$ " + parseFloat(produto.price || 0).toFixed(2);

  // Gera QR Code com chave Pix (formato EMV simplificado legível)
  const qrDiv = document.getElementById("mc-qrcode");
  qrDiv.innerHTML = "";
  if (qrInstance) { try { qrInstance.clear(); } catch(e) {} }

  // Payload Pix copia e cola (formato simplificado)
  const pixKey     = "wagnerricarte4@gmail.com";
  const amount     = parseFloat(produto.price || 0).toFixed(2);
  const pixPayload = gerarPixPayload(pixKey, "Wagner Ricarte", amount, produto.name.slice(0,25));

  try {
    qrInstance = new QRCode(qrDiv, {
      text:          pixPayload,
      width:         180,
      height:        180,
      colorDark:     "#000000",
      colorLight:    "#ffffff",
      correctLevel:  QRCode.CorrectLevel.M,
    });
  } catch(e) {
    qrDiv.textContent = "QR Code indisponível";
  }

  modal.style.display = "flex";

  // Toca o áudio voice-message
  try {
    const audio = document.getElementById("voice-audio");
    if (audio) { audio.currentTime = 0; audio.play().catch(() => {}); }
  } catch(e) {}
}

function fecharModalCompra() {
  const modal = document.getElementById("modal-compra");
  modal.style.display = "none";
  try {
    const audio = document.getElementById("voice-audio");
    if (audio) { audio.pause(); audio.currentTime = 0; }
  } catch(e) {}
  produtoAtual = null;
}

function copiarPix() {
  const pixKey  = "wagnerricarte4@gmail.com";
  const amount  = produtoAtual ? parseFloat(produtoAtual.price || 0).toFixed(2) : "0.00";
  const payload = produtoAtual
    ? gerarPixPayload(pixKey, "Wagner Ricarte", amount, (produtoAtual.name || "").slice(0, 25))
    : pixKey;

  navigator.clipboard.writeText(payload).then(() => {
    showToast("📋 Pix copiado!", "green");
  }).catch(() => {
    showToast("📋 Chave: wagnerricarte4@gmail.com", "green");
  });
}

function confirmarPedido() {
  if (!produtoAtual || !currentAccount) return;
  createOrder(
    currentAccount.profileId || currentAccount.username,
    currentAccount.username,
    produtoAtual.id,
    produtoAtual.name,
    produtoAtual.price
  );

  // Toca o áudio voice-message DUAS vezes ao confirmar
  try {
    const audio = document.getElementById("voice-audio");
    if (audio && audio.src && !audio.src.endsWith("/")) {
      // Primeira vez
      audio.currentTime = 0;
      audio.play().then(() => {
        // Quando terminar a primeira, toca segunda vez
        audio.addEventListener("ended", function playAgain() {
          audio.removeEventListener("ended", playAgain);
          audio.currentTime = 0;
          audio.play().catch(() => {});
        });
      }).catch(() => {});
    }
  } catch(e) {}

  fecharModalCompra();
  showToast("✅ Pedido registrado! Aguarde até 24h.", "green");
  renderLoja();
}

// ── Gerador de payload Pix (formato EMV simplificado) ──
function gerarPixPayload(chave, nome, valor, descricao) {
  function field(id, value) {
    const len = value.length.toString().padStart(2, "0");
    return id + len + value;
  }
  const merchantAccount = field("00", "BR.GOV.BCB.PIX") + field("01", chave);
  const payload = [
    field("00", "01"),                       // payload format
    field("26", merchantAccount),            // merchant account
    field("52", "0000"),                     // MCC
    field("53", "986"),                      // BRL
    field("54", valor),                      // amount
    field("58", "BR"),                       // country
    field("59", nome.slice(0,25).padEnd(1)), // merchant name
    field("60", "SAO PAULO"),                // city
    field("62", field("05", "***")),         // reference
  ].join("");
  const crcData  = "6304" ;
  const full     = payload + crcData;
  const crc      = calcCRC16(full).toString(16).toUpperCase().padStart(4, "0");
  return payload + "6304" + crc;
}

function calcCRC16(str) {
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
    }
  }
  return crc & 0xFFFF;
}

function escHtml(s) {
  return String(s || "")
    .replace(/&/g,"&amp;").replace(/</g,"&lt;")
    .replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

// ═══════════════════════════════════════════════════════
// SLOTS DE MÚSICA
// ═══════════════════════════════════════════════════════
function countMusicSlots() {
  if (!currentAccount) return 1;
  const account = ADMIN_DATA.user_accounts.find(a => a.username === currentAccount.username);
  if (!account || !account.unlockedFeatures) return 1;
  let extra = 0;
  account.unlockedFeatures.forEach(f => {
    const m = f.match(/^music_slot_(\d+)$/);
    if (m) extra += parseInt(m[1]);
  });
  return 1 + extra;
}

function getCurrentProfileData() {
  if (!currentAccount) return {};

  // Recarrega do localStorage para ter os dados mais recentes
  try {
    const saved = localStorage.getItem("paradise_admin_data");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.profiles) ADMIN_DATA.profiles = parsed.profiles;
    }
  } catch(e) {}

  const profile =
    ADMIN_DATA.profiles.find(p => p.id === currentAccount.profileId) ||
    ADMIN_DATA.profiles.find(p => p.id === currentAccount.username)  ||
    ADMIN_DATA.profiles.find(p => p.username === currentAccount.username);
  return (profile && profile.data) ? profile.data : {};
}

function renderMusicSlots() {
  const container = document.getElementById("music-slots-container");
  if (!container) return;
  container.innerHTML = "";

  const total       = countMusicSlots();
  const profileData = getCurrentProfileData();

  for (let i = 1; i <= total; i++) {
    const isFirst = i === 1;
    const urlId    = isFirst ? "e-audio"        : `e-audio-${i}`;
    const titleId  = isFirst ? "e-audioTitle"   : `e-audioTitle-${i}`;
    const artistId = isFirst ? "e-audioArtist"  : `e-audioArtist-${i}`;

    let url = "", title = "", artist = "";
    if (isFirst) {
      url    = profileData.audio       || "";
      title  = profileData.audioTitle  || "";
      artist = profileData.audioArtist || "";
    } else {
      const idx  = i - 2;
      const slot = profileData.extraSlots && profileData.extraSlots[idx];
      url    = slot ? (slot.url    || "") : "";
      title  = slot ? (slot.title  || "") : "";
      artist = slot ? (slot.artist || "") : "";
    }

    const wrap = document.createElement("div");
    wrap.style.cssText = [
      "border-radius:10px",
      "padding:14px 16px",
      "margin-bottom:14px",
      isFirst
        ? "border:1px solid rgba(255,255,255,0.07);background:transparent"
        : "border:1px solid rgba(126,207,160,0.2);background:rgba(126,207,160,0.04)",
    ].join(";");

    const badge = isFirst
      ? ""
      : `<span style="font-size:10px;background:rgba(126,207,160,0.15);color:#7ecfa0;border-radius:10px;padding:2px 8px;margin-left:6px;vertical-align:middle">💎 Desbloqueado</span>`;

    wrap.innerHTML = `
      <div style="font-size:13px;font-weight:600;color:#e8eaf0;margin-bottom:12px">
        🎵 ${isFirst ? "Música principal" : "Slot " + i}${badge}
      </div>
      <div class="form-grid">
        <div class="ff full">
          <label>URL da música</label>
          <input type="url" id="${urlId}" value="${_esc(url)}" placeholder="https://youtu.be/... ou .mp3" />
          <p class="hint">✅ YouTube ou .mp3 direto. ⚠️ Spotify não funciona.</p>
        </div>
        <div class="ff">
          <label>Nome da música</label>
          <input type="text" id="${titleId}" value="${_esc(title)}" maxlength="50" placeholder="Nome da música" />
        </div>
        <div class="ff">
          <label>Artista</label>
          <input type="text" id="${artistId}" value="${_esc(artist)}" maxlength="50" placeholder="Nome do artista" />
        </div>
      </div>
    `;
    container.appendChild(wrap);
  }
}

function getExtraMusicSlots() {
  const total = countMusicSlots();
  const slots = [];
  for (let i = 2; i <= total; i++) {
    const urlEl = document.getElementById(`e-audio-${i}`);
    const titEl = document.getElementById(`e-audioTitle-${i}`);
    const artEl = document.getElementById(`e-audioArtist-${i}`);
    slots.push({
      url:    urlEl ? urlEl.value.trim()   : "",
      title:  titEl ? titEl.value.trim()   : "",
      artist: artEl ? artEl.value.trim()   : "",
    });
  }
  return slots;
}

function _esc(s) {
  return String(s || "")
    .replace(/&/g,"&amp;").replace(/</g,"&lt;")
    .replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

// ═══════════════════════════════════════════════════════
// STORIES — gerenciamento em Minha Conta
// ═══════════════════════════════════════════════════════
function renderStoriesMC() {
  const list  = document.getElementById("stories-list-mc");
  const empty = document.getElementById("stories-empty-mc");
  if (!list || !currentAccount) return;

  const username = currentAccount.username;
  const stories  = typeof getActiveStories === "function"
    ? getActiveStories(username)
    : [];

  list.innerHTML = "";

  if (stories.length === 0) {
    list.style.display  = "none";
    empty.style.display = "";
    return;
  }

  list.style.display  = "";
  empty.style.display = "none";

  stories.forEach(s => {
    const card = document.createElement("div");
    card.style.cssText = `
      position:relative;border-radius:12px;overflow:hidden;
      aspect-ratio:9/16;background:#0f1118;cursor:pointer;
      border:1px solid rgba(255,255,255,0.07);
    `;

    // Thumbnail
    const img = document.createElement("img");
    img.src = s.imageData || "";
    img.style.cssText = `
      width:100%;height:100%;object-fit:cover;
      filter:${getCssFilter(s.filter)};
      pointer-events:none;
    `;

    // Textos sobrepostos em miniatura
    const textsWrap = document.createElement("div");
    textsWrap.style.cssText = "position:absolute;inset:0;pointer-events:none";
    (s.texts || []).forEach(t => {
      const tel = document.createElement("div");
      tel.textContent = t.text;
      tel.style.cssText = `
        position:absolute;
        left:${t.x}%;top:${t.y}%;
        transform:translate(-50%,-50%);
        color:#fff;font-size:8px;font-weight:700;
        text-shadow:0 1px 3px rgba(0,0,0,0.8);
        white-space:nowrap;font-family:inherit;
      `;
      textsWrap.appendChild(tel);
    });

    // Badge de música
    const musicBadge = document.createElement("div");
    musicBadge.style.cssText = `
      position:absolute;bottom:6px;left:50%;transform:translateX(-50%);
      background:rgba(0,0,0,0.55);backdrop-filter:blur(8px);
      border-radius:20px;padding:3px 8px;
      font-size:10px;color:#fff;
      display:${s.music ? "flex" : "none"};
      align-items:center;gap:4px;white-space:nowrap;
    `;
    musicBadge.innerHTML = "♫ música";

    // Expiração
    const remaining   = s.expiresAt - Date.now();
    const hoursLeft   = Math.max(0, Math.floor(remaining / 3600000));
    const expireLabel = document.createElement("div");
    expireLabel.style.cssText = `
      position:absolute;top:6px;right:6px;
      background:rgba(0,0,0,0.55);backdrop-filter:blur(8px);
      border-radius:20px;padding:2px 7px;
      font-size:9px;color:rgba(255,255,255,0.8);
    `;
    expireLabel.textContent = hoursLeft + "h";

    // Botão deletar
    const delBtn = document.createElement("button");
    delBtn.textContent = "✕";
    delBtn.style.cssText = `
      position:absolute;top:6px;left:6px;
      width:22px;height:22px;border-radius:50%;
      background:rgba(0,0,0,0.6);border:none;
      color:rgba(255,255,255,0.7);font-size:11px;
      cursor:pointer;display:flex;align-items:center;justify-content:center;
      z-index:5;
    `;
    delBtn.addEventListener("click", e => {
      e.stopPropagation();
      if (!confirm("Deletar este story?")) return;
      deleteStory(s.id);
      renderStoriesMC();
    });

    // Clique para visualizar
    card.addEventListener("click", () => {
      window.location.href = `story-viewer.html?username=${encodeURIComponent(username)}&return=minha-conta.html`;
    });

    card.appendChild(img);
    card.appendChild(textsWrap);
    card.appendChild(musicBadge);
    card.appendChild(expireLabel);
    card.appendChild(delBtn);
    list.appendChild(card);
  });
}

function getCssFilter(id) {
  const filters = {
    none:          "none",
    lores:         "contrast(1.3) saturate(0.6) brightness(0.9)",
    handheld:      "blur(1.2px) brightness(1.05) contrast(0.95)",
    riodejaneiro:  "hue-rotate(220deg) saturate(1.4) brightness(1.1)",
    softlight:     "brightness(1.15) contrast(0.85) saturate(1.1)",
    zoomblur:      "blur(2px) saturate(1.5) contrast(1.2)",
    hyper:         "saturate(2) contrast(1.3) brightness(1.05)",
    graphite:      "grayscale(1) contrast(1.1) brightness(0.95)",
  };
  return filters[id] || "none";
}
