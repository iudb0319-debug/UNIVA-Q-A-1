// ============================================================
// board.js — 掲示板ロジック (board.html)
// ============================================================

let state = {
  page: 1,
  limit: 20,
  total: 0,
  sort: "recent",
  genre: "",
  tags: [],
  keyword: "",
  questions: [],
};

async function loadQuestions() {
  const list = document.getElementById("question-list");
  list.innerHTML = `<div class="empty-state"><div class="spinner"></div></div>`;

  const res = await Api.listQuestions(Auth.token(), {
    page:    state.page,
    limit:   state.limit,
    sort:    state.sort,
    genre:   state.genre,
    tags:    state.tags,
    keyword: state.keyword,
  });

  if (!res.success) {
    list.innerHTML = `<div class="alert alert-error">${Utils.esc(res.error)}</div>`;
    return;
  }

  state.questions = res.data.questions || [];
  state.total     = res.data.total     || 0;

  renderQuestions();
  renderPagination();
}

function renderQuestions() {
  const list = document.getElementById("question-list");
  if (!state.questions.length) {
    list.innerHTML = `<div class="empty-state">
      <div class="empty-state-icon">🔭</div>
      <div class="empty-state-text">質問が見つかりません</div>
    </div>`;
    return;
  }

  list.innerHTML = state.questions.map(q => `
    <div class="card question-card" onclick="location.href='question.html?qid=${Utils.esc(q.qid)}'">
      <div class="question-card-header">
        <div class="question-title">${Utils.esc(q.title)}</div>
        ${Utils.statusBadge(q.status)}
      </div>
      <div class="question-meta">
        <span class="question-genre">${Utils.esc(q.genre || "その他")}</span>
        <div class="question-tags">${Utils.tagsHtml(Array.isArray(q.tags) ? q.tags.join(",") : q.tags, true)}</div>
        <span class="rating-display ${q.rating > 0 ? "positive" : q.rating < 0 ? "negative" : ""}">
          ${q.rating >= 0 ? "▲" : "▼"} ${Math.abs(q.rating)}
        </span>
        <span>👁 ${q.view_count || 0}</span>
        <span>${Utils.timeAgo(q.created_at)}</span>
      </div>
    </div>
  `).join("");

  // タグクリックで絞り込み
  list.querySelectorAll(".tag[data-tag]").forEach(el => {
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      const tag = el.dataset.tag;
      if (!state.tags.includes(tag)) {
        state.tags.push(tag);
        state.page = 1;
        loadQuestions();
        renderActiveFilters();
      }
    });
  });
}

function renderPagination() {
  const pag = document.getElementById("pagination");
  const totalPages = Math.ceil(state.total / state.limit);
  if (totalPages <= 1) { pag.innerHTML = ""; return; }

  let html = "";
  if (state.page > 1)
    html += `<button class="page-btn" onclick="goPage(${state.page - 1})">‹</button>`;

  const start = Math.max(1, state.page - 2);
  const end   = Math.min(totalPages, state.page + 2);
  for (let i = start; i <= end; i++) {
    html += `<button class="page-btn ${i === state.page ? "active" : ""}" onclick="goPage(${i})">${i}</button>`;
  }

  if (state.page < totalPages)
    html += `<button class="page-btn" onclick="goPage(${state.page + 1})">›</button>`;

  pag.innerHTML = html;
}

function goPage(p) {
  state.page = p;
  loadQuestions();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderActiveFilters() {
  const area = document.getElementById("active-filters");
  if (!area) return;
  const chips = state.tags.map(t =>
    `<span class="tag active" style="cursor:pointer" onclick="removeTag('${Utils.esc(t)}')">${Utils.esc(t)} ✕</span>`
  );
  area.innerHTML = chips.join("");
}

function removeTag(tag) {
  state.tags = state.tags.filter(t => t !== tag);
  state.page = 1;
  loadQuestions();
  renderActiveFilters();
}
window.removeTag = removeTag;
window.goPage    = goPage;

// ── 初期化 ──
document.addEventListener("DOMContentLoaded", () => {
  const session = Auth.require();
  if (!session) return;
  Auth.setHeaderUser();

  // 検索
  const searchInput = document.getElementById("search-input");
  let searchTimer;
  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.keyword = searchInput.value.trim();
      state.page = 1;
      loadQuestions();
    }, 400);
  });

  // ソート
  document.querySelectorAll(".sort-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".sort-tab").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.sort = btn.dataset.sort;
      state.page = 1;
      loadQuestions();
    });
  });

  // ジャンル
  document.querySelectorAll(".genre-checkbox").forEach(cb => {
    cb.addEventListener("change", () => {
      const checked = [...document.querySelectorAll(".genre-checkbox:checked")]
        .map(c => c.value);
      state.genre = checked[0] || "";
      state.page  = 1;
      loadQuestions();
    });
  });

  // ログアウト
  document.getElementById("logout-btn")?.addEventListener("click", () => Auth.logout());

  loadQuestions();
});
