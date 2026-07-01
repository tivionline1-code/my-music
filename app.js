const PASSWORD = '123456';
const $ = (id) => document.getElementById(id);
const audio = $('audio');
const state = { tracks: [], filtered: [], index: -1, view: 'all', album: null, shuffle: false, repeat: false, favs: new Set(JSON.parse(localStorage.getItem('favs')||'[]')), recent: JSON.parse(localStorage.getItem('recent')||'[]') };

function saveFavs(){ localStorage.setItem('favs', JSON.stringify([...state.favs])); }
function saveRecent(){ localStorage.setItem('recent', JSON.stringify(state.recent.slice(0,50))); }
function fmt(s){ if(!isFinite(s)) return '0:00'; const m=Math.floor(s/60); const r=Math.floor(s%60).toString().padStart(2,'0'); return `${m}:${r}`; }
function esc(s=''){ return String(s).replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function pathName(p){ return decodeURIComponent((p||'').split('/').pop()||''); }
function titleFromFile(p){ return pathName(p).replace(/\.[^.]+$/,'').replace(/[_-]+/g,' ').trim(); }
function albumFromPath(p){ const parts=(p||'').split('/'); return parts.length>2 ? parts[1] : 'Music'; }
function coverFor(t){ return t.cover || ''; }
function coverHtml(t, cls='cover'){ const c=coverFor(t); return `<div class="${cls}">${c?`<img src="${esc(c)}" alt="">`:'♪'}</div>`; }

function normalizeLibrary(){
  const lib = Array.isArray(window.MUSIC_LIBRARY) ? window.MUSIC_LIBRARY : [];
  state.tracks = lib.map((t,i)=>({
    id: t.id || t.path || `track-${i}`,
    title: t.title || titleFromFile(t.path),
    album: t.album || albumFromPath(t.path),
    artist: t.artist || 'Suno',
    path: t.path,
    cover: t.cover || '',
    duration: t.duration || ''
  })).filter(t=>t.path);
}

function unlock(){
  if($('password').value === PASSWORD){
    localStorage.setItem('unlocked','1'); $('lock').classList.add('hidden'); $('app').classList.remove('hidden'); init();
  } else $('lockMsg').textContent='Sai mật khẩu';
}
$('unlockBtn').onclick = unlock; $('password').addEventListener('keydown', e=>{ if(e.key==='Enter') unlock(); });
if(localStorage.getItem('unlocked')==='1'){ $('lock').classList.add('hidden'); $('app').classList.remove('hidden'); setTimeout(init); }

function init(){ normalizeLibrary(); renderAlbums(); render(); restoreLast(); setupViz(); }
function albums(){ return [...new Set(state.tracks.map(t=>t.album))].sort((a,b)=>a.localeCompare(b,'vi')); }
function renderAlbums(){
  $('albumList').innerHTML = albums().map(a=>`<button class="album-btn" data-album="${esc(a)}"><span>${esc(a)}</span><span>${state.tracks.filter(t=>t.album===a).length}</span></button>`).join('') || '<div class="meta">Chưa có album</div>';
  document.querySelectorAll('.album-btn').forEach(b=>b.onclick=()=>{state.view='album'; state.album=b.dataset.album; setActiveNav(); render();});
}
function setActiveNav(){ document.querySelectorAll('.nav').forEach(b=>b.classList.toggle('active', b.dataset.view===state.view)); document.querySelectorAll('.album-btn').forEach(b=>b.classList.toggle('active', state.view==='album' && b.dataset.album===state.album)); }
document.querySelectorAll('.nav').forEach(b=>b.onclick=()=>{ state.view=b.dataset.view; state.album=null; setActiveNav(); render(); });
$('search').oninput = render;

function currentBase(){
  if(state.view==='favorites') return state.tracks.filter(t=>state.favs.has(t.id));
  if(state.view==='recent') return state.recent.map(id=>state.tracks.find(t=>t.id===id)).filter(Boolean);
  if(state.view==='album') return state.tracks.filter(t=>t.album===state.album);
  return state.tracks;
}
function render(){
  setActiveNav();
  const q=$('search').value.toLowerCase().trim();
  state.filtered = currentBase().filter(t=>!q || `${t.title} ${t.album} ${t.artist}`.toLowerCase().includes(q));
  const titles={all:'Tất cả bài hát',favorites:'Yêu thích',recent:'Nghe gần đây',album:state.album||'Album'};
  $('pageTitle').textContent=titles[state.view]; $('stats').textContent=`${state.filtered.length} bài hát • ${albums().length} album`;
  $('trackList').innerHTML = state.filtered.length ? state.filtered.map((t,i)=>`<div class="track ${state.tracks[state.index]?.id===t.id?'playing':''}" data-i="${i}">${coverHtml(t)}<div><div class="title">${esc(t.title)}</div><div class="meta">${esc(t.artist)}</div></div><div class="album-col">${esc(t.album)}</div><div class="duration">${esc(t.duration||'')}</div><button class="fav ${state.favs.has(t.id)?'on':''}" data-fav="${esc(t.id)}">★</button></div>`).join('') : '<div class="empty">Chưa có bài hát. Hãy upload nhạc vào thư mục music rồi chờ GitHub Actions cập nhật.</div>';
  document.querySelectorAll('.track').forEach(el=>el.onclick=(e)=>{ if(e.target.classList.contains('fav')) return; playFiltered(+el.dataset.i); });
  document.querySelectorAll('.fav').forEach(b=>b.onclick=()=>{ const id=b.dataset.fav; state.favs.has(id)?state.favs.delete(id):state.favs.add(id); saveFavs(); render(); });
}
function playFiltered(i){ const t=state.filtered[i]; const real=state.tracks.findIndex(x=>x.id===t.id); playIndex(real); }
function playIndex(i){ if(i<0||i>=state.tracks.length) return; state.index=i; const t=state.tracks[i]; audio.src=t.path; audio.play().catch(()=>{}); updateNow(); state.recent=[t.id,...state.recent.filter(x=>x!==t.id)]; saveRecent(); localStorage.setItem('lastTrack',t.id); render(); }
function updateNow(){ const t=state.tracks[state.index]; $('nowTitle').textContent=t?t.title:'Chưa chọn bài'; $('nowMeta').textContent=t?`${t.artist} • ${t.album}`:'—'; $('nowCover').innerHTML=t&&coverFor(t)?`<img src="${esc(coverFor(t))}">`:'♪'; $('playBtn').textContent=audio.paused?'▶':'⏸'; }
function next(){ if(!state.tracks.length)return; if(state.shuffle) return playIndex(Math.floor(Math.random()*state.tracks.length)); playIndex((state.index+1)%state.tracks.length); }
function prev(){ if(!state.tracks.length)return; playIndex((state.index-1+state.tracks.length)%state.tracks.length); }
$('playBtn').onclick=()=>{ if(state.index<0 && state.tracks.length) playIndex(0); else audio.paused?audio.play():audio.pause(); };
$('nextBtn').onclick=next; $('prevBtn').onclick=prev;
$('shuffleBtn').onclick=()=>{state.shuffle=!state.shuffle; $('shuffleBtn').classList.toggle('active',state.shuffle)};
$('repeatBtn').onclick=()=>{state.repeat=!state.repeat; $('repeatBtn').classList.toggle('active',state.repeat)};
audio.onplay=updateNow; audio.onpause=updateNow; audio.onended=()=> state.repeat ? playIndex(state.index) : next();
audio.ontimeupdate=()=>{ $('curTime').textContent=fmt(audio.currentTime); $('durTime').textContent=fmt(audio.duration); $('seek').value= audio.duration ? (audio.currentTime/audio.duration*100) : 0; localStorage.setItem('lastTime',String(audio.currentTime||0)); };
$('seek').oninput=()=>{ if(audio.duration) audio.currentTime= audio.duration * $('seek').value/100; };
$('volume').oninput=()=> audio.volume=+$('volume').value; audio.volume=+$('volume').value;
function restoreLast(){ const id=localStorage.getItem('lastTrack'); const i=state.tracks.findIndex(t=>t.id===id); if(i>=0){ state.index=i; audio.src=state.tracks[i].path; audio.currentTime=+(localStorage.getItem('lastTime')||0); updateNow(); render(); } }
function setupViz(){
  const canvas=$('viz'), ctx=canvas.getContext('2d'); let ac, src, analyser, data;
  function connect(){ if(ac) return; try{ ac=new AudioContext(); src=ac.createMediaElementSource(audio); analyser=ac.createAnalyser(); src.connect(analyser); analyser.connect(ac.destination); data=new Uint8Array(analyser.frequencyBinCount); draw(); }catch(e){} }
  audio.addEventListener('play',()=>{ connect(); if(ac&&ac.state==='suspended') ac.resume(); });
  function draw(){ requestAnimationFrame(draw); if(!analyser) return; analyser.getByteFrequencyData(data); ctx.clearRect(0,0,canvas.width,canvas.height); const bars=24,w=canvas.width/bars; for(let i=0;i<bars;i++){ const v=data[i*4]/255; const h=v*canvas.height; ctx.fillStyle='rgba(34,197,94,.85)'; ctx.fillRect(i*w,canvas.height-h,w-2,h); } }
}
