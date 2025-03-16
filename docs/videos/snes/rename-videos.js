import { renameSync, readdirSync } from 'node:fs';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { romanToArabic, stripSpecialCharacters } from '../../js/utils.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const files = readdirSync(__dirname);
files.forEach(name => {
    if (name.endsWith('.webm')) {
        const newName = stripSpecialCharacters(romanToArabic(name));
        renameSync(path.join(__dirname, name), path.join(__dirname, `${newName.replace(/webm$/i, 'webm')}`));
    }
});
