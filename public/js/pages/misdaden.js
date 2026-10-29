// Tab: Misdaden — gegroepeerd per rang, met energie, kans en wachttijd
let crimeShowAll=false;
V.crimes=()=>{
 const ri=rankIdx(S.xp);
 const tiers=[...new Set(CRIMES.map(c=>c.r))].sort((a,b)=>a-b);
 const visible=tiers.filter(t=>crimeShowAll||t<=ri+1);
 const avail=CRIMES.filter(c=>c.r<=ri).length,mult=(1+fam().loot/100)*(1+ri*RANK_LOOT+rankLvlBonus())*(isVip()?1+VIP_LOOT:1);
 const row=c=>{const lock=ri<c.r,left=cdLeft(c.id),ch=chance(c),tired=S.energy<c.en;
  const label=lock?'Vanaf '+RANKS[c.r][0]:inJail()?'Je zit vast':left?Math.ceil(left/1000)+'s':tired?'Te moe':'Uitvoeren';
  return `<div class="crime ${lock?'locked':''}" style="${lock?'opacity:.45':''}">
   <div><h3>${c.n}</h3><p>${c.d}</p></div>
   <button class="btn" onclick="act.crime('${c.id}')" ${lock||left||inJail()||tired?'disabled':''}>${label}</button>
   <div class="meta"><span class="tag g">${fmt(c.min*mult)} – ${fmt(c.max*mult)}</span><span class="tag">+${c.xp} XP</span>${c.cr?`<span class="tag c">+${c.cr} cred</span>`:''}<span class="tag b">${c.en} energie</span><span class="tag r">${fmtTime(c.jail)} cel</span><span class="tag lvl${c.flee}">vluchten: ${FLEE_LEVELS[c.flee].label}</span>
    <span class="tag ${ch>60?'gr':ch>35?'g':'r'}">${ch}% kans</span></div>
   ${left?`<div class="cd" style="transform:scaleX(${Math.min(1,left/crimeCd(c))})"></div>`:''}</div>`};
 return `<h1>Misdaden</h1><p class="sub">${avail} van de ${CRIMES.length} klussen staan voor je open. Elke klus kost energie; die laadt vanzelf weer op (1 punt per ${EN_REGEN_S} seconden). Mislukt een klus, dan ga je de cel in.${ri||rankLevel(S.xp)>1?` Je rang (${RANKS[ri][0]}, level ${rankLevel(S.xp)} van ${RANK_SUB}) geeft <b>+${Math.round((ri*RANK_LOOT+rankLvlBonus())*100)}%</b> op elke buit.`:''}${fam().loot?` Je familie geeft er nog <b>+${fam().loot}%</b> bij.`:''}${isVip()?` Als <i class="vipt" style="margin:0 2px">VIP</i> krijg je <b>+15%</b> buit en kom je makkelijker weg bij de politie.`:''}</p>
 <div class="filters"><button class="chip-toggle ${crimeShowAll?'':'on'}" onclick="crimeShowAll=false;render()">Wat ik nu kan</button><button class="chip-toggle ${crimeShowAll?'on':''}" onclick="crimeShowAll=true;render()">Alle ${CRIMES.length} klussen</button></div>
 ${visible.map(t=>`<div class="tierhead ${t>ri?'locked':''}"><h2>${RANKS[t][0]}</h2><span>${t>ri?'Nog '+(RANKS[t][1]-S.xp).toLocaleString('nl-NL')+' XP':'Rang '+(t+1)}</span></div>
  ${CRIMES.filter(c=>c.r===t).map(row).join('')}`).join('')}`};
