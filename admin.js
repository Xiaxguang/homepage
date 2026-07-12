(() => {
  const DEFAULTS = window.DEFAULT_PORTFOLIO_CONTENT;
  const config = window.PORTFOLIO_CONFIG || {};
  const remoteEnabled = Boolean(config.supabaseUrl && config.supabaseAnonKey && window.supabase);
  const client = remoteEnabled ? window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey) : null;
  const clone = (value) => JSON.parse(JSON.stringify(value));
  let state = clone(DEFAULTS);
  let dirty = false;
  let currentUser = null;
  let toastTimer;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const uid = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const escapeHTML = (value = "") => String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;" }[char]));
  const getByPath = (object, path) => path.split(".").reduce((value, key) => value?.[key], object);
  const deepMerge = (base, update) => {
    if (Array.isArray(base)) return Array.isArray(update) ? update : base;
    if (base && typeof base === "object") {
      const result = { ...base };
      if (update && typeof update === "object") Object.keys(update).forEach((key) => { result[key] = key in base ? deepMerge(base[key], update[key]) : update[key]; });
      return result;
    }
    return update ?? base;
  };
  const setByPath = (object, path, value) => {
    const keys = path.split(".");
    const last = keys.pop();
    const target = keys.reduce((current, key) => current[key] ??= {}, object);
    target[last] = value;
  };

  function showToast(message) {
    const toast = $("#admin-toast"); toast.textContent = message; toast.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
  }
  function markDirty() { dirty = true; $("#save-state").textContent = "有尚未儲存的修改"; }
  function markSaved() { dirty = false; $("#save-state").textContent = "已儲存"; }

  async function loadContent() {
    if (remoteEnabled) {
      const { data, error } = await client.from("site_content").select("content").eq("id", "main").maybeSingle();
      if (error) throw error;
      return data?.content ? deepMerge(clone(DEFAULTS), data.content) : clone(DEFAULTS);
    }
    try { const local = JSON.parse(localStorage.getItem("akuangPortfolioContent") || "null"); return local ? deepMerge(clone(DEFAULTS), local) : clone(DEFAULTS); }
    catch { return clone(DEFAULTS); }
  }

  async function saveContent() {
    $("#save-button").disabled = true; $("#save-button").textContent = "儲存中…";
    try {
      if (remoteEnabled) {
        const { data: { session } } = await client.auth.getSession();
        if (!session) throw new Error("登入已失效，請重新登入");
        const { error } = await client.from("site_content").upsert({ id: "main", content: state, updated_at: new Date().toISOString() }, { onConflict: "id" });
        if (error) throw error;
      } else {
        localStorage.setItem("akuangPortfolioContent", JSON.stringify(state));
      }
      markSaved(); showToast(remoteEnabled ? "已儲存並發布到線上網站" : "已儲存到這台裝置的瀏覽器");
    } catch (error) { console.error(error); showToast(`儲存失敗：${error.message}`); }
    finally { $("#save-button").disabled = false; $("#save-button").textContent = "儲存並發布"; }
  }

  function populateStaticInputs() {
    $$("[data-path]").forEach((input) => {
      const value = getByPath(state, input.dataset.path);
      input.value = value ?? "";
    });
    $$("[data-list-path]").forEach((input) => { input.value = (getByPath(state, input.dataset.listPath) || []).join(", "); });
    updatePreviews();
  }

  function updatePreviews() {
    $("#hero-preview").src = state.hero.mascot || "";
    $("#about-preview").src = state.about.mascot || "";
    $("#radius-output").textContent = `${state.theme.cardRadius}px`;
  }

  function renderSectionOrder() {
    const root = $("#section-order-list");
    root.innerHTML = state.sections.map((item, index) => `
      <div class="section-order-item" data-section-index="${index}">
        <span class="drag-mark">☷</span><label class="visibility-toggle"><input type="checkbox" data-section-visible ${item.visible ? "checked" : ""}/><span>${escapeHTML(item.label)}</span></label>
        <div class="section-order-actions"><button class="icon-button" data-section-move="up" type="button" title="上移">↑</button><button class="icon-button" data-section-move="down" type="button" title="下移">↓</button></div>
      </div>`).join("");
  }

  function itemActions(type, index) {
    return `<div class="item-actions"><button class="icon-button" data-action="up" data-type="${type}" data-index="${index}" type="button">↑</button><button class="icon-button" data-action="down" data-type="${type}" data-index="${index}" type="button">↓</button><button class="icon-button" data-action="delete" data-type="${type}" data-index="${index}" type="button">×</button></div>`;
  }
  function field(type, index, name, label, value, extra = "") {
    return `<label ${extra.includes("full") ? 'class="full"' : ""}>${label}<input data-collection="${type}" data-index="${index}" data-field="${name}" value="${escapeHTML(value ?? "")}" ${extra.replace("full", "")}/></label>`;
  }
  function textarea(type, index, name, label, value, rows = 3) {
    return `<label class="full">${label}<textarea data-collection="${type}" data-index="${index}" data-field="${name}" rows="${rows}">${escapeHTML(value ?? "")}</textarea></label>`;
  }
  function uploadControl(type, index, fieldName, kind, accept, text) {
    return `<label class="upload-button">${text}<input class="collection-upload" data-collection="${type}" data-index="${index}" data-field="${fieldName}" data-kind="${kind}" type="file" accept="${accept}" /></label>`;
  }

  function renderWorks() {
    $("#works-editor").innerHTML = state.works.map((item, index) => `
      <article class="collection-item"><div class="collection-item-header"><strong>${String(index + 1).padStart(2, "0")}｜${escapeHTML(item.title || "未命名作品")}</strong>${itemActions("works", index)}</div>
      <div class="collection-form">
        ${field("works", index, "title", "作品名稱", item.title)}${field("works", index, "subtitle", "製作內容", item.subtitle)}
        ${field("works", index, "category", "分類標籤", item.category)}${field("works", index, "genre", "曲風", item.genre)}
        ${field("works", index, "coverUrl", "封面圖片網址", item.coverUrl, "full")}
        <div>${uploadControl("works", index, "coverUrl", "image", "image/*", "上傳封面圖片")}</div><div class="item-preview"><img src="${escapeHTML(item.coverUrl || "assets/characters/mascot-peace.png")}" alt="封面預覽" /></div>
        <label>媒體類型<select data-collection="works" data-index="${index}" data-field="mediaType"><option value="audio" ${item.mediaType === "audio" ? "selected" : ""}>音檔</option><option value="video" ${item.mediaType === "video" ? "selected" : ""}>影片</option><option value="link" ${item.mediaType === "link" ? "selected" : ""}>外部連結</option></select></label>
        ${field("works", index, "mediaUrl", "音檔／影片／主要連結", item.mediaUrl)}
        <div>${uploadControl("works", index, "mediaUrl", "media", "audio/*,video/*", "上傳音檔或影片")}</div>
        ${field("works", index, "externalUrl", "額外作品連結（選填）", item.externalUrl)}
        <label class="inline-check full"><input type="checkbox" data-collection="works" data-index="${index}" data-field="published" ${item.published !== false ? "checked" : ""}/>公開顯示</label>
        <p class="media-help full">影片較大時建議填 YouTube 連結；音檔可上傳 MP3、WAV 或使用外部網址。</p>
      </div></article>`).join("");
  }

  function renderServices() {
    $("#services-editor").innerHTML = state.services.map((item, index) => `
      <article class="collection-item"><div class="collection-item-header"><strong>${String(index + 1).padStart(2, "0")}｜${escapeHTML(item.title || "未命名服務")}</strong>${itemActions("services", index)}</div>
      <div class="collection-form">${field("services", index, "code", "縮寫", item.code)}${field("services", index, "title", "服務名稱", item.title)}${textarea("services", index, "description", "服務說明", item.description, 4)}${field("services", index, "priceLabel", "價格標籤", item.priceLabel)}${field("services", index, "price", "價格文字", item.price)}<label class="inline-check full"><input type="checkbox" data-collection="services" data-index="${index}" data-field="featured" ${item.featured ? "checked" : ""}/>設為主打服務</label></div></article>`).join("");
  }

  function renderProcess() {
    $("#process-editor").innerHTML = state.process.map((item, index) => `
      <article class="collection-item"><div class="collection-item-header"><strong>${String(index + 1).padStart(2, "0")}｜${escapeHTML(item.title || "未命名步驟")}</strong>${itemActions("process", index)}</div><div class="collection-form">${field("process", index, "title", "步驟名稱", item.title, "full")}${textarea("process", index, "description", "說明", item.description, 4)}</div></article>`).join("");
  }

  function renderBeats() {
    $("#beats-editor").innerHTML = state.beats.map((item, index) => `
      <article class="collection-item"><div class="collection-item-header"><strong>${String(index + 1).padStart(2, "0")}｜${escapeHTML(item.title || "未命名 Beat")}</strong>${itemActions("beats", index)}</div>
      <div class="collection-form">${field("beats", index, "title", "Beat 名稱", item.title)}${field("beats", index, "genre", "曲風說明", item.genre)}${field("beats", index, "filter", "篩選分類（pop／rnb／trap）", item.filter)}${field("beats", index, "bpm", "BPM", item.bpm)}${field("beats", index, "key", "Key", item.key)}${field("beats", index, "price", "售價／狀態文字", item.price)}${field("beats", index, "coverUrl", "封面圖片網址", item.coverUrl, "full")}<div>${uploadControl("beats", index, "coverUrl", "image", "image/*", "上傳封面圖片")}</div><div class="item-preview"><img src="${escapeHTML(item.coverUrl || "assets/characters/mascot-crossed.png")}" alt="Beat 封面預覽" /></div><label>試聽類型<select data-collection="beats" data-index="${index}" data-field="mediaType"><option value="audio" ${item.mediaType === "audio" ? "selected" : ""}>音檔</option><option value="video" ${item.mediaType === "video" ? "selected" : ""}>影片</option><option value="link" ${item.mediaType === "link" ? "selected" : ""}>連結</option></select></label>${field("beats", index, "mediaUrl", "試聽網址", item.mediaUrl)}<div>${uploadControl("beats", index, "mediaUrl", "media", "audio/*,video/*", "上傳試聽音檔／影片")}</div><label class="inline-check full"><input type="checkbox" data-collection="beats" data-index="${index}" data-field="published" ${item.published !== false ? "checked" : ""}/>公開顯示</label></div></article>`).join("");
  }

  function renderCollections() { renderWorks(); renderServices(); renderProcess(); renderBeats(); }
  function renderAll() { populateStaticInputs(); renderSectionOrder(); renderCollections(); updateStatus(); }

  function collectionChanged(event) {
    const input = event.target.closest("[data-collection][data-field]"); if (!input || input.type === "file") return;
    const item = state[input.dataset.collection]?.[Number(input.dataset.index)]; if (!item) return;
    item[input.dataset.field] = input.type === "checkbox" ? input.checked : input.value;
    markDirty();
  }

  function moveItem(type, index, direction) {
    const list = state[type]; const next = direction === "up" ? index - 1 : index + 1;
    if (!list || next < 0 || next >= list.length) return;
    [list[index], list[next]] = [list[next], list[index]]; renderCollections(); markDirty();
  }

  function addItem(type) {
    const templates = {
      works: { id: uid("work"), title: "新作品", subtitle: "混音・編曲", category: "WORK", genre: "POP", coverUrl: "", mediaType: "audio", mediaUrl: "", externalUrl: "", published: true },
      services: { id: uid("service"), code: "NEW", title: "新服務", description: "服務內容說明", priceLabel: "參考價格", price: "請詢問", featured: false },
      process: { id: uid("step"), title: "新步驟", description: "流程說明" },
      beats: { id: uid("beat"), title: "New Beat", genre: "Pop / Chill", filter: "pop", bpm: "100 BPM", key: "C Major", coverUrl: "", mediaType: "audio", mediaUrl: "", price: "即將開放", published: true }
    };
    state[type].push(templates[type]); renderCollections(); markDirty();
  }

  async function readAsDataUrl(file) { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); }); }
  async function uploadAsset(file, kind) {
    if (!file) return "";
    if (remoteEnabled) {
      if (file.size > 100 * 1024 * 1024) throw new Error("單一檔案不可超過 100 MB");
      const safeName = file.name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-");
      const folder = kind === "image" ? "images" : file.type.startsWith("audio/") ? "audio" : "video";
      const path = `${folder}/${Date.now()}-${crypto.randomUUID()}-${safeName}`;
      const { error } = await client.storage.from(config.storageBucket || "portfolio-media").upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
      if (error) throw error;
      const { data } = client.storage.from(config.storageBucket || "portfolio-media").getPublicUrl(path);
      return data.publicUrl;
    }
    if (file.size > 2.2 * 1024 * 1024) throw new Error("本機模式只適合 2 MB 以下圖片；音檔與影片請先使用網址，或完成 Supabase 設定");
    return readAsDataUrl(file);
  }

  async function handleUpload(input) {
    const file = input.files?.[0]; if (!file) return;
    const originalText = input.parentElement.childNodes[0]?.textContent;
    input.parentElement.childNodes[0].textContent = "上傳中…";
    try {
      const url = await uploadAsset(file, input.dataset.kind);
      if (input.dataset.uploadPath) setByPath(state, input.dataset.uploadPath, url);
      else state[input.dataset.collection][Number(input.dataset.index)][input.dataset.field] = url;
      renderAll(); markDirty(); showToast("檔案已上傳，記得按儲存並發布");
    } catch (error) { console.error(error); showToast(`上傳失敗：${error.message}`); }
    finally { if (input.parentElement?.childNodes[0]) input.parentElement.childNodes[0].textContent = originalText || "上傳檔案"; }
  }

  function bindEvents() {
    $$("[data-path]").forEach((input) => input.addEventListener("input", () => {
      let value = input.value;
      if (input.type === "range" || input.dataset.path === "theme.worksColumns") value = Number(value);
      setByPath(state, input.dataset.path, value); updatePreviews(); markDirty();
    }));
    $$("[data-list-path]").forEach((input) => input.addEventListener("input", () => { setByPath(state, input.dataset.listPath, input.value.split(/[,，]/).map((item) => item.trim()).filter(Boolean)); markDirty(); }));
    document.addEventListener("input", collectionChanged); document.addEventListener("change", collectionChanged);
    document.addEventListener("change", (event) => { const input = event.target.closest(".collection-upload,.single-asset-upload"); if (input) handleUpload(input); });
    $("#section-order-list").addEventListener("change", (event) => { const row = event.target.closest("[data-section-index]"); if (!row) return; state.sections[Number(row.dataset.sectionIndex)].visible = event.target.checked; markDirty(); });
    $("#section-order-list").addEventListener("click", (event) => { const button = event.target.closest("[data-section-move]"); if (!button) return; const row = button.closest("[data-section-index]"); const index = Number(row.dataset.sectionIndex); const next = button.dataset.sectionMove === "up" ? index - 1 : index + 1; if (next < 0 || next >= state.sections.length) return; [state.sections[index], state.sections[next]] = [state.sections[next], state.sections[index]]; renderSectionOrder(); markDirty(); });
    document.addEventListener("click", (event) => {
      const add = event.target.closest(".add-item"); if (add) addItem(add.dataset.type);
      const action = event.target.closest("[data-action][data-type]"); if (!action) return;
      const type = action.dataset.type; const index = Number(action.dataset.index);
      if (action.dataset.action === "delete") { if (confirm("確定刪除這個項目？")) { state[type].splice(index, 1); renderCollections(); markDirty(); } }
      else moveItem(type, index, action.dataset.action);
    });
    $("#save-button").addEventListener("click", saveContent);
    $("#preview-button").addEventListener("click", () => window.open("index.html", "_blank", "noopener"));
    $("#export-button").addEventListener("click", () => { const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `akuang-portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click(); URL.revokeObjectURL(a.href); });
    $("#import-input").addEventListener("change", async (event) => { try { const text = await event.target.files[0].text(); const imported = JSON.parse(text); if (!imported.hero || !imported.sections) throw new Error("不是有效的作品集備份"); state = imported; renderAll(); markDirty(); showToast("備份已匯入，請確認後儲存"); } catch (error) { showToast(`匯入失敗：${error.message}`); } event.target.value = ""; });
    $("#reset-button").addEventListener("click", () => { if (confirm("確定將編輯器回復成預設內容？")) { state = clone(DEFAULTS); renderAll(); markDirty(); } });
    $$("#admin-nav button").forEach((button) => button.addEventListener("click", () => showPanel(button.dataset.panel, button.textContent)));
    $("#logout-button").addEventListener("click", async () => { if (remoteEnabled) await client.auth.signOut(); location.reload(); });
    window.addEventListener("beforeunload", (event) => { if (dirty) { event.preventDefault(); event.returnValue = ""; } });
  }

  function showPanel(panel, title) {
    $$("#admin-nav button").forEach((button) => button.classList.toggle("active", button.dataset.panel === panel));
    $$("[data-editor-panel]").forEach((section) => section.classList.toggle("active", section.dataset.editorPanel === panel));
    $("#panel-title").textContent = title;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateStatus() {
    $("#mode-badge").textContent = remoteEnabled ? "SUPABASE ONLINE" : "LOCAL MODE";
    $("#status-mode").textContent = remoteEnabled ? "Supabase 線上模式" : "瀏覽器本機模式";
    $("#status-bucket").textContent = config.storageBucket || "portfolio-media";
    $("#status-admin").textContent = currentUser?.email || config.adminEmail || "未設定";
  }

  async function enterDashboard(user = null) {
    currentUser = user;
    try { state = await loadContent(); }
    catch (error) { showToast(`讀取內容失敗：${error.message}`); state = clone(DEFAULTS); }
    $("#login-screen").hidden = true; $("#dashboard").hidden = false;
    if (!remoteEnabled) { $("#mode-warning").hidden = false; $("#mode-warning").textContent = "目前為本機測試模式：修改只會保存在這台電腦的這個瀏覽器，其他訪客看不到。完成 Supabase 設定後，後台才會成為真正的線上管理系統。"; }
    renderAll(); bindEvents(); markSaved();
  }

  async function initAuth() {
    $("#login-email").value = config.adminEmail || "";
    if (!remoteEnabled) {
      $("#login-form").hidden = true; $("#local-mode-button").hidden = false;
      $("#login-description").textContent = "目前尚未填入 Supabase 設定。可以先使用本機模式測試版面與編輯功能。";
      $("#login-note").textContent = "本機模式不是真正線上後台，發布給訪客前請依 README 完成 Supabase 設定。";
      $("#local-mode-button").addEventListener("click", () => enterDashboard());
      return;
    }
    const { data: { session } } = await client.auth.getSession();
    if (session?.user) {
      if (config.adminEmail && session.user.email !== config.adminEmail) { await client.auth.signOut(); showToast("這個帳號不是指定管理員"); }
      else { await enterDashboard(session.user); return; }
    }
    $("#login-form").addEventListener("submit", async (event) => {
      event.preventDefault(); const email = $("#login-email").value.trim(); const password = $("#login-password").value;
      const button = event.currentTarget.querySelector("button"); button.disabled = true; button.textContent = "登入中…";
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      button.disabled = false; button.textContent = "登入後台";
      if (error) { $("#login-note").textContent = `登入失敗：${error.message}`; return; }
      if (config.adminEmail && data.user.email !== config.adminEmail) { await client.auth.signOut(); $("#login-note").textContent = "這個帳號沒有管理權限"; return; }
      await enterDashboard(data.user);
    });
  }

  initAuth().catch((error) => { console.error(error); $("#login-note").textContent = `初始化失敗：${error.message}`; });
})();
