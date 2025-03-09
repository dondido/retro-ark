import { commitTransaction } from './db.js';
import { normaliseTitle } from './utils.js';

const catalogues = {};
const titles = {};
function compareTwoStrings(first, second) {
	first = first.replace(/\s+/g, '');
	second = second.replace(/\s+/g, '');
	if (first === second) return 1; // identical or empty
	if (first.length < 2 || second.length < 2) return 0; // if either is a 0-letter or 1-letter string
	let firstBigrams = new Map();
	for (let i = 0; i < first.length - 1; i++) {
		const bigram = first.substring(i, i + 2);
		const count = firstBigrams.has(bigram) ? firstBigrams.get(bigram) + 1 : 1;
		firstBigrams.set(bigram, count);
	};
	let intersectionSize = 0;
	for (let i = 0; i < second.length - 1; i++) {
		const bigram = second.substring(i, i + 2);
		const count = firstBigrams.has(bigram) ? firstBigrams.get(bigram) : 0;
		if (count > 0) {
			firstBigrams.set(bigram, count - 1);
			intersectionSize++;
		}
	}
	return (2.0 * intersectionSize) / (first.length + second.length - 2);
}
function findBestMatch(mainString, targetStrings) {
	if (!areArgsValid(mainString, targetStrings)) throw new Error('Bad arguments: First argument should be a string, second should be an array of strings');
	const ratings = [];
	let bestMatchIndex = 0;
	for (let i = 0; i < targetStrings.length; i++) {
		const currentTargetString = targetStrings[i].toLowerCase();
		const currentRating = compareTwoStrings(mainString, currentTargetString)
		ratings.push({target: currentTargetString, rating: currentRating})
		if (currentRating > ratings[bestMatchIndex].rating) {
			bestMatchIndex = i
		}
	}
	const bestMatch = ratings[bestMatchIndex]
	return { ratings, bestMatch, bestMatchIndex: bestMatchIndex };
}
function areArgsValid(mainString, targetStrings) {
	if (typeof mainString !== 'string') return false;
	if (!Array.isArray(targetStrings)) return false;
	if (!targetStrings.length) return false;
	if (targetStrings.find( function (s) { return typeof s !== 'string'})) return false;
	return true;
}
const readFile = (file) => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onerror = event => reject(event.error);
      reader.onloadend = event => resolve(event.target.result);
      reader.readAsArrayBuffer(file);
    });
};
const isStringInString = (mainString, targetStrings) => {
	for (let i = 0; i < targetStrings.length; i++) {
		const target = targetStrings[i].toLowerCase();
        if (target.includes(mainString)) {
            return { bestMatchIndex: i, bestMatch: { target, rating: 1 } }
        }
	}
    for (let i = 0; i < targetStrings.length; i++) {
		const target = targetStrings[i].toLowerCase();
        if (mainString.includes(target)) {
            return { bestMatchIndex: i, bestMatch: { target, rating: 1 } }
        }
	}
    return null;
}
const findBestNameMatch = (mainString, targetStrings) => {
    const match = findBestMatch(mainString, targetStrings);
    const { bestMatch: { rating } } = match;
    if (rating > .9) return match;
    const matchFallback = isStringInString(mainString, targetStrings);
    if (matchFallback) return matchFallback;
    if (rating > .6) return match;
    return {};
};
window.titles = titles;
window.findBestMatch = findBestMatch;
picker.addEventListener('change', async e => {
    const roms = Array.from(e.target.files);
    let completedCount = 0;
    const step = () => {
        if (completedCount < roms.length) {
            $progress.textContent = `Importing ${completedCount} of ${roms.length}.`;
            return requestAnimationFrame(step);
        }
        $progress.textContent = `Imported ${completedCount} of ${roms.length}. Done.`;
    };
    requestAnimationFrame(step);
    for (const rom of roms) {
        const ext = rom.name.split('.').at(-1);
        let platform;
        if (['fds', 'nes', 'unif', 'unf'].includes(ext)) {
            platform = 'nes';
        }
        completedCount ++;
        if (platform) {
            if (platform in catalogues === false) {
                const json = await (await fetch(`json/${platform}.json`)).json();
                catalogues[platform] = json;
                titles[platform] = json.map(({ path }) => normaliseTitle(path));
            }
            const title = normaliseTitle(rom.name);
            const { bestMatchIndex } = findBestNameMatch(title.toLowerCase(), titles[platform]);
            const entry = bestMatchIndex === undefined ? { platform } : catalogues[platform][bestMatchIndex];
            const buffer = await readFile(rom);
            entry.id ||= `${title.replace(/\s/g, '')}.${platform}`;
            entry.title = title;
            if ($tag.value) {
                entry.tag = $tag.value;
            }
            await commitTransaction('games', entry);
            await commitTransaction('roms', { file: new Blob([buffer]), id: entry.id, title });
        }
    }
    console.log('Done');
});