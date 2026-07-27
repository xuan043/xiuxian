/* ============================================================
 * Python悟道洞府 —— 学习引擎
 * ============================================================ */
(function (global) {
  'use strict';
  const E = global.XEngine;
  const D = global.XPythonData;

  function mod() { return E.getModules().python; }

  function node(id) { return D.PY_NODES.find(n => n.id === id); }

  function isLearned(id) { return !!mod().learned[id]; }

  function allNodes() { return D.PY_NODES; }

  function learnedList() {
    const m = mod();
    return D.PY_NODES.filter(n => m.learned[n.id]).map(n => {
      return Object.assign({}, n, { date: m.learned[n.id].date, exp: m.learned[n.id].exp });
    });
  }

  function todoList() {
    const m = mod();
    return D.PY_NODES.filter(n => !m.learned[n.id]);
  }

  function stats() {
    const m = mod();
    const total = D.PY_NODES.length;
    const done = Object.keys(m.learned).length;
    return { total, done, remain: total - done };
  }

  // 学习打卡：每个知识点基础 100 经验（按倍率）
  function learn(id) {
    const n = node(id);
    if (!n) return { ok: false, msg: '未找到该术法' };
    if (isLearned(id)) return { ok: false, msg: '该术法已修习，无需重复' };
    const m = mod();
    const r = E.addExp(100, true, 'Python悟道', `修习术法·${n.title}`);
    m.learned[id] = { learned: true, date: E.todayStr(), exp: r.gained };
    E.save();
    return { ok: true, ...r, node: n };
  }

  global.XPythonEngine = {
    node, isLearned, allNodes, learnedList, todoList, stats, learn
  };
})(window);
