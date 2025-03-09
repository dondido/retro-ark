import { getCatalogue } from './db.js';

const GAMES_PER_PAGE = 40;

const searchParams = new URLSearchParams(location.search);
const params = Object.fromEntries(searchParams);
const page = Number(searchParams.get('page')) || 0;

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
    if ($pages === '') {
        return '';
    }
    return `
        <nav class="nav-pagination" aria-label="Pagination">
            <ul class="pagination">
                ${$pages}
            </ul>
        </nav>
    `;
};
const roms = await getCatalogue();
if (roms.length === 0) location.replace('/upload')
let filtered = roms;
let filterHTML = '';
const normaliseFilter = filter => {
    const filters = Object.entries(Object.groupBy(roms, rom => rom[filter]))
        .sort(([a], [b]) => a.localeCompare(b));
    if (filters.length < 2) {
        return [];
    }
    filters.unshift(['All', new Array(roms.length)]);
    return filters;
};
['genre', 'lang', 'players'].forEach((filter) => {
    const searchFilter = params[filter];
    const makeFilterItem = (list, [value, items]) =>
        list + `<li><a href="?${new URLSearchParams({ ...params, [filter]: value })}">${value} (${items.length})</a></li>`;
    if (searchFilter && searchFilter.toLowerCase() !== 'all') {
        filtered = filtered.filter(rom => rom[filter] === searchFilter);
    }
    const filterList = normaliseFilter(filter).reduce(makeFilterItem, '');
    filterHTML += filterList ? `<details><summary>${filter}</summary><ul>${filterList}</ul></details>`: '';
});
const gameCount = filtered.length;
const lastPage = Math.ceil(gameCount / GAMES_PER_PAGE);
const startGameIndex = page * GAMES_PER_PAGE;
const endGameIndex = startGameIndex + GAMES_PER_PAGE;
const makeGameEntry = (list, { path, id }) => list + `
    <li>
        <a href="/game?id=${id}">
            <video loop muted autoplay src="./videos/${path}.webm"></video>
        </a>
    </li>
`;
filters.insertAdjacentHTML('afterend', filterHTML);
gallery.innerHTML = filtered.slice(startGameIndex, endGameIndex).reduce(makeGameEntry, '');
gallery.insertAdjacentHTML('afterend', makePagination(lastPage));

