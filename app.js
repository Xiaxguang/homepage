(() => {
  "use strict";

  const CONFIG = window.PORTFOLIO_CONFIG || {};
  const DEFAULTS = window.DEFAULT_CONTENT || {};
  const STORAGE_KEY = "xiaxguang_portfolio_content_v2";
  const LEGACY_WORK_IDS = new Set(["demo-original", "demo-cover", "demo-arrangement", "demo-mix", "track-neon-velocity", "track-demon-core", "track-astral-gate", "track-echo-rift", "track-kaoliang-nights"]);

  let content = clone(DEFAULTS);
  let activeCategory = "全部";
  let playableWorks = [];
  let currentTrackIndex = -1;
  let currentTrack = null;

  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

  function clone(value) {
    if (typeof structuredClone === "function") return structuredClone(value);
    return JSON.parse(JSON.stringify(value));
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function deepMerge(base, incoming) {
    if (!incoming || typeof incoming !== "object") return clone(base);
    if (Array.isArray(base)) return Array.isArray(incoming) ? incoming : clone(base);
    const output = { ...base };
    Object.entries(incoming).forEach(([key, value]) => {
      if (
        value &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        base &&
        base[key] &&
        typeof base[key] === "object" &&
        !Array.isArray(base[key])
      ) {
        output[key] = deepMerge(base[key], value);
      } else {
        output[key] = value;
      }
    });
    return output;
  }

  function mergeById(defaultRows, incomingRows, idKey = "id") {
    if (!Array.isArray(incomingRows) || !incomingRows.length) return clone(defaultRows || []);
    const incomingById = new Map(incomingRows.filter(Boolean).map(row => [String(row[idKey] || ""), row]));
    const merged = (defaultRows || []).map(defaultRow => {
      const id = String(defaultRow[idKey] || "");
      return incomingById.has(id) ? deepMerge(defaultRow, incomingById.get(id)) : clone(defaultRow);
    });
    incomingRows.forEach(row => {
      const id = String(row && row[idKey] || "");
      if (!id || !(defaultRows || []).some(defaultRow => String(defaultRow[idKey] || "") === id)) merged.push(row);
    });
    return merged;
  }

  function normalizeWorks(rows) {
    const cleaned = Array.isArray(rows) ? rows.filter(row => row && !LEGACY_WORK_IDS.has(String(row.id || ""))) : [];
    return mergeById(DEFAULTS.works || [], cleaned, "id");
  }

  function normalizeBeats(rows) {
    const defaultIds = new Set((DEFAULTS.beats || []).map(row => String(row.id || "")));
    const cleaned = Array.isArray(rows)
      ? rows.filter(row => row && (defaultIds.has(String(row.id || "")) || row.audioUrl || row.purchaseUrl))
      : [];
    return mergeById(DEFAULTS.beats || [], cleaned, "id");
  }

  function normalizeServices(rows) {
    const defaults = DEFAULTS.services || [];
    if (!Array.isArray(rows) || !rows.length) return clone(defaults);
    const hasPricing = rows.some(row => row && (row.priceLabel || row.featured));
    return hasPricing ? rows : clone(defaults);
  }

  function normalizeContent(input) {
    const merged = deepMerge(clone(DEFAULTS), input || {});
    merged.profile = { ...(DEFAULTS.profile || {}), ...(merged.profile || {}) };
    merged.appearance = { ...(DEFAULTS.appearance || {}), ...(merged.appearance || {}) };
    merged.sections = mergeById(DEFAULTS.sections || [], merged.sections || [], "id")
      .map((section, index) => ({ ...section, order: Number(section.order || index + 1), visible: section.visible !== false }))
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
    merged.process = Array.isArray(merged.process) && merged.process.length ? merged.process : clone(DEFAULTS.process || []);
    merged.beats = normalizeBeats(merged.beats);
    merged.works = normalizeWorks(merged.works);
    merged.services = normalizeServices(merged.services);
    merged.comparisons = Array.isArray(merged.comparisons) ? merged.comparisons : [];
    merged.categories = Array.isArray(merged.categories) && merged.categories.length ? merged.categories : clone(DEFAULTS.categories || ["全部"]);
    if (!merged.categories.includes("全部")) merged.categories.unshift("全部");
    merged.profile.name = "XIAXGUANG";
    merged.profile.role = "MUSIC PRODUCER";
    return merged;
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
        if (!error && data && data.content) return normalizeContent(data.content);
      }
    } catch (_) {}

    try {
      const local = localStorage.getItem(STORAGE_KEY);
      if (local) return normalizeContent(JSON.parse(local));
    } catch (_) {}

    return normalizeContent(DEFAULTS);
  }

  function setText(id, value) {
    const node = document.getElementById(id);
    if (node) node.textContent = String(value ?? "");
  }

  function setCssVars() {
    const appearance = content.appearance || {};
    const root = document.documentElement;
    root.style.setProperty("--accent", appearance.accentColor || "#72f2aa");
    root.style.setProperty("--accent-cyan", appearance.accentCyan || "#58d9e8");
    root.style.setProperty("--accent-violet", appearance.accentViolet || "#8d6cff");
  }

  function instagramUrl(handle) {
    return `https://www.instagram.com/${String(handle || "").replace(/^@/, "")}/`;
  }

  function lineUrl(id) {
    return `https://line.me/ti/p/~${encodeURIComponent(String(id || ""))}`;
  }

  function mailUrl(email) {
    const subject = encodeURIComponent("音樂製作合作洽詢");
    return `mailto:${email}?subject=${subject}`;
  }

  function visibleItems(rows) {
    return (rows || []).filter(item => item && item.visible !== false);
  }

  function itemArtist(item) {
    return item.artist || "XIAXGUANG";
  }

  function coverHtml(url, title, className = "brand-placeholder") {
    if (url) return `<img src="${escapeHtml(url)}" alt="${escapeHtml(title || "cover")}" loading="lazy" onerror="this.closest('.cover-host')?.classList.add('cover-missing');this.remove()">`;
    return `<span class="${className}">XIAXGUANG</span>`;
  }

  function workCover(item) {
    const title = item.title || "作品";
    return `<div class="work-thumb cover-host">${coverHtml(item.coverUrl, title)}</div>`;
  }

  function beatCover(item) {
    const title = item.title || "Beat";
    return `<div class="beat-thumb cover-host">${coverHtml(item.coverUrl, title)}</div>`;
  }

  function applyProfile() {
    const p = content.profile || {};
    const a = content.appearance || {};
    setText("heroKicker", p.heroKicker || "你好，我是 XIAXGUANG");
    setText("heroLine", p.heroLine || "混音 / 編曲 / 錄音");
    setText("heroDescription", p.heroDescription || p.tagline || "");
    setText("aboutTitle", p.aboutTitle || "我是 XIAXGUANG，也叫阿光。");
    setText("aboutBody", p.aboutBody || "");
    setText("footerEmail", p.email || "");
    setText("footerLocation", p.location || "");
    document.title = "XIAXGUANG｜MUSIC PRODUCER";

    const heroCharacter = $("#heroCharacter");
    if (heroCharacter) {
      heroCharacter.src = a.heroCharacter || p.heroCharacter || "assets/characters/mascot-seated.png";
      heroCharacter.onerror = () => heroCharacter.classList.add("is-missing");
    }

    const aboutCharacter = $("#aboutCharacter");
    if (aboutCharacter) {
      aboutCharacter.src = a.aboutCharacter || p.aboutCharacter || "assets/characters/mascot-crossed.png";
      aboutCharacter.onerror = () => aboutCharacter.classList.add("is-missing");
    }

    if (a.heroBackgroundUrl) {
      $(".hero-studio")?.style.setProperty("--hero-bg", `url("${a.heroBackgroundUrl.replaceAll('"', "%22")}")`);
      $(".hero-studio")?.classList.add("has-custom-bg");
    }

    const socials = $("#socialLinks");
    if (socials) socials.innerHTML = socialLinksHtml(false);
    const contactActions = $("#contactActions");
    if (contactActions) contactActions.innerHTML = contactLinksHtml();
  }

  function socialLinksHtml(withText) {
    const p = content.profile || {};
    const links = [];
    if (p.instagram) links.push({ label: withText ? "Instagram" : "IG", href: instagramUrl(p.instagram) });
    if (p.lineId) links.push({ label: withText ? "LINE" : "LINE", href: lineUrl(p.lineId) });
    if (p.email) links.push({ label: withText ? "Email" : "MAIL", href: mailUrl(p.email) });
    if (p.discord) links.push({ label: withText ? `Discord: ${p.discord}` : "DC", textOnly: true });
    if (p.youtube) links.push({ label: withText ? "YouTube" : "YT", href: p.youtube });
    return links.map(link => link.textOnly
      ? `<span title="${escapeHtml(link.label)}">${escapeHtml(link.label)}</span>`
      : `<a href="${escapeHtml(link.href)}" target="${link.href.startsWith("mailto:") ? "_self" : "_blank"}" rel="noreferrer">${escapeHtml(link.label)}</a>`
    ).join("");
  }

  function contactLinksHtml() {
    const p = content.profile || {};
    const rows = [];
    if (p.email) rows.push(`<a class="button primary" href="${escapeHtml(mailUrl(p.email))}">Email 合作洽詢</a>`);
    if (p.instagram) rows.push(`<a class="button secondary" href="${escapeHtml(instagramUrl(p.instagram))}" target="_blank" rel="noreferrer">Instagram</a>`);
    if (p.lineId) rows.push(`<a class="button secondary" href="${escapeHtml(lineUrl(p.lineId))}" target="_blank" rel="noreferrer">LINE</a>`);
    if (p.discord) rows.push(`<span class="button secondary static-contact">DC: ${escapeHtml(p.discord)}</span>`);
    return rows.join("");
  }

  function applySections() {
    const sections = content.sections || [];
    sections.forEach(section => {
      const node = $$("[data-section]").find(item => item.dataset.section === section.id);
      if (!node) return;
      node.hidden = section.visible === false;
      node.style.order = String(Number(section.order || 0));
    });
  }

  function renderHeroTags() {
    const target = $("#heroTags");
    if (!target) return;
    const tags = visibleItems(content.services).slice(0, 3).map(item => item.title || "").filter(Boolean);
    target.innerHTML = tags.map(tag => `<span>${escapeHtml(tag)}</span>`).join("");
  }

  function renderServices() {
    const summary = $("#serviceSummary");
    const grid = $("#serviceGrid");
    const services = visibleItems(content.services);

    if (summary) {
      summary.innerHTML = services.slice(0, 3).map(item => `
        <div class="service-row">
          <span class="service-icon" aria-hidden="true"></span>
          <span>
            <strong>${escapeHtml(item.title || "")}${item.priceLabel ? `<em>${escapeHtml(item.priceLabel)}</em>` : ""}</strong>
            <span>${escapeHtml(item.description || "")}</span>
          </span>
        </div>
      `).join("") || `<div class="empty-state">服務內容準備中</div>`;
    }

    if (grid) {
      grid.innerHTML = services.map((item, index) => `
        <article class="service-card ${item.featured ? "is-featured" : ""} reveal">
          <small>${String(index + 1).padStart(2, "0")}</small>
          <div>
            <h3>${escapeHtml(item.title || "")}</h3>
            ${item.priceLabel ? `<strong class="service-price">${escapeHtml(item.priceLabel)}</strong>` : ""}
            <p>${escapeHtml(item.description || "")}</p>
          </div>
        </article>
      `).join("") || `<div class="empty-state">服務內容準備中</div>`;
    }
  }

  function renderFeaturedWorks() {
    const target = $("#featuredWorks");
    if (!target) return;
    const works = visibleItems(content.works).slice(0, 4);
    target.innerHTML = works.map(item => {
      const canPlay = item.type === "audio" && item.mediaUrl;
      const index = playableWorks.findIndex(work => work.id === item.id);
      const external = item.externalUrl || item.mediaUrl || "";
      const action = canPlay
        ? `<button class="featured-play" type="button" data-play-index="${index}" aria-label="播放 ${escapeHtml(item.title || "作品")}">▶</button>`
        : external
          ? `<a class="featured-play" href="${escapeHtml(external)}" target="_blank" rel="noreferrer" aria-label="開啟 ${escapeHtml(item.title || "作品")}">↗</a>`
          : `<button class="featured-play" type="button" disabled aria-label="尚無媒體">▶</button>`;
      return `
        <article class="featured-card">
          <div class="work-thumb cover-host">${coverHtml(item.coverUrl, item.title)}${action}</div>
          <strong>${escapeHtml(item.title || "Untitled")}</strong>
          <span>${escapeHtml([item.category, ...(item.tags || []).slice(0, 1)].filter(Boolean).join(" / "))}</span>
        </article>
      `;
    }).join("") || `<div class="empty-state">精選作品準備中</div>`;
  }

  function renderFilters() {
    const holder = $("#workFilters");
    if (!holder) return;
    const categories = content.categories || ["全部"];
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
    const works = visibleItems(content.works);
    const filtered = activeCategory === "全部" ? works : works.filter(item => item.category === activeCategory);
    if (!filtered.length) {
      grid.innerHTML = `<div class="empty-state">作品準備中</div>`;
      return;
    }
    grid.innerHTML = filtered.map(item => {
      const canPlay = item.type === "audio" && item.mediaUrl;
      const index = playableWorks.findIndex(work => work.id === item.id);
      const external = item.externalUrl || (item.type !== "audio" ? item.mediaUrl : "");
      const action = canPlay
        ? `<button class="work-play" type="button" data-play-index="${index}" aria-label="播放 ${escapeHtml(item.title || "作品")}">▶</button>`
        : external
          ? `<a class="work-play" href="${escapeHtml(external)}" target="_blank" rel="noreferrer" aria-label="開啟 ${escapeHtml(item.title || "作品")}">↗</a>`
          : `<button class="work-play" type="button" disabled aria-label="尚無媒體">▶</button>`;
      const tags = (item.tags || []).slice(0, 3).map(tag => `<span>${escapeHtml(tag)}</span>`).join("");
      return `
        <article class="work-card reveal">
          <div class="work-thumb cover-host">${coverHtml(item.coverUrl, item.title)}${action}</div>
          <div class="work-body">
            <span class="meta-line">${escapeHtml(item.category || "作品")} · ${escapeHtml(itemArtist(item))}</span>
            <h3>${escapeHtml(item.title || "Untitled")}</h3>
            <div class="tag-list">${tags}</div>
          </div>
        </article>
      `;
    }).join("");
  }

  function renderComparisons() {
    const section = $("#comparison");
    const grid = $("#comparisonGrid");
    if (!section || !grid) return;
    const items = visibleItems(content.comparisons);
    if (!items.length) {
      section.hidden = true;
      return;
    }
    section.hidden = false;
    grid.innerHTML = items.map(item => `
      <article class="comparison-card reveal">
        <h3>${escapeHtml(item.title || "Mixing")}</h3>
        <span>${escapeHtml(item.subtitle || "Before / After")}</span>
        <div class="compare-tracks">
          <div class="comparison-track">
            <label>BEFORE</label>
            ${item.beforeUrl ? `<audio controls preload="metadata" src="${escapeHtml(item.beforeUrl)}"></audio>` : `<div class="empty-audio">尚未設定音檔</div>`}
          </div>
          <div class="comparison-track">
            <label>AFTER</label>
            ${item.afterUrl ? `<audio controls preload="metadata" src="${escapeHtml(item.afterUrl)}"></audio>` : `<div class="empty-audio">尚未設定音檔</div>`}
          </div>
        </div>
      </article>
    `).join("");
  }

  function renderBeats() {
    const summary = $("#beatSummary");
    const store = $("#beatStore");
    const beats = visibleItems(content.beats);
    const comingSoon = `<div class="empty-state">Coming Soon<br>Beat 授權內容準備中</div>`;

    if (summary) {
      summary.innerHTML = beats.length ? beats.slice(0, 3).map(item => `
        <div class="beat-row">
          ${beatCover(item)}
          <span><strong>${escapeHtml(item.title || "Untitled Beat")}</strong><span>BPM ${escapeHtml(item.bpm || "-")} / ${escapeHtml(item.key || "-")}</span></span>
          ${item.purchaseUrl ? `<a class="beat-action" href="${escapeHtml(item.purchaseUrl)}" target="_blank" rel="noreferrer" aria-label="前往 ${escapeHtml(item.title || "Beat")}">↗</a>` : `<a class="beat-action" href="#contact" aria-label="洽詢 ${escapeHtml(item.title || "Beat")}">↗</a>`}
        </div>
      `).join("") : comingSoon;
    }

    if (store) {
      store.innerHTML = beats.length ? beats.map(item => {
        const preview = item.audioUrl
          ? `<audio class="beat-preview" controls preload="metadata" src="${escapeHtml(item.audioUrl)}"></audio>`
          : "";
        const action = item.purchaseUrl
          ? `<a class="button primary" href="${escapeHtml(item.purchaseUrl)}" target="_blank" rel="noreferrer">${escapeHtml(item.priceLabel || "購買授權")}</a>`
          : `<a class="button secondary" href="#contact">${escapeHtml(item.priceLabel || "洽詢授權")}</a>`;
        return `
          <article class="beat-card reveal">
            ${beatCover(item)}
            <div class="beat-body">
              <h3>${escapeHtml(item.title || "Untitled Beat")}</h3>
              <div class="beat-stats">
                <span>BPM ${escapeHtml(item.bpm || "-")}</span>
                <span>${escapeHtml(item.key || "-")}</span>
                <span>${escapeHtml(item.genre || "-")}</span>
              </div>
              ${preview}
              ${action}
            </div>
          </article>
        `;
      }).join("") : comingSoon;
    }
  }

  function processIcon(index) {
    const attrs = 'aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
    const icons = [
      `<svg ${attrs}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
      `<svg ${attrs}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>`,
      `<svg ${attrs}><path d="M21 4h-7"/><path d="M10 4H3"/><circle cx="12" cy="4" r="2"/><path d="M21 12h-9"/><path d="M8 12H3"/><circle cx="10" cy="12" r="2"/><path d="M21 20h-5"/><path d="M12 20H3"/><circle cx="14" cy="20" r="2"/></svg>`,
      `<svg ${attrs}><path d="M21 12a9 9 0 0 1-15.36 6.36L3 16"/><path d="M3 21v-5h5"/><path d="M3 12a9 9 0 0 1 15.36-6.36L21 8"/><path d="M21 3v5h-5"/></svg>`,
      `<svg ${attrs}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>`
    ];
    return icons[index] || icons[0];
  }

  function renderProcess() {
    const target = $("#processSteps");
    if (!target) return;
    target.innerHTML = (content.process || []).slice(0, 5).map((item, index) => `
      <div class="process-step reveal">
        <span class="step-icon">${processIcon(index)}</span>
        <small>${String(index + 1).padStart(2, "0")}</small>
        <strong>${escapeHtml(item.title || "")}</strong>
        <span class="step-description">${escapeHtml(item.description || "")}</span>
      </div>
    `).join("");
  }

  function setupPlayableWorks() {
    playableWorks = visibleItems(content.works).filter(item => item.type === "audio" && item.mediaUrl);
    const heroPlay = $("#heroPlayButton");
    const mainPlay = $("#mainPlay");
    const prev = $("#prevTrack");
    const next = $("#nextTrack");
    const seek = $("#playerSeek");

    if (!playableWorks.length) {
      [heroPlay, mainPlay, prev, next, seek, $("#dockPlay")].forEach(node => {
        if (node) node.disabled = true;
      });
      setText("heroPlayerTitle", "尚無可播放作品");
      setText("heroPlayerArtist", "XIAXGUANG");
      $("#heroPlayerCover").innerHTML = `<span class="brand-placeholder">XIAXGUANG</span>`;
      return;
    }

    [heroPlay, mainPlay, $("#dockPlay")].forEach(node => {
      if (node) node.disabled = false;
    });
    if (prev) prev.disabled = playableWorks.length < 2;
    if (next) next.disabled = playableWorks.length < 2;
    if (seek) seek.disabled = false;
    selectTrack(0, false);
  }

  function selectTrack(index, autoplay) {
    if (!playableWorks.length) return;
    currentTrackIndex = (index + playableWorks.length) % playableWorks.length;
    currentTrack = playableWorks[currentTrackIndex];
    updateTrackMeta();
    const audio = $("#globalAudio");
    if (!audio || !currentTrack.mediaUrl) return;
    const changed = audio.src !== new URL(currentTrack.mediaUrl, window.location.href).href;
    if (changed) {
      audio.pause();
      audio.src = currentTrack.mediaUrl;
      audio.load();
    }
    if (autoplay) playCurrent();
  }

  function updateTrackMeta() {
    const item = currentTrack || {};
    setText("heroPlayerTitle", item.title || "尚無可播放作品");
    setText("heroPlayerArtist", itemArtist(item));
    setText("dockTitle", item.title || "作品名稱");
    $("#heroPlayerCover").innerHTML = coverHtml(item.coverUrl, item.title);
    $("#dockCover").innerHTML = coverHtml(item.coverUrl, item.title);
  }

  function playCurrent() {
    const audio = $("#globalAudio");
    if (!audio || !currentTrack) return;
    if (!audio.src) audio.src = currentTrack.mediaUrl;
    pauseOtherAudio(audio);
    $("#playerDock").hidden = false;
    audio.play().catch(() => {});
  }

  function togglePlay() {
    const audio = $("#globalAudio");
    if (!audio || !currentTrack) return;
    if (audio.paused) playCurrent();
    else audio.pause();
  }

  function pauseOtherAudio(activeAudio) {
    $$("audio").forEach(audio => {
      if (audio !== activeAudio) audio.pause();
    });
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds <= 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  function updatePlayerState() {
    const audio = $("#globalAudio");
    if (!audio) return;
    const playing = !audio.paused && !audio.ended;
    const symbol = playing ? "Ⅱ" : "▶";
    ["mainPlay", "dockPlay", "heroPlayButton"].forEach(id => {
      const node = document.getElementById(id);
      if (node && !node.disabled) node.innerHTML = id === "heroPlayButton" ? `播放作品 <span aria-hidden="true">${symbol}</span>` : symbol;
    });
    $$(".mini-wave").forEach(wave => wave.classList.toggle("playing", playing));
    setText("playerCurrent", formatTime(audio.currentTime));
    setText("playerDuration", formatTime(audio.duration));
    const seek = $("#playerSeek");
    if (seek && Number.isFinite(audio.duration) && audio.duration > 0) {
      seek.value = String(Math.round((audio.currentTime / audio.duration) * 1000));
    }
  }

  function setupPlayer() {
    $("#heroPlayButton")?.addEventListener("click", () => {
      if (currentTrackIndex < 0) selectTrack(0, false);
      togglePlay();
    });
    $("#mainPlay")?.addEventListener("click", togglePlay);
    $("#dockPlay")?.addEventListener("click", togglePlay);
    $("#prevTrack")?.addEventListener("click", () => selectTrack(currentTrackIndex - 1, true));
    $("#nextTrack")?.addEventListener("click", () => selectTrack(currentTrackIndex + 1, true));
    $("#playerSeek")?.addEventListener("input", event => {
      const audio = $("#globalAudio");
      if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) return;
      audio.currentTime = (Number(event.target.value || 0) / 1000) * audio.duration;
    });
    $("#playerClose")?.addEventListener("click", () => {
      const audio = $("#globalAudio");
      audio?.pause();
      $("#playerDock").hidden = true;
    });

    const audio = $("#globalAudio");
    if (audio) {
      ["play", "pause", "timeupdate", "loadedmetadata", "ended"].forEach(eventName => {
        audio.addEventListener(eventName, updatePlayerState);
      });
      audio.addEventListener("play", () => pauseOtherAudio(audio));
      audio.addEventListener("ended", () => {
        if (playableWorks.length > 1) selectTrack(currentTrackIndex + 1, true);
      });
    }

    document.addEventListener("click", event => {
      const playButton = event.target.closest("[data-play-index]");
      if (playButton) selectTrack(Number(playButton.dataset.playIndex || 0), true);
    });

    document.addEventListener("play", event => {
      if (event.target instanceof HTMLAudioElement) pauseOtherAudio(event.target);
    }, true);
  }

  function setupNavigation() {
    const toggle = $("#navToggle");
    const nav = $("#siteNav");
    if (toggle && nav) {
      toggle.addEventListener("click", () => {
        const open = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(open));
      });
      $$("a", nav).forEach(link => link.addEventListener("click", () => {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }));
    }

    const sections = $$("[data-section]");
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(entries => {
        const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const id = visible.target.dataset.section;
        $$(".site-nav a").forEach(link => link.classList.toggle("active", link.dataset.nav === id));
      }, { rootMargin: "-35% 0px -55% 0px", threshold: [0.1, 0.35, 0.6] });
      sections.forEach(section => observer.observe(section));
    }
  }

  function setupControls() {
    $("#themeToggle")?.addEventListener("click", () => {
      document.body.classList.toggle("is-soft-light");
    });
    $("#soundToggle")?.addEventListener("click", () => {
      const audio = $("#globalAudio");
      if (!audio) return;
      audio.muted = !audio.muted;
      $("#soundToggle").classList.toggle("muted", audio.muted);
    });
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

  function renderAll() {
    setCssVars();
    applyProfile();
    applySections();
    renderHeroTags();
    setupPlayableWorks();
    renderServices();
    renderFeaturedWorks();
    renderFilters();
    renderWorks();
    renderComparisons();
    renderBeats();
    renderProcess();
    observeReveal();
    setText("year", String(new Date().getFullYear()));
  }

  async function init() {
    content = await loadContent();
    setupNavigation();
    setupPlayer();
    setupControls();
    renderAll();
  }

  init();
})();
