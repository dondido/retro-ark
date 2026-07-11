import { getGame } from './db.js';
import { callWebview } from './utils.js';

const enableDebug = false;
const enableThreads = false;
const id = new URLSearchParams(location.search).get('id');

const game = await getGame(id);
console.log(1111147, JSON.stringify(game));

const { uri, file, title, platform } = game || {};
console.log(1111148, id, uri);

const base64 = uri && await callWebview('getFileAsBase64Async', uri);
const byteArray = base64 && Uint8Array.fromBase64(base64);
console.log(1111149, id, title, platform, uri, file, byteArray);
const recent = localStorage.getItem('recent') || '';
const script = document.createElement('script');
const entry = `${id},`;

window.EJS_player = "#game";
window.EJS_gameName = title;
window.EJS_biosUrl = "";
window.EJS_gameUrl = new File([byteArray || file], title);
window.EJS_core = platform;
window.EJS_pathtodata = "data/";
window.EJS_startOnLoaded = true;
window.EJS_DEBUG_XX = enableDebug;
window.EJS_disableDatabases = true;
window.EJS_threads = enableThreads;

script.src = "data/loader.js";
document.body.appendChild(script);
localStorage.setItem('recent', `${entry}${recent.replace(entry, '')}`);
