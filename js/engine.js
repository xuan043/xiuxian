/* ============================================================
 * 修仙修为工作台 —— 数据存储与核心引擎层
 * 所有数据本地持久化（localStorage），经验数值永久不清空
 * ============================================================ */
(function (global) {
  'use strict';

  const STORAGE_KEY = 'xiuxian_workbench_v1';

  /* ---------- 灵根配置 ---------- */
  const ELEMENTS = ['金', '木', '水', '火', '土', '雷', '冰'];
  const ELEMENT_COLORS = {
    '金': '#e8c547', '木': '#5fae5f', '水': '#4a90d9', '火': '#e05a47',
    '土': '#b9885a', '雷': '#9b6bd6', '冰': '#6fd0e0', '混沌': '#c0c0ff'
  };
  // 灵根倍率（任务经验结算倍率）
  const ROOT_MULTIPLIER = {
    '混沌': 1.5, '极品': 1.3, '单': 1.1, '双': 1.0,
    '三': 0.9, '四': 0.8, '五': 0.7
  };

  /* ---------- 职业配置 ---------- */
  const PROFESSIONS = {
    '剑修': { slogan: '以剑证道，恒心为锋，勤学不辍，一往无前', icon: '🗡️' },
    '丹修': { slogan: '文火慢炼，日积月累，沉淀学识，方成大道', icon: '⚗️' },
    '符修': { slogan: '一笔一画，谨守章法，点滴积累，落笔生玄', icon: '📜' },
    '器修': { slogan: '千锤百炼，打磨自我，攻坚克难，铸就根基', icon: '🔨' }
  };
  // 多选职业门槛：选几个职业，境界门槛即乘以几（单职业 ×1，双职业 ×2）
  const MULTI_PROF_RATIO = 1; // 保留字段（语义见 profThresholdRatio：倍数=职业数）

  /* ---------- 境界配置（基础单职业门槛） ---------- */
  const REALMS = [
    { name: '炼气', stages: [500, 800, 1000] },
    { name: '筑基', stages: [1600, 2400, 3200] },
    { name: '金丹', stages: [4500, 6000, 8000] },
    { name: '元婴', stages: [11000, 15000, 20000] },
    { name: '化神', stages: [28000, 38000, 50000] },
    { name: '炼虚', stages: [65000, 85000, 110000] },
    { name: '合体', stages: [140000, 180000, 230000] },
    { name: '大乘', stages: [290000, 360000, 450000] },
    { name: '渡劫', stages: [560000, 680000, 820000] }
  ];

  /* ---------- 默认数据 ---------- */
  function defaultState() {
    return {
      version: 1,
      initialized: false,         // 是否完成开局
      spiritRoot: null,           // { type:'混沌'|'极品'|'单'..., elements:[], multiplier:1.3, label:'极品·金火' }
      profession: [],             // ['剑修', ...]
      totalExp: 0,                // 累计总经验（永久不清空）
      lastLoginDate: null,        // 上次登录日期 YYYY-MM-DD
      dailyClaimed: false,        // 今日俸禄是否已领
      log: [],                    // 修行日志 [{date,time,type,detail,exp}]
      modules: {                  // 各板块学习进度
        english: {
          words: {},              // wordKey -> { master:0-5, stage:'new'|'review'|'done', nextReview:ts, history:[] }
          lastWordBatch: null,
          reviewedToday: false,
          todayReviewWords: null,
          // 阅读理解
          lastReadingBatch: null,
          todayReadings: null,
          readingsDone: [],
          readingIndex: 0,
          // 中译英
          lastTranslationBatch: null,
          todayTranslations: null,
          translationsDone: false
        },
        python: {
          learned: {}             // nodeId -> { learned:true, date, exp }
        }
      },
      breakthroughAnimSeen: 0,    // 已播放突破动画的最高总经验节点
      createdAt: Date.now()
    };
  }

  /* ---------- 持久化 ---------- */
  let _state = null;

  function load() {
    if (_state) return _state;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        _state = Object.assign(defaultState(), JSON.parse(raw));
        // 保证嵌套对象存在
        _state.modules = Object.assign(defaultState().modules, _state.modules || {});
        _state.modules.english = Object.assign(defaultState().modules.english, _state.modules.english || {});
        _state.modules.python = Object.assign(defaultState().modules.python, _state.modules.python || {});
      } else {
        _state = defaultState();
      }
    } catch (e) {
      console.error('读取存档失败，重置', e);
      _state = defaultState();
    }
    return _state;
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(_state));
    } catch (e) {
      console.error('保存失败', e);
    }
  }

  function getState() { return load(); }
  // 用云端状态覆盖当前内存状态（同步合并后调用）
  function replaceState(newState) {
    _state = Object.assign(defaultState(), newState || {});
    _state.modules = Object.assign(defaultState().modules, _state.modules || {});
    _state.modules.english = Object.assign(defaultState().modules.english, _state.modules.english || {});
    _state.modules.python = Object.assign(defaultState().modules.python, _state.modules.python || {});
    save();
  }
  function resetAll() {
    _state = defaultState();
    save();
    return _state;
  }

  /* ---------- 工具 ---------- */
  function todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  function nowTime() {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
  function randInt(n) { return Math.floor(Math.random() * n); }
  function pick(arr) { return arr[randInt(arr.length)]; }

  /* ---------- 灵根抽取 ---------- */
  function drawSpiritRoot() {
    const r = Math.random();
    // 权重：混沌(2%) 极品(5%) 单(18%) 双(30%) 三(22%) 四(15%) 五(8%)
    let kind, elements = [], multiplier;
    if (r < 0.02) {
      kind = '混沌';
      elements = ['混沌'];
      multiplier = ROOT_MULTIPLIER['混沌'];
    } else if (r < 0.07) {
      kind = '极品';
      // 极品：同属性双灵根（高纯）
      const e = pick(ELEMENTS);
      elements = [e, e];
      multiplier = ROOT_MULTIPLIER['极品'];
    } else if (r < 0.25) {
      kind = '单';
      elements = [pick(ELEMENTS)];
      multiplier = ROOT_MULTIPLIER['单'];
    } else if (r < 0.55) {
      kind = '双';
      elements = sampleUnique(ELEMENTS, 2);
      multiplier = ROOT_MULTIPLIER['双'];
    } else if (r < 0.77) {
      kind = '三';
      elements = sampleUnique(ELEMENTS, 3);
      multiplier = ROOT_MULTIPLIER['三'];
    } else if (r < 0.92) {
      kind = '四';
      elements = sampleUnique(ELEMENTS, 4);
      multiplier = ROOT_MULTIPLIER['四'];
    } else {
      kind = '五';
      elements = sampleUnique(ELEMENTS, 5);
      multiplier = ROOT_MULTIPLIER['五'];
    }
    const label = buildRootLabel(kind, elements);
    return { type: kind, elements, multiplier, label };
  }
  function sampleUnique(arr, n) {
    const copy = arr.slice();
    const out = [];
    for (let i = 0; i < n; i++) out.push(copy.splice(randInt(copy.length), 1)[0]);
    return out;
  }
  function buildRootLabel(kind, elements) {
    if (kind === '混沌') return '混沌灵根·先天道体';
    if (kind === '极品') return `极品灵根·${elements[0]}属性大圆满`;
    const map = { '单': '单', '双': '双', '三': '三', '四': '四', '五': '五' };
    return `${map[kind]}灵根·${elements.join('')}`;
  }

  /* ---------- 职业 ---------- */
  function setProfession(list) {
    const s = load();
    s.profession = list.slice();
    save();
  }

  // 多选职业门槛系数：单职业 ×1，选 2 个职业即 ×2，选几个职业就 ×几
  function profThresholdRatio() {
    const s = load();
    const n = s.profession.length;
    return Math.max(1, n);
  }

  /* ---------- 境界计算 ---------- */
  // 构造扁平门槛列表：[{exp, realmIndex, stageIndex}]，按经验升序
  function flatThresholds() {
    const ratio = profThresholdRatio();
    const list = [];
    for (let i = 0; i < REALMS.length; i++) {
      for (let j = 0; j < REALMS[i].stages.length; j++) {
        list.push({ exp: Math.round(REALMS[i].stages[j] * ratio), realmIndex: i, stageIndex: j });
      }
    }
    return list; // 已按 realm/stage 顺序天然升序
  }
  function stageLabel(j) { return ['初期', '中期', '圆满'][j]; }

  // 返回 { realmName, stageName, realmIndex, stageIndex, currentThreshold, nextThreshold, progress, isMax }
  function computeRealm(totalExp) {
    const list = flatThresholds();
    let curIdx = -1; // 已达成的最后一个门槛下标
    for (let k = 0; k < list.length; k++) {
      if (totalExp >= list[k].exp) curIdx = k; else break;
    }
    const last = list[list.length - 1];
    if (curIdx < 0) {
      // 尚未达到最低门槛（炼气初期）
      const t = list[0];
      return {
        realmName: REALMS[t.realmIndex].name, stageName: stageLabel(t.stageIndex),
        realmIndex: t.realmIndex, stageIndex: t.stageIndex,
        currentThreshold: 0, nextThreshold: t.exp,
        progress: Math.min(100, Math.round((totalExp / t.exp) * 100)), isMax: false
      };
    }
    const cur = list[curIdx];
    if (curIdx === list.length - 1) {
      // 已达最高门槛
      return {
        realmName: REALMS[cur.realmIndex].name, stageName: stageLabel(cur.stageIndex),
        realmIndex: cur.realmIndex, stageIndex: cur.stageIndex,
        currentThreshold: cur.exp, nextThreshold: Infinity, progress: 100, isMax: true
      };
    }
    const nxt = list[curIdx + 1];
    const progress = Math.min(100, Math.round(((totalExp - cur.exp) / (nxt.exp - cur.exp)) * 100));
    return {
      realmName: REALMS[cur.realmIndex].name, stageName: stageLabel(cur.stageIndex),
      realmIndex: cur.realmIndex, stageIndex: cur.stageIndex,
      currentThreshold: cur.exp, nextThreshold: nxt.exp, progress, isMax: false
    };
  }

  // 返回经验变化后的境界（用于检测突破）
  function realmAfter(totalExp) {
    return computeRealm(totalExp);
  }

  /* ---------- 经验结算 ---------- */
  // 任务经验按灵根倍率结算；俸禄不受倍率影响
  function settleTaskExp(baseExp) {
    const s = load();
    const mult = s.spiritRoot ? s.spiritRoot.multiplier : 1.0;
    return Math.round(baseExp * mult);
  }

  // 添加经验，返回 { gained, before, after, realmBefore, realmAfter, brokeThrough }
  function addExp(baseExp, isTask, type, detail) {
    const s = load();
    const before = s.totalExp;
    const gained = isTask ? settleTaskExp(baseExp) : baseExp;
    s.totalExp = before + gained;
    const realmBefore = computeRealm(before);
    const realmAfter = computeRealm(s.totalExp);
    const brokeThrough = realmAfter.realmIndex > realmBefore.realmIndex ||
      (realmAfter.realmIndex === realmBefore.realmIndex && realmAfter.stageIndex > realmBefore.stageIndex);
    // 写入日志
    s.log.unshift({
      date: todayStr(), time: nowTime(),
      type: type || 'task', detail: detail || '',
      exp: gained, total: s.totalExp
    });
    if (s.log.length > 2000) s.log.length = 2000;
    save();
    return { gained, before, after: s.totalExp, realmBefore, realmAfter, brokeThrough, multiplier: s.spiritRoot ? s.spiritRoot.multiplier : 1 };
  }

  // 每日俸禄 100
  function claimDaily() {
    const s = load();
    const t = todayStr();
    if (s.lastLoginDate !== t) {
      s.lastLoginDate = t;
      s.dailyClaimed = false;
    }
    if (s.dailyClaimed) return { ok: false, msg: '今日俸禄已领取' };
    s.dailyClaimed = true;
    const r = addExp(400, false, '俸禄', '每日登录俸禄');
    save();
    return { ok: true, ...r };
  }

  function canClaimDaily() {
    const s = load();
    const t = todayStr();
    if (s.lastLoginDate !== t) return true;
    return !s.dailyClaimed;
  }

  /* ---------- 修行日志 ---------- */
  function getLog() { return load().log; }
  function getLogByDate(date) {
    return load().log.filter(l => l.date === date);
  }

  /* ---------- 模块数据 ---------- */
  function getModules() { return load().modules; }

  /* ---------- 导出 ---------- */
  const Engine = {
    STORAGE_KEY, ELEMENTS, ELEMENT_COLORS, ROOT_MULTIPLIER, PROFESSIONS, REALMS, MULTI_PROF_RATIO,
    load, save, getState, replaceState, resetAll,
    todayStr, nowTime,
    drawSpiritRoot, buildRootLabel,
    setProfession, profThresholdRatio,
    computeRealm, realmAfter,
    settleTaskExp, addExp, claimDaily, canClaimDaily,
    getLog, getLogByDate, getModules
  };

  global.XEngine = Engine;
})(window);
