/* ============================================================
 * 修仙修为工作台 —— 主应用（UI 渲染 + 交互 + 路由）
 * ============================================================ */
(function () {
  'use strict';
  const E = window.XEngine;
  const Eng = window.XEnglishEngine;
  const Py = window.XPythonEngine;
  const ReadEng = window.XReadingEngine;
  const TransEng = window.XTranslationEngine;

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---------- 工具 ---------- */
  function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
  function fmt(n) { return n.toLocaleString('en-US'); }
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 2200);
  }
  function rootColor(type) { return E.ELEMENT_COLORS[type] || '#d9b35c'; }

  // 单词/例句点读（英文 TTS）
  function speak(text) {
    if (!text) return;
    try {
      if (!('speechSynthesis' in window)) { toast('当前浏览器不支持朗读'); return; }
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US'; u.rate = 0.95; u.pitch = 1;
      window.speechSynthesis.speak(u);
    } catch (e) { toast('朗读失败'); }
  }

  /* ---------- 页面切换 ---------- */
  const PAGES = ['home', 'english', 'python', 'log', 'profile'];
  function go(page) {
    PAGES.forEach(p => $('#' + p).classList.toggle('active', p === page));
    $$('.tabbar .tb').forEach(tb => tb.classList.toggle('on', tb.dataset.page === page));
    if (page === 'home') renderHome();
    if (page === 'english') renderEnglish();
    if (page === 'python') renderPython();
    if (page === 'log') renderLog();
    if (page === 'profile') renderProfile();
    window.scrollTo(0, 0);
  }

  /* ---------- 云端同步状态 ---------- */
  let _syncStatus = { state: 'idle', msg: '' };
  function syncStatusText() {
    if (_syncStatus.state === 'syncing') return '☁️ 云端同步中…';
    if (_syncStatus.state === 'error') return '⚠️ 云端未连通（本机数据正常）';
    return '☁️ 已开启云端同步';
  }
  function registerSync() {
    if (window.XSync && window.XSync.setStatus) {
      window.XSync.setStatus((state, msg) => {
        _syncStatus = { state, msg: msg || '' };
        // 状态变化后轻量刷新可显示的页面
        const active = $('.page.active');
        if (active && active.id === 'home') renderHome();
        if (active && active.id === 'profile') renderProfile();
      });
    }
  }
  async function doPullAndMerge() {
    if (!window.XSync || !window.XSync.pull) return;
    const cloud = await window.XSync.pull();
    const merged = E.mergeFromCloud(cloud);
    if (merged) {
      toast('已从云端同步最新进度');
    }
  }

  /* ---------- 开场：首次/老用户 ---------- */
  function boot() {
    registerSync();
    renderStaticFrames();
    finishBoot();
  }

  function finishBoot() {
    const s = E.getState();
    if (!s.initialized) {
      showOnboarding();
    } else {
      ensureDaily();
      // 进入前先从云端拉取并合并（异步，不阻塞页面）
      doPullAndMerge().finally(() => { go('home'); });
      go('home');
    }
  }

  function ensureDaily() {
    if (E.canClaimDaily()) {
      // 进入时提示可领取，但不强制（首页有按钮）
    }
  }

  /* ============================================================
   * 开局流程：灵根抽取 → 职业选择 → 进入
   * ============================================================ */
  function showOnboarding() {
    const mask = $('#modal');
    mask.classList.add('show');
    mask.innerHTML = `
      <div class="modal" id="onb">
        <h3>✦ 启程 · 测灵根 ✦</h3>
        <p class="center muted">道友初次临世，天道将为你随机显化灵根。<br>灵根决定修行效率，倍率越高，悟道越快。</p>
        <div class="draw-stage">
          <div class="draw-orb" id="orb"></div>
          <div class="draw-result" id="drawRes">静待天机……</div>
        </div>
        <button class="btn btn-primary" id="drawBtn">⚡ 抽取灵根</button>
        <button class="btn btn-primary hidden" id="nextBtn">选定灵根 · 择道修行 →</button>
      </div>`;
    const drawBtn = $('#drawBtn'), nextBtn = $('#nextBtn'), drawRes = $('#drawRes');
    let drawn = null;
    drawBtn.onclick = () => {
      drawn = E.drawSpiritRoot();
      drawRes.innerHTML = `灵根显化：<b>${esc(drawn.label)}</b><br>
        <span class="muted">修炼倍率 ×${drawn.multiplier}</span>`;
      drawBtn.classList.add('hidden');
      nextBtn.classList.remove('hidden');
    };
    nextBtn.onclick = () => {
      if (!drawn) return;
      E.getState().spiritRoot = drawn; E.save();
      showProfessionChoice();
    };
  }

  function showProfessionChoice() {
    const mask = $('#modal');
    const profs = E.PROFESSIONS;
    mask.innerHTML = `
      <div class="modal">
        <h3>✦ 择道 · 修行职业 ✦</h3>
        <p class="center muted">可单选一道，亦可多择并行。<br>多修并行者，突破门槛将相应提升。</p>
        <div class="prof-grid" id="profGrid">
          ${Object.entries(profs).map(([k, v]) => `
            <div class="prof-card" data-prof="${k}">
              <div class="pn">${v.icon} ${k}</div>
              <div class="ps">「${v.slogan}」</div>
            </div>`).join('')}
        </div>
        <div class="info-row" style="margin-top:12px"><span class="k">已择</span><span class="v" id="selInfo">未择</span></div>
        <button class="btn btn-primary" id="startBtn" disabled>⚔ 入修行界 →</button>
      </div>`;
    const sel = new Set();
    const selInfo = $('#selInfo'), startBtn = $('#startBtn');
    $$('.prof-card').forEach(c => {
      c.onclick = () => {
        const k = c.dataset.prof;
        if (sel.has(k)) { sel.delete(k); c.classList.remove('sel'); }
        else { sel.add(k); c.classList.add('sel'); }
        selInfo.textContent = sel.size ? Array.from(sel).join('、') : '未择';
        startBtn.disabled = sel.size === 0;
      };
    });
    startBtn.onclick = () => {
      E.setProfession(Array.from(sel));
      E.getState().initialized = true; E.save();
      mask.classList.remove('show'); mask.innerHTML = '';
      toast('✦ 入道成功，修行之路自此开启 ✦');
      ensureDaily();
      go('home');
    };
  }

  /* ============================================================
   * 首页修行面板
   * ============================================================ */
  function renderHome() {
    const s = E.getState();
    const root = s.spiritRoot;
    const realm = E.computeRealm(s.totalExp);
    const profs = s.profession;

    // 俸禄状态
    const canClaim = E.canClaimDaily();
    const nextExpStr = realm.isMax ? '已是巅峰·渡劫圆满' :
      `距${realm.realmName}${realm.stageName === '圆满' ? '下境界' : '下一阶'}还需 ${fmt(realm.nextThreshold - s.totalExp)} 经验`;

    $('#home').innerHTML = `
      <div class="topbar">
        <h1>修 仙 修 行 台</h1>
        <div class="sub">道友 · 持之以恒，方得大道</div>
      </div>

      <div class="panel">
        <div class="hero">
          <div class="realm">${realm.realmName} · ${realm.stageName}</div>
          <div class="exp">总修为 ${fmt(s.totalExp)} 经验</div>
          <div class="mult">灵根倍率 ×${root ? root.multiplier : 1}</div>
        </div>
        <div class="bar"><i style="width:${realm.progress}%"></i></div>
        <div class="bar-label"><span>${realm.realmName}·${realm.stageName}</span><span>${realm.isMax ? '圆满' : nextExpStr}</span></div>
      </div>

      <div class="panel">
        <div class="panel-title"><span class="ico">🪪</span>道身信息</div>
        <div class="info-row"><span class="k">灵根</span><span class="v">
          <span class="root-tags">${(root ? root.elements : []).map(e => `<span class="root-chip" style="color:${rootColor(e)}">${e}</span>`).join('')}</span>
          <span class="muted">（${root ? root.label : '-'}）</span></span></div>
        <div class="info-row"><span class="k">修行职业</span><span class="v">${profs.map(p => E.PROFESSIONS[p].icon + p).join('、') || '-'}</span></div>
        <div class="info-row"><span class="k">修炼倍率</span><span class="v">×${root ? root.multiplier : 1}</span></div>
      </div>

      <div class="panel">
        <div class="panel-title"><span class="ico">🌀</span>修行显化</div>
        <div class="avatar-stage" id="avatarStage">${professionFx(profs)}</div>
        <div class="muted center">${profs.map(p => '「' + E.PROFESSIONS[p].slogan + '」').join('<br>')}</div>
      </div>

      <div class="panel">
        <div class="panel-title"><span class="ico">💰</span>每日俸禄</div>
        <p class="muted">每日登录可领 400 基础经验（不受灵根倍率影响）。</p>
        <button class="btn ${canClaim ? 'btn-primary' : 'btn-ghost'}" id="claimBtn" ${canClaim ? '' : 'disabled'}>
          ${canClaim ? '🪙 领取今日俸禄 +400' : '✓ 今日俸禄已领取'}
        </button>
      </div>

      <div class="panel sync-panel">
        <div class="panel-title"><span class="ico">☁️</span>云端同步</div>
        <p class="muted" id="syncMsg"${_syncStatus.state === 'error' ? ' style="color:var(--crimson)"' : ''}>${syncStatusText()}</p>
        <button class="btn btn-ghost" id="syncBtn">🔄 立即同步到云端</button>
      </div>

      <div class="panel">
        <div class="panel-title"><span class="ico">📜</span>修行板块</div>
        <div class="grid2">
          <div class="entry-card" data-go="english">
            <div class="big">🔤</div><div class="t">四级英语修行阁</div>
            <div class="d">聆听·品读·书字</div>
          </div>
          <div class="entry-card" data-go="python">
            <div class="big">🐍</div><div class="t">Python悟道洞府</div>
            <div class="d">术法·避坑·修习</div>
          </div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-title"><span class="ico">🧭</span>预留 · 可拓展修行</div>
        <div class="grid2">
          <div class="entry-card" onclick="toast('此修行板块尚未开启，敬请期待')"><div class="big">🔒</div><div class="t">待开辟道场</div><div class="d">后续可新增板块</div></div>
          <div class="entry-card" onclick="toast('此修行板块尚未开启，敬请期待')"><div class="big">🔒</div><div class="t">待开辟道场</div><div class="d">后续可新增板块</div></div>
        </div>
      </div>
    `;

    $('#claimBtn') && ($('#claimBtn').onclick = () => {
      const r = E.claimDaily();
      if (r.ok) { toast(`领取俸禄 +${r.gained} 经验`); maybeBreak(realm, r.realmAfter); }
      else toast(r.msg);
    });
    $('#syncBtn') && ($('#syncBtn').onclick = () => {
      if (window.XSync && window.XSync.isBusy && window.XSync.isBusy()) { toast('同步进行中，请稍候'); return; }
      toast('开始同步…');
      doPullAndMerge().finally(() => {
        // 合并后再把本地最新状态推上去，保证双向一致
        E.save();
        setTimeout(() => { const m = $('#syncMsg'); if (m) m.textContent = syncStatusText(); }, 600);
        renderHome();
      });
    });
    $$('#home .entry-card[data-go]').forEach(c => c.onclick = () => go(c.dataset.go));
  }

  function professionFx(profs) {
    if (!profs || !profs.length) return '<span class="muted">尚未择道</span>';
    let html = '';
    profs.forEach((p, i) => {
      const off = i * 30 - (profs.length - 1) * 15;
      if (p === '剑修') html += `<div class="fx-sword" style="left:calc(50% + ${off}px)"></div>`;
      if (p === '丹修') html += `<div class="fx-dan" style="left:calc(50% + ${off}px - 20px); top:40px"></div>`;
      if (p === '符修') html += `<div class="fx-fu" style="left:calc(50% + ${off}px - 15px); top:36px"></div>`;
      if (p === '器修') html += `<div class="fx-qi" style="left:calc(50% + ${off}px - 25px); top:50px"></div>`;
    });
    return html;
  }

  /* 突破动画 */
  function maybeBreak(beforeRealm, afterRealm) {
    renderHome(); // 先刷新显示
    if (afterRealm.realmIndex > beforeRealm.realmIndex ||
      (afterRealm.realmIndex === beforeRealm.realmIndex && afterRealm.stageIndex > beforeRealm.stageIndex)) {
      showBreakthrough(afterRealm);
    }
  }
  function showBreakthrough(realm) {
    const mask = $('#modal');
    let rays = '';
    for (let i = 0; i < 12; i++) rays += `<div class="ray" style="transform:rotate(${i * 30}deg)"></div>`;
    mask.innerHTML = `
      <div class="modal" style="text-align:center;background:rgba(10,8,5,0.9)">
        <div class="rays">${rays}</div>
        <div class="break-anim">⚡ 境界突破 ⚡</div>
        <div class="hero" style="margin-top:10px">
          <div class="realm">${realm.realmName} · ${realm.stageName}</div>
          <div class="exp">修为更进一层，大道可期</div>
        </div>
        <button class="btn btn-primary" id="bkClose">承道 ✦</button>
      </div>`;
    mask.classList.add('show');
    $('#bkClose').onclick = () => { mask.classList.remove('show'); mask.innerHTML = ''; };
  }

  /* ============================================================
   * 板块一：四级英语修行阁
   * ============================================================ */
  let engTab = 'listen';
  function renderEnglish() {
    Eng.ensureTodayBatch(); // 每日自动准备新词批次
    ReadEng.ensureTodayReadings();
    TransEng.ensureTodayTranslations();
    const stats = Eng.stats();
    const rs = ReadEng.stats();
    const ts = TransEng.stats();
    const newKeys = Eng.getNewWords();
    const due = Eng.getDueReviews();
    $('#english').innerHTML = `
      <div class="topbar"><h1>四级英语修行阁</h1><div class="sub">语言悟道 · 艾宾浩斯记忆</div></div>
      <div class="panel">
        <div class="panel-title"><span class="ico">📖</span>悟道总览</div>
        <div class="info-row"><span class="k">已记词汇</span><span class="v">${stats.total} 词</span></div>
        <div class="info-row"><span class="k">今日新词</span><span class="v">${newKeys.length} 词</span></div>
        <div class="info-row"><span class="k">待复习</span><span class="v">${due.length} 词</span></div>
        <div class="info-row"><span class="k">今日阅读</span><span class="v">${rs.done}/${rs.total} 篇</span></div>
        <div class="info-row"><span class="k">今日中译英</span><span class="v">${ts.done}/${ts.total} 题</span></div>
      </div>
      <div class="tabs">
        <div class="tab ${engTab === 'listen' ? 'on' : ''}" data-tab="listen">聆听词韵</div>
        <div class="tab ${engTab === 'read' ? 'on' : ''}" data-tab="read">品读文句</div>
        <div class="tab ${engTab === 'write' ? 'on' : ''}" data-tab="write">凝神书字</div>
        <div class="tab ${engTab === 'reading' ? 'on' : ''}" data-tab="reading">阅读悟道</div>
        <div class="tab ${engTab === 'translate' ? 'on' : ''}" data-tab="translate">中译英</div>
      </div>
      <div id="engBody"></div>
    `;
    $$('#english .tab').forEach(t => t.onclick = () => { engTab = t.dataset.tab; renderEnglish(); });
    renderEngBody();
  }

  function renderEngBody() {
    const body = $('#engBody');
    if (engTab === 'listen') return renderListen(body);
    if (engTab === 'read') return renderRead(body);
    if (engTab === 'write') return renderWrite(body);
    if (engTab === 'reading') return renderReading(body);
    if (engTab === 'translate') return renderTranslation(body);
  }

  // 聆听词韵：展示新词 + 今日复习配额（30），可打卡
  function renderListen(body) {
    const newKeys = Eng.getNewWords();
    const reviews = Eng.getTodayReviews();
    let html = `<div class="panel"><div class="panel-title"><span class="ico">👂</span>聆听词韵（背单词）</div>
      <p class="muted">每日新词 ${newKeys.length} 词，复习 ${reviews.length} 词（上限30）。完成打卡 +50 经验（按灵根倍率）。点 🔊 可听读音。</p>`;
    html += `<div class="muted" style="margin:8px 0">🆕 今日新词 ${newKeys.length} 词 ｜ 🔁 今日复习 ${reviews.length} 词</div>`;

    // 新词卡
    html += `<div class="log-date">今日新词（${newKeys.length}）</div>`;
    if (newKeys.length === 0) html += `<p class="muted">今日新词已修习完毕，明日再启新篇。</p>`;
    newKeys.forEach(k => {
      const w = Eng.getWordInfo(k);
      html += wordCard(k, w, true);
    });
    // 今日复习
    html += `<div class="log-date">今日复习（${reviews.length}）</div>`;
    if (reviews.length === 0) html += `<p class="muted">暂无待复习词，道友可闲庭信步。</p>`;
    reviews.forEach(k => {
      const w = Eng.getWordInfo(k);
      html += wordCard(k, w, false);
    });
    html += `<button class="btn btn-primary" id="listenChk">✦ 打卡：聆听词韵 +50</button></div>`;
    body.innerHTML = html;
    const btn = $('#listenChk');
    btn.onclick = () => {
      const r = Eng.checkListen();
      if (!r.ok) { toast(r.msg); return; }
      toast(`聆听词韵 +${r.gained} 经验`); renderEnglish();
    };
  }

  function wordCard(k, w, isNew) {
    if (!w) return '';
    const badge = isNew ? `<span class="badge new">新词</span>` :
      (w.stage === 'done' ? `<span class="badge done">已掌握</span>` : `<span class="badge review">复习</span>`);
    return `<div class="word-card">
      <div class="w">${esc(w.w)} ${badge}
        <button class="btn btn-ghost btn-sm" style="margin-left:6px" onclick="XApp.speak('${esc(w.w)}')">🔊 单词</button>
      </div>
      <div class="c">${esc(w.cn)}</div>
      <div class="e">“${esc(w.ex)}”
        <button class="btn btn-ghost btn-sm" style="margin-top:4px" onclick="XApp.speak('${esc(w.ex).replace(/'/g, "\\'")}')">🔊 例句</button>
      </div>
    </div>`;
  }

  // 品读文句
  function renderRead(body) {
    const newKeys = Eng.getNewWords();
    let html = `<div class="panel"><div class="panel-title"><span class="ico">📜</span>品读文句（学习例句）</div>
      <p class="muted">品读今日新词例句，体会地道用法。完成打卡 +50 经验（按灵根倍率）。</p>`;
    if (newKeys.length === 0) {
      html += `<p class="muted">今日新词已学完，明日再续。</p>`;
    } else {
      newKeys.forEach(k => {
        const w = Eng.getWordInfo(k);
        html += `<div class="word-card"><div class="w">${esc(w.w)}</div>
          <div class="e">“${esc(w.ex)}”</div>
          <div class="c">释义：${esc(w.cn)}</div></div>`;
      });
    }
    html += `<button class="btn btn-primary" id="readChk" ${newKeys.length ? '' : 'disabled'}>✦ 打卡：品读文句 +50</button></div>`;
    body.innerHTML = html;
    const btn = $('#readChk');
    if (btn) btn.onclick = () => {
      const r = Eng.checkSentence();
      if (!r.ok) { toast(r.msg); return; }
      toast(`品读文句 +${r.gained} 经验`); renderEnglish();
    };
  }

  // 凝神书字（拼写自测）
  function renderWrite(body) {
    const newKeys = Eng.getNewWords();
    const reviews = Eng.getTodayReviews();
    const practiceKeys = (newKeys.concat(reviews)).filter((v, i, a) => a.indexOf(v) === i).slice(0, 30);
    let html = `<div class="panel"><div class="panel-title"><span class="ico">✍️</span>凝神书字（拼写自测）</div>
      <p class="muted">针对今日新词与今日复习词自测拼写（共 ${practiceKeys.length} 词），系统据艾宾浩斯推进掌握度。完成 +100 经验（按灵根倍率）。</p>`;
    if (practiceKeys.length === 0) {
      html += `<p class="muted">暂无待练词汇，道友可先至「聆听词韵」修习新词。</p>`;
    } else {
      html += `<div class="muted" style="margin-bottom:6px">请凭释义默写下列单词（共 ${practiceKeys.length} 词）：</div>`;
      practiceKeys.forEach(k => {
        const w = Eng.getWordInfo(k);
        html += `<div class="word-card">
          <div class="c">${esc(w.cn)}</div>
          <div class="e">“${esc(w.ex)}”</div>
          <input class="input" data-k="${esc(k)}" placeholder="在此默写英文单词">
        </div>`;
      });
      html += `<button class="btn btn-primary" id="writeChk">✦ 提交自测 +100</button>`;
    }
    html += `</div>`;
    body.innerHTML = html;
    const btn = $('#writeChk');
    if (btn) btn.onclick = () => {
      const inputs = $$('#engBody .input');
      const attempts = {};
      inputs.forEach(i => attempts[i.dataset.k] = i.value);
      if (inputs.some(i => !i.value.trim())) { toast('请补全所有拼写后再提交'); return; }
      const r = Eng.checkSpell(attempts);
      toast(`拼写自测 ${r.correct}/${r.total} 正确 · +${r.gained} 经验`);
      renderEnglish();
    };
  }

  /* ============================================================
   * 英语板块：四级阅读悟道
   * ============================================================ */
  function renderReading(body) {
    const ids = ReadEng.getTodayReadings();
    const idx = ReadEng.getCurrentIndex();
    const art = ReadEng.getArticle(ids[idx]);
    const st = ReadEng.stats();
    const isDone = (ReadEng.allFinished());
    let html = `<div class="panel"><div class="panel-title"><span class="ico">📰</span>阅读悟道（四级阅读）</div>
      <p class="muted">每日 2 篇四级阅读。点击绿色关键词查看释义与用法；完成当前篇可打卡 +25 经验。</p>`;
    html += `<div class="info-row"><span class="k">今日进度</span><span class="v">${st.done}/${st.total} 篇</span></div>`;
    if (isDone) {
      html += `<p class="muted center">今日阅读任务已完成，道行更进。</p>`;
    } else if (art) {
      html += `<div class="word-card" style="margin-top:12px">
        <div class="tt" style="color:var(--gold-bright);font-size:18px">${esc(art.title)}</div>
        <div class="td" style="margin:4px 0">${esc(art.sub)}</div>
        <div style="font-size:14px;line-height:1.8;margin-top:10px;color:var(--ink)">${highlightKeywords(art.text, art.keywords)}</div>
      </div>
      <div style="display:flex;gap:8px;margin-top:10px">
        <button class="btn btn-ghost" id="readNext" style="flex:1">🔄 换一篇</button>
        <button class="btn btn-primary" id="readFinish" style="flex:1">✦ 完成本篇 +25</button>
      </div>`;
    }
    html += `</div>`;
    body.innerHTML = html;
    const nextBtn = $('#readNext');
    const finishBtn = $('#readFinish');
    if (nextBtn) nextBtn.onclick = () => {
      ReadEng.setCurrentIndex((idx + 1) % ids.length);
      renderEnglish();
    };
    if (finishBtn) finishBtn.onclick = () => {
      const r = ReadEng.finishCurrent();
      if (!r.ok) { toast(r.msg); return; }
      toast(`阅读悟道 +${r.gained} 经验`);
      renderEnglish();
    };
  }

  function regexEscape(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function highlightKeywords(text, keywords) {
    if (!keywords || !keywords.length) return esc(text);
    // 按词长度降序，避免短词替换破坏长词
    const kws = keywords.slice().sort((a, b) => b.w.length - a.w.length);
    let html = esc(text);
    kws.forEach(k => {
      const re = new RegExp('\\b' + regexEscape(k.w) + '\\b', 'gi');
      html = html.replace(re, m => `<span class="kw" data-kw="${esc(k.w)}">${esc(m)}</span>`);
    });
    return html;
  }

  // 关键词释义弹窗（事件委托）
  document.addEventListener('click', e => {
    const el = e.target.closest('.kw');
    if (!el) return;
    const word = el.dataset.kw;
    if (!word) return;
    const allArts = window.XReadingData.READING_BANK;
    let kw = null;
    for (const a of allArts) {
      kw = (a.keywords || []).find(k => k.w.toLowerCase() === word.toLowerCase());
      if (kw) break;
    }
    if (!kw) return;
    const mask = $('#modal');
    mask.innerHTML = `
      <div class="modal">
        <h3>${esc(kw.w)}</h3>
        <div class="c" style="font-size:16px">${esc(kw.cn)}</div>
        <div class="panel-title" style="margin-top:12px">用法</div>
        <div class="e">${esc(kw.usage)}</div>
        <button class="btn btn-primary" id="kwClose">已明悟</button>
      </div>`;
    mask.classList.add('show');
    $('#kwClose').onclick = () => { mask.classList.remove('show'); mask.innerHTML = ''; };
  });

  /* ============================================================
   * 英语板块：中译英悟道
   * ============================================================ */
  function renderTranslation(body) {
    const ids = TransEng.getTodayTranslations();
    const st = TransEng.stats();
    const isDone = TransEng.isDone();
    let html = `<div class="panel"><div class="panel-title"><span class="ico">🔄</span>中译英悟道</div>
      <p class="muted">每日 5 道四级中译英。完成全部 5 题提交后可得 +50 经验（按灵根倍率）。</p>`;
    html += `<div class="info-row"><span class="k">今日进度</span><span class="v">${st.done}/${st.total} 题</span></div>`;
    if (isDone) {
      html += `<p class="muted center">今日中译英已完成。可点击右下角"查看答案"对照。</p>`;
    }
    ids.forEach((id, i) => {
      const q = TransEng.getQuestion(id);
      html += `<div class="word-card">
        <div class="c">${i + 1}. ${esc(q.cn)}</div>
        <input class="input" data-t="${esc(id)}" placeholder="请输入英文翻译" ${isDone ? 'disabled' : ''}>
        ${isDone ? `<div class="e" style="margin-top:4px">参考答案：${esc(q.ref)}</div>` : ''}
      </div>`;
    });
    if (!isDone) {
      html += `<button class="btn btn-primary" id="transSubmit">✦ 提交翻译 +50</button>`;
    }
    html += `</div>`;
    body.innerHTML = html;
    const btn = $('#transSubmit');
    if (btn) btn.onclick = () => {
      const inputs = $$('#engBody .input');
      const attempts = {};
      inputs.forEach(i => attempts[i.dataset.t] = i.value);
      if (inputs.some(i => !i.value.trim())) { toast('请完成全部 5 题后再提交'); return; }
      const r = TransEng.submit(attempts);
      if (!r.ok) { toast(r.msg); return; }
      toast(`中译英悟道 +${r.gained} 经验`);
      renderEnglish();
    };
  }

  /* ============================================================
   * 板块二：Python悟道洞府
   * ============================================================ */
  let pyTab = 'todo';
  function renderPython() {
    const st = Py.stats();
    $('#python').innerHTML = `
      <div class="topbar"><h1>Python悟道洞府</h1><div class="sub">术法修习 · 避坑精进</div></div>
      <div class="panel">
        <div class="panel-title"><span class="ico">🐍</span>术法总览</div>
        <div class="info-row"><span class="k">已修习术法</span><span class="v">${st.done}/${st.total}</span></div>
        <div class="info-row"><span class="k">待修习</span><span class="v">${st.remain} 术法</span></div>
      </div>
      <div class="tabs">
        <div class="tab ${pyTab === 'todo' ? 'on' : ''}" data-tab="todo">待修习</div>
        <div class="tab ${pyTab === 'done' ? 'on' : ''}" data-tab="done">已修习</div>
      </div>
      <div id="pyBody"></div>
    `;
    $$('#python .tab').forEach(t => t.onclick = () => { pyTab = t.dataset.tab; renderPython(); });
    renderPyBody();
  }

  function renderPyBody() {
    const body = $('#pyBody');
    if (pyTab === 'todo') {
      const list = Py.todoList();
      let html = '';
      if (list.length === 0) html = `<p class="muted center">万法已通，道友已成此道高手 ✦</p>`;
      list.forEach(n => {
        html += `<div class="task-row">
          <div class="ti">
            <div class="tt">${esc(n.title)} <span class="muted">[${esc(n.level)}]</span></div>
            <div class="td">${esc(n.desc)}</div>
          </div>
          <button class="btn btn-primary btn-sm" data-learn="${n.id}">修习 +100</button>
        </div>`;
      });
      body.innerHTML = html;
      $$('#pyBody [data-learn]').forEach(b => b.onclick = () => showPyStudy(b.dataset.learn));
    } else {
      const list = Py.learnedList();
      let html = '';
      if (list.length === 0) html = `<p class="muted center">尚未修习任何术法。</p>`;
      list.forEach(n => {
        html += `<div class="task-row">
          <div class="ti">
            <div class="tt">${esc(n.title)} <span class="muted">[${esc(n.level)}]</span></div>
            <div class="td">修习于 ${esc(n.date)} · +${n.exp} 经验</div>
          </div>
          <button class="btn btn-ghost btn-sm" data-view="${n.id}">查看</button>
        </div>`;
      });
      body.innerHTML = html;
      $$('#pyBody [data-view]').forEach(b => b.onclick = () => showPyDetail(b.dataset.view));
    }
  }

  function showPyDetail(id) {
    const n = Py.node(id);
    const mask = $('#modal');
    mask.innerHTML = `
      <div class="modal">
        <h3>${esc(n.title)}</h3>
        <div class="muted" style="margin-bottom:8px">难度：${esc(n.level)}</div>
        <p>${esc(n.desc)}</p>
        <div class="panel-title" style="font-size:14px;margin-top:10px">📹 配套讲法（视频）</div>
        <a class="video-link" href="${esc(n.video)}" target="_blank" rel="noopener">▶ 前往观览教学视频（外链）</a>
        <div class="panel-title" style="font-size:14px;margin-top:14px">⚠ 术法避坑指南</div>
        ${n.pitfalls.map(p => `<div class="pitfall">${esc(p)}</div>`).join('')}
        <button class="btn btn-primary" id="pyClose">收功</button>
      </div>`;
    mask.classList.add('show');
    $('#pyClose').onclick = () => { mask.classList.remove('show'); mask.innerHTML = ''; };
  }

  // 修习流程：先看视频 → 再学习 → 成功才得经验
  function showPyStudy(id) {
    const n = Py.node(id);
    const mask = $('#modal');
    mask.innerHTML = `
      <div class="modal">
        <h3>${esc(n.title)}</h3>
        <div class="muted" style="margin-bottom:8px">难度：${esc(n.level)} ｜ 修习成功可得 100 经验（按灵根倍率）</div>
        <div class="panel-title" style="font-size:14px">📹 第一步：观看配套讲法（视频）</div>
        <a class="video-link" href="${esc(n.video)}" target="_blank" rel="noopener">▶ 点此前往观看教学视频（外链，需跳转）</a>
        <div class="panel-title" style="font-size:14px;margin-top:12px">⚠ 第二步：研习术法避坑指南</div>
        ${n.pitfalls.map(p => `<div class="pitfall">${esc(p)}</div>`).join('')}
        <label class="info-row" style="margin-top:10px;align-items:center">
          <span class="k">我已观看视频并研习完成</span>
          <input type="checkbox" id="pyDone" style="width:20px;height:20px">
        </label>
        <button class="btn btn-primary" id="pyLearn" disabled>✦ 学习成功 · 领取 100 经验</button>
        <button class="btn btn-ghost" id="pyCancel">暂缓修行</button>
      </div>`;
    mask.classList.add('show');
    const chk = $('#pyDone'), learnBtn = $('#pyLearn');
    chk.onchange = () => { learnBtn.disabled = !chk.checked; };
    learnBtn.onclick = () => {
      const r = Py.learn(id);
      if (!r.ok) { toast(r.msg); return; }
      toast(`修习·${r.node.title} +${r.gained} 经验`);
      mask.classList.remove('show'); mask.innerHTML = '';
      renderPython();
    };
    $('#pyCancel').onclick = () => { mask.classList.remove('show'); mask.innerHTML = ''; };
  }

  /* ============================================================
   * 修行日志
   * ============================================================ */
  function renderLog() {
    const log = E.getLog();
    let html = `<div class="topbar"><h1>修行日志</h1><div class="sub">每日功行 · 永久留存</div></div><div class="panel">`;
    if (log.length === 0) html += `<p class="muted center">尚无修行记录，今日便可启程。</p>`;
    // 按日期分组
    const groups = {};
    log.forEach(l => { (groups[l.date] = groups[l.date] || []).push(l); });
    const dates = Object.keys(groups).sort((a, b) => b.localeCompare(a));
    dates.forEach(d => {
      html += `<div class="log-date">📅 ${d}</div>`;
      groups[d].forEach(l => {
        html += `<div class="log-item">
          <span class="lt">${esc(l.time)}</span>
          <span class="ld">${esc(l.detail)}</span>
          <span class="le">+${l.exp}</span>
        </div>`;
      });
    });
    html += `</div>`;
    $('#log').innerHTML = html;
  }

  /* ============================================================
   * 道身（个人）页：查看灵根/职业/重置
   * ============================================================ */
  function renderProfile() {
    const s = E.getState();
    const root = s.spiritRoot;
    const realm = E.computeRealm(s.totalExp);
    $('#profile').innerHTML = `
      <div class="topbar"><h1>道身</h1><div class="sub">修行根基 · 数据留存</div></div>
      <div class="panel">
        <div class="panel-title"><span class="ico">🪪</span>本命信息</div>
        <div class="info-row"><span class="k">当前境界</span><span class="v">${realm.realmName}·${realm.stageName}</span></div>
        <div class="info-row"><span class="k">累计修为</span><span class="v">${fmt(s.totalExp)}</span></div>
        <div class="info-row"><span class="k">灵根</span><span class="v">${root ? root.label : '-'}（×${root ? root.multiplier : 1}）</span></div>
        <div class="info-row"><span class="k">修行职业</span><span class="v">${s.profession.join('、') || '-'}</span></div>
        <div class="info-row"><span class="k">多修门槛倍数</span><span class="v">×${E.profThresholdRatio()}（修习 ${s.profession.length} 道）</span></div>
      </div>
      <div class="panel">
        <div class="panel-title"><span class="ico">💾</span>数据说明</div>
        <p class="muted">所有修行数据（灵根、职业、总经验、单词记忆、打卡日志）均永久保存于本机，经验数值永不清空。开启云端同步后，电脑与手机会自动保持一致。</p>
        <div class="sync-line" id="syncMsg2">${syncStatusText()}</div>
        <button class="btn btn-ghost" id="syncBtn2">🔄 立即同步到云端</button>
        <button class="btn btn-ghost" id="resetBtn">↺ 重开修行（清空全部数据）</button>
      </div>
    `;
    $('#syncBtn2') && ($('#syncBtn2').onclick = () => {
      if (window.XSync && window.XSync.isBusy && window.XSync.isBusy()) { toast('同步进行中，请稍候'); return; }
      toast('开始同步…');
      doPullAndMerge().finally(() => {
        E.save();
        const m = $('#syncMsg2'); if (m) m.textContent = syncStatusText();
        renderProfile();
      });
    });
    $('#resetBtn').onclick = () => {
      if (confirm('确定重开？将清空灵根、职业、经验与全部修行记录，此操作不可恢复。')) {
        E.resetAll();
        const mask = $('#modal'); mask.classList.add('show');
        showOnboarding();
      }
    };
  }

  /* ---------- 静态框架 ---------- */
  function renderStaticFrames() {
    const app = $('#app');
    app.innerHTML = `
      <div class="page active" id="home"></div>
      <div class="page" id="english"></div>
      <div class="page" id="python"></div>
      <div class="page" id="log"></div>
      <div class="page" id="profile"></div>
      <div class="tabbar">
        <div class="tb on" data-page="home"><span class="bi">🏯</span>修行</div>
        <div class="tb" data-page="english"><span class="bi">🔤</span>英语阁</div>
        <div class="tb" data-page="python"><span class="bi">🐍</span>洞府</div>
        <div class="tb" data-page="log"><span class="bi">📜</span>日志</div>
        <div class="tb" data-page="profile"><span class="bi">🪪</span>道身</div>
      </div>
      <div class="toast" id="toast"></div>
    `;
    $$('.tabbar .tb').forEach(tb => tb.onclick = () => go(tb.dataset.page));
  }

  /* ---------- 启动 ---------- */
  document.addEventListener('DOMContentLoaded', boot);
  // 暴露给内联 onclick
  window.toast = toast;
  window.XApp = { speak: speak };

})();
