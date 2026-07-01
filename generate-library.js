const fs = require('fs');
const path = require('path');
const root = __dirname;
const musicDir = path.join(root, 'music');
const audioExt = new Set(['.mp3','.wav','.flac','.m4a','.aac','.ogg','.opus','.webm']);
const imageExt = new Set(['.jpg','.jpeg','.png','.webp']);
function walk(dir){
  if(!fs.existsSync(dir)) return [];
  let out=[];
  for(const name of fs.readdirSync(dir)){
    const p=path.join(dir,name); const st=fs.statSync(p);
    if(st.isDirectory()) out=out.concat(walk(p)); else out.push(p);
  }
  return out;
}
function rel(p){ return path.relative(root,p).split(path.sep).join('/'); }
function cleanTitle(file){ return path.basename(file,path.extname(file)).replace(/[_-]+/g,' ').trim(); }
function albumOf(file){ const r=rel(file).split('/'); return r.length>2 ? r[1] : 'Music'; }
function findCover(file){
  const dir=path.dirname(file); const files=fs.existsSync(dir)?fs.readdirSync(dir):[];
  const hit=files.find(f=>['cover','folder','album','artwork'].includes(path.basename(f,path.extname(f)).toLowerCase()) && imageExt.has(path.extname(f).toLowerCase()));
  return hit ? rel(path.join(dir,hit)) : '';
}
const tracks = walk(musicDir).filter(f=>audioExt.has(path.extname(f).toLowerCase())).sort((a,b)=>rel(a).localeCompare(rel(b),'vi')).map((f,i)=>({ id: rel(f), title: cleanTitle(f), artist: 'Suno', album: albumOf(f), path: rel(f), cover: findCover(f) }));
const js = 'window.MUSIC_LIBRARY = ' + JSON.stringify(tracks,null,2) + ';\n';
fs.writeFileSync(path.join(root,'library.js'), js);
console.log(`Updated library.js: ${tracks.length} tracks`);
