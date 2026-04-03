// ============================================================
// wordcloud.js — ワードクラウド描画
// kuromoji.js (CDN) + wordcloud2.js (CDN) を使用
// ============================================================

const WordCloud = {
  currentMode: "recent",
  keyword: "",
  tokenizer: null,

  async init(canvas) {
    this.canvas = canvas;

    // kuromoji 初期化（CDNから読み込み）
    await new Promise((resolve, reject) => {
      kuromoji.builder({ dicPath: "https://cdn.jsdelivr.net/npm/kuromoji@0.1.2/dict" })
        .build((err, t) => {
          if (err) { console.warn("kuromoji初期化失敗（形態素解析なしで動作）:", err); resolve(); return; }
          this.tokenizer = t;
          resolve();
        });
    });
  },

  /** テキストリストから単語頻度マップを生成 */
  tokenize(texts) {
    const freq = {};
    const stopWords = new Set(["する", "なる", "ある", "いる", "こと", "これ", "それ",
      "ため", "ような", "など", "もの", "について", "という", "その", "この"]);

    texts.forEach(text => {
      if (this.tokenizer) {
        const tokens = this.tokenizer.tokenize(text);
        tokens.forEach(t => {
          const pos = t.pos;
          const surface = t.surface_form;
          // 名詞・動詞・形容詞のみ、2文字以上
          if ((pos === "名詞" || pos === "動詞" || pos === "形容詞") &&
               surface.length >= 2 && !stopWords.has(surface)) {
            freq[surface] = (freq[surface] || 0) + 1;
          }
        });
      } else {
        // フォールバック: スペース区切りで単語を数える
        text.split(/[\s　、。！？・]+/).forEach(w => {
          if (w.length >= 2) freq[w] = (freq[w] || 0) + 1;
        });
      }
    });

    return freq;
  },

  /** ワードクラウドを描画 */
  async render(sessionToken, mode, keyword = "") {
    this.currentMode = mode;
    this.keyword     = keyword;

    const res = await Api.getWordcloud(sessionToken, mode, keyword);
    if (!res.success || !res.data) return;

    const texts = res.data.texts || [];
    if (!texts.length) {
      this.clear();
      return;
    }

    const freq = this.tokenize(texts);
    const wordList = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 60)
      .map(([text, weight]) => [text, weight]);

    if (typeof wordcloud2 !== "undefined" || typeof WordCloud2 !== "undefined") {
      const WC = window.WordCloud || window.wordcloud2;
      WC(this.canvas, {
        list:            wordList,
        gridSize:        8,
        weightFactor:    function(size) { return Math.max(14, size * 3); },
        fontFamily:      "'Noto Sans JP', sans-serif",
        color:           function() {
          const colors = ["#00d4ff", "#7c3aed", "#00ff88", "#ffb800", "#a78bfa"];
          return colors[Math.floor(Math.random() * colors.length)];
        },
        backgroundColor: "#0f1629",
        rotateRatio:     0.3,
        click: function(item) {
          const searchInput = document.getElementById("search-input");
          if (searchInput) {
            searchInput.value = item[0];
            searchInput.dispatchEvent(new Event("input"));
          }
        },
      });
    }
  },

  clear() {
    if (!this.canvas) return;
    const ctx = this.canvas.getContext("2d");
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },
};

window.WordCloudManager = WordCloud;
