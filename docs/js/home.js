const picker = document.getElementById('picker');
const LevenshteinDistance =  function(a, b){
    if(a.length == 0) return b.length; 
    if(b.length == 0) return a.length; 

    var matrix = [];

    // increment along the first column of each row
    var i;
    for(i = 0; i <= b.length; i++){
        matrix[i] = [i];
    }

    // increment each column in the first row
    var j;
    for(j = 0; j <= a.length; j++){
        matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for(i = 1; i <= b.length; i++){
        for(j = 1; j <= a.length; j++){
        if(b.charAt(i-1) == a.charAt(j-1)){
            matrix[i][j] = matrix[i-1][j-1];
        } else {
            matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
                                    Math.min(matrix[i][j-1] + 1, // insertion
                                            matrix[i-1][j] + 1)); // deletion
        }
        }
    }

    return matrix[b.length][a.length];
};
const JaroWrinker = function (s1, s2) {
    var m = 0;
    var i, j, n_trans ;
    // Exit early if either are empty.
    if ( s1.length === 0 || s2.length === 0 ) {
        return 0;
    }

    // Exit early if they're an exact match.
    if ( s1 === s2 ) {
        return 1;
    }

    var range     = (Math.floor(Math.max(s1.length, s2.length) / 2)) - 1,
        s1Matches = new Array(s1.length),
        s2Matches = new Array(s2.length);

    for ( i = 0; i < s1.length; i++ ) {
        var low  = (i >= range) ? i - range : 0,
            high = (i + range <= s2.length) ? (i + range) : (s2.length - 1);

        for ( j = low; j <= high; j++ ) {
            if ( s1Matches[i] !== true && s2Matches[j] !== true && s1[i] === s2[j] ) {
                ++m;
                s1Matches[i] = s2Matches[j] = true;
                break;
            }
        }
    }

    // Exit early if no matches were found.
    if ( m === 0 ) {
        return 0;
    }

    // Count the transpositions.
    var k = n_trans = 0;

    for ( i = 0; i < s1.length; i++ ) {
        if ( s1Matches[i] === true ) {
        for ( j = k; j < s2.length; j++ ) {
            if ( s2Matches[j] === true ) {
            k = j + 1;
            break;
            }
        }

        if ( s1[i] !== s2[j] ) {
            ++n_trans;
        }
        }
    }

    var weight = (m / s1.length + m / s2.length + (m - (n_trans / 2)) / m) / 3,
        l      = 0,
        p      = 0.1;

    if ( weight > 0.7 ) {
        while ( s1[l] === s2[l] && l < 4 ) {
        ++l;
        }

        weight = weight + l * p * (1 - weight);
    }

    return weight;
};
const Cosinesimilarity = (() => {
    function termFreqMap(str) {
        var words = str.split(' ');
        var termFreq = {};
        words.forEach(function(w) {
            termFreq[w] = (termFreq[w] || 0) + 1;
        });
        return termFreq;
    }

    function addKeysToDict(map, dict) {
        for (var key in map) {
            dict[key] = true;
        }
    }

    function termFreqMapToVector(map, dict) {
        var termFreqVector = [];
        for (var term in dict) {
            termFreqVector.push(map[term] || 0);
        }
        return termFreqVector;
    }

    function vecDotProduct(vecA, vecB) {
        var product = 0;
        for (var i = 0; i < vecA.length; i++) {
            product += vecA[i] * vecB[i];
        }
        return product;
    }

    function vecMagnitude(vec) {
        var sum = 0;
        for (var i = 0; i < vec.length; i++) {
            sum += vec[i] * vec[i];
        }
        return Math.sqrt(sum);
    }

    function cosineSimilarity(vecA, vecB) {
        return vecDotProduct(vecA, vecB) / (vecMagnitude(vecA) * vecMagnitude(vecB));
    }

    return function textCosineSimilarity(strA, strB) {
        var termFreqA = termFreqMap(strA);
        var termFreqB = termFreqMap(strB);

        var dict = {};
        addKeysToDict(termFreqA, dict);
        addKeysToDict(termFreqB, dict);

        var termFreqVecA = termFreqMapToVector(termFreqA, dict);
        var termFreqVecB = termFreqMapToVector(termFreqB, dict);

        return cosineSimilarity(termFreqVecA, termFreqVecB);
    }
})();
const TrigramIndex = function (inputPhrases) {
    function asTrigrams(phrase, callback) {
        var rawData = "  ".concat(phrase, "  ");
        for (var i = rawData.length - 3; i >= 0; i = i - 1)
            callback.call(this, rawData.slice(i, i + 3));
    };

    var instance = {
        phrases: [],
        trigramIndex: [],

        index: function (phrase) {
            if (!phrase || phrase === "" || this.phrases.indexOf(phrase) >= 0) return;
            var phraseIndex = this.phrases.push(phrase) - 1;
            asTrigrams.call(this, phrase, function (trigram) {
                var phrasesForTrigram = this.trigramIndex[trigram];
                if (!phrasesForTrigram) phrasesForTrigram = [];
                if (phrasesForTrigram.indexOf(phraseIndex) < 0) phrasesForTrigram.push(phraseIndex);
                this.trigramIndex[trigram] = phrasesForTrigram;
            });
        },

        find: function (phrase) {
            var phraseMatches = [];
            var trigramsInPhrase = 0;
            asTrigrams.call(this, phrase, function (trigram) {
                var phrasesForTrigram = this.trigramIndex[trigram];
                trigramsInPhrase += 1;
                if (phrasesForTrigram)
                    for (var j in phrasesForTrigram) {
                        phraseIndex = phrasesForTrigram[j];
                        if (!phraseMatches[phraseIndex]) phraseMatches[phraseIndex] = 0;
                        phraseMatches[phraseIndex] += 1;
                    }
            });
            var result = [];
            for (var i in phraseMatches)
                result.push({ phrase: this.phrases[i], matches: phraseMatches[i] });

            result.sort(function (a, b) {
                var diff = b.matches - a.matches;
                return diff;// == 0 ? a.phrase.localeCompare(b.phrase) : diff;
            });
            return result;
        }
    };
    for (var i in inputPhrases)
        instance.index(inputPhrases[i]);
    return instance;
};

function compareTwoStrings(first, second) {
	first = first.replace(/\s+/g, '')
	second = second.replace(/\s+/g, '')

	if (first === second) return 1; // identical or empty
	if (first.length < 2 || second.length < 2) return 0; // if either is a 0-letter or 1-letter string

	let firstBigrams = new Map();
	for (let i = 0; i < first.length - 1; i++) {
		const bigram = first.substring(i, i + 2);
		const count = firstBigrams.has(bigram)
			? firstBigrams.get(bigram) + 1
			: 1;

		firstBigrams.set(bigram, count);
	};

	let intersectionSize = 0;
	for (let i = 0; i < second.length - 1; i++) {
		const bigram = second.substring(i, i + 2);
		const count = firstBigrams.has(bigram)
			? firstBigrams.get(bigram)
			: 0;

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
		const currentTargetString = targetStrings[i];
		const currentRating = compareTwoStrings(mainString, currentTargetString)
		ratings.push({target: currentTargetString, rating: currentRating})
		if (currentRating > ratings[bestMatchIndex].rating) {
			bestMatchIndex = i
		}
	}
	
	
	const bestMatch = ratings[bestMatchIndex]
	
	return { ratings: ratings, bestMatch: bestMatch, bestMatchIndex: bestMatchIndex };
}
function longestCommonSubstringRatio(s1, s2) {
    let currentMatchStart = -1;
    let currentMatchEnd = -1;

    let bestMatchStart = currentMatchStart;
    let bestMatchEnd = currentMatchEnd;

    const minLen = Math.min(s1.length, s2.length);
    for (let i = 0; i < minLen; i++) {
        if (s1[i] === s2[i]) {
            currentMatchStart = currentMatchEnd = i;
            let j = 0;
            while (s1[i + j] === s2[i + j] && (i + j) < minLen) {
                j++;
            }
            currentMatchEnd = currentMatchStart + j;

            if (currentMatchEnd - currentMatchStart > bestMatchEnd - bestMatchStart) {
                bestMatchStart = currentMatchStart;
                bestMatchEnd = currentMatchEnd;
            }
        }
    }

    return s1.slice(bestMatchStart, bestMatchEnd).length / s1.length;
}

function areArgsValid(mainString, targetStrings) {
	if (typeof mainString !== 'string') return false;
	if (!Array.isArray(targetStrings)) return false;
	if (!targetStrings.length) return false;
	if (targetStrings.find( function (s) { return typeof s !== 'string'})) return false;
	return true;
}
const a = 'aA ';
const b = 'aB ';
console.log(111, Cosinesimilarity(a, b));
console.log(112, JaroWrinker(a, b));
console.log(113, LevenshteinDistance(a, b));
console.log(114, TrigramIndex(a, b));
console.log(115, compareTwoStrings(a, b));




const ROMAN_NUMERALS_TO_ARABIC = { 'IV': 4,'III': 3, 'II': 2, 'VII': 7, 'VI': 6, 'V': 5, '.nes': '' };
const normaliseTitle = (file) => file
    .replace((/\b(IV|VII|VI|V|III|II)\b|.nes/g), matched => ROMAN_NUMERALS_TO_ARABIC[matched]);
const $games = document.querySelector('.games');

/* (async () => {
    const response = await fetch('./videos/nes.csv');
    const csv = await response.text();
    const videos = csv.split('\n');
    picker.addEventListener('change', e => {
        const roms = Array.from(e.target.files).map(({ name }) => name);
        let $list = '';
        roms.forEach(name => {
            const match = findBestMatch(normaliseTitle(name), videos).bestMatch.target;
            $list += `<li><video loop autoplay src="./videos/${match}.webm"></video></li>`;
        })
        $games.innerHTML = $list;
    });
})() */



(async () => {
    
    if ("serviceWorker" in navigator) {
        const req = navigator.serviceWorker.register("sw.js");
        console.log(req);
    };
    loadJSON("/versions", (response) => {
        if (!response) {
            loadJSON("https://cdn.emulatorjs.org/versions.json", resp => loadVersions(resp));
            //document.getElementById("offline-status").textContent = "Offline Status: NOT INSTALLED";
        } else {
            loadVersions(response);
            //document.getElementById("offline-status").textContent = "Offline Status: READY";
        }
    });
    function loadVersions(response) {
        const version_select = document.getElementById("version-select");
        var versions = JSON.parse(response);
        version_select.innerHTML = "";
        addOptions(version_select, versions.releases, versions.default, versions.github);
        addOptions(version_select, versions.versions, versions.default);
        version_select.addEventListener("change", () => {
            localStorage.setItem("version", version_select[version_select.selectedIndex].textContent);
            window.cdn = "https://cdn.emulatorjs.org/" + version_select[version_select.selectedIndex].value + "data/";
        });
    }
    picker.addEventListener("change", async () => {
        const url = picker.files[0];
        const parts = picker.files[0].name.split(".");

        const core = await (async (ext) => {
            if (["fds", "nes", "unif", "unf"].includes(ext))
                return "nes"

            if (["smc", "fig", "sfc", "gd3", "gd7", "dx2", "bsx", "swc"].includes(ext))
                return "snes"

            if (["z64", "n64"].includes(ext))
                return "n64"

            if (["pce"].includes(ext))
                return "pce"

            if (["ngp", "ngc"].includes(ext))
                return "ngp"

            if (["ws", "wsc"].includes(ext))
                return "ws"

            if (["col", "cv"].includes(ext))
                return "coleco"

            if (["d64"].includes(ext))
                return "vice_x64"

            if (["nds", "gba", "gb", "z64", "n64"].includes(ext))
                return ext

            return await new Promise(resolve => {
                const cores = {
                    "Nintendo 64": "n64",
                    "Nintendo Game Boy": "gb",
                    "Nintendo Game Boy Advance": "gba",
                    "Nintendo DS": "nds",
                    "Nintendo Entertainment System": "nes",
                    "Super Nintendo Entertainment System": "snes",
                    "PlayStation": "psx",
                    "Virtual Boy": "vb",
                    "Sega Mega Drive": "segaMD",
                    "Sega Master System": "segaMS",
                    "Sega CD": "segaCD",
                    "Atari Lynx": "lynx",
                    "Sega 32X": "sega32x",
                    "Atari Jaguar": "jaguar",
                    "Sega Game Gear": "segaGG",
                    "Sega Saturn": "segaSaturn",
                    "Atari 7800": "atari7800",
                    "Atari 2600": "atari2600",
                    "NEC TurboGrafx-16/SuperGrafx/PC Engine": "pce",
                    "NEC PC-FX": "pcfx",
                    "SNK NeoGeo Pocket (Color)": "ngp",
                    "Bandai WonderSwan (Color)": "ws",
                    "ColecoVision": "coleco",
                    "Commodore 64": "vice_x64",
                    "PlayStation Portable": "psp"
                }

                const button = document.createElement("button")
                const select = document.createElement("select")

                for (const type in cores) {
                    const option = document.createElement("option")

                    option.value = cores[type]
                    option.textContent = type
                    select.appendChild(option)
                }

                button.onclick = () => resolve(select[select.selectedIndex].value)
                button.textContent = "Load game"
                /* box.innerHTML = ""

                box.appendChild(select)
                box.appendChild(button) */
            })
        })(parts.pop())

        const div = document.createElement("div")
        const sub = document.createElement("div")
        const script = document.createElement("script")

        sub.id = "game"
        div.id = "display"

        const top = document.getElementById("top");
        const version = document.getElementById("version");
        /* top.remove();
        version.remove();
        box.remove(); */
        div.appendChild(sub)
        document.body.appendChild(div)

        const cdn = window.cdn || "https://cdn.emulatorjs.org/stable/data/"

        window.EJS_player = "#game";
        window.EJS_gameName = parts.shift();
        window.EJS_biosUrl = "";
        window.EJS_gameUrl = url;
        window.EJS_core = core;
        window.EJS_pathtodata = cdn;
        window.EJS_startOnLoaded = true;
        window.EJS_AdUrl = "";
        if (core === "psp") {
            window.EJS_threads = true;
        }
        /* window.EJS_ready = function() {
            detectAdBlock("data:text/html;base64,PGh0bWw+PHN0eWxlPiNhZGJsb2Nre2JhY2tncm91bmQtY29sb3I6cmdiYSgwLDAsMCwuOCk7cG9zaXRpb246Zml4ZWQ7d2lkdGg6MTAwJTtoZWlnaHQ6MTAwJTt0b3A6MDtsZWZ0OjA7ei1pbmRleDoxMDAwO3RleHQtYWxpZ246Y2VudGVyO2NvbG9yOiNmZmZ9Ym9keSxodG1se2JhY2tncm91bmQtY29sb3I6dHJhbnNwYXJlbnR9PC9zdHlsZT48Ym9keSBzdHlsZT0ibWFyZ2luOjAiPjxkaXYgaWQ9ImFkYmxvY2siPjxoMT5IaSBBZGJsb2NrIFVzZXIhPC9oMT48cD5BZHMgb24gdGhpcyBwYWdlIG1heSBjb21lIGFuZCBnbyBkZXBlbmRpbmcgb24gaG93IG1hbnkgcGVvcGxlIGFyZSBmdW5kaW5nIHRoaXMgcHJvamVjdC48YnI+WW91IGNhbiBoZWxwIGZ1bmQgdGhpcyBwcm9qZWN0IG9uPGEgaHJlZj0iaHR0cHM6Ly9wYXRyZW9uLmNvbS9FbXVsYXRvckpTIj5wYXRyZW9uPC9hPjwvcD48L2Rpdj48L2JvZHk+PC9odG1sPg==");
        } */
        
        script.src = cdn + "loader.js";
        document.body.appendChild(script);
    });

    // box.ondragover = () => box.setAttribute("drag", true);
    // box.ondragleave = () => box.removeAttribute("drag");

    function detectAdBlock(url) {
        let adBlockEnabled = false;
        try {
            const adframe = document.querySelector('iframe[src="'+window.EJS_AdUrl+'"]');
            var adpage = adframe.contentWindow.document;
            window.EJS_AdUrl = adframe.src;
            if (!adpage) {
                adBlockEnabled = true;
            }
        } catch (e) {
            adBlockEnabled = true;
        }
        if (adBlockEnabled) {
            window.EJS_adBlocked(url);
            
        }
    }

    function loadJSON(url, callback) {
        var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        xobj.open('GET', url, true);

        xobj.onreadystatechange = function () {
            if (xobj.readyState === 4) {
                if (xobj.status === 200) {
                    callback(xobj.responseText);
                } else {
                    callback(null);
                }
            }
        };

        xobj.send();
    }


    function addOptions(select, options, default_option, github) {
        for (const version in options) {
            const option = document.createElement("option");
            option.value = options[version];
            if (version == "stable"){
                option.textContent = "stable ("+github+")";
            } else {
                option.textContent = version;
            }
            if (localStorage.getItem("version") && localStorage.getItem("version") === version) {
                option.selected = true;
                window.cdn = "https://cdn.emulatorjs.org/" + option.value + "data/";
            } else if (version.includes(default_option)) {
                option.selected = true;
                window.cdn = "https://cdn.emulatorjs.org/" + option.value + "data/";
            }
            select.appendChild(option);
        }
    }

    function openSettings() {
        document.getElementById("popup-settings").classList.add("show");
        if (localStorage.getItem("pwa") == "false") {
            checkinstall();
        }
    }

    function closeSettings() {
        document.getElementById("popup-settings").classList.remove("show");
    }

    let installPrompt = null;
    const installButton = document.querySelector("#install");
    const installBox = document.querySelector("#installbox");
    const installBoxText = document.querySelector("#installboxtext");
    localStorage.setItem("pwa", "false");

    window.addEventListener("beforeinstallprompt", (event) => {
        event.preventDefault();
        installPrompt = event;
        localStorage.setItem("pwa", "true");
        /* installButton.textContent = "Install";
        installButton.disabled = false; */
        console.log("Supported");
    });
    /* installButton.addEventListener("click", async () => {
        if (!installPrompt) {
            return;
        }
        const result = await installPrompt.prompt();
        console.log(`Install prompt was: ${result.outcome}`);
        installPrompt = null;
    }); */
    function checkinstall(overide) {
        console.log("Checking install");
        if (navigator.userAgent.includes("Firefox") || (navigator.userAgent.includes("OPR") && !navigator.userAgent.includes("Mobile"))) {
            installButton.style.display = "none";
            installBoxText.innerHTML = "PWA's are not supported on this browser.";
            return;
        }
        if (window.matchMedia('(display-mode: standalone)').matches || overide) {
            installButton.textContent = "Installed";
            installButton.disabled = true;
            installButton.style.display = "inline";
            installBoxText.innerHTML = "Install PWA: ";
        } else {
            installButton.style.display = "none";
            if (navigator.userAgent.includes("Safari") && !navigator.userAgent.includes("Chrome")) {
                installBoxText.innerHTML = "PWA's are supported on this browser, but prompt is not supported.<br> Please install manually";
                return;
            }
            if ('getInstalledRelatedApps' in navigator) {
                navigator.getInstalledRelatedApps().then((relatedApps) => {
                    if (relatedApps.length > 0) {
                        checkinstall(true);
                        return;
                    }
                });
            }
            installBoxText.innerHTML = "PWA is either already installed, or prompt is not supported on this browser.<br> Please install manually.<br>Note: PWA's are not supported in Incognito/Private mode.";
        }
        
    }
    /* document.addEventListener('visibilitychange', function() {
        window.matchMedia('(display-mode: standalone)').addListener(event => {
            if (event.matches) {
                checkinstall(true);
            }
        });
    }); */

})();
