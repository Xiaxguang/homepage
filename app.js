(() => {
  "use strict";

  const CONFIG = window.PORTFOLIO_CONFIG || {};
  const DEFAULTS = window.DEFAULT_CONTENT || {};
  const STORAGE_KEY = "xiaxguang_portfolio_content_v2";
  let content = structuredClone(DEFAULTS);
  let activeCategory = "全部";

  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

  function deepMerge(base, incoming) {
    if (!incoming || typeof incoming !== "object") return base;
    const output = Array.isArray(base) ? [...base] : { ...base };
    for (const [key, value] of Object.entries(incoming)) {
      if (
        value &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        base &&
        typeof base[key] === "object" &&
        !Array.isArray(base[key])
      ) {
        output[key] = deepMerge(base[key], value);
      } else {
        output[key] = value;
      }
    }
    return output;
  }

  function isSupabaseReady() {
    return Boolean(CONFIG.supabaseUrl && CONFIG.supabaseAnonKey && window.supabase);
  }

  async function loadContent() {
    try {
      if (isSupabaseReady()) {
        const client = window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey);
        const { data, error } = await client
          .from(CONFIG.contentTable || "site_content")
          .select("content")
          .eq("id", CONFIG.contentRowKey || "main")
          .maybeSingle();
        if (error) throw error;
        if (data?.content) return deepMerge(structuredClone(DEFAULTS), data.content);
      }
    } catch (error) {
      console.warn("Supabase content load failed:", error.message);
    }

    try {
      const local = localStorage.getItem(STORAGE_KEY);
      if (local) return deepMerge(structuredClone(DEFAULTS), JSON.parse(local));
    } catch (error) {
      console.warn("Local content load failed:", error.message);
    }

    return structuredClone(DEFAULTS);
  }

  function setText(id, value) {
    const node = document.getElementById(id);
    if (node && typeof value === "string") node.textContent = value;
  }

  function instagramUrl(handle) {
    return `https://www.instagram.com/${String(handle || "").replace(/^@/, "")}/`;
  }

  function lineUrl(id) {
    return `https://line.me/ti/p/~${encodeURIComponent(String(id || ""))}`;
  }

  function applyProfile() {
    const p = content.profile || {};
    setText("headerName", p.name || "Xiaxguang");
    setText("headerAlias", p.alias || "阿光");
    setText("heroName", p.name || "Xiaxguang");
    setText("heroAlias", p.alias || "阿光");
    setText("heroTagline", p.tagline || "");
    setText("aboutTitle", p.aboutTitle || "");
    setText("aboutBody", p.aboutBody || "");

    const igHandle = String(p.instagram || "xiaxguang").replace(/^@/, "");
    const igLinks = [$("#heroInstagram"), $("#contactInstagram")].filter(Boolean);
    igLinks.forEach(link => link.href = instagramUrl(igHandle));
    setText("contactInstagram", "");

    const contactInstagram = $("#contactInstagram");
    if (contactInstagram) {
      contactInstagram.innerHTML = `<span>Instagram</span><strong>@${escapeHtml(igHandle)}</strong>`;
    }

    const lineId = p.lineId || "bikabikahikari";
    const lineLinks = [$("#heroLine"), $("#contactLine")].filter(Boolean);
    lineLinks.forEach(link => link.href = lineUrl(lineId));
    const contactLine = $("#contactLine");
    if (contactLine) {
      contactLine.innerHTML = `<span>LINE</span><strong>${escapeHtml(lineId)}</strong>`;
    }

    const heroCharacter = $("#heroCharacter");
    if (heroCharacter) {
      heroCharacter.src = p.heroCharacter || "assets/characters/mascot-wave.png";
      heroCharacter.onerror = () => heroCharacter.classList.add("is-missing");
    }

    const aboutCharacter = $("#aboutCharacter");
    if (aboutCharacter) {
      aboutCharacter.src = p.aboutCharacter || "assets/characters/mascot-seated.png";
      aboutCharacter.onerror = () => aboutCharacter.classList.add("is-missing");
    }

    document.title = `${p.name || "Xiaxguang"}｜${p.alias || "阿光"}`;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function renderFilters() {
    const holder = $("#workFilters");
    if (!holder) return;
    const categories = Array.isArray(content.categories) && content.categories.length
      ? content.categories
      : ["全部", "原創", "翻唱", "混音", "編曲"];

    holder.innerHTML = categories.map(category => `
      <button class="filter-tab ${category === activeCategory ? "active" : ""}" type="button" data-filter="${escapeHtml(category)}">
        ${escapeHtml(category)}
      </button>
    `).join("");

    $$(".filter-tab", holder).forEach(button => {
      button.addEventListener("click", () => {
        activeCategory = button.dataset.filter || "全部";
        renderFilters();
        renderWorks();
      });
    });
  }

  function renderWorks() {
    const grid = $("#worksGrid");
    if (!grid) return;

    const works = (content.works || []).filter(item => item.visible !== false);
    const filtered = activeCategory === "全部"
      ? works
      : works.filter(item => item.category === activeCategory);

    if (!filtered.length) {
      grid.innerHTML = `<div class="empty-state">作品準備中</div>`;
      return;
    }

    grid.innerHTML = filtered.map(item => {
      const title = escapeHtml(item.title || "Untitled");
      const tags = (item.tags || []).slice(0, 3).map(tag => `<span>${escapeHtml(tag)}</span>`).join("");
      const cover = item.coverUrl
        ? `<img class="work-cover" src="${escapeHtml(item.coverUrl)}" alt="${title}" loading="lazy" onerror="this.remove()">`
        : `<div class="work-placeholder">XG</div>`;

      let action = "";
      if (item.type === "audio" && item.mediaUrl) {
        action = `<button class="work-play" type="button" data-audio="${escapeHtml(item.mediaUrl)}" data-title="${title}" aria-label="播放 ${title}">▶</button>`;
      } else if ((item.type === "video" || item.type === "link") && (item.externalUrl || item.mediaUrl)) {
        const href = item.externalUrl || item.mediaUrl;
        action = `<a class="work-play" href="${escapeHtml(href)}" target="_blank" rel="noreferrer" aria-label="開啟 ${title}">↗</a>`;
      }

      return `
        <article class="work-card reveal">
          ${cover}
          <div class="work-overlay">
            <div class="work-meta"><span>${escapeHtml(item.category || "作品")}</span>${tags}</div>
            <div class="work-title-row">
              <h3>${title}</h3>
              ${action}
            </div>
          </div>
        </article>
      `;
    }).join("");

    $$("[data-audio]", grid).forEach(button => {
      button.addEventListener("click", () => playAudio(button.dataset.audio, button.dataset.title));
    });

    observeReveal();
  }

  function renderComparisons() {
    const section = $("#comparison");
    const grid = $("#comparisonGrid");
    if (!grid || !section) return;

    const items = (content.comparisons || []).filter(item => item.visible !== false);
    if (!items.length) {
      section.hidden = true;
      return;
    }

    section.hidden = false;
    grid.innerHTML = items.map(item => {
      const hasBefore = Boolean(item.beforeUrl);
      const hasAfter = Boolean(item.afterUrl);
      return `
        <article class="comparison-card reveal">
          <h3>${escapeHtml(item.title || "Mixing")}</h3>
          <span>${escapeHtml(item.subtitle || "Before / After")}</span>
          <div class="comparison-track">
            <label>BEFORE</label>
            ${hasBefore ? `<audio controls preload="metadata" src="${escapeHtml(item.beforeUrl)}"></audio>` : `<div class="empty-audio"></div>`}
          </div>
          <div class="comparison-track">
            <label>AFTER</label>
            ${hasAfter ? `<audio controls preload="metadata" src="${escapeHtml(item.afterUrl)}"></audio>` : `<div class="empty-audio"></div>`}
          </div>
        </article>
      `;
    }).join("");

    observeReveal();
  }

  function renderServices() {
    const grid = $("#serviceGrid");
    if (!grid) return;
    grid.innerHTML = (content.services || []).map((item, index) => `
      <article class="service-card reveal">
        <span class="service-number">0${index + 1}</span>
        <h3>${escapeHtml(item.title || "")}</h3>
        <p>${escapeHtml(item.description || "")}</p>
      </article>
    `).join("");
    observeReveal();
  }

  function playAudio(src, title) {
    const dock = $("#playerDock");
    const audio = $("#globalAudio");
    if (!dock || !audio || !src) return;
    setText("playerTitle", title || "作品");
    audio.src = src;
    dock.hidden = false;
    audio.play().catch(() => {});
  }

  function setupNavigation() {
    const toggle = $("#navToggle");
    const nav = $("#siteNav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    $$("a", nav).forEach(link => link.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }));
  }

  function observeReveal() {
    const nodes = $$(".reveal:not(.visible)");
    if (!("IntersectionObserver" in window)) {
      nodes.forEach(node => node.classList.add("visible"));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .08 });
    nodes.forEach(node => observer.observe(node));
  }

  async function init() {
    content = await loadContent();
    applyProfile();
    renderFilters();
    renderWorks();
    renderComparisons();
    renderServices();
    setupNavigation();
    observeReveal();

    setText("year", String(new Date().getFullYear()));

    $("#playerClose")?.addEventListener("click", () => {
      const dock = $("#playerDock");
      const audio = $("#globalAudio");
      if (audio) {
        audio.pause();
        audio.removeAttribute("src");
      }
      if (dock) dock.hidden = true;
    });
  }

  init();
})();
