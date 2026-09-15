/* ═══════════════════════════════════════════════════════
   PARADISE ADMIN — PAINEL.JS
   ═══════════════════════════════════════════════════════ */

let currentUser = null; // { user, role }

function limparCache() {
  try {
    localStorage.removeItem("paradise_admin_data");
    sessionStorage.removeItem("paradise_admin_session");
  } catch(e) {}
  location.reload();
}

// ═══════════════════════════════════════════════════════
// LOGIN / LOGOUT
// ═══════════════════════════════════════════════════════
function doLogin() {
  const user = document.getElementById("login-user").value.trim();
  const pass = document.getElementById("login-pass").value;
  const err  = document.getElementById("login-error");

  const found = ADMIN_DATA.credentials.find(c => c.user.toLowerCase() === user.toLowerCase() && c.password === pass);

  if (!found) {
    err.classList.remove("hidden");
    document.getElementById("login-pass").value = "";
    return;
  }

  err.classList.add("hidden");
  currentUser = { user: found.user, role: found.role };

  // Salva sessão
  try { sessionStorage.setItem("paradise_admin_session", JSON.stringify(currentUser)); } catch(e) {}

  showPanel();
}

function doLogout() {
  currentUser = null;
  try { sessionStorage.removeItem("paradise_admin_session"); } catch(e) {}
  const panel = document.getElementById("panel");
  panel.classList.add("hidden");
  panel.style.display = "none";
  const login = document.getElementById("login-screen");
  login.classList.remove("hidden");
  login.style.display = "";
  document.getElementById("login-user").value = "";
  document.getElementById("login-pass").value = "";
}

function showPanel() {
  // Fecha todos os modais antes de mostrar o painel
  document.querySelectorAll(".modal").forEach(m => {
    m.classList.add("hidden");
    m.style.display = "none";
  });
  document.body.style.overflow = "";

  document.getElementById("login-screen").classList.add("hidden");
  document.getElementById("login-screen").style.display = "none";
  const panel = document.getElementById("panel");
  panel.classList.remove("hidden");
  panel.style.display = "";

  const roleEl = document.getElementById("sidebar-role");
  roleEl.textContent = currentUser.role.toUpperCase();
  roleEl.className = "sidebar-role role-" + currentUser.role;
  document.getElementById("sidebar-username").textContent = "👤 " + currentUser.user;

  // Oculta aba admins para senior
  const perm = ADMIN_DATA.permissions[currentUser.role];
  if (!perm.viewAdmins) {
    document.getElementById("nav-admins").style.display = "none";
  }

  // Loja — só owner vê e gerencia
  if (!perm.manageStore) {
    const storeNav = document.getElementById("nav-store");
    if (storeNav) storeNav.style.display = "none";
  }
  // Pendentes — só quem pode aprovar
  if (!perm.approvePurchases) {
    const ordersNav = document.getElementById("nav-orders");
    if (ordersNav) ordersNav.style.display = "none";
  }

  updateOrdersBadge();
  goPage("dashboard");
}

// Restaura sessão ao recarregar
(function restoreSession() {
  try {
    const s = sessionStorage.getItem("paradise_admin_session");
    if (s) {
      currentUser = JSON.parse(s);
      showPanel();
    }
  } catch(e) {}
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
// NAVEGAÇÃO
// ═══════════════════════════════════════════════════════
function goPage(name) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));

  document.getElementById("page-" + name).classList.add("active");
  const btn = document.querySelector(`[data-page="${name}"]`);
  if (btn) btn.classList.add("active");

  if (name === "dashboard")   renderDashboard();
  if (name === "users")       renderUsers();
  if (name === "suspensions") renderSuspensions();
  if (name === "admins")      renderAdmins();
  if (name === "store")       renderStore();
  if (name === "orders") {
    // Sincroniza do GitHub antes de renderizar
    if (typeof syncOrdersFromGitHub === "function") {
      syncOrdersFromGitHub().then(() => renderOrders("pending"));
    } else {
      renderOrders("pending");
    }
  }
}

// ═══════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════
function renderDashboard() {
  const profiles    = ADMIN_DATA.profiles;
  const suspensions = getActiveSuspensions();
  const active      = profiles.filter(p => !suspensions.find(s => s.id === p.id));

  document.getElementById("stat-total").textContent     = profiles.length;
  document.getElementById("stat-suspended").textContent = suspensions.length;
  document.getElementById("stat-active").textContent    = active.length;
  document.getElementById("stat-admins").textContent    = ADMIN_DATA.credentials.length;

  const recent = [...profiles].sort((a,b) => b.updatedAt - a.updatedAt).slice(0, 5);
  const container = document.getElementById("recent-users");
  container.innerHTML = "";

  if (recent.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">👥</div><p>Nenhum perfil ainda.</p><span>Quando alguém criar um perfil, ele aparecerá aqui.</span></div>`;
    return;
  }

  recent.forEach(p => container.appendChild(buildUserCard(p, true)));
}

// ═══════════════════════════════════════════════════════
// USUÁRIOS
// ═══════════════════════════════════════════════════════
function renderUsers() {
  const query    = (document.getElementById("search-users").value || "").toLowerCase();
  const profiles = ADMIN_DATA.profiles.filter(p =>
    !query ||
    (p.name     || "").toLowerCase().includes(query) ||
    (p.username || "").toLowerCase().includes(query)
  );

  document.getElementById("users-count").textContent = profiles.length + " perfis";
  const list = document.getElementById("users-list");
  list.innerHTML = "";

  if (profiles.length === 0) {
    document.getElementById("users-empty").classList.remove("hidden");
  } else {
    document.getElementById("users-empty").classList.add("hidden");
    profiles.forEach(p => list.appendChild(buildUserCard(p, false)));
  }
}

function buildUserCard(profile, compact) {
  const perm       = ADMIN_DATA.permissions[currentUser.role];
  const suspension = getActiveSuspensions().find(s => s.id === profile.id);
  const data       = profile.data || {};

  const card = document.createElement("div");
  card.className = "user-card" + (suspension ? " suspended" : "");

  // Avatar
  const avatarDiv = document.createElement("div");
  avatarDiv.className = "user-avatar";
  if (data.avatar) {
    const img = document.createElement("img");
    img.src = data.avatar;
    img.onerror = () => { avatarDiv.textContent = "👤"; };
    avatarDiv.appendChild(img);
  } else {
    avatarDiv.textContent = "👤";
  }

  // Info
  const info = document.createElement("div");
  info.className = "user-info";
  info.innerHTML = `
    <div class="user-name">${esc(profile.name || "Sem nome")}</div>
    <div class="user-meta">@${esc(profile.username || "—")} · criado ${formatDate(profile.createdAt)}</div>
    <div class="user-badges">
      ${suspension ? `<span class="badge-suspended">🚫 Suspenso${suspension.until ? " até " + formatDate(suspension.until) : " permanente"}</span>` : ""}
    </div>
  `;

  // Ações
  const actions = document.createElement("div");
  actions.className = "user-actions";

  // Ver perfil
  const viewBtn = document.createElement("button");
  viewBtn.className = "btn-action blue";
  viewBtn.textContent = "👁 Ver";
  viewBtn.onclick = () => viewProfile(profile);
  actions.appendChild(viewBtn);

  if (!compact) {
    // Editar — owner e ceo
    if (perm.editUsers) {
      const editBtn = document.createElement("button");
      editBtn.className = "btn-action purple";
      editBtn.textContent = "✏️ Editar";
      editBtn.onclick = () => openEdit(profile);
      actions.appendChild(editBtn);
    }

    // Suspender / remover suspensão
    if (perm.suspendUsers) {
      if (suspension) {
        const unsuspBtn = document.createElement("button");
        unsuspBtn.className = "btn-action yellow";
        unsuspBtn.textContent = "✅ Remover castigo";
        unsuspBtn.onclick = () => removeSuspension(profile.id);
        actions.appendChild(unsuspBtn);
      } else {
        const suspBtn = document.createElement("button");
        suspBtn.className = "btn-action yellow";
        suspBtn.textContent = "🚫 Castigar";
        suspBtn.onclick = () => openSuspend(profile);
        actions.appendChild(suspBtn);
      }
    }

    // Deletar — owner e ceo
    if (perm.deleteUsers) {
      const delBtn = document.createElement("button");
      delBtn.className = "btn-action red";
      delBtn.textContent = "🗑️";
      delBtn.title = "Deletar perfil";
      delBtn.onclick = () => openDelete(profile);
      actions.appendChild(delBtn);
    }

    // Resetar senha do usuário — owner e ceo
    if (perm.editUsers) {
      const account = ADMIN_DATA.user_accounts.find(a => a.profileId === profile.id || a.username === profile.id);
      if (account) {
        const pwBtn = document.createElement("button");
        pwBtn.className = "btn-action gray";
        pwBtn.textContent = "🔑";
        pwBtn.title = "Resetar senha do usuário";
        pwBtn.onclick = () => resetUserPassword(profile, account);
        actions.appendChild(pwBtn);
      }
    }
  }

  card.appendChild(avatarDiv);
  card.appendChild(info);
  card.appendChild(actions);
  return card;
}

// ═══════════════════════════════════════════════════════
// SUSPENSÕES
// ═══════════════════════════════════════════════════════
function getActiveSuspensions() {
  const now = Date.now();
  // Remove expiradas
  ADMIN_DATA.suspensions = ADMIN_DATA.suspensions.filter(s => !s.until || s.until > now);
  return ADMIN_DATA.suspensions;
}

function renderSuspensions() {
  const suspended = getActiveSuspensions();
  const list = document.getElementById("suspensions-list");
  list.innerHTML = "";

  if (suspended.length === 0) {
    document.getElementById("suspensions-empty").classList.remove("hidden");
    return;
  }
  document.getElementById("suspensions-empty").classList.add("hidden");

  suspended.forEach(s => {
    const profile = ADMIN_DATA.profiles.find(p => p.id === s.id) || { id: s.id, name: s.id, username: s.id, data: {} };
    const card = buildUserCard(profile, false);
    list.appendChild(card);

    // Info do castigo
    const infoDiv = document.createElement("div");
    infoDiv.className = "suspend-info";
    infoDiv.innerHTML = `<strong>Motivo:</strong> ${esc(s.reason || "Sem motivo")} · <strong>Por:</strong> ${esc(s.by)} · <strong>Até:</strong> ${s.until ? formatDate(s.until) : "Permanente"}`;
    card.after(infoDiv);
  });
}

function openSuspend(profile) {
  document.getElementById("suspend-id").value = profile.id;
  document.getElementById("suspend-name-display").value = profile.name + " (@" + profile.username + ")";
  document.getElementById("suspend-reason").value = "";
  document.getElementById("suspend-duration").value = "604800000";
  openModal("modal-suspend");
}

function applySuspension() {
  const id       = document.getElementById("suspend-id").value;
  const reason   = document.getElementById("suspend-reason").value.trim() || "Sem motivo";
  const duration = parseInt(document.getElementById("suspend-duration").value);
  const until    = duration === 0 ? null : Date.now() + duration;

  // Remove suspensão anterior se existir
  ADMIN_DATA.suspensions = ADMIN_DATA.suspensions.filter(s => s.id !== id);

  ADMIN_DATA.suspensions.push({ id, reason, until, by: currentUser.user, at: Date.now() });
  saveAdminData();

  closeModal("modal-suspend");
  showToast("🚫 Castigo aplicado com sucesso!", "red");
  renderUsers();
  renderDashboard();
}

function removeSuspension(id) {
  ADMIN_DATA.suspensions = ADMIN_DATA.suspensions.filter(s => s.id !== id);
  saveAdminData();
  showToast("✅ Castigo removido!", "green");
  renderUsers();
  renderSuspensions();
  renderDashboard();
}

// ═══════════════════════════════════════════════════════
// VER PERFIL
// ═══════════════════════════════════════════════════════
function viewProfile(profile) {
  const data = profile.data || {};
  const params = new URLSearchParams(data);
  const url = window.location.origin + window.location.pathname.replace("painel.html", "index.html") + "?" + params.toString();
  window.open(url, "_blank");
}

// ═══════════════════════════════════════════════════════
// EDITAR PERFIL
// ═══════════════════════════════════════════════════════
function openEdit(profile) {
  const d = profile.data || {};
  document.getElementById("edit-id").value = profile.id;
  document.getElementById("edit-name").value        = d.name        || "";
  document.getElementById("edit-username").value    = d.username    || "";
  document.getElementById("edit-desc").value        = d.desc        || "";
  document.getElementById("edit-status").value      = d.status      || "";
  document.getElementById("edit-location").value    = d.location    || "";
  document.getElementById("edit-avatar").value      = d.avatar      || "";
  document.getElementById("edit-mainbg").value      = d.mainbg      || "";
  document.getElementById("edit-spotify").value     = d.spotify     || "";
  document.getElementById("edit-instagram").value   = d.instagram   || "";
  document.getElementById("edit-tiktok").value      = d.tiktok      || "";
  document.getElementById("edit-youtube").value     = d.youtube     || "";
  document.getElementById("edit-audio").value       = d.audio       || "";
  document.getElementById("edit-audioTitle").value  = d.audioTitle  || "";
  document.getElementById("edit-audioArtist").value = d.audioArtist || "";
  openModal("modal-edit");
}

function saveEdit() {
  const id = document.getElementById("edit-id").value;
  const idx = ADMIN_DATA.profiles.findIndex(p => p.id === id);
  if (idx < 0) return;

  const newData = {
    name:        document.getElementById("edit-name").value.trim(),
    username:    document.getElementById("edit-username").value.trim(),
    desc:        document.getElementById("edit-desc").value.trim(),
    status:      document.getElementById("edit-status").value.trim(),
    location:    document.getElementById("edit-location").value.trim(),
    avatar:      document.getElementById("edit-avatar").value.trim(),
    mainbg:      document.getElementById("edit-mainbg").value.trim(),
    spotify:     document.getElementById("edit-spotify").value.trim(),
    instagram:   document.getElementById("edit-instagram").value.trim(),
    tiktok:      document.getElementById("edit-tiktok").value.trim(),
    youtube:     document.getElementById("edit-youtube").value.trim(),
    audio:       document.getElementById("edit-audio").value.trim(),
    audioTitle:  document.getElementById("edit-audioTitle").value.trim(),
    audioArtist: document.getElementById("edit-audioArtist").value.trim(),
  };

  ADMIN_DATA.profiles[idx].data      = newData;
  ADMIN_DATA.profiles[idx].name      = newData.name;
  ADMIN_DATA.profiles[idx].username  = newData.username;
  ADMIN_DATA.profiles[idx].updatedAt = Date.now();
  saveAdminData();

  closeModal("modal-edit");
  showToast("✅ Perfil atualizado!", "green");
  renderUsers();
}

// ═══════════════════════════════════════════════════════
// RESETAR SENHA DE USUÁRIO
// ═══════════════════════════════════════════════════════
function resetUserPassword(profile, account) {
  const nova = prompt(`Nova senha para @${profile.username || profile.id}:`);
  if (!nova || nova.trim().length < 4) { showToast("Senha muito curta (mín. 4).", "red"); return; }
  const idx = ADMIN_DATA.user_accounts.findIndex(a => a.username === account.username);
  if (idx >= 0) {
    ADMIN_DATA.user_accounts[idx].password = nova.trim();
    saveAdminData();
    showToast(`✅ Senha de @${account.username} resetada!`, "green");
  }
}

// ═══════════════════════════════════════════════════════
// DELETAR PERFIL
// ═══════════════════════════════════════════════════════
function openDelete(profile) {
  document.getElementById("delete-id").value = profile.id;
  document.getElementById("delete-name-display").textContent = profile.name + " (@" + profile.username + ")";
  openModal("modal-delete");
}

function confirmDelete() {
  const id = document.getElementById("delete-id").value;
  ADMIN_DATA.profiles      = ADMIN_DATA.profiles.filter(p => p.id !== id);
  ADMIN_DATA.suspensions   = ADMIN_DATA.suspensions.filter(s => s.id !== id);
  ADMIN_DATA.user_accounts = ADMIN_DATA.user_accounts.filter(a => a.profileId !== id && a.username !== id);
  saveAdminData();

  closeModal("modal-delete");
  showToast("🗑️ Perfil deletado.", "red");
  renderUsers();
  renderDashboard();
}

// ═══════════════════════════════════════════════════════
// ADMINISTRADORES
// ═══════════════════════════════════════════════════════
function renderAdmins() {
  const perm = ADMIN_DATA.permissions[currentUser.role];
  const list = document.getElementById("admins-list");
  list.innerHTML = "";

  // Esconde form de adicionar para quem não tem permissão
  document.getElementById("admins-add-section").style.display = perm.addCredentials ? "" : "none";

  ADMIN_DATA.credentials.forEach(cred => {
    const card = document.createElement("div");
    card.className = "user-card";

    const roleIcon = cred.role === "owner" ? "👑" : cred.role === "ceo" ? "💎" : "⭐";

    card.innerHTML = `
      <div class="user-avatar">${roleIcon}</div>
      <div class="user-info">
        <div class="user-name">${esc(cred.user)}</div>
        <div class="user-meta">Senha: ${"•".repeat(cred.password.length)}</div>
        <div class="user-badges">
          <span class="badge-role badge-${cred.role}">${cred.role.toUpperCase()}</span>
        </div>
      </div>
      <div class="user-actions" id="admin-actions-${esc(cred.user)}"></div>
    `;
    list.appendChild(card);

    const actions = card.querySelector(".user-actions");

    // Owner pode mexer em todos; CEO não pode mexer em owners
    const canEdit = perm.editCredentials &&
      !(currentUser.role === "ceo" && cred.role === "owner") &&
      cred.user !== currentUser.user;

    if (canEdit && perm.deleteCredentials) {
      const delBtn = document.createElement("button");
      delBtn.className = "btn-action red";
      delBtn.textContent = "🗑️ Remover";
      delBtn.onclick = () => deleteAdmin(cred.user);
      actions.appendChild(delBtn);
    }

    // Pode trocar a própria senha sempre
    if (cred.user === currentUser.user) {
      const pwBtn = document.createElement("button");
      pwBtn.className = "btn-action gray";
      pwBtn.textContent = "🔑 Trocar senha";
      pwBtn.onclick = () => changeOwnPassword();
      actions.appendChild(pwBtn);
    }
  });
}

function addAdmin() {
  const user = document.getElementById("new-admin-user").value.trim();
  const pass = document.getElementById("new-admin-pass").value.trim();
  const role = document.getElementById("new-admin-role").value;

  if (!user || !pass) { showToast("Preencha usuário e senha.", "red"); return; }

  const perm = ADMIN_DATA.permissions[currentUser.role];
  if (!perm.addCredentials) { showToast("Sem permissão.", "red"); return; }

  // CEO não pode adicionar owner
  if (currentUser.role === "ceo" && role === "owner") {
    showToast("CEO não pode adicionar um Owner.", "red"); return;
  }

  if (ADMIN_DATA.credentials.find(c => c.user === user)) {
    showToast("Usuário já existe.", "red"); return;
  }

  ADMIN_DATA.credentials.push({ user, password: pass, role });
  saveAdminData();

  document.getElementById("new-admin-user").value = "";
  document.getElementById("new-admin-pass").value = "";
  showToast("✅ Administrador adicionado!", "green");
  renderAdmins();
  renderDashboard();
}

function deleteAdmin(user) {
  const perm = ADMIN_DATA.permissions[currentUser.role];
  if (!perm.deleteCredentials) { showToast("Sem permissão.", "red"); return; }

  const target = ADMIN_DATA.credentials.find(c => c.user === user);
  if (!target) return;

  // CEO não pode remover owner
  if (currentUser.role === "ceo" && target.role === "owner") {
    showToast("CEO não pode remover um Owner.", "red"); return;
  }

  ADMIN_DATA.credentials = ADMIN_DATA.credentials.filter(c => c.user !== user);
  saveAdminData();
  showToast("🗑️ Administrador removido.", "red");
  renderAdmins();
  renderDashboard();
}

function changeOwnPassword() {
  const nova = prompt("Digite a nova senha:");
  if (!nova || nova.trim().length < 4) { showToast("Senha muito curta.", "red"); return; }
  const idx = ADMIN_DATA.credentials.findIndex(c => c.user === currentUser.user);
  if (idx >= 0) {
    ADMIN_DATA.credentials[idx].password = nova.trim();
    saveAdminData();
    showToast("✅ Senha alterada!", "green");
  }
}

// ═══════════════════════════════════════════════════════
// MODAIS
// ═══════════════════════════════════════════════════════
function openModal(id) {
  const el = document.getElementById(id);
  el.classList.remove("hidden");
  el.style.display = "";
  document.body.style.overflow = "hidden";
}

function closeModal(id) {
  const el = document.getElementById(id);
  el.classList.add("hidden");
  el.style.display = "none";
  document.body.style.overflow = "";
}

// Fecha modal clicando fora
document.addEventListener("click", e => {
  if (e.target.classList.contains("modal")) {
    e.target.classList.add("hidden");
    document.body.style.overflow = "";
  }
});

// ═══════════════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════════════
let toastTimer = null;
function showToast(msg, type) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = "toast" + (type === "green" ? " green-toast" : type === "red" ? " red-toast" : "");
  t.classList.remove("hidden");
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add("hidden"), 3000);
}

// ═══════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════
function esc(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDate(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

// ═══════════════════════════════════════════════════════
// LOJA / PRODUTOS + CATEGORIAS
// ═══════════════════════════════════════════════════════
let currentStoreTab = "cats";

function goStoreTab(tab) {
  currentStoreTab = tab;
  document.querySelectorAll(".store-tab").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".store-tab-content").forEach(c => c.classList.remove("active"));
  document.getElementById("stab-" + tab).classList.add("active");
  document.getElementById("store-" + tab).classList.add("active");
  if (tab === "cats")  renderCategories();
  if (tab === "prods") { populateCatSelects(); renderStore(); }
}

function renderStore() {
  const perm   = ADMIN_DATA.permissions[currentUser.role];
  const manSec = document.getElementById("store-prod-manage-section");
  if (manSec) manSec.style.display = perm.manageStore ? "" : "none";

  populateCatSelects();

  const filterEl  = document.getElementById("filter-cat-prod");
  const filterCat = filterEl ? filterEl.value : "";
  let products = ADMIN_DATA.products || [];
  if (filterCat) products = products.filter(p => p.categoryId === filterCat);

  const list  = document.getElementById("products-list");
  const empty = document.getElementById("products-empty");
  list.innerHTML = "";

  if (products.length === 0) {
    empty.classList.remove("hidden");
    return;
  }
  empty.classList.add("hidden");

  products.forEach(p => {
    const cat = ADMIN_DATA.categories.find(c => c.id === p.categoryId) || {};
    const card = document.createElement("div");
    card.className = "product-card" + (!p.active ? " inactive" : "");

    const thumb = document.createElement("div");
    thumb.className = "product-thumb";
    if (p.photo) {
      thumb.innerHTML = `<img src="${esc(p.photo)}" onerror="this.parentElement.textContent='🛍️'" />`;
    } else {
      thumb.textContent = cat.icon || "🛍️";
    }

    const info = document.createElement("div");
    info.className = "product-info";
    info.innerHTML = `
      <div class="product-name">${esc(p.name)}</div>
      <div class="product-meta">${esc(cat.name || "Sem categoria")}${p.desc ? " · " + esc(p.desc) : ""}</div>
      <div class="product-price">R$ ${parseFloat(p.price||0).toFixed(2)}</div>
      <div class="product-meta" style="margin-top:4px">
        Feature: <code style="color:var(--accent)">${esc(p.feature||"—")}</code>
        · ${p.active ? "✅ Ativo" : "⏸️ Inativo"}
      </div>
    `;

    const actions = document.createElement("div");
    actions.className = "product-actions";

    if (perm.manageStore) {
      const editBtn = document.createElement("button");
      editBtn.className = "btn-action purple";
      editBtn.textContent = "✏️ Editar";
      editBtn.onclick = () => openProdEdit(p);
      actions.appendChild(editBtn);

      const delBtn = document.createElement("button");
      delBtn.className = "btn-action red";
      delBtn.textContent = "🗑️";
      delBtn.onclick = () => {
        if (confirm(`Deletar "${p.name}"?`)) {
          deleteProduct(p.id);
          renderStore();
          showToast("🗑️ Produto deletado.", "red");
        }
      };
      actions.appendChild(delBtn);
    }

    card.appendChild(thumb);
    card.appendChild(info);
    card.appendChild(actions);
    list.appendChild(card);
  });
}

function populateCatSelects() {
  const cats = ADMIN_DATA.categories || [];
  ["prod-categoryId","filter-cat-prod","pedit-categoryId"].forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    const isFilter = id === "filter-cat-prod";
    const cur = sel.value;
    sel.innerHTML = isFilter
      ? '<option value="">Todas as categorias</option>'
      : '<option value="">Selecione a categoria *</option>';
    cats.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = (c.icon ? c.icon + " " : "") + c.name.replace(/^[^\w\s]+\s*/,"");
      sel.appendChild(opt);
    });
    if (cur) sel.value = cur;
  });
}

function addProduct() {
  const name       = document.getElementById("prod-name").value.trim();
  const price      = parseFloat(document.getElementById("prod-price").value) || 0;
  const categoryId = document.getElementById("prod-categoryId").value;
  const photo      = document.getElementById("prod-photo").value.trim();
  const feature    = document.getElementById("prod-feature").value.trim();
  const desc       = document.getElementById("prod-desc").value.trim();
  const active     = document.getElementById("prod-active").value === "1";

  if (!name)       { showToast("Preencha o nome.", "red"); return; }
  if (!price)      { showToast("Preencha o preço.", "red"); return; }
  if (!categoryId) { showToast("Selecione uma categoria.", "red"); return; }

  saveProduct({ name, price, categoryId, photo, feature, desc, active });

  ["prod-name","prod-price","prod-photo","prod-feature","prod-desc"].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = "";
  });
  document.getElementById("prod-categoryId").value = "";
  renderStore();
  showToast("✅ Produto adicionado!", "green");
}

function openProdEdit(p) {
  populateCatSelects();
  document.getElementById("pedit-id").value         = p.id;
  document.getElementById("pedit-name").value       = p.name       || "";
  document.getElementById("pedit-price").value      = p.price      || "";
  document.getElementById("pedit-categoryId").value = p.categoryId || "";
  document.getElementById("pedit-feature").value    = p.feature    || "";
  document.getElementById("pedit-photo").value      = p.photo      || "";
  document.getElementById("pedit-desc").value       = p.desc       || "";
  document.getElementById("pedit-active").value     = p.active ? "1" : "0";
  openModal("modal-prod-edit");
}

function saveProdEdit() {
  const id = document.getElementById("pedit-id").value;
  saveProduct({
    id,
    name:       document.getElementById("pedit-name").value.trim(),
    price:      parseFloat(document.getElementById("pedit-price").value) || 0,
    categoryId: document.getElementById("pedit-categoryId").value,
    feature:    document.getElementById("pedit-feature").value.trim(),
    photo:      document.getElementById("pedit-photo").value.trim(),
    desc:       document.getElementById("pedit-desc").value.trim(),
    active:     document.getElementById("pedit-active").value === "1",
  });
  closeModal("modal-prod-edit");
  renderStore();
  showToast("✅ Produto atualizado!", "green");
}

// ── Categorias ──────────────────────────────────────────
function renderCategories() {
  const perm   = ADMIN_DATA.permissions[currentUser.role];
  const manSec = document.getElementById("store-manage-section");
  if (manSec) manSec.style.display = perm.manageStore ? "" : "none";

  const cats  = ADMIN_DATA.categories || [];
  const list  = document.getElementById("categories-list");
  const empty = document.getElementById("categories-empty");
  list.innerHTML = "";

  if (cats.length === 0) { empty.classList.remove("hidden"); return; }
  empty.classList.add("hidden");

  cats.forEach(cat => {
    const prodCount = (ADMIN_DATA.products || []).filter(p => p.categoryId === cat.id).length;
    const card = document.createElement("div");
    card.className = "category-card";
    card.innerHTML = `
      <div class="cat-icon">${esc(cat.icon || "📂")}</div>
      <div class="cat-info">
        <div class="cat-name">${esc(cat.name)}</div>
        <div class="cat-desc">${esc(cat.desc || "")}</div>
        <div class="cat-count">${prodCount} produto${prodCount !== 1 ? "s" : ""}</div>
      </div>
      <div class="cat-actions" id="cact-${esc(cat.id)}"></div>
    `;
    list.appendChild(card);

    if (perm.manageStore) {
      const actEl = card.querySelector(".cat-actions");

      const editBtn = document.createElement("button");
      editBtn.className = "btn-action purple";
      editBtn.textContent = "✏️";
      editBtn.title = "Editar";
      editBtn.onclick = () => openCatEdit(cat);
      actEl.appendChild(editBtn);

      const delBtn = document.createElement("button");
      delBtn.className = "btn-action red";
      delBtn.textContent = "🗑️";
      delBtn.title = prodCount > 0 ? `Remova os ${prodCount} produtos antes` : "Deletar";
      delBtn.disabled = prodCount > 0;
      if (prodCount > 0) delBtn.style.opacity = "0.35";
      delBtn.onclick = () => {
        if (prodCount > 0) { showToast("Remova os produtos desta categoria primeiro.", "red"); return; }
        if (confirm(`Deletar "${cat.name}"?`)) {
          deleteCategory(cat.id);
          renderCategories();
          showToast("🗑️ Categoria deletada.", "red");
        }
      };
      actEl.appendChild(delBtn);
    }
  });
}

function addCategory() {
  const name = document.getElementById("cat-name").value.trim();
  const icon = document.getElementById("cat-icon").value.trim();
  const desc = document.getElementById("cat-desc").value.trim();
  if (!name) { showToast("Preencha o nome da categoria.", "red"); return; }
  saveCategory({ name, icon, desc });
  document.getElementById("cat-name").value = "";
  document.getElementById("cat-icon").value = "";
  document.getElementById("cat-desc").value = "";
  renderCategories();
  showToast("✅ Categoria criada!", "green");
}

function openCatEdit(cat) {
  document.getElementById("cedit-id").value   = cat.id;
  document.getElementById("cedit-name").value = cat.name || "";
  document.getElementById("cedit-icon").value = cat.icon || "";
  document.getElementById("cedit-desc").value = cat.desc || "";
  openModal("modal-cat-edit");
}

function saveCatEdit() {
  saveCategory({
    id:   document.getElementById("cedit-id").value,
    name: document.getElementById("cedit-name").value.trim(),
    icon: document.getElementById("cedit-icon").value.trim(),
    desc: document.getElementById("cedit-desc").value.trim(),
  });
  closeModal("modal-cat-edit");
  renderCategories();
  showToast("✅ Categoria atualizada!", "green");
}

// ═══════════════════════════════════════════════════════
// PEDIDOS PENDENTES
// ═══════════════════════════════════════════════════════
let currentOrderFilter = "pending";

function updateOrdersBadge() {
  const pending = ADMIN_DATA.orders.filter(o => o.status === "pending").length;
  const badge   = document.getElementById("orders-badge");
  if (!badge) return;
  if (pending > 0) {
    badge.textContent = pending;
    badge.style.display = "";
  } else {
    badge.style.display = "none";
  }
}

function filterOrders(status) {
  currentOrderFilter = status;
  // Destaca botão ativo
  ["pending","approved","rejected","all"].forEach(s => {
    const btn = document.getElementById("filter-" + s);
    if (btn) btn.style.opacity = s === status ? "1" : "0.5";
  });
  renderOrders(status);
}

function renderOrders(status) {
  const perm = ADMIN_DATA.permissions[currentUser.role];
  const canApprove = perm.approvePurchases;

  let orders = ADMIN_DATA.orders;
  if (status !== "all") orders = orders.filter(o => o.status === status);
  // Mais recentes primeiro
  orders = [...orders].sort((a, b) => b.createdAt - a.createdAt);

  const list  = document.getElementById("orders-list");
  const empty = document.getElementById("orders-empty");
  list.innerHTML = "";

  if (orders.length === 0) {
    empty.classList.remove("hidden");
    return;
  }
  empty.classList.add("hidden");

  orders.forEach(order => {
    const card = document.createElement("div");
    card.className = "order-card " + order.status;

    const statusLabels = { pending: "🕐 Pendente", approved: "✅ Aprovado", rejected: "❌ Recusado" };

    card.innerHTML = `
      <div class="order-info">
        <div class="order-user">👤 ${esc(order.username)}</div>
        <div class="order-product">🛒 ${esc(order.productName)}</div>
        <div class="order-price">R$ ${parseFloat(order.price || 0).toFixed(2)}</div>
        <div class="order-meta">🕐 ${formatDate(order.createdAt)}
          ${order.resolvedAt ? ` · Resolvido em ${formatDate(order.resolvedAt)} por ${esc(order.resolvedBy || "—")}` : ""}
        </div>
        <span class="order-status ${order.status}">${statusLabels[order.status] || order.status}</span>
      </div>
      <div class="order-actions" id="order-actions-${esc(order.id)}"></div>
    `;
    list.appendChild(card);

    const actionsEl = card.querySelector(".order-actions");

    if (canApprove && order.status === "pending") {
      const acceptBtn = document.createElement("button");
      acceptBtn.className  = "btn-action green";
      acceptBtn.textContent = "✅ Aceitar";
      acceptBtn.onclick = () => {
        resolveOrder(order.id, "approved", currentUser.user);
        updateOrdersBadge();
        renderOrders(currentOrderFilter);
        showToast("✅ Compra aprovada! Produto liberado.", "green");
      };

      const rejectBtn = document.createElement("button");
      rejectBtn.className  = "btn-action red";
      rejectBtn.textContent = "❌ Recusar";
      rejectBtn.onclick = () => {
        resolveOrder(order.id, "rejected", currentUser.user);
        updateOrdersBadge();
        renderOrders(currentOrderFilter);
        showToast("❌ Compra recusada.", "red");
      };

      actionsEl.appendChild(acceptBtn);
      actionsEl.appendChild(rejectBtn);
    }
  });

  updateOrdersBadge();
}
