import { getGame } from './db.js';

let enableDebug = false;
let enableThreads = false;
const id = new URLSearchParams(location.search).get('id');
console.log(11111, id);
alert(`Loading game with id: ${id}...`);
var a = await getGame(id);
console.log(11112, typeof id, a);
const { uri, file, name, platform } = await getGame(id);
console.log(11114, uri);

const blob = uri && await window.getRomFileAsBlob(uri);
console.log(11118, name, blob, file);
const recent = localStorage.getItem('recent') || '';
const script = document.createElement('script');
const entry = `${id},`;

window.EJS_player = "#game";
window.EJS_gameName = name;
window.EJS_biosUrl = "";
window.EJS_gameUrl = new File([blob || file], name);
window.EJS_core = platform;
window.EJS_pathtodata = "data/";
window.EJS_startOnLoaded = true;
window.EJS_DEBUG_XX = enableDebug;
window.EJS_disableDatabases = true;
window.EJS_threads = enableThreads;

script.src = "data/loader.js";
document.body.appendChild(script);
localStorage.setItem('recent', `${entry}${recent.replace(entry, '')}`);