// Tab: Bank
V.bank=()=>`<h1>Bank</h1><p class="sub">Geld op de bank ben je niet kwijt als je gepakt wordt. Je krijgt 1% rente per 10 minuten.</p>
 <div class="card" style="max-width:520px"><div class="grid2" style="grid-template-columns:1fr 1fr"><div><div class="label">Contant</div><div class="big" style="color:var(--gold)">${fmt(S.cash)}</div></div><div><div class="label">Bank</div><div class="big">${fmt(S.bank)}</div></div></div>
  <div class="label" style="margin-top:16px">Bedrag</div><input id="amt" class="input" type="number" min="1" value="${Math.floor(S.cash)}">
  <div class="flex" style="margin-top:10px"><button class="btn" onclick="act.dep()">Storten</button><button class="btn gold" onclick="act.wd()">Opnemen</button></div>
  <div class="flex" style="margin-top:8px"><button class="btn sm" onclick="$('#amt').value=Math.floor(S.cash)">Alles contant</button><button class="btn sm" onclick="$('#amt').value=Math.floor(S.bank)">Alles bank</button></div></div>`;
