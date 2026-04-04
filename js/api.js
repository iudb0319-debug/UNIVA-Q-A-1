// ============================================================
// api.js — GAS API 呼び出しラッパー
// ============================================================

const API_URL = "https://script.google.com/macros/s/AKfycbwvhHZET-7y0NdJHeqAB6UUKEIPWgUfK75ic4EcLnICMBhmyZkpDcuIN-ddgnsSHQA-/exec";

const Api = {
  async post(action, body = {}) {
    const payload = Object.assign({ action }, body);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        redirect: "follow",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return json;
    } catch (err) {
      return { success: false, error: "通信エラー: " + err.message };
    }
  },

  // ── 認証 ──
  register(email, password, displayName) {
    return this.post("auth/register", { email, password, display_name: displayName });
  },
  verify(token) {
    return this.post("auth/verify", { token });
  },
  login(email, password) {
    return this.post("auth/login", { email, password });
  },
  logout(sessionToken) {
    return this.post("auth/logout", { session_token: sessionToken });
  },
  forgotPassword(email) {
    return this.post("auth/forgot-password", { email });
  },
  resetPassword(token, newPassword) {
    return this.post("auth/reset-password", { token, new_password: newPassword });
  },

  // ── 質問 ──
  createQuestion(sessionToken, title, body, genre, tags) {
    return this.post("questions/create", { session_token: sessionToken, title, body, genre, tags });
  },
  listQuestions(sessionToken, filters = {}) {
    return this.post("questions/list", Object.assign({ session_token: sessionToken }, filters));
  },
  getQuestion(sessionToken, qid) {
    return this.post("questions/get", { session_token: sessionToken, qid });
  },
  rateQuestion(sessionToken, qid, vote) {
    return this.post("questions/rate", { session_token: sessionToken, qid, vote });
  },
  getWordcloud(sessionToken, mode, keyword) {
    return this.post("questions/wordcloud", { session_token: sessionToken, mode, keyword });
  },
  getStatus(sessionToken, qid) {
    return this.post("questions/status", { session_token: sessionToken, qid });
  },
};

window.Api = Api;
