/* ============================================================
 * 云端同步模块（Supabase REST）
 * - 使用 publishable (anon) key，表已关闭 RLS，任何人可读写
 * - 单条记录 id = 'global'，data 为完整存档 jsonb
 * - 自动保存（push）/ 进入时拉取（pull），失败静默不阻塞
 * ============================================================ */
(function (global) {
  'use strict';

  const SUPABASE_URL = 'https://vcqldvbmhxlonmwpbacb.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_UoVGswwauUa62ouIY5MKOg_DF77-agf';
  const TABLE = 'save';
  const ROW_ID = 'global';

  const REST = `${SUPABASE_URL}/rest/v1/${TABLE}`;
  const HEADERS = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json'
  };

  // 状态监听（app.js 注入）
  let _onStatus = function () {};
  function setStatus(fn) { if (typeof fn === 'function') _onStatus = fn; }
  function emit(status, detail) { try { _onStatus(status, detail); } catch (e) {} }

  let _busy = false;
  function isBusy() { return _busy; }

  function rowUrl() {
    return `${REST}?id=eq.${encodeURIComponent(ROW_ID)}`;
  }

  // 拉取云端存档，返回解析后的对象或 null
  async function pull() {
    _busy = true;
    emit('syncing', '正在从云端拉取存档…');
    try {
      const res = await fetch(rowUrl() + '&select=data', { headers: HEADERS });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const arr = await res.json();
      if (!Array.isArray(arr) || arr.length === 0) {
        emit('idle', '云端暂无存档');
        return null;
      }
      const data = arr[0].data;
      emit('idle', '云端拉取成功');
      return data;
    } catch (e) {
      emit('error', '拉取失败：' + (e && e.message ? e.message : e));
      return null;
    } finally {
      _busy = false;
    }
  }

  // 上传本地存档到云端
  async function push(stateObj) {
    if (_busy) return false;
    _busy = true;
    emit('syncing', '正在同步到云端…');
    try {
      const payload = {
        id: ROW_ID,
        data: stateObj,
        updated_at: new Date().toISOString()
      };
      const res = await fetch(REST, {
        method: 'POST',
        headers: Object.assign({}, HEADERS, { 'Prefer': 'resolution=merge-upsert' }),
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      emit('idle', '云端同步完成');
      return true;
    } catch (e) {
      emit('error', '同步失败：' + (e && e.message ? e.message : e));
      return false;
    } finally {
      _busy = false;
    }
  }

  const Sync = { SUPABASE_URL, setStatus, isBusy, pull, push, ROW_ID };
  global.XSync = Sync;
})(window);
