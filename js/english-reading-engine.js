/* ============================================================
 * 四级英语修行阁 —— 阅读理解引擎
 * ============================================================ */
(function (global) {
  'use strict';
  const E = global.XEngine;
  const D = global.XReadingData;

  function mod() { return E.getModules().english; }
  function save() { E.save(); }

  function randInt(n) { return Math.floor(Math.random() * n); }
  function sample(arr, n) {
    const copy = arr.slice(); const out = [];
    for (let i = 0; i < n && copy.length; i++) out.push(copy.splice(randInt(copy.length), 1)[0]);
    return out;
  }

  function todayStr() { return E.todayStr(); }

  // 每日抽取今日阅读篇目
  function ensureTodayReadings() {
    const m = mod();
    const t = todayStr();
    if (m.lastReadingBatch === t && m.todayReadings) return m.todayReadings;
    const pool = D.READING_BANK.map(a => a.id);
    const ids = sample(pool, D.DAILY_READING_LIMIT);
    m.lastReadingBatch = t;
    m.todayReadings = ids;
    m.readingsDone = [];
    save();
    return ids;
  }

  function getTodayReadings() { return ensureTodayReadings(); }

  function getArticle(id) { return D.READING_BANK.find(a => a.id === id); }

  function getCurrentIndex() { return mod().readingIndex || 0; }
  function setCurrentIndex(i) { mod().readingIndex = i; save(); }

  function finishCurrent() {
    const m = mod();
    const idx = getCurrentIndex();
    const ids = getTodayReadings();
    const id = ids[idx];
    if (!id || (m.readingsDone || []).includes(id)) return { ok: false, msg: '本篇已打卡' };
    m.readingsDone = m.readingsDone || [];
    m.readingsDone.push(id);
    save();
    const r = E.addExp(25, true, '阅读悟道', `完成四级阅读 1 篇`);
    return { ok: true, ...r, id };
  }

  function allFinished() {
    const m = mod();
    return (m.readingsDone || []).length >= getTodayReadings().length;
  }

  function stats() {
    const ids = getTodayReadings();
    const done = mod().readingsDone || [];
    return { total: ids.length, done: done.length, remain: ids.length - done.length };
  }

  global.XReadingEngine = {
    ensureTodayReadings, getTodayReadings, getArticle,
    getCurrentIndex, setCurrentIndex, finishCurrent, allFinished, stats
  };
})(window);
