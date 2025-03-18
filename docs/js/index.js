import { getCatalogue, deleteByKey, deleteBulk, deleteStores } from './db.js';
import systems from '../platforms/systems.json' with { type: 'json' };

const GAMES_PER_PAGE = 36;

const searchParams = new URLSearchParams(location.search);
const params = Object.fromEntries(searchParams);
const page = Number(searchParams.get('page')) || 1;
const { tag = '', search = '', order = 'rating' } = params;
const makePagination = (lastPage, onSides = 1) => {
    // pages
    let $pages = '';
    // Loop through
    for (let i = 1; i <= lastPage; i++) {
        let offset = (i === 1 || lastPage) ? onSides + 1 : onSides;
        // If added
        if (i === 1 || (page - offset <= i && page + offset >= i) || 
            i === page || i === lastPage) {
            const ariaCurrent = i === page ? ' aria-current="true"' : '';
            params.page = i;
            $pages += `<li><a href="?${new URLSearchParams(params)}" ${ariaCurrent}>${i}</a></li>`;
        } else if (i === page - (offset + 1) || i === page + (offset + 1)) {
            $pages += '<li></li>';
        }
    }
    return $pages;
};
let roms = await getCatalogue();
if (localStorage.getItem('noninitial')) {
    localStorage.setItem('noninitial', true)
    location.replace('./upload');
};
const makeTagItem = ($html, [tag, count]) =>
    `${$html}<li><a href="?${new URLSearchParams({ order, search, tag })}">${systems[tag] || tag} (${count})</a></li>`;
const makePlayersTag = players => `${players} ${players == 1 ? 'Player' : 'Players'}`;
const extractTags = ({ genre, platform, players = 1 }) =>
    [genre || 'Unclassified', platform, makePlayersTag(players)];
const updateTagCount = (count, word) => { count[word] = (count[word] || 0) + 1; return count; };
const matchRomByTag = tag => rom =>
    rom.genre === tag
    || rom.genre === undefined && tag === 'unclassified'
    || rom.genre && tag === 'classified'
    || rom.platform === tag
    || tag === makePlayersTag(rom.players);
const matchRomByName = term => rom => rom.title.toLowerCase().includes(term);
let filtered;
let recent = [];
let favourites = [];
let activeVideo;
const filterRoms = () => {
    if (tag) {
        if (tag === 'favourites') {
            filtered = filtered.filter(({ id }) => favourites.includes(id));
        }
        else if (tag !== 'all') {
            filtered = filtered.filter(matchRomByTag(tag));
        }
    }
    const filteredByTagCount = filtered.length;
    const term = search || document.forms.$search.firstElementChild.value;
    document.forms.$search.firstElementChild.placeholder = `Search ${filteredByTagCount} games`;
    if (term) {
        filtered = filtered.filter(matchRomByName(term.toLowerCase()));
    }
};
const getRecentItemIndex = item => recent.indexOf(item.id) + 1 || 1e6;
const orderBy = {
    name: (a, b) => a.title.localeCompare(b.title),
    rating: (a, b) => (b.rating || 0) - (a.rating || 0),
    releasedate: (a, b) => b.releasedate?.localeCompare(a.releasedate),
    recent: (a, b) => getRecentItemIndex(a) - getRecentItemIndex(b) || orderBy.name(a, b)
};
const makeGameEntry = (list, { path, id, title, platform, rating = 0 }) => list + `
    <li>
        <a href="./game?id=${id}" class="${favourites.includes(id) ? 'favourite' : ''}">
            <video ${$autoplay.checked ? '' : 'autoplay'} loop muted poster="./images/${platform}/${path}-image.png" src="./videos/${platform}/${path}.webm">
            </video>
            <div class="thumb-footer">
                <div class="thumb-title">${title}</div>
                <div class="rating">${rating * 10}</div>
            </div>
        </a>
        <button></button>
    </li>
`;
const collapseTags = () => {
    if ($tags.childElementCount === 0) return;
    let count = $tags.childElementCount - 1;
    $tags.querySelectorAll('.hidden').forEach($element => $element.classList.remove('hidden'))
    while (count --) {
        if ($tags.firstElementChild.offsetTop === $tags.lastElementChild.offsetTop) {
            break;
        }
        $tags.children[count].classList.add('hidden');
    }
};
const disablePreview = () => {
    activeVideo?.load();
    activeVideo = null;
};
const enablePreview = target => {
    target.load();
    target.play();
    activeVideo = target;
};
const move = ({ target }) => {
    if (target.tagName === 'VIDEO') {
        if (activeVideo === null) {
            return enablePreview(target);
        }
        if (activeVideo.poster !== target.poster) {
            disablePreview();
            enablePreview(target);
        }
        return;
    }
    disablePreview();
};
const init = () => {
    if (roms.length === 0) return;
    filtered = roms;
    favourites = localStorage.getItem('favourites')?.split(',').filter(Boolean) || [];
    recent = localStorage.getItem('recent')?.split(',').filter(Boolean) || [];
    filterRoms();
    const gameCount = filtered.length;
    const lastPage = Math.ceil(gameCount / GAMES_PER_PAGE);
    const startGameIndex = (page - 1) * GAMES_PER_PAGE;
    const endGameIndex = startGameIndex + GAMES_PER_PAGE;
    const tagsCount = roms.flatMap(extractTags).sort().reduce(updateTagCount, {});
    const { Unclassified, ...restTags } = tagsCount;
    const customTagList = [['all', roms.length], ['favourites', 0]];
    if (Unclassified) {
        customTagList.push(['classified', roms.length - Unclassified], ['unclassified', Unclassified]);
    }
    $tags.innerHTML = customTagList.concat(Object.entries(restTags))
        .reduce(makeTagItem, '') + '<li><button>More</button></li>';
    $tags.lastElementChild.lastElementChild.onclick = ({ currentTarget }) => {
        currentTarget.textContent = currentTarget.textContent === 'More' ? 'Less' : 'More';
        $tags.classList.toggle('expand');
    };
    $gallery.innerHTML = filtered
        .sort(orderBy[order])
        .slice(startGameIndex, endGameIndex)
        .reduce(makeGameEntry, '');
    $autoplay.checked && $gallery.addEventListener('pointermove', move);
    $pagination.innerHTML = makePagination(lastPage);
    $tags.querySelector('[href$=favourites]').textContent = `Favourites (${favourites.length})`;
}
addEventListener('resize', collapseTags)
$order.onchange = ({ target }) => {
    location.href = `?${new URLSearchParams({ tag, order: target.value})}`;
};
document.forms.$search.onsubmit = (event) => {
    event.preventDefault();
    location.href = `?${new URLSearchParams({ tag, search: document.forms.$search.firstElementChild.value})}`;
};
document.forms.$search.firstElementChild.value = search;
$order.querySelector(`[value="${order}"]`).selected = true;
$delete.onchange = ({ target }) => {
    const handleDelete =  (event) => {
        const a = event.target.closest('a');
        const deleteAllGames = () => {
            deleteStores();
            $gallery.replaceChildren();
            $tags.replaceChildren();
            $pagination.remove();
            document.body.firstElementChild.onclick = null;
        };
        const deleteGamesInRange = (tag) => {
            const bulk = roms.filter(matchRomByTag(tag)).map(({ id }) => id);
            if (bulk.length === roms.length) return deleteAllGames();
            deleteBulk(bulk);
            roms = roms.filter(({ id }) => bulk.includes(id) === false);
            init();
        };
        if (a) {
            event.preventDefault();
            const searchParams = new URLSearchParams(a.getAttribute('href').replace('/game', ''));
            const gameId = searchParams.get('id');
            if (gameId) {
                if (roms.length === 1) return deleteAllGames();
                deleteByKey(gameId);
                roms = roms.filter(({ id }) => id !== gameId);
                init();
            }
            const tag = searchParams.get('tag');
            if (tag) {
                tag === 'all' ? deleteAllGames() : deleteGamesInRange(tag);
            }
            a.parentElement.remove();
        }
    };
    if (target.checked) {
        document.body.classList.add('delete-mode');
        document.body.firstElementChild.onclick = handleDelete;
    } else {
        document.body.firstElementChild.onclick = null;
        document.body.classList.remove('delete-mode');
    }
    collapseTags();
};
$autoplay.checked = Boolean(localStorage.getItem('disable-autoplay'));
$autoplay.onchange = ({ target }) => {
    if (target.checked) {
        localStorage.setItem('disable-autoplay', '1');
        $gallery.addEventListener('pointermove', move);
        $gallery.querySelectorAll('video').forEach($video => {
            $video.autoplay = false;
            $video.load();
            $video.pause();
        });
    } else {
        localStorage.setItem('disable-autoplay', '');
        $gallery.removeEventListener('pointermove', move);
        $gallery.querySelectorAll('video').forEach($video => {
            $video.autoplay = true;
            $video.play();
        });
    }
};
init();
collapseTags();
$gallery.onclick = ({ target: { previousElementSibling } }) => {
    const searchParams = new URLSearchParams(previousElementSibling.getAttribute('href')?.replace('/game', ''));
    const gameId = searchParams.get('id');
    if (gameId) {
        favourites = localStorage.getItem('favourites')?.split(',').filter(Boolean) || [];
        const gameIdIndex = favourites.indexOf(gameId);
        if (gameIdIndex !== -1) {
            favourites.splice(gameIdIndex, 1);
            previousElementSibling.classList.remove('favourite');
            if (tag === 'favourites') {
                if (favourites.length === 0) {
                    $gallery.replaceChildren();
                    $pagination.remove();
                }
                else {
                    previousElementSibling.parentElement.remove();
                }
            }
        }
        else {
            favourites.push(gameId);
            previousElementSibling.classList.add('favourite');
        }
        $tags.querySelector('[href$=favourites]').textContent = `Favourites (${favourites.length})`;
        localStorage.setItem('favourites', favourites);
    }
}