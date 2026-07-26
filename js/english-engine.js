/* ============================================================
 * 四级英语修行阁 —— 记忆调度引擎（艾宾浩斯 + 打卡）
 * 依赖 XEngine（存储）与 XEnglishData（词库）
 * ============================================================ */
(function (global) {
  'use strict';
  const E = global.XEngine;
  const D = global.XEnglishData;

  const DAY = 86400000;

  function mod() { return E.getModules().english; }
  function save() { E.save(); }

  function dayStart(ts) {
    const d = new Date(ts);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }
  function todayStart() { return dayStart(Date.now()); }

  // 抽取新词批次
  function pickNewBatch() {
    const m = mod();
    const learned = m.words;
    const pool = D.WORD_BANK.filter(w => !learned[w.w]);
    // 尽量从未学过的词中取
    const batch = [];
    const shuffle = pool.slice();
    for (let i = shuffle.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffle[i], shuffle[j]] = [shuffle[j], shuffle[i]];
    }
    const cnt = Math.min(D.NEW_WORDS_PER_BATCH, shuffle.length);
    for (let i = 0; i < cnt; i++) {
      const w = shuffle[i];
      learned[w.w] = {
        master: 0, stage: 'new', level: 0,
        nextReview: Date.now(), lastReview: null, history: [],
        cn: w.cn, ex: w.ex
      };
      batch.push(w.w);
    }
    save();
    return batch;
  }

  // 创建/获取今日学习批次（新词 + 今日复习配额），返回新词 key 列表
  function ensureTodayBatch() {
    const m = mod();
    const t = E.todayStr();
    if (m.lastWordBatch === t && m.todayNewWords) {
      // 已生成今日批次，确保复习配额也已就绪
      if (!m.todayReviewWords) m.todayReviewWords = pickDailyReviews();
      save();
      return m.todayNewWords;
    }
    const keys = pickNewBatch();
    m.lastWordBatch = t;
    m.todayNewWords = keys;
    m.todayReviewWords = pickDailyReviews();
    m.reviewedToday = false;
    save();
    return keys;
  }

  // 从到期复习词中取今日复习配额（最多 DAILY_REVIEW_LIMIT 个）
  function pickDailyReviews() {
    const m = mod();
    const end = todayStart() + DAY;
    const due = [];
    for (const key in m.words) {
      const rec = m.words[key];
      if (rec.stage === 'done') continue;
      if (rec.nextReview <= end) due.push(key);
    }
    // 按下次复习时间排序，早的优先
    due.sort((a, b) => (m.words[a].nextReview || 0) - (m.words[b].nextReview || 0));
    return due.slice(0, D.DAILY_REVIEW_LIMIT);
  }

  // 待复习单词（到期全部，用于展示）
  function getDueReviews() {
    const m = mod();
    const end = todayStart() + DAY;
    const due = [];
    for (const key in m.words) {
      const rec = m.words[key];
      if (rec.stage === 'done') continue;
      if (rec.nextReview <= end) due.push(key);
    }
    return due;
  }

  // 今日复习任务（配额内）
  function getTodayReviews() {
    return mod().todayReviewWords || [];
  }

  function getNewWords() {
    return mod().todayNewWords || [];
  }

  function getWordInfo(key) {
    const rec = mod().words[key];
    if (!rec) return null;
    const bank = D.WORD_BANK.find(w => w.w === key);
    return Object.assign({ w: key }, bank || {}, rec);
  }

  // 聆听词韵打卡（背单词）
  function checkListen() {
    const m = mod();
    const newKeys = ensureTodayBatch();
    const reviewKeys = getTodayReviews();
    if (newKeys.length === 0 && reviewKeys.length === 0) {
      return { ok: false, msg: '今日新词已学完，暂无可复习词' };
    }
    const r = E.addExp(50, true, '聆听词韵', `背诵新词 ${newKeys.length} 词 + 复习 ${reviewKeys.length} 词`);
    return { ok: true, ...r, newCount: newKeys.length, reviewCount: reviewKeys.length };
  }

  // 品读文句打卡（例句）
  function checkSentence() {
    const newKeys = ensureTodayBatch();
    if (newKeys.length === 0) {
      return { ok: false, msg: '今日新词已学完，明日再续' };
    }
    const r = E.addExp(50, true, '品读文句', `品读 ${newKeys.length} 条文句`);
    return { ok: true, ...r };
  }

  // 凝神书字（拼写自测）：对传入单词 key 列表评分
  // attempts: { key: typedString }
  function checkSpell(attempts) {
    let correct = 0, total = 0;
    const results = [];
    const m = mod();
    for (const key in attempts) {
      total++;
      const typed = (attempts[key] || '').trim().toLowerCase();
      const ok = typed === key.toLowerCase();
      results.push({ key, typed: attempts[key], ok });
      if (ok) {
        correct++;
        // 推进记忆阶段
        const rec = m.words[key];
        if (rec) {
          rec.master = Math.min(5, rec.master + 1);
          rec.level = Math.min(D.REVIEW_INTERVALS.length - 1, rec.level + 1);
          rec.lastReview = Date.now();
          rec.history.push({ t: Date.now(), ok: true });
          if (rec.level >= D.REVIEW_INTERVALS.length - 1) {
            rec.stage = 'done';
          } else {
            rec.stage = 'review';
            rec.nextReview = Date.now() + D.REVIEW_INTERVALS[rec.level] * DAY;
          }
        }
      } else {
        // 拼错：重置复习周期到第1阶
        const rec = m.words[key];
        if (rec) {
          rec.master = Math.max(0, rec.master - 1);
          rec.level = 0;
          rec.lastReview = Date.now();
          rec.history.push({ t: Date.now(), ok: false });
          rec.stage = rec.stage === 'new' ? 'new' : 'review';
          rec.nextReview = Date.now() + D.REVIEW_INTERVALS[0] * DAY;
        }
      }
    }
    save();
    const rate = total ? Math.round((correct / total) * 100) : 0;
    // 拼写自测基础经验 100（按倍率），但需至少完成一次
    const r = E.addExp(100, true, '凝神书字', `拼写自测 ${correct}/${total} 正确`);
    return { ok: true, ...r, correct, total, rate, results };
  }

  // 复习打卡（复习到期单词，推进记忆阶段）
  function reviewDue(keys) {
    const m = mod();
    const now = Date.now();
    let done = 0;
    keys.forEach(key => {
      const rec = m.words[key];
      if (!rec || rec.stage === 'done') return;
      rec.level = Math.min(D.REVIEW_INTERVALS.length - 1, rec.level + 1);
      rec.lastReview = now;
      rec.history.push({ t: now, ok: true });
      if (rec.level >= D.REVIEW_INTERVALS.length - 1) rec.stage = 'done';
      else { rec.stage = 'review'; rec.nextReview = now + D.REVIEW_INTERVALS[rec.level] * DAY; }
      done++;
    });
    m.reviewedToday = true;
    save();
    if (done === 0) return { ok: false, msg: '暂无可复习单词' };
    const r = E.addExp(50, true, '复习', `复习单词 ${done} 词`);
    return { ok: true, ...r, done };
  }

  // 统计掌握情况
  function stats() {
    const m = mod();
    let total = 0, done = 0, newCnt = 0, review = 0;
    for (const k in m.words) {
      total++;
      const s = m.words[k].stage;
      if (s === 'done') done++;
      else if (s === 'new') newCnt++;
      else review++;
    }
    return { total, done, newCnt, review };
  }

  const EnglishEngine = {
    DAY, ensureTodayBatch, getDueReviews, getTodayReviews, getNewWords, getWordInfo,
    checkListen, checkSentence, checkSpell, reviewDue, stats, pickNewBatch
  };
  global.XEnglishEngine = EnglishEngine;
})(window);
