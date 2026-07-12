(() => {
  const DEFAULTS = window.DEFAULT_PORTFOLIO_CONTENT;
  const config = window.PORTFOLIO_CONFIG || {};
  const remoteEnabled = Boolean(config.supabaseUrl && config.supabaseAnonKey && window.supabase);
  const client = remoteEnabled ? window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey) : null;
  let content = structuredClone(DEFAULTS);
  let toastTimer;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const escapeHTML = (value = "") => String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;" }[char]));
  const safeUrl = (value = "") => {
    const url = String(value).trim();
    if (!url) return "";
    if (url.startsWith("#") || url.startsWith("assets/") || url.startsWith("./") || url.startsWith("../") || url.startsWith("data:")) return url;
    try {
      const parsed = new URL(url, window.location.href);
      return ["http:", "https:", "mailto:", "tel:"].includes(parsed.protocol) ? parsed.href : "";
    } catch { return ""; }
  };
  const deepMerge = (base, update) => {
    if (Array.isArray(base)) return Array.isArray(update) ? update : base;
    if (base && typeof base === "object") {
      const result = { ...base };
      if (update && typeof update === "object") Object.keys(update).forEach((key) => { result[key] = key in base ? deepMerge(base[key], update[key]) : update[key]; });
      return result;
    }
    return update ?? base;
  };

  function showToast(message) {
    const toast = $(".toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
  }

  async function loadContent() {
    if (remoteEnabled) {
      const { data, error } = await client.from("site_content").select("content").eq("id", "main").maybeSingle();
      if (!error && data?.content) return deepMerge(clone(DEFAULTS), data.content);
      if (error) console.warn("Supabase content load failed:", error.message);
    }
    try {
      const local = JSON.parse(localStorage.getItem("akuangPortfolioContent") || "null");
      if (local) return deepMerge(clone(DEFAULTS), local);
    } catch (error) { console.warn(error); }
    return clone(DEFAULTS);
  }

  function applyTheme() {
    const theme = content.theme || {};
    const root = document.documentElement;
    root.style.setProperty("--accent", theme.accent || DEFAULTS.theme.accent);
    root.style.setProperty("--accent-2", theme.accent2 || DEFAULTS.theme.accent2);
    root.style.setProperty("--warm", theme.warm || DEFAULTS.theme.warm);
    root.style.setProperty("--bg", theme.background || DEFAULTS.theme.background);
    root.style.setProperty("--works-columns", Math.max(1, Math.min(4, Number(theme.worksColumns) || 3)));
    root.style.setProperty("--radius", `${Math.max(8, Math.min(42, Number(theme.cardRadius) || 24))}px`);
    document.body.classList.toggle("mascot-left", theme.mascotPosition === "left");
  }

  function setTextAll(selector, value) { $$(selector).forEach((node) => { node.textContent = value || ""; }); }
  function setLink(node, text, href) { if (!node) return; node.textContent = text || ""; node.href = safeUrl(href) || "#"; }

  function renderBrand() {
    setTextAll("[data-brand-name]", content.brand.name);
    setTextAll("[data-brand-en]", content.brand.en);
    setTextAll("[data-brand-mark]", content.brand.mark);
    document.title = `${content.brand.name}｜混音・編曲・免費宅錄`;
  }

  function renderSectionsAndNav() {
    const main = $("#page-sections");
    main.style.display = "flex";
    main.style.flexDirection = "column";
    $("[data-fixed-section='hero']").style.order = -100;
    $("[data-fixed-section='stats']").style.order = -90;
    const nav = $("#site-nav");
    nav.innerHTML = "";
    content.sections.forEach((item, index) => {
      const section = document.querySelector(`[data-section="${CSS.escape(item.id)}"]`);
      if (section) {
        section.hidden = !item.visible;
        section.style.order = String(index);
      }
      if (item.visible) {
        const link = document.createElement("a");
        link.href = `#${item.id}`;
        link.textContent = item.label;
        if (item.id === "contact") link.className = "nav-cta";
        nav.append(link);
      }
    });
  }

  function renderHero() {
    $("[data-hero-eyebrow]").textContent = content.hero.eyebrow;
    $("[data-hero-before]").textContent = content.hero.titleBefore + " ";
    $("[data-hero-highlight]").textContent = content.hero.titleHighlight;
    $("[data-hero-after]").textContent = content.hero.titleAfter;
    $("[data-hero-description]").textContent = content.hero.description;
    setLink($("[data-hero-primary]"), content.hero.primaryText, content.hero.primaryLink);
    setLink($("[data-hero-secondary]"), content.hero.secondaryText, content.hero.secondaryLink);
    $("[data-hero-chips]").innerHTML = content.hero.chips.map((chip) => `<span>${escapeHTML(chip)}</span>`).join("");
    const mascot = $("[data-hero-mascot]"); mascot.src = safeUrl(content.hero.mascot); mascot.onerror = () => { mascot.src = DEFAULTS.hero.mascot; };
  }

  function renderStats() {
    $(".stats-bar").innerHTML = content.stats.map((item) => `<div><strong>${escapeHTML(item.value)}</strong><span>${escapeHTML(item.label)}</span></div>`).join("");
  }

  function renderHeading(prefix, data) {
    $(`[data-${prefix}-eyebrow]`).textContent = data.eyebrow || "";
    $(`[data-${prefix}-title]`).textContent = data.title || "";
    const desc = $(`[data-${prefix}-description]`); if (desc) desc.textContent = data.description || "";
  }

  function gradientFor(index) {
    const gradients = [
      "linear-gradient(145deg,#5f678f,#151d18 55%,#a97555)",
      "linear-gradient(145deg,#21342a,#7b5a44 58%,#252d4a)",
      "linear-gradient(145deg,#2a2e48,#101713 55%,#6c8a5e)",
      "linear-gradient(145deg,#805942,#1c2220 58%,#4f587c)"
    ];
    return gradients[index % gradients.length];
  }

  function renderWorks() {
    renderHeading("works", content.worksHeading);
    const grid = $("#work-grid");
    grid.innerHTML = "";
    content.works.filter((item) => item.published !== false).forEach((item, index) => {
      const article = document.createElement("article");
      article.className = "work-card reveal";
      const cover = safeUrl(item.coverUrl);
      article.innerHTML = `
        <div class="work-cover" style="background-image:${cover ? `linear-gradient(180deg,transparent 45%,rgba(0,0,0,.32)),url('${escapeHTML(cover)}')` : gradientFor(index)}">
          <span class="category">${escapeHTML(item.category || "WORK")}</span>
          <button class="play-button" type="button" aria-label="播放 ${escapeHTML(item.title)}">▶</button>
        </div>
        <div class="work-info"><div><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.subtitle)}</p></div><span>${escapeHTML(item.genre)}</span></div>`;
      $(".play-button", article).addEventListener("click", () => openMedia(item));
      grid.append(article);
    });
  }

  function renderServices() {
    renderHeading("services", content.servicesHeading);
    $("#service-grid").innerHTML = content.services.map((item, index) => `
      <article class="service-card ${item.featured ? "featured" : ""} reveal">
        ${item.featured ? '<span class="service-badge">POPULAR</span>' : ""}
        <span class="service-number">${String(index + 1).padStart(2, "0")}</span><div class="service-icon">${escapeHTML(item.code)}</div>
        <h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.description)}</p>
        <div class="price-row"><span>${escapeHTML(item.priceLabel)}</span><strong>${escapeHTML(item.price)}</strong></div>
      </article>`).join("");
  }

  function renderProcess() {
    renderHeading("process", content.processHeading);
    $("#process-grid").innerHTML = content.process.map((item, index) => `<article class="process-item reveal"><span>${String(index + 1).padStart(2, "0")}</span><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.description)}</p></article>`).join("");
  }

  function renderBeats() {
    renderHeading("beat", content.beatHeading);
    setLink($("[data-beat-button]"), content.beatHeading.buttonText, content.beatHeading.buttonLink);
    const list = $("#beat-list");
    const beats = content.beats.filter((item) => item.published !== false);
    const filters = ["all", ...new Set(beats.map((beat) => (beat.filter || "other").toLowerCase()))];
    $("#beat-filters").innerHTML = filters.map((filter, index) => `<button class="${index === 0 ? "active" : ""}" type="button" data-filter="${escapeHTML(filter)}">${filter === "all" ? "全部" : escapeHTML(filter.toUpperCase())}</button>`).join("");
    list.innerHTML = "";
    beats.forEach((item, index) => {
      const row = document.createElement("article"); row.className = "beat-row"; row.dataset.genre = (item.filter || "other").toLowerCase();
      const cover = safeUrl(item.coverUrl);
      row.innerHTML = `<button class="mini-play" type="button" aria-label="播放 ${escapeHTML(item.title)}">▶</button><div class="mini-cover" style="${cover ? `background-image:url('${escapeHTML(cover)}')` : `background:${gradientFor(index)}`} "></div><div class="beat-title"><strong>${escapeHTML(item.title)}</strong><span>${escapeHTML(item.genre)}</span></div><span>${escapeHTML(item.bpm)}</span><span>${escapeHTML(item.key)}</span><button class="license-button" type="button">${escapeHTML(item.price)}</button>`;
      $(".mini-play", row).addEventListener("click", () => openMedia(item));
      $(".license-button", row).addEventListener("click", () => { window.location.hash = "contact"; });
      list.append(row);
    });
    $$("#beat-filters button").forEach((button) => button.addEventListener("click", () => {
      $$("#beat-filters button").forEach((item) => item.classList.remove("active")); button.classList.add("active");
      $$(".beat-row").forEach((row) => row.classList.toggle("is-hidden", button.dataset.filter !== "all" && row.dataset.genre !== button.dataset.filter));
    }));
  }

  function renderAbout() {
    $("[data-about-eyebrow]").textContent = content.about.eyebrow;
    $("[data-about-title]").textContent = content.about.title;
    $("[data-about-description]").textContent = content.about.description;
    $("[data-about-tags]").innerHTML = content.about.tags.map((tag) => `<span>${escapeHTML(tag)}</span>`).join("");
    const mascot = $("[data-about-mascot]"); mascot.src = safeUrl(content.about.mascot); mascot.onerror = () => { mascot.src = DEFAULTS.about.mascot; };
  }

  function renderContact() {
    $("[data-contact-eyebrow]").textContent = content.contact.eyebrow;
    $("[data-contact-title]").textContent = content.contact.title;
    $("[data-contact-description]").textContent = content.contact.description;
    $("[data-form-button]").textContent = content.contact.formButton;
    const links = [
      { label: "EMAIL", text: content.contact.email, url: `mailto:${content.contact.email}` },
      { label: "INSTAGRAM / THREADS", text: content.contact.instagramLabel, url: content.contact.instagramUrl },
      { label: "LINE", text: content.contact.lineLabel, url: content.contact.lineUrl }
    ];
    $("#contact-links").innerHTML = "";
    links.forEach((item) => {
      const a = document.createElement("a"); a.href = safeUrl(item.url) || "#contact"; if (item.url?.startsWith("http")) { a.target = "_blank"; a.rel = "noopener"; }
      a.innerHTML = `<span>${escapeHTML(item.label)}</span><strong>${escapeHTML(item.text)}</strong>`; $("#contact-links").append(a);
    });
    const select = $("#service-select");
    select.innerHTML = '<option value="">請選擇</option>' + content.services.map((service) => `<option>${escapeHTML(service.title)}</option>`).join("") + '<option>Beat 伴奏授權</option><option>其他合作</option>';
  }

  function youtubeEmbed(url) {
    try {
      const parsed = new URL(url);
      if (parsed.hostname.includes("youtu.be")) return `https://www.youtube.com/embed/${parsed.pathname.slice(1)}`;
      if (parsed.hostname.includes("youtube.com")) {
        const id = parsed.searchParams.get("v") || parsed.pathname.split("/").filter(Boolean).pop();
        return id ? `https://www.youtube.com/embed/${id}` : "";
      }
    } catch { return ""; }
    return "";
  }

  function openMedia(item) {
    const url = safeUrl(item.mediaUrl || item.externalUrl);
    if (!url) { showToast("這個作品尚未加入音檔、影片或連結"); return; }
    if (item.mediaType === "link") { window.open(url, "_blank", "noopener"); return; }
    const dialog = $("#media-dialog"); const body = $("#media-dialog-body"); body.innerHTML = "";
    if (item.mediaType === "video") {
      const embed = youtubeEmbed(url);
      if (embed) body.innerHTML = `<iframe src="${escapeHTML(embed)}" title="${escapeHTML(item.title)}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
      else { const video = document.createElement("video"); video.src = url; video.controls = true; video.autoplay = true; body.append(video); }
    } else {
      const audio = document.createElement("audio"); audio.src = url; audio.controls = true; audio.autoplay = true; body.append(audio);
    }
    dialog.showModal();
  }

  function setupInteractions() {
    const toggle = $(".menu-toggle"); const nav = $(".site-nav");
    toggle.addEventListener("click", () => { const open = nav.classList.toggle("open"); toggle.setAttribute("aria-expanded", String(open)); });
    $$(".site-nav a").forEach((link) => link.addEventListener("click", () => { nav.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); }));
    $(".dialog-close").addEventListener("click", () => $("#media-dialog").close());
    $("#media-dialog").addEventListener("close", () => { $("#media-dialog-body").innerHTML = ""; });
    $("#contact-form").addEventListener("submit", (event) => {
      event.preventDefault(); const data = new FormData(event.currentTarget);
      const subject = encodeURIComponent(`音樂製作合作詢問｜${data.get("service")}｜${data.get("name")}`);
      const body = encodeURIComponent(`阿光你好，我是 ${data.get("name")}。\n\n想詢問的項目：${data.get("service")}\n\n作品與需求：\n${data.get("message")}\n\n期待你的回覆，謝謝！`);
      window.location.href = `mailto:${content.contact.email}?subject=${subject}&body=${body}`;
    });
  }

  function setupReveal() {
    if (!("IntersectionObserver" in window)) { $$(".reveal").forEach((item) => item.classList.add("visible")); return; }
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); } }), { threshold: .1 });
    $$(".reveal").forEach((item) => observer.observe(item));
  }

  async function init() {
    content = await loadContent(); applyTheme(); renderBrand(); renderSectionsAndNav(); renderHero(); renderStats(); renderWorks(); renderServices(); renderProcess(); renderBeats(); renderAbout(); renderContact(); setupInteractions(); setupReveal(); $("#year").textContent = new Date().getFullYear();
  }

  init().catch((error) => { console.error(error); showToast("網站內容載入失敗，已顯示預設版本"); });
})();
