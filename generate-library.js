const fs = require('fs');
const path = require('path');
const exts = new Set(['.mp3','.wav','.flac','.m4a','.aac','.ogg','.opus','.webm']);
const root = path.join(__dirname, 'music');
const out = path.join(__dirname, 'library.js');
function walk(dir){ if(!fs.existsSync(dir)) return []; return fs.readdirSync(dir,{withFileTypes:true}).flatMap(d=>{ const p=path.join(dir,d.name); return d.isDirectory()?walk(p):[p]; }); }
function safeUrl(p){ return p.split(path.sep).join('/'); }
const files = walk(root).filter(f=>exts.has(path.extname(f).toLowerCase()));
const tracks = files.map(f=>{ const rel=safeUrl(path.relative(__dirname,f)); const parts=rel.split('/'); const file=parts.pop(); const ext=path.extname(file).slice(1).toLowerCase(); const album=parts.slice(1).join(' / ') || 'Nhac le'; const folder=path.dirname(f); const cover=['cover.jpg','cover.png','album.jpg','album.png'].map(c=>path.join(folder,c)).find(fs.existsSync); return { title:path.basename(file,path.extname(file)), album, path:rel, ext, cover:cover?safeUrl(path.relative(__dirname,cover)):'' }; }).sort((a,b)=>(a.album+a.title).localeCompare(b.album+b.title,'vi'));
fs.writeFileSync(out, 'window.MUSIC_LIBRARY = '+JSON.stringify(tracks,null,2)+';\n');
console.log('Da tao library.js voi '+tracks.length+' bai hat.');
