import { getGame } from './db.js';

let enableDebug = false;
let enableThreads = false;
const id = new URLSearchParams(location.search).get('id');
const { file: blob, name, platform } = await getGame(id);
const recent = localStorage.getItem('recent') || '';
const script = document.createElement("script");
const entry = `${id},`;

window.EJS_player = "#game";
window.EJS_gameName = name;
window.EJS_biosUrl = "";
window.EJS_gameUrl = new File([blob], name);
window.EJS_core = platform;
window.EJS_pathtodata = "data/";
window.EJS_startOnLoaded = true;
window.EJS_DEBUG_XX = enableDebug;
window.EJS_disableDatabases = true;
window.EJS_threads = enableThreads;

script.src = "data/loader.js";
document.body.appendChild(script);
localStorage.setItem('recent', `${entry}${recent.replace(entry, '')}`);