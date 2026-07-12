(() => {
  "use strict";

  const CONFIG = window.PORTFOLIO_CONFIG || {};
  const DEFAULTS = window.DEFAULT_CONTENT || {};
  const STORAGE_KEY = "xiaxguang_portfolio_content_v2";
  let state = structuredClone(DEFAULTS);
  let supabaseClient = null;

  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

  function isSupabaseReady() {
    return Boolean(CONFIG.supabaseUrl && CONFIG.supabaseAnonKey && window.supabase);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
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
        if (error) throw error;
        if (data?.content) return data.content;
      } catch (error) {
        console.warn(error);
      }
    }

    try {
      const local = localStorage.getItem(STORAGE_KEY);
      if (local) return JSON.parse(local);
    } catch (error) {
      console.warn(error);
    }

    return structuredClone(DEFAULTS);
  }

  function setStatus(text, ok = false) {
    const node = $("#saveStatus");
    if (!node) return;
    node.textContent = text;
    node.style.color = ok ? "#c8ff48" : "";
  }

  function bindNavigation() {
    $$(".admin-nav").forEach(button => {
      button.addEventListener("click", () => {
        $$(".admin-nav").forEach(item => item.classList.remove("active"));
        $$(".admin-panel").forEach(item => item.classList.remove("active"));
        button.classList.add("active");
        document.getElementById(button.dataset.panel)?.classList.add("active");
      });
    });
  }

  function fillProfile() {
    const p = state.profile || {};
    $("#profileName").value = p.name || "";
    $("#profileAlias").value = p.alias || "";
    $("#profileTagline").value = p.tagline || "";
    $("#profileInstagram").value = p.instagram || "";
    $("#profileLine").value = p.lineId || "";
    $("#aboutTitle").value = p.aboutTitle || "";
    $("#aboutBody").value = p.aboutBody || "";
    $("#heroCharacter").value = p.heroCharacter || "";
    $("#aboutCharacter").value = p.aboutCharacter || "";
  }

  function readProfile() {
    state.profile = {
      ...(state.profile || {}),
      name: $("#profileName").value.trim(),
      alias: $("#profileAlias").value.trim(),
      tagline: $("#profileTagline").value.trim(),
      instagram: $("#profileInstagram").value.trim().replace(/^@/, ""),
      lineId: $("#profileLine").value.trim(),
      aboutTitle: $("#aboutTitle").value.trim(),
      aboutBody: $("#aboutBody").value.trim(),
      heroCharacter: $("#heroCharacter").value.trim(),
      aboutCharacter: $("#aboutCharacter").value.trim()
    };
  }

  function renderServices() {
    const holder = $("#servicesEditor");
    holder.innerHTML = (state.services || []).map((item, index) => `
      <article class="editor-card" data-service-index="${index}">
        <div class="editor-card-head">
          <strong>服務 ${index + 1}</strong>
          <button class="button danger small" type="button" data-remove-service="${index}">刪除</button>
        </div>
        <div class="editor-grid">
          <label><span>名稱</span><input data-service-title="${index}" value="${escapeHtml(item.title || "")}"></label>
          <label class="wide"><span>介紹</span><textarea rows="3" data-service-description="${index}">${escapeHtml(item.description || "")}</textarea></label>
        </div>
      </article>
    `).join("");

    $$("[data-remove-service]").forEach(button => button.addEventListener("click", () => {
      state.services.splice(Number(button.dataset.removeService), 1);
      renderServices();
      markDirty();
    }));
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
    holder.innerHTML = (state.works || []).map((item, index) => `
      <article class="editor-card" data-work-index="${index}">
        <div class="editor-card-head">
          <strong>${escapeHtml(item.title || `作品 ${index + 1}`)}</strong>
          <button class="button danger small" type="button" data-remove-work="${index}">刪除</button>
        </div>
        <div class="editor-grid">
          <label><span>作品名稱</span><input data-work-field="title" data-index="${index}" value="${escapeHtml(item.title || "")}"></label>
          <label><span>分類</span>
            <select data-work-field="category" data-index="${index}">
              ${["原創","翻唱","混音","編曲"].map(c => `<option ${item.category === c ? "selected" : ""}>${c}</option>`).join("")}
            </select>
          </label>
          <label><span>內容類型</span>
            <select data-work-field="type" data-index="${index}">
              ${["audio","video","link"].map(type => `<option value="${type}" ${item.type === type ? "selected" : ""}>${type}</option>`).join("")}
            </select>
          </label>
          <label><span>標籤（逗號分隔）</span><input data-work-field="tags" data-index="${index}" value="${escapeHtml((item.tags || []).join(", "))}"></label>
          <label class="wide"><span>封面圖片網址或路徑</span><input data-work-field="coverUrl" data-index="${index}" value="${escapeHtml(item.coverUrl || "")}"></label>
          <label class="wide"><span>音檔或影片網址</span><input data-work-field="mediaUrl" data-index="${index}" value="${escapeHtml(item.mediaUrl || "")}"></label>
          <label class="wide"><span>外部作品連結</span><input data-work-field="externalUrl" data-index="${index}" value="${escapeHtml(item.externalUrl || "")}"></label>
          <label class="checkbox-row wide"><input type="checkbox" data-work-field="visible" data-index="${index}" ${item.visible !== false ? "checked" : ""}><span>公開顯示</span></label>
        </div>
      </article>
    `).join("");

    $$("[data-remove-work]").forEach(button => button.addEventListener("click", () => {
      state.works.splice(Number(button.dataset.removeWork), 1);
      renderWorks();
      markDirty();
    }));
  }

  function readWorks() {
    state.works = $$("[data-work-index]").map(card => {
      const index = Number(card.dataset.workIndex);
      const read = field => $(`[data-work-field="${field}"][data-index="${index}"]`);
      return {
        id: state.works[index]?.id || `work-${Date.now()}-${index}`,
        title: read("title").value.trim(),
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

  function renderComparisons() {
    const holder = $("#comparisonEditor");
    holder.innerHTML = (state.comparisons || []).map((item, index) => `
      <article class="editor-card" data-comparison-index="${index}">
        <div class="editor-card-head">
          <strong>${escapeHtml(item.title || `對比 ${index + 1}`)}</strong>
          <button class="button danger small" type="button" data-remove-comparison="${index}">刪除</button>
        </div>
        <div class="editor-grid">
          <label><span>標題</span><input data-comparison-field="title" data-index="${index}" value="${escapeHtml(item.title || "")}"></label>
          <label><span>副標題</span><input data-comparison-field="subtitle" data-index="${index}" value="${escapeHtml(item.subtitle || "")}"></label>
          <label class="wide"><span>混音前音檔網址</span><input data-comparison-field="beforeUrl" data-index="${index}" value="${escapeHtml(item.beforeUrl || "")}"></label>
          <label class="wide"><span>混音後音檔網址</span><input data-comparison-field="afterUrl" data-index="${index}" value="${escapeHtml(item.afterUrl || "")}"></label>
          <label class="checkbox-row wide"><input type="checkbox" data-comparison-field="visible" data-index="${index}" ${item.visible !== false ? "checked" : ""}><span>公開顯示</span></label>
        </div>
      </article>
    `).join("");

    $$("[data-remove-comparison]").forEach(button => button.addEventListener("click", () => {
      state.comparisons.splice(Number(button.dataset.removeComparison), 1);
      renderComparisons();
      markDirty();
    }));
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
    readServices();
    readWorks();
    readComparisons();
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
      console.error(error);
      setStatus(`儲存失敗：${error.message}`);
    }
  }

  function markDirty() {
    setStatus("有尚未儲存的變更");
  }

  async function uploadMedia(file) {
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

    result.innerHTML = `檔案網址：<br><code>${escapeHtml(data.publicUrl)}</code>`;
  }

  async function init() {
    bindNavigation();
    state = await loadState();
    fillProfile();
    renderServices();
    renderWorks();
    renderComparisons();

    $("#connectionMode").textContent = isSupabaseReady()
      ? "Supabase 已設定，儲存時會同步至線上資料庫。"
      : "本機模式：目前只會儲存在這台裝置的瀏覽器。";

    $("#saveButton").addEventListener("click", save);
    $("#resetButton").addEventListener("click", () => {
      if (!confirm("確定要還原成預設內容嗎？")) return;
      state = structuredClone(DEFAULTS);
      fillProfile();
      renderServices();
      renderWorks();
      renderComparisons();
      markDirty();
    });

    $("#addService").addEventListener("click", () => {
      state.services ||= [];
      state.services.push({ title: "新服務", description: "" });
      renderServices();
      markDirty();
    });

    $("#addWork").addEventListener("click", () => {
      state.works ||= [];
      state.works.push({
        id: `work-${Date.now()}`,
        title: "新作品",
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

    $("#addComparison").addEventListener("click", () => {
      state.comparisons ||= [];
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

    $("#mediaUpload").addEventListener("change", event => uploadMedia(event.target.files?.[0]));

    document.addEventListener("input", event => {
      if (event.target.closest(".admin-panel")) markDirty();
    });
    document.addEventListener("change", event => {
      if (event.target.closest(".admin-panel")) markDirty();
    });
  }

  init();
})();
