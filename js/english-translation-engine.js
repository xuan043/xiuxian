/* ============================================================
 * 四级英语修行阁 —— 中译英引擎
 * ============================================================ */
(function (global) {
  'use strict';
  const E = global.XEngine;
  const D = global.XTranslationData;

  function mod() { return E.getModules().english; }
  function save() { E.save(); }

  function randInt(n) { return Math.floor(Math.random() * n); }
  function sample(arr, n) {
    const copy = arr.slice(); const out = [];
    for (let i = 0; i < n && copy.length; i++) out.push(copy.splice(randInt(copy.length), 1)[0]);
    return out;
  }

  function todayStr() { return E.todayStr(); }

  function ensureTodayTranslations() {
    const m = mod();
    const t = todayStr();
    if (m.lastTranslationBatch === t && m.todayTranslations) return m.todayTranslations;
    const pool = D.TRANSLATION_BANK.map(q => q.id);
    const ids = sample(pool, D.DAILY_TRANSLATION_LIMIT);
    m.lastTranslationBatch = t;
    m.todayTranslations = ids;
    m.translationsDone = false;
    save();
    return ids;
  }

  function getTodayTranslations() { return ensureTodayTranslations(); }

  function getQuestion(id) { return D.TRANSLATION_BANK.find(q => q.id === id); }

  // 提交所有今日中译英，返回对比结果
  function submit(attempts) {
    const ids = getTodayTranslations();
    const results = [];
    let nonEmpty = 0;
    ids.forEach(id => {
      const q = getQuestion(id);
      const typed = (attempts[id] || '').trim();
      if (typed) nonEmpty++;
      results.push({ id, cn: q.cn, ref: q.ref, typed, ok: typed.length > 0 });
    });
    if (nonEmpty < ids.length) return { ok: false, msg: `请完成全部 ${ids.length} 题后再提交` };
    const m = mod();
    if (m.translationsDone) return { ok: false, msg: '今日中译英已完成' };
    m.translationsDone = true;
    save();
    const r = E.addExp(50, true, '中译英悟道', `完成中译英 ${ids.length} 题`);
    return { ok: true, ...r, results };
  }

  function isDone() { return !!mod().translationsDone; }

  function stats() {
    const ids = getTodayTranslations();
    return { total: ids.length, done: isDone() ? ids.length : 0 };
  }

  global.XTranslationEngine = {
    ensureTodayTranslations, getTodayTranslations, getQuestion,
    submit, isDone, stats
  };
})(window);
