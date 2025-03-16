import { renameSync, readdirSync } from 'node:fs';
import path from 'node:path';

const __dirname = import.meta.dirname;
const files = readdirSync(__dirname);
files.forEach(name => {
    console.log(11111, name)
    if (name.endsWith('.webm')) {
        console.log(111111, path.join(__dirname, `${name.replace(/-video.webm$/i, '.webm')}`) )
        renameSync(path.join(__dirname, name), path.join(__dirname, `${name.replace(/-video.webm$/i, '.webm')}`));
    }
});
