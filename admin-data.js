/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║          PARADISE PROFILE — ADMIN DATA                  ║
 * ║  Dados de cargos, perfis registrados e suspensões       ║
 * ╚══════════════════════════════════════════════════════════╝
 *
 * CARGOS:
 *   owner  — acesso total
 *   ceo    — acesso total exceto mexer em owners
 *   senior — só visualiza usuários, não edita
 */

const ADMIN_DATA = {

  // ── Senhas por cargo ─────────────────────────────────────
  // TROQUE as senhas abaixo antes de publicar!
  credentials: [
    { user: "Wagner",   password: "757894nlw",  role: "owner"  },
    { user: "Arthur",   password: "757894nlw",    role: "ceo"    },
    { user: "Senior1",  password: "757894nlw", role: "senior" },
  ],

  // ── Permissões por cargo ──────────────────────────────────
  permissions: {
    owner: {
      viewUsers:      true,
      editUsers:      true,
      deleteUsers:    true,
      suspendUsers:   true,
      editCredentials:true,
      addCredentials: true,
      deleteCredentials: true,
      viewAdmins:     true,
      manageStore:    true,   // criar/editar/deletar produtos
      approvePurchases: true, // aprovar pedidos pendentes
    },
    ceo: {
      viewUsers:      true,
      editUsers:      true,
      deleteUsers:    true,
      suspendUsers:   true,
      editCredentials:false,
      addCredentials: false,
      deleteCredentials: false,
      viewAdmins:     true,
      manageStore:    false,
      approvePurchases: false,
    },
    senior: {
      viewUsers:      true,
      editUsers:      false,
      deleteUsers:    false,
      suspendUsers:   false,
      editCredentials:false,
      addCredentials: false,
      deleteCredentials: false,
      viewAdmins:     false,
      manageStore:    false,
      approvePurchases: false,
    },
  },

  // ── Perfis registrados ────────────────────────────────────
  profiles: [],

  // ── Suspensões ────────────────────────────────────────────
  suspensions: [],

  // ── Contas de usuário (donos de perfil) ───────────────────
  // { id, username, password, profileId }
  user_accounts: [],

  // ── Produtos da loja ─────────────────────────────────────
  // { id, name, price, photo, description, category, feature, limit, active, createdAt }
  products: [],

  // ── Categorias da loja ───────────────────────────────────
  // { id, name, desc, icon, createdAt }
  categories: [],

  // ── Stories ──────────────────────────────────────────────
  // { id, username, profileId, imageData, filter, texts:[{text,x,y,color,size}], music, createdAt, expiresAt }
  stories: [],

  // ── Pedidos / compras ────────────────────────────────────
  // { id, userId, username, productId, productName, price, status, createdAt, resolvedAt, resolvedBy }
  // status: "pending" | "approved" | "rejected"
  orders: [],

};

// Persistência via localStorage
(function initStorage() {
  try {
    // Limpa qualquer credentials antiga que possa estar travando o login
    const saved = localStorage.getItem("paradise_admin_data");
    if (saved) {
      const parsed = JSON.parse(saved);
      // Remove credentials do objeto salvo se existir (limpeza automática)
      if (parsed.credentials) {
        delete parsed.credentials;
        localStorage.setItem("paradise_admin_data", JSON.stringify(parsed));
      }
      if (parsed.profiles)      ADMIN_DATA.profiles      = parsed.profiles;
      if (parsed.suspensions)   ADMIN_DATA.suspensions   = parsed.suspensions;
      // ⚠️ credentials NUNCA vem do localStorage — sempre do arquivo
      if (parsed.user_accounts) ADMIN_DATA.user_accounts = parsed.user_accounts;
      if (parsed.products)      ADMIN_DATA.products      = parsed.products;
      if (parsed.categories)    ADMIN_DATA.categories    = parsed.categories;
      if (parsed.stories)       ADMIN_DATA.stories       = parsed.stories;
      if (parsed.orders)        ADMIN_DATA.orders        = parsed.orders;
    }
  } catch(e) {}

  // ── Contas padrão pré-cadastradas ──
  // Se o usuário não existir ainda, cria automaticamente
  (function seedDefaultAccounts() {
    const defaults = [
      { username: "_Ricarte.777", password: "757894nlw", profileId: "_Ricarte.777" },
      { username: "Ricarte.777",  password: "757894nlw", profileId: "_Ricarte.777" },
    ];
    let changed = false;
    defaults.forEach(def => {
      const exists = ADMIN_DATA.user_accounts.find(a => a.username === def.username);
      if (!exists) {
        ADMIN_DATA.user_accounts.push(def);
        changed = true;
      }
    });
    if (changed) saveAdminData();
  })();

  // ── Categorias padrão pré-cadastradas ──
  (function seedDefaultCategories() {
    const defaults = [
      { id: "cat_musica",    name: "🎵 Música",    icon: "🎵", desc: "Libera slots de música no perfil. Adicione mais músicas para tocar no seu perfil." },
      { id: "cat_fundos",    name: "🌌 Fundos",    icon: "🌌", desc: "Personalize o fundo do seu perfil com imagens, GIFs, animações e vídeos." },
      { id: "cat_aparencia", name: "🎨 Aparência", icon: "🎨", desc: "Modifique cores, temas, fontes e o estilo visual do seu perfil." },
      { id: "cat_efeitos",   name: "✨ Efeitos",   icon: "✨", desc: "Adicione efeitos visuais, animações e partículas ao seu perfil." },
      { id: "cat_links",     name: "🔗 Links",     icon: "🔗", desc: "Libere mais espaços para links e botões personalizados no perfil." },
      { id: "cat_premium",   name: "💎 Premium",   icon: "💎", desc: "Recursos exclusivos e avançados para quem quer o melhor perfil." },
      { id: "cat_perfil",    name: "👤 Perfil",    icon: "👤", desc: "Libere novas possibilidades de personalização das informações do perfil." },
    ];
    let changed = false;
    defaults.forEach(def => {
      const exists = ADMIN_DATA.categories.find(c => c.id === def.id);
      if (!exists) {
        ADMIN_DATA.categories.push({ ...def, createdAt: Date.now() });
        changed = true;
      }
    });
    if (changed) saveAdminData();
  })();

  // ── Produtos padrão pré-cadastrados ──
  // Produtos criados no painel ficam aqui para aparecer em todos os dispositivos
  (function seedDefaultProducts() {
    const defaults = [
      {
        id:         "prod_music_slot_1",
        name:       "+1 Slots de musica",
        price:      5.00,
        categoryId: "cat_musica",
        photo:      "https://i.imgur.com/1Q1Q1Q1.png",
        feature:    "music_slot_1",
        desc:       "Adicione mais uma música ao seu perfil e deixe sua identidade ainda mais personalizada. Com esse produto, você ganha acesso a mais um espaço para colocar sua música favorita!",
        active:     true,
        createdAt:  1726000000000,
      },
    ];
    let changed = false;
    defaults.forEach(def => {
      const exists = ADMIN_DATA.products.find(p => p.id === def.id);
      if (!exists) {
        ADMIN_DATA.products.push(def);
        changed = true;
      }
    });
    if (changed) saveAdminData();
  })();
})();

function saveAdminData() {
  try {
    localStorage.setItem("paradise_admin_data", JSON.stringify({
      profiles:      ADMIN_DATA.profiles,
      suspensions:   ADMIN_DATA.suspensions,
      user_accounts: ADMIN_DATA.user_accounts,
      products:      ADMIN_DATA.products,
      categories:    ADMIN_DATA.categories,
      stories:       ADMIN_DATA.stories,
      orders:        ADMIN_DATA.orders,
    }));
  } catch(e) {}
}

function registerProfile(data) {
  const id = data.username || data.name || ("user_" + Date.now().toString(36));
  const existing = ADMIN_DATA.profiles.findIndex(p => p.id === id);
  const entry = {
    id,
    name:      data.name || "",
    username:  data.username || "",
    createdAt: existing >= 0 ? ADMIN_DATA.profiles[existing].createdAt : Date.now(),
    updatedAt: Date.now(),
    data,
  };
  if (existing >= 0) {
    ADMIN_DATA.profiles[existing] = entry;
  } else {
    ADMIN_DATA.profiles.push(entry);
  }
  saveAdminData();
  return id;
}

// ── Contas de usuário ────────────────────────────────────
function registerUserAccount(username, password, profileId) {
  const existing = ADMIN_DATA.user_accounts.findIndex(a => a.username === username);
  if (existing >= 0) {
    // Atualiza senha se já existe
    ADMIN_DATA.user_accounts[existing].password  = password;
    ADMIN_DATA.user_accounts[existing].profileId = profileId;
  } else {
    ADMIN_DATA.user_accounts.push({ username, password, profileId });
  }
  saveAdminData();
}

function loginUserAccount(username, password) {
  return ADMIN_DATA.user_accounts.find(a => a.username === username && a.password === password) || null;
}

function getUserSession() {
  try {
    // Tenta sessionStorage primeiro, depois localStorage (sessão persistente)
    const s = sessionStorage.getItem("paradise_user_session")
           || localStorage.getItem("paradise_user_session");
    return s ? JSON.parse(s) : null;
  } catch(e) { return null; }
}

function setUserSession(account) {
  try {
    const data = JSON.stringify(account);
    sessionStorage.setItem("paradise_user_session", data);
    // Persiste também no localStorage para sobreviver ao fechamento do navegador
    localStorage.setItem("paradise_user_session", data);
  } catch(e) {}
}

function clearUserSession() {
  try {
    sessionStorage.removeItem("paradise_user_session");
    localStorage.removeItem("paradise_user_session");
  } catch(e) {}
}

function isProfileSuspended(id) {
  const s = ADMIN_DATA.suspensions.find(s => s.id === id);
  if (!s) return null;
  if (s.until && Date.now() > s.until) {
    // Suspensão expirou — remove
    ADMIN_DATA.suspensions = ADMIN_DATA.suspensions.filter(x => x.id !== id);
    saveAdminData();
    return null;
  }
  return s;
}

if (typeof module !== "undefined") module.exports = { ADMIN_DATA, saveAdminData, registerProfile, isProfileSuspended, registerUserAccount, loginUserAccount, getUserSession, setUserSession, clearUserSession };

// ── Categorias ───────────────────────────────────────────
function saveCategory(data) {
  const id = data.id || ("cat_" + Date.now().toString(36));
  const existing = ADMIN_DATA.categories.findIndex(c => c.id === id);
  const entry = { ...data, id };
  if (!entry.createdAt) entry.createdAt = Date.now();
  if (existing >= 0) {
    ADMIN_DATA.categories[existing] = entry;
  } else {
    ADMIN_DATA.categories.push(entry);
  }
  saveAdminData();
  return id;
}

function deleteCategory(id) {
  // Remove a categoria e disvincula produtos
  ADMIN_DATA.categories = ADMIN_DATA.categories.filter(c => c.id !== id);
  ADMIN_DATA.products.forEach(p => { if (p.categoryId === id) p.categoryId = ""; });
  saveAdminData();
}

// ── Produtos ─────────────────────────────────────────────
function saveProduct(data) {
  const id = data.id || ("prod_" + Date.now().toString(36));
  const existing = ADMIN_DATA.products.findIndex(p => p.id === id);
  const entry = { ...data, id, updatedAt: Date.now() };
  if (!entry.createdAt) entry.createdAt = Date.now();
  if (existing >= 0) {
    ADMIN_DATA.products[existing] = entry;
  } else {
    ADMIN_DATA.products.push(entry);
  }
  saveAdminData();
  return id;
}

function deleteProduct(id) {
  ADMIN_DATA.products = ADMIN_DATA.products.filter(p => p.id !== id);
  saveAdminData();
}

// ── Pedidos ──────────────────────────────────────────────
function createOrder(userId, username, productId, productName, price) {
  const id = "ord_" + Date.now().toString(36) + Math.random().toString(36).slice(2,6);
  const order = {
    id, userId, username, productId, productName, price,
    status: "pending", createdAt: Date.now(), resolvedAt: null, resolvedBy: null
  };
  ADMIN_DATA.orders.push(order);
  saveAdminData();
  // Envia para o banco central no GitHub (silencioso se sem token)
  pushOrderToGitHub(order).catch(() => {});
  return order;
}

function resolveOrder(orderId, status, resolvedBy) {
  const idx = ADMIN_DATA.orders.findIndex(o => o.id === orderId);
  if (idx < 0) return null;
  ADMIN_DATA.orders[idx].status     = status; // "approved" | "rejected"
  ADMIN_DATA.orders[idx].resolvedAt = Date.now();
  ADMIN_DATA.orders[idx].resolvedBy = resolvedBy;

  if (status === "approved") {
    const order   = ADMIN_DATA.orders[idx];
    const product = ADMIN_DATA.products.find(p => p.id === order.productId);
    const account = ADMIN_DATA.user_accounts.find(
      a => a.username === order.username || a.profileId === order.userId
    );
    if (account) {
      if (!account.unlockedFeatures) account.unlockedFeatures = [];
      const feature = (product && product.feature) ? product.feature : order.productId;
      if (!account.unlockedFeatures.includes(feature)) {
        account.unlockedFeatures.push(feature);
      }
    }
  }
  saveAdminData();
  // Sincroniza resolução com o banco central
  pushOrderToGitHub(ADMIN_DATA.orders[idx]).catch(() => {});
  return ADMIN_DATA.orders[idx];
}

function getUserOrders(username) {
  return ADMIN_DATA.orders.filter(o => o.username === username);
}

function hasFeature(username, feature) {
  const account = ADMIN_DATA.user_accounts.find(a => a.username === username);
  return !!(account && account.unlockedFeatures && account.unlockedFeatures.includes(feature));
}

// ── Stories ──────────────────────────────────────────────
function publishStory(username, profileId, imageData, filter, texts, music, musicName, durationSec) {
  const id        = "story_" + Date.now().toString(36) + Math.random().toString(36).slice(2,5);
  const createdAt = Date.now();
  const expiresAt = createdAt + 24 * 60 * 60 * 1000; // 24h
  const duration  = (durationSec || 10) * 1000; // converte para ms
  const story = { id, username, profileId, imageData, filter: filter || "none", texts: texts || [], music: music || "", musicName: musicName || "", duration, createdAt, expiresAt };
  ADMIN_DATA.stories.push(story);
  saveAdminData();
  return story;
}

function deleteStory(id) {
  ADMIN_DATA.stories = ADMIN_DATA.stories.filter(s => s.id !== id);
  saveAdminData();
}

function getActiveStories(username) {
  const now = Date.now();
  // Remove stories expirados automaticamente
  const before = ADMIN_DATA.stories.length;
  ADMIN_DATA.stories = ADMIN_DATA.stories.filter(s => s.expiresAt > now);
  if (ADMIN_DATA.stories.length !== before) saveAdminData();
  return ADMIN_DATA.stories.filter(s => s.username === username);
}

function hasActiveStory(username) {
  return getActiveStories(username).length > 0;
}

// ══════════════════════════════════════════════════════════════
// PEDIDOS CENTRALIZADOS — orders-db.json no GitHub
// ══════════════════════════════════════════════════════════════

const ORDERS_DB_URL  = "https://raw.githubusercontent.com/vaguinhoraquel2019-art/Perfil/main/orders-db.json";
const ORDERS_API_URL = "https://api.github.com/repos/vaguinhoraquel2019-art/Perfil/contents/orders-db.json";
const ORDERS_BRANCH  = "main";

function _ghToken() {
  return localStorage.getItem("paradise_gh_token") || "";
}

// Carrega pedidos do GitHub e mescla com localStorage
async function syncOrdersFromGitHub() {
  try {
    const res = await fetch(ORDERS_DB_URL + "?t=" + Date.now());
    if (!res.ok) return;
    const json = await res.json();
    const remoteOrders = json.orders || [];

    // Mescla: remote prevalece, mas mantém pedidos locais não enviados ainda
    const localOrders = ADMIN_DATA.orders;
    remoteOrders.forEach(ro => {
      const idx = localOrders.findIndex(lo => lo.id === ro.id);
      if (idx >= 0) {
        localOrders[idx] = ro; // atualiza com versão remota (pode ter sido resolvido)
      } else {
        localOrders.push(ro);
      }
    });
    ADMIN_DATA.orders = localOrders;
    saveAdminData();
  } catch(e) {}
}

// Salva um pedido no GitHub
async function pushOrderToGitHub(order) {
  const token = _ghToken();
  if (!token) return;

  try {
    // Lê SHA atual
    const headers = {
      "Authorization": "token " + token,
      "Accept": "application/vnd.github+json",
      "Content-Type": "application/json",
    };
    const getRes  = await fetch(ORDERS_API_URL + "?ref=" + ORDERS_BRANCH, { headers });
    const getData = await getRes.json();
    const sha     = getData.sha;
    const current = JSON.parse(atob(getData.content.replace(/\n/g,"")));
    const orders  = current.orders || [];

    // Adiciona ou atualiza
    const idx = orders.findIndex(o => o.id === order.id);
    if (idx >= 0) { orders[idx] = order; } else { orders.push(order); }

    const newContent = JSON.stringify({ orders }, null, 2);
    await fetch(ORDERS_API_URL, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        message: "pedido: " + order.id,
        content: btoa(unescape(encodeURIComponent(newContent))),
        sha,
        branch: ORDERS_BRANCH,
      }),
    });

    // Atualiza local também
    const localIdx = ADMIN_DATA.orders.findIndex(o => o.id === order.id);
    if (localIdx >= 0) { ADMIN_DATA.orders[localIdx] = order; } else { ADMIN_DATA.orders.push(order); }
    saveAdminData();
  } catch(e) {}
}
