export function renderHtml(content: string) {
  return `
    <!DOCTYPE html>
    <html lang="zh-CN">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Alpha 积分管理系统</title>
        <style>
          :root { --text:#0F172A; --muted:#64748B; --card-bg:rgba(255,255,255,0.7); --border:rgba(148,163,184,0.64); --shadow:rgba(2,8,23,0.4); --blue:#3B82F6; --blue-start:#60A5FA; --dialog-bg:rgba(255,255,255,0.8); }
          * { box-sizing: border-box; }
          html, body { height: 100%; }
          body { margin: 0; font-family: Segoe UI, Roboto, Arial, sans-serif; color: var(--text); background: #FFFFFF; }
          .app { min-height: 100vh; display: flex; flex-direction: column; gap: 14px; padding: 14px; }
          .card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 14px; padding: 14px; box-shadow: 0 6px 20px var(--shadow); }
          .top { height: 40px; }
          .middle { display: grid; grid-template-columns: 1fr; gap: 14px; }
          .calendar-header { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
          .calendar-nav { display: flex; gap: 8px; }
          .btn { padding: 8px 12px; border: 1px solid var(--border); border-radius: 10px; background: #FFFFFF; cursor: pointer; }
          .btn:hover { background: #F9FAFB; }
          .month-title { font-size: 16px; font-weight: 600; }
          .week-row { display: grid; grid-template-columns: repeat(7, 1fr); margin-top: 8px; }
          .week-cell { text-align: center; font-size: 14px; color: var(--muted); padding: 6px; }
          .date-grid { display: grid; grid-template-columns: repeat(7, 1fr); grid-template-rows: repeat(6, 1fr); gap: 6px; }
          .date-cell { position: relative; aspect-ratio: 1/1; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-size: 14px; }
          .date-cell.today::before { content: ""; position: absolute; left: 6px; top: 6px; width: 6px; height: 6px; border-radius: 50%; background: #50CC09; }
          .date-cell.has-data { color: #FFFFFF; background: linear-gradient(135deg, var(--blue-start), var(--blue)); }
          .date-cell.selected { outline: 2px solid var(--blue); }
          .date-cell.modified::after { content: ""; position: absolute; right: 6px; bottom: 6px; width: 6px; height: 6px; border-radius: 50%; background: #FBCFE8; }
          .today-card-header { display: flex; align-items: center; justify-content: space-between; }
          .today-title { font-size: 18px; font-weight: 600; }
          .today-date { font-size: 14px; color: var(--muted); }
          .settings { width: 24px; height: 24px; display: grid; place-items: center; border: 1px solid var(--border); border-radius: 10px; background: #FFFFFF; cursor: pointer; }
          .stats-grid { margin-top: 10px; display: grid; grid-template-columns: repeat(4, 1fr); grid-auto-rows: 1fr; gap: 8px; }
          .stat-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px; padding: 10px; box-shadow: 0 6px 14px var(--shadow); display: flex; flex-direction: column; align-items: center; justify-content: center; }
          .stat-label { color: var(--muted); font-size: 12px; }
          .stat-value { color: var(--text); font-size: 22px; font-weight: 600; }
          .summary { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; }
          .summary-card { padding: 12px; border-radius: 14px; box-shadow: 0 6px 14px var(--shadow); background: var(--card-bg); border: 1px solid var(--border); text-align: center; }
          .summary-title { font-size: 16px; font-weight: 700; }
          .summary-value { font-size: 22px; font-weight: 700; }
          .dialog-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.2); display: none; align-items: center; justify-content: center; padding: 14px; }
          .dialog { width: 100%; max-width: 680px; background: var(--dialog-bg); border: 1px solid var(--border); border-radius: 14px; padding: 14px; }
          .tabs { display: flex; gap: 0; }
          .tab { flex: 1; text-align: center; padding: 10px; border: 1px solid var(--border); background: #FFFFFF; cursor: pointer; }
          .tab.active { background: var(--blue); color: #FFFFFF; }
          .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 12px; }
          .form-grid .full { grid-column: span 2; }
          .input { width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: #FFFFFF; }
          .dialog-actions { margin-top: 12px; display: flex; justify-content: flex-end; gap: 8px; }
          .primary { background: var(--blue); color: #FFFFFF; border-radius: 4px; padding: 10px 14px; border: none; cursor: pointer; }
          @media (min-width: 1040px) { .middle { grid-template-columns: 1fr 1fr; } }
          @media (max-width: 960px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } .summary { grid-template-columns: 1fr; } }
          @media (max-width: 640px) { .form-grid { grid-template-columns: 1fr; } }
        </style>
      </head>
      <body>
        <div class="app">
          <div class="top"></div>
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
                <div class="today-title">当日数据：</div>
                <div style="display:flex; align-items:center; gap:8px;">
                  <div class="today-date" id="today-date"></div>
                  <div class="settings" id="open-settings">⚙</div>
                </div>
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
        <div class="dialog-backdrop" id="dialog">
          <div class="dialog">
            <div class="tabs">
              <div class="tab active" data-tab="calc">计算</div>
              <div class="tab" data-tab="use">使用</div>
              <div class="tab" data-tab="edit">修改</div>
            </div>
            <div class="form-grid" id="form-calc">
              <input class="input" placeholder="例如 1000" />
              <input class="input" placeholder="例如 1200" />
              <input class="input" placeholder="例如 200" />
              <input class="input" placeholder="例如 5.000" />
              <input class="input" placeholder="例如 3" />
              <input class="input" placeholder="例如 4" />
              <input class="input" placeholder="例如 180.000" />
              <input class="input full" placeholder="yyyy-MM-dd HH:mm:ss" />
            </div>
            <div class="form-grid" id="form-use" style="display:none;">
              <input class="input" placeholder="例如 BTC" />
              <input class="input" placeholder="例如 0.05" />
              <input class="input" placeholder="例如 68000" />
              <input class="input" placeholder="例如 10" />
              <input class="input full" placeholder="yyyy-MM-dd HH:mm:ss" />
            </div>
            <div class="form-grid" id="form-edit" style="display:none;">
              <select class="input full"><option>选择条目</option></select>
              <input class="input" placeholder="代币名称" />
              <input class="input" placeholder="例如 1200" />
              <input class="input" placeholder="例如 200" />
              <input class="input" placeholder="例如 5.000" />
              <input class="input" placeholder="例如 3" />
              <input class="input" placeholder="例如 4" />
              <input class="input full" placeholder="yyyy-MM-dd HH:mm:ss" />
            </div>
            <div class="dialog-actions">
              <button class="primary" id="dialog-action">计算保存</button>
            </div>
          </div>
        </div>
        <script>
          const state = { y: null, m: null, selected: null };
          function fmtDate(y,m,d){ const mm = String(m+1).padStart(2,'0'); const dd = String(d).padStart(2,'0'); return y + '-' + mm + '-' + dd; }
          function buildMonth(y,m){ const title = document.getElementById('month-title'); title.textContent = y + ' 年 ' + String(m+1).padStart(2,'0') + ' 月'; const grid = document.getElementById('date-grid'); grid.innerHTML = ''; const first = new Date(y,m,1); const startIdx = (first.getDay()+6)%7; const days = new Date(y,m+1,0).getDate(); const today = new Date(); const hasDataSet = new Set([1,5,12,18]); for(let i=0;i<42;i++){ const cell = document.createElement('div'); cell.className = 'date-cell'; const day = i-startIdx+1; if(day>0 && day<=days){ cell.textContent = String(day); const isToday = y===today.getFullYear() && m===today.getMonth() && day===today.getDate(); if(isToday) cell.classList.add('today'); if(hasDataSet.has(day)) cell.classList.add('has-data'); cell.addEventListener('click',()=>{ document.querySelectorAll('.date-cell.selected').forEach(el=>el.classList.remove('selected')); cell.classList.add('selected'); state.selected = { y, m, d: day }; document.getElementById('today-date').textContent = fmtDate(y,m,day); }); cell.addEventListener('dblclick',()=>{ if(isToday) openDialog('calc'); }); } grid.appendChild(cell); }
          }
          function openDialog(tab){ const backdrop = document.getElementById('dialog'); backdrop.style.display = 'flex'; switchTab(tab); }
          function closeDialog(){ document.getElementById('dialog').style.display = 'none'; }
          function switchTab(tab){ document.querySelectorAll('.tab').forEach(t=>{ t.classList.toggle('active', t.dataset.tab===tab); }); document.getElementById('form-calc').style.display = tab==='calc'?'grid':'none'; document.getElementById('form-use').style.display = tab==='use'?'grid':'none'; document.getElementById('form-edit').style.display = tab==='edit'?'grid':'none'; const action = document.getElementById('dialog-action'); action.textContent = tab==='calc'?'计算保存':tab==='use'?'保存使用':'保存修改'; }
          document.getElementById('open-settings').addEventListener('click',()=>openDialog('edit'));
          document.getElementById('dialog').addEventListener('click',(e)=>{ if(e.target.id==='dialog') closeDialog(); });
          document.querySelectorAll('.tab').forEach(t=> t.addEventListener('click', ()=> switchTab(t.dataset.tab)) );
          document.getElementById('prev-month').addEventListener('click',()=>{ if(state.m===0){ state.m=11; state.y--; } else state.m--; buildMonth(state.y,state.m); });
          document.getElementById('next-month').addEventListener('click',()=>{ if(state.m===11){ state.m=0; state.y++; } else state.m++; buildMonth(state.y,state.m); });
          const now = new Date(); state.y = now.getFullYear(); state.m = now.getMonth(); buildMonth(state.y,state.m); document.getElementById('today-date').textContent = fmtDate(state.y,state.m,now.getDate());
          try { const parsed = JSON.parse(${JSON.stringify(JSON.stringify(content))}); const count = Array.isArray(parsed)?parsed.length:0; document.getElementById('sum-valid').textContent = String(count); } catch {}
        </script>
      </body>
    </html>
  `;
}
