// ============================================================
// utils.js — ユーティリティ関数
// ============================================================

const Utils = {
  /** 相対時間表示 */
  timeAgo(dateStr) {
    if (!dateStr) return "";
    const d   = new Date(dateStr);
    const now = new Date();
    const sec = Math.floor((now - d) / 1000);
    if (sec < 60)   return "たった今";
    if (sec < 3600) return `${Math.floor(sec / 60)}分前`;
    if (sec < 86400)return `${Math.floor(sec / 3600)}時間前`;
    if (sec < 2592000) return `${Math.floor(sec / 86400)}日前`;
    return d.toLocaleDateString("ja-JP");
  },

  /** ステータスバッジHTMLを返す */
  statusBadge(status) {
    const map = {
      pending:    ["pending",    "待機中"],
      processing: ["processing", "生成中…"],
      answered:   ["answered",   "回答済"],
      error:      ["error",      "エラー"],
    };
    const [cls, label] = map[status] || ["pending", status];
    return `<span class="badge badge-${cls}">${label}</span>`;
  },

  /** タグ文字列 → HTML */
  tagsHtml(tagsStr, clickable = false) {
    if (!tagsStr) return "";
    return tagsStr.split(",")
      .map(t => t.trim()).filter(Boolean)
      .map(t => clickable
        ? `<span class="tag" data-tag="${Utils.esc(t)}">${Utils.esc(t)}</span>`
        : `<span class="tag">${Utils.esc(t)}</span>`
      ).join("");
  },

  /** XSSサニタイズ */
  esc(str) {
    return String(str || "")
      .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
      .replace(/"/g,"&quot;").replace(/'/g,"&#39;");
  },

  /** URLパラメータ取得 */
  param(name) {
    return new URLSearchParams(location.search).get(name) || "";
  },

  /** アラートを表示 */
  showAlert(container, message, type = "error") {
    if (!container) return;
    container.innerHTML = `<div class="alert alert-${type}">${Utils.esc(message)}</div>`;
    container.scrollIntoView({ behavior: "smooth", block: "nearest" });
  },

  /** ローカルストレージ */
  storage: {
    set(key, val) { localStorage.setItem(key, JSON.stringify(val)); },
    get(key)      { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } },
    del(key)      { localStorage.removeItem(key); },
  },
};

window.Utils = Utils;
