export function renderHtml(authed: boolean, content: string) {
  return `
    <!DOCTYPE html>
    <html lang="zh-CN">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Alpha 积分管理系统</title>
        <style>
          :root { --text:#0F172A; --muted:#64748B; --card-bg:rgba(250,250,250,0.698); --border:rgba(148,163,184,0.64); --shadow:rgba(200,200,200,0.4); --blue:#3B82F6; --blue-start:#60A5FA; --dialog-bg:rgba(255,255,255,0.8); --button-bg:#FFFFFF; --button-hover-bg:#F9FAFB; --table-bg:rgba(255,255,255,0.698); --window-bg:#FFFFFF; --invalid-bg:#E5E7EB; --stat-card-height:110px; --today-dot:#50CC09; }
          * { box-sizing: border-box; }
          html, body { height: 100%; }
          body { margin: 0; font-family: Segoe UI, Roboto, Arial, sans-serif; color: var(--text); background: var(--window-bg); }
          .app { max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 14px; padding: 14px; }
          .card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 14px; padding: 14px; box-shadow: 0 6px 20px var(--shadow); }
          .middle { display: grid; grid-template-columns: 1fr; grid-auto-rows: 1fr; align-items: stretch; gap: 16px; }
          .calendar-header { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
          .calendar-nav { display: flex; gap: 8px; }
          .btn { padding: 9px 14px; border: 1px solid var(--border); border-radius: 12px; background: var(--button-bg); cursor: pointer; transition: background .2s ease, box-shadow .2s ease; }
          .btn:hover { background: var(--button-hover-bg); box-shadow: 0 2px 8px rgba(200,200,200,0.25); }
          .month-title { font-size: 16px; font-weight: 600; }
          .week-row { display: grid; grid-template-columns: repeat(7, 1fr); margin-top: 8px; }
          .week-cell { text-align: center; font-size: 14px; color: var(--muted); padding: 6px; }
          .date-grid { display: grid; grid-template-columns: repeat(7, 1fr); grid-template-rows: repeat(6, auto); gap: 6px; }
          .date-cell { position: relative; aspect-ratio: 1/1; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-size: 14px; }
          .date-cell.today::before { content: ""; position: absolute; left: 6px; top: 6px; width: 6px; height: 6px; border-radius: 50%; background: var(--today-dot); }
          .date-cell.has-data { color: #FFFFFF; background: linear-gradient(135deg, var(--blue-start), var(--blue)); }
          .date-cell.invalid { color: var(--muted); background: var(--invalid-bg); }
          .date-cell.selected { outline: 2px solid var(--blue); }
          .date-cell.modified::after { content: ""; position: absolute; right: 6px; bottom: 6px; width: 6px; height: 6px; border-radius: 50%; background: #FBCFE8; }
          .today-card-header { display: flex; align-items: center; justify-content: space-between; }
          #today-card { display: flex; flex-direction: column; }
          #today-card .stats-grid { flex: 1; }
          .today-title { font-size: 18px; font-weight: 600; }
          .today-date { font-size: 14px; color: var(--muted); }
          .settings { width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; border: 1px solid var(--border); border-radius: 12px; background: var(--button-bg); cursor: pointer; vertical-align: middle; font-size: 16px; line-height: 1; }
          .stats-grid { margin-top: 10px; display: grid; grid-template-columns: repeat(4, 1fr); grid-auto-rows: 1fr; gap: 8px; }
          .stat-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px; padding: 10px; box-shadow: 0 6px 14px var(--shadow); display: flex; flex-direction: column; align-items: center; justify-content: center; height: var(--stat-card-height); }
          .stat-label { color: var(--muted); font-size: 12px; }
          .stat-value { color: var(--text); font-size: 22px; font-weight: 600; }
          .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }
          .summary-card { padding: 12px; border-radius: 14px; box-shadow: 0 6px 14px var(--shadow); background: var(--card-bg); border: 1px solid var(--border); text-align: center; }
          .summary-title { font-size: 16px; font-weight: 700; }
          .summary-value { font-size: 22px; font-weight: 700; }
          .dialog-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.2); display: none; align-items: center; justify-content: center; padding: 14px; }
          .dialog { width: 100%; max-width: 680px; background: var(--dialog-bg); border: 1px solid var(--border); border-radius: 14px; padding: 14px; max-height: 88vh; overflow: auto; }
          .tabs { display: flex; gap: 8px; }
          .tab { flex: 1; text-align: center; padding: 10px; border: 1px solid var(--border); background: #FFFFFF; cursor: pointer; border-radius: 12px; }
          .tab.active { background: var(--blue); color: #FFFFFF; border-color: var(--blue); }
          .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 12px; }
          .form-grid.vertical { grid-template-columns: 1fr; }
          .form-grid .full { grid-column: span 2; }
          .input { width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: #FFFFFF; }
          .dialog-actions { margin-top: 12px; display: flex; justify-content: center; align-items: center; gap: 8px; }
          .primary { background: var(--blue); color: #FFFFFF; border-radius: 10px; padding: 12px 16px; border: none; cursor: pointer; box-shadow: 0 2px 10px rgba(59,130,246,0.3); transition: transform .1s ease; }
          .dialog .primary { padding: calc(12px * 1.5) calc(16px * 2); }
          .primary:active { transform: translateY(1px); }
          .now { font-size: 12px; color: var(--muted); }
          .settings-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.35); display: none; align-items: center; justify-content: center; padding: 14px; }
          .settings-card { width: 100%; max-width: 700px; background: var(--dialog-bg); border: 1px solid var(--border); border-radius: 14px; padding: 14px; box-shadow: 0 12px 38px var(--shadow); max-height: 88vh; overflow: auto; }
          .settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
          .settings-actions { margin-top: 12px; display: flex; justify-content: center; gap: 8px; }
          .settings-row { display: flex; align-items: center; gap: 8px; }
          .settings-row label { width: 140px; color: var(--muted); font-size: 12px; }
          
          .lock { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; padding: 20px; background: rgba(0,0,0,0.25); }
          .lock-card { width: 100%; max-width: 420px; background: var(--card-bg); border: 1px solid var(--border); border-radius: 14px; padding: 16px; box-shadow: 0 8px 24px var(--shadow); backdrop-filter: blur(6px); }
          .lock-title { font-size: 18px; font-weight: 700; text-align: center; margin-bottom: 10px; }
          .lock-form { display: grid; gap: 10px; }
          .lock-btn { background: var(--blue); color: #fff; border: none; border-radius: 10px; padding: 10px 14px; cursor: pointer; }
          @media (min-width: 1040px) { .middle { grid-template-columns: 2fr 1.3fr; } }
          @media (max-width: 960px) { 
            .summary { grid-template-columns: 1fr; }
            .stats-grid { grid-template-columns: repeat(2, 1fr); }
            .settings-grid { grid-template-columns: 1fr; }
            .settings-card { max-width: 90vw; }
          }
          @media (max-width: 640px) { 
            .form-grid { grid-template-columns: 1fr; }
            .settings-backdrop { padding: 8px; }
            .settings-card { max-width: calc(100vw - 24px); }
            .dialog { max-width: calc(100vw - 24px); }
            .settings-actions { flex-direction: column; }
            .settings-row label { width: 110px; }
          }
        </style>
      </head>
      <body>
        <div class="app">
          <div class="middle">
            <div class="card" id="calendar-card">
              <div class="calendar-header">
                <div class="calendar-nav">
                  <button class="btn" id="prev-month">上一月</button>
                  <button class="btn" id="next-month">下一月</button>
                </div>
                <div class="month-title" id="month-title"></div>
              </div>
              <div class="week-row">
                <div class="week-cell">一</div>
                <div class="week-cell">二</div>
                <div class="week-cell">三</div>
                <div class="week-cell">四</div>
                <div class="week-cell">五</div>
                <div class="week-cell">六</div>
                <div class="week-cell">日</div>
              </div>
              <div class="date-grid" id="date-grid"></div>
            </div>
            <div class="card" id="today-card">
            <div class="today-card-header">
              <div style="display:flex; align-items:center; gap:8px;">
                <div class="today-title">当日数据：</div>
                <div class="today-date" id="today-date"></div>
              </div>
              <div class="settings" id="open-settings">⚙</div>
            </div>
              <div class="stats-grid">
                <div class="stat-card"><div class="stat-label">初始资金</div><div class="stat-value" id="stat-initial">0</div></div>
                <div class="stat-card"><div class="stat-label">完成资金</div><div class="stat-value" id="stat-finish">0</div></div>
                <div class="stat-card"><div class="stat-label">磨损金额</div><div class="stat-value" id="stat-wear">0</div></div>
                <div class="stat-card"><div class="stat-label">代币名称</div><div class="stat-value" id="stat-token">--</div></div>
                <div class="stat-card"><div class="stat-label">余额积分</div><div class="stat-value" id="stat-balance">0</div></div>
                <div class="stat-card"><div class="stat-label">交易积分</div><div class="stat-value" id="stat-trade">0</div></div>
                <div class="stat-card"><div class="stat-label">当日积分</div><div class="stat-value" id="stat-today">0</div></div>
                <div class="stat-card"><div class="stat-label">利润</div><div class="stat-value" id="stat-profit">0</div></div>
              </div>
            </div>
          </div>
          <div class="summary">
            <div class="summary-card"><div class="summary-title">总磨损</div><div class="summary-value" id="sum-wear">0</div></div>
            <div class="summary-card"><div class="summary-title">净利润</div><div class="summary-value" id="sum-profit">0</div></div>
            <div class="summary-card"><div class="summary-title">有效积分</div><div class="summary-value" id="sum-valid">0</div></div>
            <div class="summary-card"><div class="summary-title">总交易量</div><div class="summary-value" id="sum-volume">0</div></div>
            <div class="summary-card"><div class="summary-title">磨损率</div><div class="summary-value" id="sum-rate">0%</div></div>
          </div>
        </div>
        ${authed ? "" : `
        <div class="lock">
          <form class="lock-card lock-form" method="POST" action="/auth">
            <div class="lock-title">输入密码以进入</div>
            <input class="input" type="password" name="password" placeholder="请输入密码" autocomplete="off" />
            <button class="lock-btn" type="submit">进入</button>
          </form>
        </div>
        `}
        <div class="settings-backdrop" id="settings">
          <div class="settings-card">
            <div class="today-title" style="margin-bottom:8px;">界面设置</div>
            <div class="settings-grid">
              <div class="settings-row"><label>卡片透明度</label><input type="range" min="0" max="100" value="70" id="cfg-card-opacity" /></div>
              <div class="settings-row"><label>阴影透明度</label><input type="range" min="0" max="100" value="40" id="cfg-shadow-opacity" /></div>
              <div class="settings-row"><label>边框颜色</label><input type="color" id="cfg-border-color" value="#94a3b8" /></div>
              <div class="settings-row"><label>文本颜色</label><input type="color" id="cfg-text-color" value="#0f172a" /></div>
              <div class="settings-row"><label>标签颜色</label><input type="color" id="cfg-muted-color" value="#64748b" /></div>
              <div class="settings-row"><label>按钮背景</label><input type="color" id="cfg-btn-bg" value="#ffffff" /></div>
              <div class="settings-row"><label>按钮悬停</label><input type="color" id="cfg-btn-hover" value="#f9fafb" /></div>
              <div class="settings-row"><label>选择起始</label><input type="color" id="cfg-sel-start" value="#60a5fa" /></div>
              <div class="settings-row"><label>选择结束</label><input type="color" id="cfg-sel-end" value="#3b82f6" /></div>
              <div class="settings-row"><label>失效背景</label><input type="color" id="cfg-invalid-bg" value="#e5e7eb" /></div>
              <div class="settings-row"><label>窗口背景</label><input type="color" id="cfg-window-bg" value="#ffffff" /></div>
              <div class="settings-row"><label>当日标记</label><input type="color" id="cfg-today-dot" value="#50cc09" /></div>
              <div class="settings-row"><label>卡片高度</label><input type="number" id="cfg-stat-h" min="60" step="10" value="110" /></div>
              <div class="settings-row"><label>统计范围（日）</label><input type="number" id="cfg-stat-range" min="0" step="1" value="0" /></div>
            </div>
            <div class="settings-actions">
              <button class="primary" id="cfg-apply">应用</button>
              <button class="btn" id="cfg-cancel">取消</button>
            </div>
          </div>
        </div>
        <div class="dialog-backdrop" id="dialog-cu">
          <div class="dialog">
            <div class="tabs">
              <div class="tab active" data-tab="calc">计算</div>
              <div class="tab" data-tab="use">使用</div>
            </div>
              <div class="form-grid vertical" id="form-calc">
              <input class="input" placeholder="初始资金" />
              <input class="input" placeholder="完成资金" />
              <input class="input" placeholder="交易量" />
              </div>
              <div class="form-grid vertical" id="form-use" style="display:none;">
              <input class="input" placeholder="名称" />
              <input class="input" placeholder="数量" />
              <input class="input" placeholder="单价" />
              </div>
              <div class="dialog-actions">
              <button class="primary" id="dialog-action">计算保存</button>
              </div>
          </div>
        </div>
        <div class="dialog-backdrop" id="dialog-edit">
          <div class="dialog">
            <div class="today-title" style="margin-bottom:8px;">修改数据</div>
            <div class="form-grid" id="form-edit">
              <div class="full" style="font-size:12px; color:var(--muted);">当日：<span id="edit-date"></span></div>
              <div class="full" style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; align-items:center;">
                <div style="font-size:12px; color:var(--muted);">原值</div>
                <div style="font-size:12px; color:var(--muted);">修改为</div>
              </div>
              <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
                <input class="input" id="orig-init" disabled />
                <input class="input" id="edit-init" placeholder="初始资金" />
                <input class="input" id="orig-final" disabled />
                <input class="input" id="edit-final" placeholder="完成资金" />
                <input class="input" id="orig-vol" disabled />
                <input class="input" id="edit-vol" placeholder="交易量" />
                <input class="input" id="orig-txnpts" disabled />
                <input class="input" id="edit-txnpts" placeholder="交易积分" />
                <input class="input" id="orig-balancepts" disabled />
                <input class="input" id="edit-balancepts" placeholder="持仓积分" />
                <input class="input" id="orig-wear" disabled />
                <input class="input" id="edit-wear" placeholder="磨损" />
                <input class="input" id="orig-time" disabled />
                <input class="input" id="edit-time" placeholder="时间（YYYY-MM-DD HH:mm:ss）" />
              </div>
            </div>
            <div class="dialog-actions">
              <button class="primary" id="edit-save">保存修改</button>
              <button class="btn" id="edit-cancel">取消</button>
            </div>
          </div>
        </div>
        <script>
          let DATA = null;
          const state = { y: null, m: null, selected: null };
          function fmtDate(y,m,d){ const mm = String(m+1).padStart(2,'0'); const dd = String(d).padStart(2,'0'); return y + '-' + mm + '-' + dd; }
          function hasData(dateStr){ if(!DATA) return false; return Boolean(DATA[dateStr] && ((DATA[dateStr].calc && DATA[dateStr].calc.length) || (DATA[dateStr].use && DATA[dateStr].use.length))); }
          function isValidDate(dateStr){ try { const now = new Date(); const pivot = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0); const ref = now.getTime() < pivot.getTime() ? new Date(now.getFullYear(), now.getMonth(), now.getDate()-1) : new Date(now.getFullYear(), now.getMonth(), now.getDate()); const ds = new Date(dateStr + 'T00:00:00'); const diffMs = ref.getTime() - ds.getTime(); const diffDays = Math.floor(diffMs / (24*60*60*1000)); return diffDays <= 15 && diffDays >= 0; } catch { return false; } }
          function buildMonth(y,m){ const title = document.getElementById('month-title'); title.textContent = y + ' 年 ' + String(m+1).padStart(2,'0') + ' 月'; const grid = document.getElementById('date-grid'); grid.innerHTML = ''; const first = new Date(y,m,1); const startIdx = (first.getDay()+6)%7; const days = new Date(y,m+1,0).getDate(); const now = new Date(); const pivot = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0); const ref = now.getTime() < pivot.getTime() ? new Date(now.getFullYear(), now.getMonth(), now.getDate()-1) : new Date(now.getFullYear(), now.getMonth(), now.getDate()); for(let i=0;i<42;i++){ const cell = document.createElement('div'); cell.className = 'date-cell'; const day = i-startIdx+1; if(day>0 && day<=days){ cell.textContent = String(day); const isToday = y===ref.getFullYear() && m===ref.getMonth() && day===ref.getDate(); if(isToday) cell.classList.add('today'); const ds = fmtDate(y,m,day); if(hasData(ds)) { if(isValidDate(ds)) cell.classList.add('has-data'); else cell.classList.add('invalid'); } cell.addEventListener('click',()=>{ document.querySelectorAll('.date-cell.selected').forEach(el=>el.classList.remove('selected')); cell.classList.add('selected'); state.selected = { y, m, d: day }; const td = document.getElementById('today-date'); if(td) td.textContent = fmtDate(y,m,day); fillStatsForDate(ds); }); cell.addEventListener('dblclick',()=>{ openDialogCU('calc'); }); } grid.appendChild(cell); }
          }
          function currentTimestamp(){ const n = new Date(); const y = n.getFullYear(); const m = String(n.getMonth()+1).padStart(2,'0'); const d = String(n.getDate()).padStart(2,'0'); const hh = String(n.getHours()).padStart(2,'0'); const mm = String(n.getMinutes()).padStart(2,'0'); const ss = String(n.getSeconds()).padStart(2,'0'); return y + '-' + m + '-' + d + ' ' + hh + ':' + mm + ':' + ss; }
          function openDialogCU(tab){ const backdrop = document.getElementById('dialog-cu'); backdrop.style.display = 'flex'; switchTabCU(tab); }
          function closeDialogCU(){ document.getElementById('dialog-cu').style.display = 'none'; }
          function switchTabCU(tab){ document.querySelectorAll('#dialog-cu .tab').forEach(t=>{ t.classList.toggle('active', t.dataset.tab===tab); }); document.getElementById('form-calc').style.display = tab==='calc'?'grid':'none'; document.getElementById('form-use').style.display = tab==='use'?'grid':'none'; const action = document.getElementById('dialog-action'); action.textContent = tab==='calc'?'计算保存':'保存使用'; }
          function openDialogEdit(){ const backdrop = document.getElementById('dialog-edit'); backdrop.style.display = 'flex'; var ds = (state.selected? fmtDate(state.selected.y, state.selected.m, state.selected.d): (function(){ var n=new Date(); return fmtDate(n.getFullYear(), n.getMonth(), n.getDate()); })()); var ed = document.getElementById('edit-date'); if(ed) ed.textContent = ds; var e = (DATA && DATA[ds]) || null; var calc0 = e && e.calc && e.calc[0] || null; var origInit = document.getElementById('orig-init'); var origFinal = document.getElementById('orig-final'); var origVol = document.getElementById('orig-vol'); var origTxnPts = document.getElementById('orig-txnpts'); var origBalPts = document.getElementById('orig-balancepts'); var origWear = document.getElementById('orig-wear'); var origTime = document.getElementById('orig-time'); var ei = document.getElementById('edit-init'); var ef = document.getElementById('edit-final'); var ev = document.getElementById('edit-vol'); var etp = document.getElementById('edit-txnpts'); var ebp = document.getElementById('edit-balancepts'); var ew = document.getElementById('edit-wear'); var et = document.getElementById('edit-time'); var init = calc0? Number(calc0.initBalance)||0 : 0; var final = calc0? Number(calc0.finalBalance)||0 : 0; var vol = calc0? Number((calc0.txnVolume!==undefined?calc0.txnVolume: (calc0.volume!==undefined?calc0.volume: (calc0.transaction!==undefined?calc0.transaction: 0))))||0 : 0; var txnpts = calc0? (typeof calc0.txnPts!=='undefined'? Number(calc0.txnPts)||0 : (vol>=2? Math.floor(Math.log2(vol)) : 0)) : 0; var balpts = final>=100000 ? 4 : (final>=10000 ? 3 : (final>=1000 ? 2 : (final>=100 ? 1 : 0))); var wear = calc0? (typeof calc0.wear!=='undefined'? Number(calc0.wear)||0 : (init - final)) : 0; var time = calc0 && (calc0.timestamp||'') || ''; if(origInit) origInit.value = String(init); if(origFinal) origFinal.value = String(final); if(origVol) origVol.value = String(vol); if(origTxnPts) origTxnPts.value = String(txnpts); if(origBalPts) origBalPts.value = String(balpts); if(origWear) origWear.value = String(wear); if(origTime) origTime.value = time; if(ei) ei.value = String(init); if(ef) ef.value = String(final); if(ev) ev.value = String(vol); if(etp) etp.value = String(txnpts); if(ebp) ebp.value = String(balpts); if(ew) ew.value = String(wear); if(et) et.value = time; }
          function closeDialogEdit(){ document.getElementById('dialog-edit').style.display = 'none'; }
          document.getElementById('open-settings').addEventListener('click',()=>{ const s = document.getElementById('settings'); s.style.display = 'flex'; });
          document.getElementById('cfg-cancel').addEventListener('click',()=>{ const s = document.getElementById('settings'); s.style.display = 'none'; });
          function applyThemeFromControls(){ const cardOp = Number((document.getElementById('cfg-card-opacity')).value); const shOp = Number((document.getElementById('cfg-shadow-opacity')).value); const bcol = (document.getElementById('cfg-border-color')).value; const tcol = (document.getElementById('cfg-text-color')).value; const mcol = (document.getElementById('cfg-muted-color')).value; const btnBg = (document.getElementById('cfg-btn-bg')).value; const btnHover = (document.getElementById('cfg-btn-hover')).value; const sStart = (document.getElementById('cfg-sel-start')).value; const sEnd = (document.getElementById('cfg-sel-end')).value; const invalidBg = (document.getElementById('cfg-invalid-bg')).value; const windowBg = (document.getElementById('cfg-window-bg')).value; const todayDot = (document.getElementById('cfg-today-dot')).value; const statH = Number((document.getElementById('cfg-stat-h')).value)||110; const statRange = Number((document.getElementById('cfg-stat-range')).value)||0; const root = document.documentElement; root.style.setProperty('--card-bg', 'rgba(' + [250,250,250].join(',') + ',' + (cardOp/100).toFixed(3) + ')'); root.style.setProperty('--shadow', 'rgba(' + [200,200,200].join(',') + ',' + (shOp/100).toFixed(3) + ')'); root.style.setProperty('--border', bcol); root.style.setProperty('--text', tcol); root.style.setProperty('--muted', mcol); root.style.setProperty('--button-bg', btnBg); root.style.setProperty('--button-hover-bg', btnHover); root.style.setProperty('--blue-start', sStart); root.style.setProperty('--blue', sEnd); root.style.setProperty('--invalid-bg', invalidBg); root.style.setProperty('--window-bg', windowBg); root.style.setProperty('--today-dot', todayDot); root.style.setProperty('--stat-card-height', statH + 'px'); const themeObj = { cardOp, shOp, bcol, tcol, mcol, btnBg, btnHover, sStart, sEnd, invalidBg, windowBg, todayDot, statH, statRange }; localStorage.setItem('alpha_theme', JSON.stringify(themeObj)); try { fetch('/theme', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(themeObj) }); } catch {} }
          document.getElementById('cfg-apply').addEventListener('click',()=>{ applyThemeFromControls(); computeSummaries(); const s = document.getElementById('settings'); s.style.display = 'none'; });
          (function restoreTheme(){ try { const tLocal = JSON.parse(localStorage.getItem('alpha_theme')||'{}'); if(Object.keys(tLocal).length){ (document.getElementById('cfg-card-opacity')).value = tLocal.cardOp; (document.getElementById('cfg-shadow-opacity')).value = tLocal.shOp; (document.getElementById('cfg-border-color')).value = tLocal.bcol; (document.getElementById('cfg-text-color')).value = tLocal.tcol; (document.getElementById('cfg-muted-color')).value = tLocal.mcol; (document.getElementById('cfg-btn-bg')).value = tLocal.btnBg; (document.getElementById('cfg-btn-hover')).value = tLocal.btnHover; (document.getElementById('cfg-sel-start')).value = tLocal.sStart; (document.getElementById('cfg-sel-end')).value = tLocal.sEnd; (document.getElementById('cfg-invalid-bg')).value = tLocal.invalidBg || '#e5e7eb'; (document.getElementById('cfg-window-bg')).value = tLocal.windowBg || '#ffffff'; (document.getElementById('cfg-today-dot')).value = tLocal.todayDot || '#50cc09'; (document.getElementById('cfg-stat-h')).value = typeof tLocal.statH!=='undefined'? tLocal.statH : 110; (document.getElementById('cfg-stat-range')).value = typeof tLocal.statRange!=='undefined'? tLocal.statRange : 0; applyThemeFromControls(); } fetch('/theme').then(r=> r.ok? r.json(): null).then(t=>{ if(t && Object.keys(t).length){ (document.getElementById('cfg-card-opacity')).value = t.cardOp; (document.getElementById('cfg-shadow-opacity')).value = t.shOp; (document.getElementById('cfg-border-color')).value = t.bcol; (document.getElementById('cfg-text-color')).value = t.tcol; (document.getElementById('cfg-muted-color')).value = t.mcol; (document.getElementById('cfg-btn-bg')).value = t.btnBg; (document.getElementById('cfg-btn-hover')).value = t.btnHover; (document.getElementById('cfg-sel-start')).value = t.sStart; (document.getElementById('cfg-sel-end')).value = t.sEnd; (document.getElementById('cfg-invalid-bg')).value = t.invalidBg || '#e5e7eb'; (document.getElementById('cfg-window-bg')).value = t.windowBg || '#ffffff'; (document.getElementById('cfg-today-dot')).value = t.todayDot || '#50cc09'; (document.getElementById('cfg-stat-h')).value = typeof t.statH!=='undefined'? t.statH : 110; (document.getElementById('cfg-stat-range')).value = typeof t.statRange!=='undefined'? t.statRange : 0; applyThemeFromControls(); } }); } catch {} })();
          
          document.getElementById('dialog-cu').addEventListener('click',(e)=>{ if(e.target.id==='dialog-cu') closeDialogCU(); });
          document.getElementById('dialog-edit').addEventListener('click',(e)=>{ if(e.target.id==='dialog-edit') closeDialogEdit(); });
          function fmtNum(v){ var n = Number(v); if(!isFinite(n)) return String(v); return Number.isInteger(n) ? String(n) : n.toFixed(4); }
          function fmt2(v){ var n = Number(v); if(!isFinite(n)) return String(v); return n.toFixed(2); }
          function fmtKM(v){ var n = Number(v)||0; var a = Math.abs(n); if(a>=1000000) return (n/1000000).toFixed(2)+'M'; if(a>=1000) return (n/1000).toFixed(2)+'K'; return String(n); }
          function fillStatsForDate(dateStr){ if(!DATA || !DATA[dateStr]){ var ids = ['stat-initial','stat-finish','stat-wear','stat-balance','stat-trade','stat-today','stat-profit']; for(var i=0;i<ids.length;i++){ var el = document.getElementById(ids[i]); if(el) el.textContent = ''; } var tk = document.getElementById('stat-token'); if(tk) tk.textContent = '--'; return; } const entry = DATA[dateStr]; const calc = entry.calc && entry.calc[0]; const uses = entry.use && Array.isArray(entry.use) ? entry.use : []; const use0 = uses[0] || null; function set2(id, val){ const el = document.getElementById(id); if(el) el.textContent = fmt2(val); } if(calc){ var init = Number(calc.initBalance)||0; var fin = Number(calc.finalBalance)||0; var wear = typeof calc.wear!=='undefined' ? Number(calc.wear)||0 : (init - fin); var vol = Number((calc.txnVolume!==undefined?calc.txnVolume: (calc.volume!==undefined?calc.volume: (calc.transaction!==undefined?calc.transaction: 0))))||0; var tradePts = typeof calc.txnPts!=='undefined' ? Number(calc.txnPts)||0 : (vol>=2 ? Math.floor(Math.log2(vol)) : 0); var holdPts = fin>=100000 ? 4 : (fin>=10000 ? 3 : (fin>=1000 ? 2 : (fin>=100 ? 1 : 0))); var dayPts = tradePts + holdPts; set2('stat-initial', init); set2('stat-finish', fin); set2('stat-wear', wear); set2('stat-balance', holdPts); set2('stat-trade', tradePts); set2('stat-today', dayPts); var profit = 0; try { for(var i=0;i<uses.length;i++){ var u = uses[i]; var up = Number(u.unitPrice||u.price||0)||0; var qty = Number(u.quantity||u.qty||0)||0; profit += up * qty; } } catch {} set2('stat-profit', profit); var tok = document.getElementById('stat-token'); if(tok){ tok.textContent = use0 ? String(use0.tokenName||use0.name||'--') : '--'; } }
          }
          function getStatRange(){ try { var el = document.getElementById('cfg-stat-range'); var v = Number((el && (el).value) || 0); return Number.isFinite(v)?v:0; } catch { return 0; } }
          function computeSummaries(){ if(!DATA) return; var wear = 0, profit = 0, volume = 0; var range = getStatRange(); try { const now = new Date(); const pivot = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0); const ref = now.getTime() < pivot.getTime() ? new Date(now.getFullYear(), now.getMonth(), now.getDate()-1) : new Date(now.getFullYear(), now.getMonth(), now.getDate()); Object.keys(DATA).forEach(k=>{ const ds = new Date(k+'T00:00:00'); const diffMs = ref.getTime() - ds.getTime(); const diffDays = Math.floor(diffMs / (24*60*60*1000)); if(range>0){ if(diffDays<0 || diffDays>range) return; } const entry = DATA[k]; const calcs = (entry && Array.isArray(entry.calc)) ? entry.calc : []; const uses = entry && Array.isArray(entry.use) ? entry.use : []; var dayVol = 0; var dayPts = 0; for(var ci=0; ci<calcs.length; ci++){ var c = calcs[ci]; var init = Number(c.initBalance)||0; var fin = Number(c.finalBalance)||0; wear += typeof c.wear!=='undefined' ? (Number(c.wear)||0) : (init - fin); var v = Number((c.txnVolume!==undefined?c.txnVolume: (c.volume!==undefined?c.volume: (c.transaction!==undefined?c.transaction: 0))))||0; if(v>0){ dayVol += v; } else if(typeof c.txnPts!=='undefined'){ var p = Number(c.txnPts)||0; if(p>0) dayPts += p; } }
            if(dayVol>0){ volume += dayVol; } else if(dayPts>0){ volume += Math.pow(2, dayPts); }
            try { for(var i=0;i<uses.length;i++){ var u = uses[i]; var up = Number(u.unitPrice||u.price||0)||0; var qty = Number(u.quantity||u.qty||0)||0; profit += up * qty; } } catch {}
          }); } catch {} var sw = document.getElementById('sum-wear'); if(sw) sw.textContent = fmtNum(wear); var np = document.getElementById('sum-profit'); if(np) np.textContent = fmtNum(profit - wear); var svl = document.getElementById('sum-volume'); if(svl) svl.textContent = fmtKM(volume); var sr = document.getElementById('sum-rate'); if(sr) sr.textContent = (volume>0? ((wear/volume)*100).toFixed(6)+'%' : '0%'); }
          document.querySelectorAll('.stat-card').forEach(el=>{ el.addEventListener('dblclick', ()=> openDialogEdit()); });
          document.querySelectorAll('#dialog-cu .tab').forEach(t=> t.addEventListener('click', ()=> switchTabCU(t.dataset.tab)) );
          document.getElementById('prev-month').addEventListener('click',()=>{ if(state.m===0){ state.m=11; state.y--; } else state.m--; buildMonth(state.y,state.m); });
          document.getElementById('next-month').addEventListener('click',()=>{ if(state.m===11){ state.m=0; state.y++; } else state.m++; buildMonth(state.y,state.m); });
          const now = new Date(); const pivot = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0); const ref = now.getTime() < pivot.getTime() ? new Date(now.getFullYear(), now.getMonth(), now.getDate()-1) : new Date(now.getFullYear(), now.getMonth(), now.getDate()); state.y = ref.getFullYear(); state.m = ref.getMonth(); buildMonth(state.y,state.m); var td = document.getElementById('today-date'); if(td) td.textContent = fmtDate(ref.getFullYear(), ref.getMonth(), ref.getDate());
          
          function computeEffectivePoints(){ if(!DATA) return; var sum = 0; try { Object.keys(DATA).forEach(k=>{ if(isValidDate(k)){ const entry = DATA[k]; const calc0 = entry && entry.calc && entry.calc[0]; if(calc0 && typeof calc0.txnPts !== 'undefined'){ sum += Number(calc0.txnPts)||0; } const uses = entry && entry.use; if(Array.isArray(uses)){ sum -= 15 * uses.length; } } }); } catch {} var el = document.getElementById('sum-valid'); if(el) el.textContent = String(sum); }
          try { fetch('/data').then(r=> r.ok? r.json(): null).then(j=>{ DATA = j||null; buildMonth(state.y,state.m); computeEffectivePoints(); computeSummaries(); if(td) fillStatsForDate(td.textContent); }); } catch {}
          try { fetch('/theme').then(r=> r.ok? r.json(): null).then(t=>{ if(t && Object.keys(t).length){ (document.getElementById('cfg-card-opacity')).value = t.cardOp; (document.getElementById('cfg-shadow-opacity')).value = t.shOp; (document.getElementById('cfg-border-color')).value = t.bcol; (document.getElementById('cfg-text-color')).value = t.tcol; (document.getElementById('cfg-muted-color')).value = t.mcol; (document.getElementById('cfg-btn-bg')).value = t.btnBg; (document.getElementById('cfg-btn-hover')).value = t.btnHover; (document.getElementById('cfg-sel-start')).value = t.sStart; (document.getElementById('cfg-sel-end')).value = t.sEnd; (document.getElementById('cfg-invalid-bg')).value = t.invalidBg || '#e5e7eb'; (document.getElementById('cfg-window-bg')).value = t.windowBg || '#ffffff'; (document.getElementById('cfg-today-dot')).value = t.todayDot || '#50cc09'; (document.getElementById('cfg-stat-h')).value = typeof t.statH!=='undefined'? t.statH : 110; (document.getElementById('cfg-stat-range')).value = typeof t.statRange!=='undefined'? t.statRange : 0; applyThemeFromControls(); } }); } catch {}
        </script>
      </body>
    </html>
  `;
}

export function renderLoginHtml() {
  return `
    <!DOCTYPE html>
    <html lang="zh-CN">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>登录</title>
        <style>
          :root { --text:#0F172A; --muted:#64748B; --card-bg:rgba(250,250,250,0.698); --border:rgba(148,163,184,0.64); --shadow:rgba(200,200,200,0.4); --blue:#3B82F6; --button-bg:#FFFFFF; --button-hover-bg:#F9FAFB; --window-bg:#FFFFFF; }
          * { box-sizing: border-box; }
          html, body { height: 100%; }
          body { margin: 0; font-family: Segoe UI, Roboto, Arial, sans-serif; color: var(--text); background: var(--window-bg); }
          .lock { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; padding: 20px; background: rgba(0,0,0,0.25); }
          .card { width: 100%; max-width: 420px; background: var(--card-bg); border: 1px solid var(--border); border-radius: 14px; padding: 16px; box-shadow: 0 8px 24px var(--shadow); backdrop-filter: blur(6px); }
          .title { font-size: 18px; font-weight: 700; text-align: center; margin-bottom: 10px; }
          .input { width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: #FFFFFF; }
          .btn { width: 100%; background: var(--blue); color: #fff; border: none; border-radius: 10px; padding: 10px 14px; cursor: pointer; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="lock">
          <form class="card" method="POST" action="/auth">
            <div class="title">输入密码以进入</div>
            <div id="err" style="display:none; color:#EF4444; font-size:12px; text-align:center; margin-bottom:6px;">密码错误或系统未配置</div>
            <input class="input" type="password" name="password" placeholder="请输入密码" autocomplete="off" />
            <button class="btn" type="submit">进入</button>
          </form>
        </div>
        <script>
          (function(){ try { const p = new URLSearchParams(location.search); if(p.get('error')){ var el = document.getElementById('err'); if(el){ el.style.display='block'; } } } catch {} })();
        </script>
      </body>
    </html>
  `;
}
