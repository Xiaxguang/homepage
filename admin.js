(() => {
  "use strict";

  const CONFIG = window.PORTFOLIO_CONFIG || {};
  const DEFAULTS = window.DEFAULT_CONTENT || {};
  const STORAGE_KEY = "xiaxguang_portfolio_content_v2";
  const LEGACY_WORK_IDS = new Set(["demo-original", "demo-cover", "demo-arrangement", "demo-mix"]);
  const SECTION_LABELS = {
    hero: "Hero 首頁",
    dashboard: "首頁三欄摘要",
    works: "完整作品集",
    comparison: "混音前後對比",
    services: "完整服務區",
    beats: "Beats 商店",
    about: "關於我與流程",
    contact: "聯絡區"
  };

  let state = clone(DEFAULTS);
  let supabaseClient = null;
  let pendingUploadTargetId = "";

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

  function normalizeState(input) {
    const merged = deepMerge(clone(DEFAULTS), input || {});
    merged.profile = { ...(DEFAULTS.profile || {}), ...(merged.profile || {}) };
    merged.appearance = { ...(DEFAULTS.appearance || {}), ...(merged.appearance || {}) };
    merged.sections = mergeById(DEFAULTS.sections || [], merged.sections || [], "id")
      .map((section, index) => ({ ...section, order: Number(section.order || index + 1), visible: section.visible !== false }))
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
    merged.process = Array.isArray(merged.process) && merged.process.length ? merged.process : clone(DEFAULTS.process || []);
    merged.beats = Array.isArray(merged.beats) ? merged.beats : clone(DEFAULTS.beats || []);
    merged.works = normalizeWorks(merged.works);
    merged.services = Array.isArray(merged.services) ? merged.services : [];
    merged.comparisons = Array.isArray(merged.comparisons) ? merged.comparisons : [];
    merged.categories = Array.isArray(merged.categories) && merged.categories.length ? merged.categories : clone(DEFAULTS.categories || ["全部"]);
    merged.profile.name = "XIAXGUANG";
    merged.profile.role = "MUSIC PRODUCER";
    return merged;
  }

  function isSupabaseReady() {
    return Boolean(CONFIG.supabaseUrl && CONFIG.supabaseAnonKey && window.supabase);
  }

  async function loadState() {
    if (isSupabaseReady()) {
      try {
        supabaseClient = window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey);
        const { data, error } = await supabaseClient
          .from(CONFIG.contentTable || "site_content")
          .select("content")
          .eq("id", CONFIG.contentRowKey || "main")
          .maybeSingle();
        if (!error && data && data.content) return normalizeState(data.content);
      } catch (_) {}
    }

    try {
      const local = localStorage.getItem(STORAGE_KEY);
      if (local) return normalizeState(JSON.parse(local));
    } catch (_) {}

    return normalizeState(DEFAULTS);
  }

  function setStatus(text, ok = false) {
    const node = $("#saveStatus");
    if (!node) return;
    node.textContent = text;
    node.style.color = ok ? "#72f2aa" : "";
  }

  function bindNavigation() {
    $$(".admin-nav").forEach(button => {
      button.addEventListener("click", () => {
        $$(".admin-nav").forEach(item => item.classList.remove("active"));
        $$(".admin-panel").forEach(item => item.classList.remove("active"));
        button.classList.add("active");
        document.getElementById(button.dataset.panel || "")?.classList.add("active");
      });
    });
  }

  function fillProfile() {
    const p = state.profile || {};
    $("#profileName").value = "XIAXGUANG";
    $("#profileAlias").value = p.alias || "";
    $("#profileRole").value = "MUSIC PRODUCER";
    $("#profileLocation").value = p.location || "";
    $("#heroKicker").value = p.heroKicker || "";
    $("#profileTagline").value = p.tagline || "";
    $("#heroLine").value = p.heroLine || "";
    $("#heroDescription").value = p.heroDescription || "";
    $("#profileEmail").value = p.email || "";
    $("#profileInstagram").value = p.instagram || "";
    $("#profileLine").value = p.lineId || "";
    $("#profileYoutube").value = p.youtube || "";
    $("#aboutTitle").value = p.aboutTitle || "";
    $("#aboutBody").value = p.aboutBody || "";
  }

  function readProfile() {
    state.profile = {
      ...(state.profile || {}),
      name: "XIAXGUANG",
      alias: $("#profileAlias").value.trim() || "阿光",
      role: "MUSIC PRODUCER",
      location: $("#profileLocation").value.trim(),
      heroKicker: $("#heroKicker").value.trim(),
      tagline: $("#profileTagline").value.trim(),
      heroLine: $("#heroLine").value.trim(),
      heroDescription: $("#heroDescription").value.trim(),
      email: $("#profileEmail").value.trim(),
      instagram: $("#profileInstagram").value.trim().replace(/^@/, ""),
      lineId: $("#profileLine").value.trim(),
      youtube: $("#profileYoutube").value.trim(),
      aboutTitle: $("#aboutTitle").value.trim(),
      aboutBody: $("#aboutBody").value.trim()
    };
  }

  function fillAppearance() {
    const a = state.appearance || {};
    $("#accentColor").value = a.accentColor || "#72f2aa";
    $("#accentCyan").value = a.accentCyan || "#58d9e8";
    $("#accentViolet").value = a.accentViolet || "#8d6cff";
    $("#heroBackgroundUrl").value = a.heroBackgroundUrl || "";
    $("#heroCharacter").value = a.heroCharacter || state.profile?.heroCharacter || "";
    $("#aboutCharacter").value = a.aboutCharacter || state.profile?.aboutCharacter || "";
  }

  function readAppearance() {
    state.appearance = {
      ...(state.appearance || {}),
      accentColor: $("#accentColor").value || "#72f2aa",
      accentCyan: $("#accentCyan").value || "#58d9e8",
      accentViolet: $("#accentViolet").value || "#8d6cff",
      heroBackgroundUrl: $("#heroBackgroundUrl").value.trim(),
      heroCharacter: $("#heroCharacter").value.trim(),
      aboutCharacter: $("#aboutCharacter").value.trim()
    };
    state.profile = {
      ...(state.profile || {}),
      heroCharacter: state.appearance.heroCharacter,
      aboutCharacter: state.appearance.aboutCharacter
    };
  }

  function renderSections() {
    const holder = $("#sectionsEditor");
    holder.innerHTML = (state.sections || []).sort((a, b) => Number(a.order) - Number(b.order)).map((item, index) => `
      <article class="editor-card section-row" data-section-index="${index}">
        <label class="checkbox-row">
          <input type="checkbox" data-section-visible="${index}" ${item.visible !== false ? "checked" : ""}>
          <span>${escapeHtml(SECTION_LABELS[item.id] || item.id)}</span>
        </label>
        <div class="card-actions">
          <button class="button small" type="button" data-section-up="${index}" ${index === 0 ? "disabled" : ""}>上移</button>
          <button class="button small" type="button" data-section-down="${index}" ${index === state.sections.length - 1 ? "disabled" : ""}>下移</button>
        </div>
      </article>
    `).join("");
  }

  function readSections() {
    state.sections = $$("[data-section-index]").map(card => {
      const index = Number(card.dataset.sectionIndex);
      return {
        ...(state.sections[index] || {}),
        visible: $(`[data-section-visible="${index}"]`).checked,
        order: index + 1
      };
    });
  }

  function moveSection(index, direction) {
    readSections();
    const next = index + direction;
    if (next < 0 || next >= state.sections.length) return;
    const rows = [...state.sections];
    [rows[index], rows[next]] = [rows[next], rows[index]];
    state.sections = rows.map((row, rowIndex) => ({ ...row, order: rowIndex + 1 }));
    renderSections();
    markDirty();
  }

  function renderServices() {
    const holder = $("#servicesEditor");
    holder.innerHTML = (state.services || []).map((item, index) => `
      <article class="editor-card" data-service-index="${index}">
        <div class="editor-card-head">
          <strong>服務 ${index + 1}</strong>
          <div class="card-actions"><button class="button danger small" type="button" data-remove-service="${index}">刪除</button></div>
        </div>
        <div class="editor-grid">
          <label><span>名稱</span><input data-service-title="${index}" value="${escapeHtml(item.title || "")}"></label>
          <label class="wide"><span>介紹</span><textarea rows="3" data-service-description="${index}">${escapeHtml(item.description || "")}</textarea></label>
        </div>
      </article>
    `).join("");
  }

  function readServices() {
    state.services = $$("[data-service-index]").map(card => {
      const index = Number(card.dataset.serviceIndex);
      return {
        title: $(`[data-service-title="${index}"]`).value.trim(),
        description: $(`[data-service-description="${index}"]`).value.trim()
      };
    });
  }

  function renderWorks() {
    const holder = $("#worksEditor");
    holder.innerHTML = (state.works || []).map((item, index) => {
      const coverId = `workCover${index}`;
      const mediaId = `workMedia${index}`;
      return `
        <article class="editor-card" data-work-index="${index}">
          <div class="editor-card-head">
            <strong>${escapeHtml(item.title || `作品 ${index + 1}`)}</strong>
            <div class="card-actions"><button class="button danger small" type="button" data-remove-work="${index}">刪除</button></div>
          </div>
          <div class="editor-grid">
            <label><span>作品名稱</span><input data-work-field="title" data-index="${index}" value="${escapeHtml(item.title || "")}"></label>
            <label><span>作者</span><input data-work-field="artist" data-index="${index}" value="${escapeHtml(item.artist || "XIAXGUANG")}"></label>
            <label><span>分類</span><select data-work-field="category" data-index="${index}">${["原創","翻唱","混音","編曲"].map(c => `<option ${item.category === c ? "selected" : ""}>${c}</option>`).join("")}</select></label>
            <label><span>內容類型</span><select data-work-field="type" data-index="${index}">${["audio","video","link"].map(type => `<option value="${type}" ${item.type === type ? "selected" : ""}>${type}</option>`).join("")}</select></label>
            <label class="wide"><span>標籤（逗號分隔）</span><input data-work-field="tags" data-index="${index}" value="${escapeHtml((item.tags || []).join(", "))}"></label>
            <label class="wide with-upload"><span>封面圖片網址或路徑</span><input id="${coverId}" data-work-field="coverUrl" data-index="${index}" value="${escapeHtml(item.coverUrl || "")}"><button class="button small" type="button" data-upload-target="${coverId}">上傳</button></label>
            <label class="wide with-upload"><span>音檔或影片網址</span><input id="${mediaId}" data-work-field="mediaUrl" data-index="${index}" value="${escapeHtml(item.mediaUrl || "")}"><button class="button small" type="button" data-upload-target="${mediaId}">上傳</button></label>
            <label class="wide"><span>外部作品連結</span><input data-work-field="externalUrl" data-index="${index}" value="${escapeHtml(item.externalUrl || "")}"></label>
            <label class="checkbox-row wide"><input type="checkbox" data-work-field="visible" data-index="${index}" ${item.visible !== false ? "checked" : ""}><span>公開顯示</span></label>
          </div>
        </article>
      `;
    }).join("");
  }

  function readWorks() {
    state.works = $$("[data-work-index]").map(card => {
      const index = Number(card.dataset.workIndex);
      const read = field => $(`[data-work-field="${field}"][data-index="${index}"]`);
      return {
        id: state.works[index]?.id || `work-${Date.now()}-${index}`,
        title: read("title").value.trim(),
        artist: read("artist").value.trim(),
        category: read("category").value,
        type: read("type").value,
        tags: read("tags").value.split(",").map(v => v.trim()).filter(Boolean),
        coverUrl: read("coverUrl").value.trim(),
        mediaUrl: read("mediaUrl").value.trim(),
        externalUrl: read("externalUrl").value.trim(),
        visible: read("visible").checked
      };
    });
  }

  function renderBeats() {
    const holder = $("#beatsEditor");
    holder.innerHTML = (state.beats || []).map((item, index) => {
      const coverId = `beatCover${index}`;
      const audioId = `beatAudio${index}`;
      return `
        <article class="editor-card" data-beat-index="${index}">
          <div class="editor-card-head">
            <strong>${escapeHtml(item.title || `Beat ${index + 1}`)}</strong>
            <div class="card-actions"><button class="button danger small" type="button" data-remove-beat="${index}">刪除</button></div>
          </div>
          <div class="editor-grid">
            <label><span>Beat 名稱</span><input data-beat-field="title" data-index="${index}" value="${escapeHtml(item.title || "")}"></label>
            <label><span>BPM</span><input data-beat-field="bpm" data-index="${index}" type="number" min="1" value="${escapeHtml(item.bpm || "")}"></label>
            <label><span>Key</span><input data-beat-field="key" data-index="${index}" value="${escapeHtml(item.key || "")}"></label>
            <label><span>曲風</span><input data-beat-field="genre" data-index="${index}" value="${escapeHtml(item.genre || "")}"></label>
            <label class="wide with-upload"><span>封面圖片網址</span><input id="${coverId}" data-beat-field="coverUrl" data-index="${index}" value="${escapeHtml(item.coverUrl || "")}"><button class="button small" type="button" data-upload-target="${coverId}">上傳</button></label>
            <label class="wide with-upload"><span>音檔網址</span><input id="${audioId}" data-beat-field="audioUrl" data-index="${index}" value="${escapeHtml(item.audioUrl || "")}"><button class="button small" type="button" data-upload-target="${audioId}">上傳</button></label>
            <label><span>價格文字</span><input data-beat-field="priceLabel" data-index="${index}" value="${escapeHtml(item.priceLabel || "")}"></label>
            <label><span>購買連結</span><input data-beat-field="purchaseUrl" data-index="${index}" value="${escapeHtml(item.purchaseUrl || "")}"></label>
            <label class="checkbox-row wide"><input type="checkbox" data-beat-field="visible" data-index="${index}" ${item.visible !== false ? "checked" : ""}><span>公開顯示</span></label>
          </div>
        </article>
      `;
    }).join("");
  }

  function readBeats() {
    state.beats = $$("[data-beat-index]").map(card => {
      const index = Number(card.dataset.beatIndex);
      const read = field => $(`[data-beat-field="${field}"][data-index="${index}"]`);
      return {
        id: state.beats[index]?.id || `beat-${Date.now()}-${index}`,
        title: read("title").value.trim(),
        coverUrl: read("coverUrl").value.trim(),
        audioUrl: read("audioUrl").value.trim(),
        bpm: Number(read("bpm").value || 0),
        key: read("key").value.trim(),
        genre: read("genre").value.trim(),
        priceLabel: read("priceLabel").value.trim(),
        purchaseUrl: read("purchaseUrl").value.trim(),
        visible: read("visible").checked
      };
    });
  }

  function renderProcess() {
    const holder = $("#processEditor");
    holder.innerHTML = (state.process || []).map((item, index) => `
      <article class="editor-card" data-process-index="${index}">
        <div class="editor-card-head">
          <strong>步驟 ${index + 1}</strong>
          <div class="card-actions"><button class="button danger small" type="button" data-remove-process="${index}">刪除</button></div>
        </div>
        <div class="editor-grid">
          <label><span>標題</span><input data-process-title="${index}" value="${escapeHtml(item.title || "")}"></label>
          <label class="wide"><span>描述</span><textarea rows="2" data-process-description="${index}">${escapeHtml(item.description || "")}</textarea></label>
        </div>
      </article>
    `).join("");
  }

  function readProcess() {
    state.process = $$("[data-process-index]").map(card => {
      const index = Number(card.dataset.processIndex);
      return {
        title: $(`[data-process-title="${index}"]`).value.trim(),
        description: $(`[data-process-description="${index}"]`).value.trim()
      };
    });
  }

  function renderComparisons() {
    const holder = $("#comparisonEditor");
    holder.innerHTML = (state.comparisons || []).map((item, index) => {
      const beforeId = `comparisonBefore${index}`;
      const afterId = `comparisonAfter${index}`;
      return `
        <article class="editor-card" data-comparison-index="${index}">
          <div class="editor-card-head">
            <strong>${escapeHtml(item.title || `對比 ${index + 1}`)}</strong>
            <div class="card-actions"><button class="button danger small" type="button" data-remove-comparison="${index}">刪除</button></div>
          </div>
          <div class="editor-grid">
            <label><span>標題</span><input data-comparison-field="title" data-index="${index}" value="${escapeHtml(item.title || "")}"></label>
            <label><span>副標題</span><input data-comparison-field="subtitle" data-index="${index}" value="${escapeHtml(item.subtitle || "")}"></label>
            <label class="wide with-upload"><span>混音前音檔網址</span><input id="${beforeId}" data-comparison-field="beforeUrl" data-index="${index}" value="${escapeHtml(item.beforeUrl || "")}"><button class="button small" type="button" data-upload-target="${beforeId}">上傳</button></label>
            <label class="wide with-upload"><span>混音後音檔網址</span><input id="${afterId}" data-comparison-field="afterUrl" data-index="${index}" value="${escapeHtml(item.afterUrl || "")}"><button class="button small" type="button" data-upload-target="${afterId}">上傳</button></label>
            <label class="checkbox-row wide"><input type="checkbox" data-comparison-field="visible" data-index="${index}" ${item.visible !== false ? "checked" : ""}><span>公開顯示</span></label>
          </div>
        </article>
      `;
    }).join("");
  }

  function readComparisons() {
    state.comparisons = $$("[data-comparison-index]").map(card => {
      const index = Number(card.dataset.comparisonIndex);
      const read = field => $(`[data-comparison-field="${field}"][data-index="${index}"]`);
      return {
        id: state.comparisons[index]?.id || `comparison-${Date.now()}-${index}`,
        title: read("title").value.trim(),
        subtitle: read("subtitle").value.trim(),
        beforeUrl: read("beforeUrl").value.trim(),
        afterUrl: read("afterUrl").value.trim(),
        visible: read("visible").checked
      };
    });
  }

  function readAll() {
    readProfile();
    readAppearance();
    readSections();
    readServices();
    readWorks();
    readBeats();
    readProcess();
    readComparisons();
    state = normalizeState(state);
  }

  async function save() {
    readAll();
    setStatus("儲存中…");
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      if (supabaseClient) {
        const { error } = await supabaseClient
          .from(CONFIG.contentTable || "site_content")
          .upsert({
            id: CONFIG.contentRowKey || "main",
            content: state,
            updated_at: new Date().toISOString()
          });
        if (error) throw error;
      }
      setStatus("已儲存", true);
    } catch (error) {
      setStatus(`儲存失敗：${error.message || error}`);
    }
  }

  function markDirty() {
    setStatus("有尚未儲存的變更");
  }

  function renderAllEditors() {
    fillProfile();
    fillAppearance();
    renderSections();
    renderServices();
    renderWorks();
    renderBeats();
    renderProcess();
    renderComparisons();
  }

  async function uploadMedia(file, targetId = "") {
    const result = $("#uploadResult");
    if (!file) return;
    if (!supabaseClient) {
      result.textContent = "目前未連接 Supabase，請先完成 config.js 與資料庫設定。";
      return;
    }

    result.textContent = "上傳中…";
    const safeName = file.name.replace(/[^\w.\-]+/g, "-");
    const path = `${Date.now()}-${safeName}`;
    const { error } = await supabaseClient.storage
      .from(CONFIG.storageBucket || "portfolio-media")
      .upload(path, file, { upsert: false });

    if (error) {
      result.textContent = `上傳失敗：${error.message}`;
      return;
    }

    const { data } = supabaseClient.storage
      .from(CONFIG.storageBucket || "portfolio-media")
      .getPublicUrl(path);

    const url = data.publicUrl;
    if (targetId) {
      const input = document.getElementById(targetId);
      if (input) {
        input.value = url;
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }
    result.innerHTML = `檔案網址：<code>${escapeHtml(url)}</code><button class="button small" type="button" data-copy-url="${escapeHtml(url)}">複製網址</button>`;
  }

  function bindActions() {
    document.addEventListener("click", event => {
      const target = event.target;
      const uploadButton = target.closest("[data-upload-target]");
      if (uploadButton) {
        pendingUploadTargetId = uploadButton.dataset.uploadTarget || "";
        $("#targetUpload").value = "";
        $("#targetUpload").click();
        return;
      }

      const copyButton = target.closest("[data-copy-url]");
      if (copyButton) {
        navigator.clipboard?.writeText(copyButton.dataset.copyUrl || "");
        copyButton.textContent = "已複製";
        return;
      }

      const removeService = target.closest("[data-remove-service]");
      if (removeService) {
        state.services.splice(Number(removeService.dataset.removeService), 1);
        renderServices();
        markDirty();
        return;
      }

      const removeWork = target.closest("[data-remove-work]");
      if (removeWork) {
        state.works.splice(Number(removeWork.dataset.removeWork), 1);
        renderWorks();
        markDirty();
        return;
      }

      const removeBeat = target.closest("[data-remove-beat]");
      if (removeBeat) {
        state.beats.splice(Number(removeBeat.dataset.removeBeat), 1);
        renderBeats();
        markDirty();
        return;
      }

      const removeProcess = target.closest("[data-remove-process]");
      if (removeProcess) {
        state.process.splice(Number(removeProcess.dataset.removeProcess), 1);
        renderProcess();
        markDirty();
        return;
      }

      const removeComparison = target.closest("[data-remove-comparison]");
      if (removeComparison) {
        state.comparisons.splice(Number(removeComparison.dataset.removeComparison), 1);
        renderComparisons();
        markDirty();
        return;
      }

      const sectionUp = target.closest("[data-section-up]");
      if (sectionUp) {
        moveSection(Number(sectionUp.dataset.sectionUp), -1);
        return;
      }

      const sectionDown = target.closest("[data-section-down]");
      if (sectionDown) {
        moveSection(Number(sectionDown.dataset.sectionDown), 1);
      }
    });

    document.addEventListener("input", event => {
      if (event.target.closest(".admin-panel")) markDirty();
    });
    document.addEventListener("change", event => {
      if (event.target.closest(".admin-panel")) markDirty();
    });
  }

  function bindCreateButtons() {
    $("#addService").addEventListener("click", () => {
      readServices();
      state.services.push({ title: "新服務", description: "" });
      renderServices();
      markDirty();
    });

    $("#addWork").addEventListener("click", () => {
      readWorks();
      state.works.push({
        id: `work-${Date.now()}`,
        title: "新作品",
        artist: "XIAXGUANG",
        category: "原創",
        type: "audio",
        mediaUrl: "",
        coverUrl: "",
        externalUrl: "",
        tags: [],
        visible: true
      });
      renderWorks();
      markDirty();
    });

    $("#addBeat").addEventListener("click", () => {
      readBeats();
      state.beats.push({
        id: `beat-${Date.now()}`,
        title: "New Beat",
        coverUrl: "",
        audioUrl: "",
        bpm: 120,
        key: "A minor",
        genre: "",
        priceLabel: "洽詢授權",
        purchaseUrl: "",
        visible: true
      });
      renderBeats();
      markDirty();
    });

    $("#addProcess").addEventListener("click", () => {
      readProcess();
      state.process.push({ title: "新步驟", description: "" });
      renderProcess();
      markDirty();
    });

    $("#addComparison").addEventListener("click", () => {
      readComparisons();
      state.comparisons.push({
        id: `comparison-${Date.now()}`,
        title: "Mixing Comparison",
        subtitle: "Before / After",
        beforeUrl: "",
        afterUrl: "",
        visible: true
      });
      renderComparisons();
      markDirty();
    });
  }

  async function init() {
    bindNavigation();
    state = await loadState();
    renderAllEditors();

    $("#connectionMode").textContent = isSupabaseReady()
      ? "Supabase 已設定，儲存時會同步至線上資料庫。"
      : "本機模式：目前只會儲存在這台裝置的瀏覽器。";

    $("#saveButton").addEventListener("click", save);
    $("#resetButton").addEventListener("click", () => {
      if (!confirm("確定要還原成預設內容嗎？")) return;
      state = normalizeState(DEFAULTS);
      renderAllEditors();
      markDirty();
    });

    $("#mediaUpload").addEventListener("change", event => uploadMedia(event.target.files?.[0]));
    $("#targetUpload").addEventListener("change", event => uploadMedia(event.target.files?.[0], pendingUploadTargetId));

    bindCreateButtons();
    bindActions();
  }

  init();
})();
