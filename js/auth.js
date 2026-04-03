// ============================================================
// auth.js — セッション管理
// ============================================================

const Auth = {
  SESSION_KEY: "univa_session",

  /** ログイン情報を保存 */
  save(sessionToken, uid, displayName) {
    Utils.storage.set(this.SESSION_KEY, { sessionToken, uid, displayName });
  },

  /** セッション情報を取得 */
  get() {
    return Utils.storage.get(this.SESSION_KEY);
  },

  /** セッショントークンを取得 */
  token() {
    const s = this.get();
    return s ? s.sessionToken : null;
  },

  /** ログイン済みかチェック。未ログインならindex.htmlへリダイレクト */
  require() {
    if (!this.token()) {
      location.href = "/UNIVA-Q-A-1/index.html";
      return null;
    }
    return this.get();
  },

  /** ログアウト */
  async logout() {
    const token = this.token();
    if (token) {
      await Api.logout(token);
    }
    Utils.storage.del(this.SESSION_KEY);
    location.href = "/UNIVA-Q-A-1/index.html";
  },

  /** ヘッダーのユーザー名を設定 */
  setHeaderUser() {
    const s = this.get();
    if (!s) return;
    const el = document.getElementById("header-username");
    if (el) el.textContent = s.displayName;
  },
};

window.Auth = Auth;
