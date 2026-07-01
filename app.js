const PASSWORD = "123456"; // Doi mat khau tai day
const audio = document.getElementById('audio');
const tracksEl = document.getElementById('tracks');
const albumsEl = document.getElementById('albums');
const searchEl = document.getElementById('search');
const countEl = document.getElementById('count');
const favKey = 'suno-favorites-v2';
let all = Array.isArray(window.MUSIC_LIBRARY) ? window.MUSIC_LIBRARY : [];
let current = 0, filter = 'all', album = '', shuffle = false, repeat = false;
let favs = new Set(JSON.parse(localStorage.getItem(favKey) || '[]'));
function saveFav(){ localStorage.setItem(favKey, JSON.stringify([...favs])); }
function norm(s){ return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''); }
function coverOf(t){ return t.cover || 'data:image/svg+xml;utf8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="100%" height="100%" fill="#142232"/><text x="50%" y="52%" font-size="64" text-anchor="middle" fill="#22c55e">♫</text></svg>`); }
function visible(){ const q=norm(searchEl.value); return all.filter(t=>{ if(filter==='fav'&&!favs.has(t.path)) return false; if(album&&t.album!==album) return false; return !q || norm(t.title+' '+t.album+' '+t.path).includes(q); }); }
function renderAlbums(){ const albums=[...new Set(all.map(t=>t.album||'Khac'))].sort(); albumsEl.innerHTML=''; albums.forEach(a=>{ const b=document.createElement('button'); b.className='album-btn'; b.textContent=a; b.onclick=()=>{album=album===a?'':a; filter='all'; document.querySelectorAll('.nav').forEach(x=>x.classList.remove('active')); render();}; albumsEl.appendChild(b); }); }
function render(){ const list=visible(); countEl.textContent=list.length+' bài'; tracksEl.innerHTML=''; list.forEach((t,i)=>{ const row=document.createElement('div'); row.className='track '+(all[current]?.path===t.path?'playing':''); row.innerHTML=`<img src="${coverOf(t)}"><div><b>${t.title}</b><span>${t.album||''}</span></div><button class="fav">${favs.has(t.path)?'★':'☆'}</button><div class="fmt">${(t.ext||'').toUpperCase()}</div>`; row.onclick=(e)=>{ if(e.target.className==='fav'){ favs.has(t.path)?favs.delete(t.path):favs.add(t.path); saveFav(); render(); return;} play(all.indexOf(t)); }; tracksEl.appendChild(row); }); }
function play(i){ if(!all.length) return; current=(i+all.length)%all.length; const t=all[current]; audio.src=encodeURI(t.path); audio.play().catch(()=>{}); document.getElementById('title').textContent=t.title; document.getElementById('album').textContent=t.album||''; document.getElementById('cover').src=coverOf(t); localStorage.setItem('suno-last', String(current)); render(); }
function next(){ if(shuffle) play(Math.floor(Math.random()*all.length)); else play(current+1); }
document.getElementById('unlock').onclick=()=>{ if(document.getElementById('pass').value===PASSWORD){ document.getElementById('lock').classList.add('hidden'); document.getElementById('app').classList.remove('hidden'); } else document.getElementById('wrong').textContent='Sai mật khẩu'; };
document.getElementById('pass').addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('unlock').click()});
document.querySelectorAll('.nav').forEach(b=>b.onclick=()=>{document.querySelectorAll('.nav').forEach(x=>x.classList.remove('active'));b.classList.add('active');filter=b.dataset.filter;album='';render();});
searchEl.oninput=render; document.getElementById('next').onclick=next; document.getElementById('prev').onclick=()=>play(current-1);
document.getElementById('shuffle').onclick=e=>{shuffle=!shuffle;e.currentTarget.classList.toggle('on',shuffle)}; document.getElementById('repeat').onclick=e=>{repeat=!repeat;e.currentTarget.classList.toggle('on',repeat)};
audio.onended=()=> repeat ? play(current) : next();
renderAlbums(); current=Number(localStorage.getItem('suno-last')||0); render();
