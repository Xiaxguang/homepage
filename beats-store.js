(() => {
  "use strict";

  const ROOT_CONFIG = window.PORTFOLIO_CONFIG || {};
  const STORE_CONFIG = {
    mode: "sandbox",
    currency: "USD",
    ...(ROOT_CONFIG.store || {})
  };
  const STORE_MODE = String(STORE_CONFIG.mode || "sandbox").toLowerCase() === "live" ? "live" : "sandbox";
  const SUPABASE_URL = STORE_CONFIG.supabaseUrl || ROOT_CONFIG.supabaseUrl || "";
  const SUPABASE_KEY = STORE_CONFIG.supabasePublishableKey || ROOT_CONFIG.supabaseAnonKey || "";
  const FUNCTIONS_BASE_URL = String(STORE_CONFIG.functionsBaseUrl || `${SUPABASE_URL}/functions/v1`).replace(/\/+$/, "");
  const PAYPAL_CLIENT_ID = currentPayPalClientId();
  const TOKEN_KEY = "xiaxguang_latest_download_token";
  const LICENSE_ORDER = ["BASIC", "PREMIUM", "UNLIMITED"];
  const REQUESTED_BEAT = new URLSearchParams(window.location.search).get("beat") || "";
  const FALLBACK_ASSETS = {
    "neon-velocity": {
      cover: "assets/media/cover-neon-velocity.webp",
      preview: "assets/audio/neon-velocity.mp3"
    },
    "midnight-core": {
      cover: "assets/media/cover-demon-core.webp",
      preview: "assets/audio/demon-core.mp3"
    },
    "demon-core": {
      cover: "assets/media/cover-demon-core.webp",
      preview: "assets/audio/demon-core.mp3"
    },
    "astral-gate": {
      cover: "assets/media/cover-astral-gate.webp",
      preview: "assets/audio/astral-gate.mp3"
    },
    "echo-rift": {
      cover: "assets/media/cover-echo-rift.webp",
      preview: "assets/audio/echo-rift.mp3"
    },
    "rainy-nights": {
      cover: "assets/media/cover-kaoliang-nights.webp",
      preview: "assets/audio/kaoliang-nights.mp3"
    },
    "kaoliang-nights": {
      cover: "assets/media/cover-kaoliang-nights.webp",
      preview: "assets/audio/kaoliang-nights.mp3"
    }
  };

  const state = {
    client: null,
    products: [],
    selectedProduct: null,
    selectedLicense: null,
    paypalButtons: null,
    paypalSdkPromise: null,
    previousFocus: null,
    busy: false
  };

  const app = document.getElementById("beatStoreApp");
  const modeNote = document.getElementById("beatShopModeNote");
  const modal = document.getElementById("beatCheckoutModal");
  const checkoutClose = document.getElementById("beatCheckoutClose");
  const checkoutSummary = document.getElementById("beatCheckoutSummary");
  const checkoutStatus = document.getElementById("beatCheckoutStatus");
  const downloadList = document.getElementById("beatDownloadList");
  const paypalButtons = document.getElementById("beatPaypalButtons");
  const termsAgree = document.getElementById("beatTermsAgree");

  const escapeHtml = value => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const normalizeSlug = value => String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^beat-/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  function currentPayPalClientId() {
    const ids = STORE_CONFIG.paypalClientIds || {};
    if (ids[STORE_MODE]) return String(ids[STORE_MODE]).trim();
    if (STORE_MODE === "sandbox" && STORE_CONFIG.paypalClientId) return String(STORE_CONFIG.paypalClientId).trim();
    return "";
  }

  function safeUrl(value, fallback = "#") {
    const url = String(value || "").trim();
    if (!url) return fallback;
    if (/^(javascript|data|vbscript):/i.test(url)) return fallback;
    return url;
  }

  function updateModeNote() {
    if (!modeNote) return;
    modeNote.textContent = STORE_MODE === "live"
      ? "目前付款流程使用 PayPal 正式收款模式。"
      : "目前付款流程使用 PayPal Sandbox 測試模式；日後可於設定切換正式收款。";
  }

  function configReady() {
    return Boolean(SUPABASE_URL && SUPABASE_KEY && FUNCTIONS_BASE_URL && PAYPAL_CLIENT_ID);
  }

  function createClient() {
    if (!window.supabase || !SUPABASE_URL || !SUPABASE_KEY) return null;
    if (!state.client) state.client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    return state.client;
  }

  function normalizeDelivery(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value.map(String).filter(Boolean);
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return normalizeDelivery(parsed);
      } catch (_) {
        return value.split(/[,、\n]/).map(item => item.trim()).filter(Boolean);
      }
    }
    if (typeof value === "object") return Object.values(value).flat().map(String).filter(Boolean);
    return [];
  }

  function normalizeLicense(row) {
    const code = String(row.code || "").trim().toUpperCase();
    return {
      id: String(row.id || ""),
      productId: String(row.product_id || row.productId || ""),
      code,
      name: String(row.name || code || "授權方案"),
      description: String(row.description || ""),
      price: Number(row.price ?? 0),
      currency: String(row.currency || STORE_CONFIG.currency || "USD").toUpperCase(),
      deliveryContents: normalizeDelivery(row.delivery_contents),
      termsUrl: safeUrl(row.terms_url || "terms.html#beat-license", "terms.html#beat-license"),
      isActive: row.is_active !== false
    };
  }

  function sortLicenses(licenses) {
    return licenses
      .filter(license => license.id && license.isActive)
      .sort((a, b) => {
        const ai = LICENSE_ORDER.indexOf(a.code);
        const bi = LICENSE_ORDER.indexOf(b.code);
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi) || a.price - b.price;
      });
  }

  function normalizeProduct(row) {
    const slug = normalizeSlug(row.slug || row.sku || row.name || row.id);
    const fallback = FALLBACK_ASSETS[slug] || {};
    const licenses = Array.isArray(row.product_licenses)
      ? row.product_licenses
      : Array.isArray(row.licenses)
        ? row.licenses
        : [];
    return {
      id: String(row.id || ""),
      sku: String(row.sku || ""),
      slug,
      name: String(row.name || "Untitled Beat"),
      description: String(row.description || ""),
      coverUrl: safeUrl(row.cover_url || fallback.cover || "", ""),
      previewUrl: safeUrl(row.preview_url || fallback.preview || "", ""),
      isActive: row.is_active !== false,
      licenses: sortLicenses(licenses.map(normalizeLicense))
    };
  }

  async function fetchProducts() {
    const client = createClient();
    if (!client) throw new Error("商店設定尚未完成，請確認 Supabase 公開設定。");

    const relationQuery = await client
      .from("products")
      .select("id, sku, slug, name, description, cover_url, preview_url, is_active, product_licenses(id, product_id, code, name, description, price, currency, delivery_contents, terms_url, is_active)")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (!relationQuery.error && Array.isArray(relationQuery.data)) {
      return relationQuery.data.map(normalizeProduct).filter(product => product.isActive);
    }

    const productsQuery = await client
      .from("products")
      .select("id, sku, slug, name, description, cover_url, preview_url, is_active")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (productsQuery.error) throw new Error(productsQuery.error.message || "無法讀取 Beat 商品。");

    const products = Array.isArray(productsQuery.data) ? productsQuery.data : [];
    const productIds = products.map(product => product.id).filter(Boolean);
    if (!productIds.length) return [];

    const licensesQuery = await client
      .from("product_licenses")
      .select("id, product_id, code, name, description, price, currency, delivery_contents, terms_url, is_active")
      .in("product_id", productIds)
      .eq("is_active", true);

    if (licensesQuery.error) throw new Error(licensesQuery.error.message || "無法讀取授權方案。");

    const licenses = Array.isArray(licensesQuery.data) ? licensesQuery.data : [];
    return products.map(product => ({
      ...product,
      product_licenses: licenses.filter(license => String(license.product_id) === String(product.id))
    })).map(normalizeProduct).filter(product => product.isActive);
  }

  function formatPrice(license) {
    if (!Number.isFinite(license.price) || license.price <= 0) return "另行報價";
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: license.currency || STORE_CONFIG.currency || "USD",
        maximumFractionDigits: Number.isInteger(license.price) ? 0 : 2
      }).format(license.price);
    } catch (_) {
      return `${license.currency || "USD"} ${license.price}`;
    }
  }

  function deliveryHtml(items) {
    const list = items.length ? items : ["授權檔案", "音訊檔案", "授權 PDF"];
    return `<ul>${list.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  }

  function renderDownloads(result, target) {
    const downloads = Array.isArray(result.downloads)
      ? result.downloads
      : Array.isArray(result.files)
        ? result.files
        : [];

    if (!downloads.length) {
      target.innerHTML = `<div class="beat-shop-alert error">目前沒有可下載檔案，請聯絡 Xiaxguang 協助確認訂單。</div>`;
      return false;
    }

    target.innerHTML = `
      <div class="beat-download-ready">
        <h3>下載檔案</h3>
        <div class="beat-download-buttons">
          ${downloads.map(file => {
            const href = safeUrl(file.signed_url || file.url || "", "");
            if (!href) return "";
            const label = file.display_name || file.name || file.file_name || "商品檔案";
            return `<a class="button primary" href="${escapeHtml(href)}" rel="noopener" target="_blank">下載 ${escapeHtml(label)}</a>`;
          }).join("")}
        </div>
        <p>下載連結每次產生後有效 5 分鐘；連結過期可重新取得，不需要再次付款。</p>
      </div>
    `;
    return true;
  }

  function renderStore() {
    const savedToken = sessionStorage.getItem(TOKEN_KEY);

    if (!state.products.length) {
      app.innerHTML = `
        <div class="empty-state">目前沒有可購買的 Beat 商品，請稍後再查看或直接聯絡 Xiaxguang。</div>
      `;
      return;
    }

    app.innerHTML = `
      ${savedToken ? `
        <div class="beat-shop-restore glass-panel">
          <div>
            <strong>已偵測到最近一次購買紀錄</strong>
            <p>可重新產生短效下載連結，不需要再次付款。</p>
          </div>
          <button class="button secondary" type="button" data-refresh-downloads>重新取得下載連結</button>
          <div id="beatRestoreDownloads" class="beat-restore-downloads"></div>
        </div>
      ` : ""}
      <div class="beat-shop-grid">
        ${state.products.map(product => {
          const isTarget = REQUESTED_BEAT && normalizeSlug(REQUESTED_BEAT) === product.slug;
          return `
            <article class="beat-shop-card glass-panel ${isTarget ? "is-target" : ""}" id="beat-product-${escapeHtml(product.slug)}">
              <div class="beat-shop-cover">
                ${product.coverUrl ? `<img src="${escapeHtml(product.coverUrl)}" alt="${escapeHtml(product.name)} Beat 封面" width="980" height="980" loading="lazy" decoding="async">` : `<span class="brand-placeholder">XIAXGUANG</span>`}
              </div>
              <div class="beat-shop-copy">
                <span class="meta-line">${escapeHtml(product.sku || "Licensed Beat")}</span>
                <h2>${escapeHtml(product.name)}</h2>
                <p>${escapeHtml(product.description || "可線上試聽並選擇授權方案，付款完成後取得私人下載連結。")}</p>
                ${product.previewUrl ? `<audio class="beat-preview" controls preload="metadata" src="${escapeHtml(product.previewUrl)}"></audio>` : ""}
              </div>
              <div class="license-grid">
                ${product.licenses.length ? product.licenses.map(license => `
                  <article class="license-card">
                    <div>
                      <span>${escapeHtml(license.code || "LICENSE")}</span>
                      <h3>${escapeHtml(license.name)}</h3>
                      <strong>${escapeHtml(formatPrice(license))}</strong>
                      <p>${escapeHtml(license.description || "適合依方案範圍使用 Beat 伴奏。")}</p>
                    </div>
                    <div class="license-delivery">
                      <small>交付內容</small>
                      ${deliveryHtml(license.deliveryContents)}
                    </div>
                    <div class="license-actions">
                      <a href="${escapeHtml(license.termsUrl)}" target="_blank" rel="noreferrer">查看條款</a>
                      <button class="button primary" type="button" data-checkout data-product-id="${escapeHtml(product.id)}" data-license-id="${escapeHtml(license.id)}">購買授權</button>
                    </div>
                  </article>
                `).join("") : `<div class="beat-shop-alert">此 Beat 目前尚未開放線上授權，請聯絡 Xiaxguang 洽詢。</div>`}
              </div>
            </article>
          `;
        }).join("")}
      </div>
    `;

    const target = REQUESTED_BEAT ? document.getElementById(`beat-product-${normalizeSlug(REQUESTED_BEAT)}`) : null;
    if (target) setTimeout(() => target.scrollIntoView({ block: "center", behavior: "smooth" }), 120);
  }

  function setStatus(message, type = "info") {
    if (!checkoutStatus) return;
    checkoutStatus.className = `beat-checkout-status ${type}`;
    checkoutStatus.textContent = message || "";
  }

  function setBusy(isBusy) {
    state.busy = Boolean(isBusy);
    modal?.classList.toggle("is-busy", state.busy);
  }

  function selectedSummaryHtml(product, license) {
    return `
      <div class="beat-checkout-product">
        ${product.coverUrl ? `<img src="${escapeHtml(product.coverUrl)}" alt="${escapeHtml(product.name)} Beat 封面" width="980" height="980" loading="lazy" decoding="async">` : `<span class="brand-placeholder">XIAXGUANG</span>`}
        <div>
          <span>${escapeHtml(product.sku || "Beat License")}</span>
          <h3>${escapeHtml(product.name)}</h3>
          <p>${escapeHtml(product.description || "Beat 伴奏授權購買。")}</p>
        </div>
      </div>
      <div class="beat-checkout-license">
        <span>${escapeHtml(license.code || "LICENSE")}</span>
        <strong>${escapeHtml(license.name)}｜${escapeHtml(formatPrice(license))}</strong>
        <p>${escapeHtml(license.description || "請依授權範圍使用此 Beat。")}</p>
        <div>
          <small>交付內容</small>
          ${deliveryHtml(license.deliveryContents)}
        </div>
        <a href="${escapeHtml(license.termsUrl)}" target="_blank" rel="noreferrer">開啟授權條款</a>
      </div>
    `;
  }

  function findProduct(productId) {
    return state.products.find(product => String(product.id) === String(productId));
  }

  function findLicense(product, licenseId) {
    return product?.licenses.find(license => String(license.id) === String(licenseId));
  }

  async function loadPayPalSdk() {
    if (window.paypal?.Buttons) return window.paypal;
    if (state.paypalSdkPromise) return state.paypalSdkPromise;

    state.paypalSdkPromise = new Promise((resolve, reject) => {
      const existing = document.getElementById("paypal-sdk");
      if (existing) {
        existing.addEventListener("load", () => resolve(window.paypal), { once: true });
        existing.addEventListener("error", reject, { once: true });
        return;
      }

      const script = document.createElement("script");
      script.id = "paypal-sdk";
      script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(PAYPAL_CLIENT_ID)}&currency=${encodeURIComponent(STORE_CONFIG.currency || "USD")}&intent=capture&components=buttons`;
      script.async = true;
      script.onload = () => window.paypal?.Buttons ? resolve(window.paypal) : reject(new Error("PayPal SDK 載入失敗。"));
      script.onerror = () => reject(new Error("PayPal SDK 載入失敗。"));
      document.head.appendChild(script);
    });

    return state.paypalSdkPromise;
  }

  async function callEdgeFunction(name, body) {
    const response = await fetch(`${FUNCTIONS_BASE_URL}/${name}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY
      },
      body: JSON.stringify(body)
    });

    const text = await response.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch (_) {
      throw new Error("伺服器回傳格式暫時無法讀取，請稍後再試。");
    }

    if (!response.ok || data.ok === false) {
      throw new Error(data.message || data.error || "伺服器請求失敗，請稍後再試。");
    }

    return data;
  }

  async function loadDownloads(downloadToken) {
    const result = await callEdgeFunction("order-downloads", { download_token: downloadToken });
    const rendered = renderDownloads(result, downloadList);
    if (rendered) setStatus("付款成功，下載連結已準備完成。", "success");
  }

  async function renderPayPalButtons() {
    paypalButtons.innerHTML = "";
    const paypal = await loadPayPalSdk();

    if (state.paypalButtons?.close) {
      try {
        state.paypalButtons.close();
      } catch (_) {}
    }

    state.paypalButtons = paypal.Buttons({
      style: {
        layout: "vertical",
        shape: "rect",
        label: "paypal"
      },
      onClick: (_data, actions) => {
        if (!termsAgree.checked) {
          setStatus("請先勾選同意授權條款後再付款。", "error");
          return actions.reject();
        }
        return actions.resolve();
      },
      createOrder: async () => {
        try {
          setBusy(true);
          downloadList.innerHTML = "";
          setStatus("正在建立 PayPal 訂單...", "info");
          const result = await callEdgeFunction("paypal-create-order", {
            license_id: state.selectedLicense.id
          });
          if (!result.paypal_order_id) throw new Error("後端沒有回傳 PayPal 訂單編號。");
          setStatus("訂單已建立，請在 PayPal 視窗中核准付款。", "info");
          return result.paypal_order_id;
        } catch (error) {
          setBusy(false);
          setStatus(error.message || "訂單建立失敗，請稍後再試。", "error");
          throw error;
        }
      },
      onApprove: async data => {
        try {
          setBusy(true);
          setStatus("付款核准完成，正在確認收款...", "info");
          const paymentResult = await callEdgeFunction("paypal-capture-order", {
            paypal_order_id: data.orderID
          });
          if (paymentResult.payment_completed !== true) {
            setBusy(false);
            setStatus(paymentResult.message || "付款仍在處理中，尚未完成。", "info");
            return;
          }
          if (!paymentResult.download_token) throw new Error("付款已完成，但下載憑證尚未建立。");
          sessionStorage.setItem(TOKEN_KEY, paymentResult.download_token);
          setStatus("付款成功，正在準備私人下載檔案...", "info");
          await loadDownloads(paymentResult.download_token);
          setBusy(false);
        } catch (error) {
          setBusy(false);
          setStatus(error.message || "付款確認失敗，請聯絡 Xiaxguang 協助處理。", "error");
        }
      },
      onCancel: () => {
        setBusy(false);
        setStatus("付款已取消，尚未完成訂單。", "info");
      },
      onError: () => {
        setBusy(false);
        setStatus("付款流程暫時無法完成，請稍後再試或聯絡 Xiaxguang。", "error");
      }
    });

    if (state.paypalButtons.isEligible && !state.paypalButtons.isEligible()) {
      setStatus("目前瀏覽器無法顯示 PayPal 按鈕，請稍後再試或聯絡 Xiaxguang。", "error");
      return;
    }

    await state.paypalButtons.render("#beatPaypalButtons");
  }

  async function openCheckout(productId, licenseId) {
    const product = findProduct(productId);
    const license = findLicense(product, licenseId);
    if (!product || !license) return;

    state.selectedProduct = product;
    state.selectedLicense = license;
    state.previousFocus = document.activeElement;
    checkoutSummary.innerHTML = selectedSummaryHtml(product, license);
    termsAgree.checked = false;
    downloadList.innerHTML = "";
    paypalButtons.innerHTML = "";
    setStatus("請確認授權內容並勾選同意條款。", "info");
    modal.hidden = false;
    document.body.classList.add("beat-modal-open");
    checkoutClose?.focus();

    if (!configReady()) {
      setStatus(STORE_MODE === "live" ? "正式收款設定尚未完成，請先補上 PayPal Live Client ID。" : "付款設定尚未完成，請聯絡 Xiaxguang。", "error");
      return;
    }

    try {
      await renderPayPalButtons();
    } catch (error) {
      setStatus(error.message || "PayPal 按鈕載入失敗，請稍後再試。", "error");
    }
  }

  function closeCheckout() {
    if (!modal || state.busy) return;
    modal.hidden = true;
    document.body.classList.remove("beat-modal-open");
    downloadList.innerHTML = "";
    paypalButtons.innerHTML = "";
    state.previousFocus?.focus?.();
  }

  async function refreshDownloads() {
    const token = sessionStorage.getItem(TOKEN_KEY);
    const holder = document.getElementById("beatRestoreDownloads");
    if (!token || !holder) return;

    holder.innerHTML = `<div class="beat-shop-alert">正在重新產生下載連結...</div>`;
    try {
      const result = await callEdgeFunction("order-downloads", { download_token: token });
      renderDownloads(result, holder);
    } catch (error) {
      holder.innerHTML = `<div class="beat-shop-alert error">${escapeHtml(error.message || "下載連結重新產生失敗，請聯絡 Xiaxguang。")}</div>`;
    }
  }

  function bindEvents() {
    app.addEventListener("click", event => {
      const checkoutButton = event.target.closest("[data-checkout]");
      if (checkoutButton) {
        openCheckout(checkoutButton.dataset.productId, checkoutButton.dataset.licenseId);
        return;
      }

      const refreshButton = event.target.closest("[data-refresh-downloads]");
      if (refreshButton) refreshDownloads();
    });

    checkoutClose?.addEventListener("click", closeCheckout);
    modal?.addEventListener("click", event => {
      if (event.target === modal) closeCheckout();
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && modal && !modal.hidden) closeCheckout();
    });
    document.addEventListener("play", event => {
      if (event.target instanceof HTMLAudioElement) {
        document.querySelectorAll("audio").forEach(audio => {
          if (audio !== event.target) audio.pause();
        });
      }
    }, true);
  }

  async function init() {
    if (!app) return;
    updateModeNote();
    bindEvents();

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      app.innerHTML = `<div class="empty-state">商店資料來源尚未設定，請先補上 Supabase 公開設定。</div>`;
      return;
    }

    try {
      state.products = await fetchProducts();
      renderStore();
    } catch (error) {
      app.innerHTML = `<div class="empty-state">${escapeHtml(error.message || "Beat 商店資料暫時無法載入，請稍後再試。")}</div>`;
    }
  }

  init();
})();
