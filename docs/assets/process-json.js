import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { romanToArabic } from '../js/utils.js';

let supportedSystems = '';
const __dirname = import.meta.dirname;
const filenames = readdirSync(__dirname);
const makeCatalogueByPlatform = (filename) => {
    const data = readFileSync(path.join(__dirname, filename));
    const json = JSON.parse(data);
    const [platform] = filename.split('.');
    const stripPath = path => romanToArabic(path.slice(2, path.lastIndexOf('.')));
    const process = ({ path: title, name, desc, rating, releasedate, genre = 'Misc', players = '1', lang = 'en', _id }) => {
        const normalisedPath = stripPath(title);
        return { path: normalisedPath, name, desc, rating, releasedate, genre, players, lang, id: _id, platform };
    };
    json.gameList.game.map(process);
    writeFileSync(path.join(__dirname, `../platforms/${filename}`), JSON.stringify(json.gameList.game.map(process)), 'utf8');
};
const matchJSON = filename => filename.split('.').at(-1) === 'json';
filenames.filter(matchJSON).forEach(makeCatalogueByPlatform);
