/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║              🌸 PAINEL DE CONFIGURAÇÃO 🌸                   ║
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
    // Fundo da tela de entrada (click to enter)
    // Troque por uma imagem sua — coloque em assets/images/ ou use URL direta
    entranceBg: "https://cdn.discordapp.com/attachments/1519432914109071492/1549103856523284540/wagner.png?ex=6aac1de4&is=6aaacc64&hm=34cbed59c7934a591484a8faf480a65a339bdff1a79eff6bc3472ad6c224c8f8",

    // Fundo da página principal
    // Troque pelo jardim/fundo que preferir
    mainBg: "https://cdn.discordapp.com/attachments/1519432914109071492/1549103856523284540/wagner.png?ex=6aac1de4&is=6aaacc64&hm=34cbed59c7934a591484a8faf480a65a339bdff1a79eff6bc3472ad6c224c8f8",

    // Foto de perfil — troque pela sua foto
    avatar: "https://cdn.discordapp.com/attachments/1519432914109071492/1549103792564342924/IMG_20260903_112843_207.jpg?ex=6aac1dd5&is=6aaacc55&hm=689d841916b44a306e21cf5034a860ce2a36c4d59c96f722eee5ed58d8b324b8",

    // Imagem dentro do cartão (pode ser igual ao avatar ou diferente)
    cardAvatar: "https://cdn.discordapp.com/attachments/1519432914109071492/1549103792564342924/IMG_20260903_112843_207.jpg?ex=6aac1dd5&is=6aaacc55&hm=689d841916b44a306e21cf5034a860ce2a36c4d59c96f722eee5ed58d8b324b8",
  },

  // ──────────────────────────────────────────────
  // 👤  PERFIL
  // ──────────────────────────────────────────────
  profile: {
    // Nome principal exibido na página
    name: "Ricarte",

    // Frase/descrição abaixo do nome
    description: "Não temas, porque eu sou contigo; não te assombres, porque eu sou o teu Deus (Isaías 41:10)",

    // Localização
    location: "Bertioga",

    // Nome de usuário do cartão
    username: "_Ricarte.777",

    // Status/frase do cartão
    status: "Não temas, porque eu sou contigo; não te assombres, porque eu sou o teu Deus (Isaías 41:10)",

    // Ícones decorativos ao lado do username no cartão (emojis ou texto)
    cardIcons: ["😶‍🌫️"],
  },

  // ──────────────────────────────────────────────
  // 🔗  REDES SOCIAIS
  // ──────────────────────────────────────────────
  socials: {
    spotify: {
      enabled: true,
      url: "https://open.spotify.com/user/31ih6wfklh5s3n5foq7skakgsjje?si=d658544919c64704",
      label: "Spotify",
    },
    instagram: {
      enabled: true,
      url: "https://www.instagram.com/_ricarte.777?stkn=MXRlY3ZlZmRjNDM0Mg==",
      label: "Instagram",
    },
    tiktok: {
      enabled: true,
      url: "https://www.tiktok.com/@ricarte.02?is_from_webapp=1&sender_device=pc",
      label: "TikTok",
    },
    twitter: {
      enabled: false,
      url: "https://twitter.com/",
      label: "Twitter",
    },
    youtube: {
      enabled: false,
      url: "https://youtube.com/",
      label: "YouTube",
    },
    patreon: {
      enabled: false,
      url: "https://patreon.com/",
      label: "Patreon",
    },
  },

  // ──────────────────────────────────────────────
  // 🎵  MÚSICA
  // ──────────────────────────────────────────────
  audio: {
    // Ativar ou desativar música
    enabled: false,

    // URL do arquivo de áudio — coloque um .mp3 na pasta assets/audio/
    // Link do Spotify NÃO funciona. Use um arquivo .mp3 direto.
    url: "assets/audio/music.mp3",

    // Nome da música exibido no player
    title: "Joga Essa bucet4 pros meno do pcc",

    // Artista exibido no player
    artist: "DJ Nonato",

    // Volume inicial (0.0 a 1.0)
    volume: 1.0,

    // Repetir música ao terminar
    loop: true,

    // Iniciar automaticamente após clicar em "click to enter"
    autoplay: true,
  },

  // ──────────────────────────────────────────────
  // 🎨  CORES E TEMA
  // ──────────────────────────────────────────────
  theme: {
    // Cor primária (usada em títulos, destaques)
    primary: "#ffffff",

    // Cor secundária (usada em textos, ícones)
    secondary: "#ffffff",

    // Cor de destaque/accent
    accent: "#ffffff",

    // Cor do texto principal
    textColor: "#ffffff",

    // Cor do texto claro (sobre fundos escuros)
    textLight: "#f5f0e8",

    // Cor do card (fundo semi-transparente)
    cardBg: "rgba(0, 0, 0, 0.35)",

    // Cor da borda do card
    cardBorder: "rgba(0, 0, 0, 0.4)",

    // Cor de fundo da tela de entrada
    entranceOverlay: "rgba(0, 0, 0, 0.55)",
  },

  // ──────────────────────────────────────────────
  // 🔤  FONTES
  // ──────────────────────────────────────────────
  fonts: {
    // Fonte do título/nome (Google Fonts)
    titleFont: "Playfair Display",

    // Fonte dos textos gerais
    bodyFont: "Lato",

    // Fonte decorativa (usada em frases especiais)
    decorFont: "Dancing Script",
  },

  // ──────────────────────────────────────────────
  // ✨  EFEITOS VISUAIS
  // ──────────────────────────────────────────────
  effects: {
    // Partículas flutuantes (pétalas)
    particles: true,

    // Quantidade de partículas
    particleCount: 18,

    // Cursor personalizado
    customCursor: true,

    // Efeito de brilho nos ícones sociais ao passar o mouse
    socialGlow: true,

    // Animação de entrada (fade) ao carregar o perfil
    fadeIn: true,

    // Blur no fundo da tela de entrada
    entranceBlur: "6px",

    // Efeito parallax suave no fundo
    parallax: false,
  },

  // ──────────────────────────────────────────────
  // 📝  TEXTOS DA INTERFACE
  // ──────────────────────────────────────────────
  ui: {
    // Texto da tela de entrada
    enterText: "click to enter...",

    // Título da aba do navegador
    pageTitle: "Ricarte",

    // Favicon emoji (aparece na aba)
    faviconEmoji: "😶‍🌫️",
  },

};

// Exporta para uso nos outros arquivos
if (typeof module !== "undefined") module.exports = CONFIG;
