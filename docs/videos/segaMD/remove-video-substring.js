import { renameSync, readdirSync } from 'node:fs';
import path from 'node:path';

const __dirname = import.meta.dirname;
const files = readdirSync(__dirname);
files.forEach(name => {
    if (name.endsWith('.webm')) {
        renameSync(path.join(__dirname, name), path.join(__dirname, `${name.replace(/-video.webm$/i, '.webm')}`));
    }
});
