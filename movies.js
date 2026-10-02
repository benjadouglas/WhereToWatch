const API_KEY = 'dcfbb1ad76889a2f3af575f398f1ab52';
const API_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w342';

const CATEGORY_TITLES = {
    popular: 'Populares',
    top_rated: 'Mejor calificadas',
    now_playing: 'En cines',
};

const grid = document.getElementById('movies-container');
const searchInput = document.getElementById('search-bar');
const searchForm = document.getElementById('search-form');
const clearButton = document.getElementById('search-clear');
const sectionTitle = document.getElementById('section-title');
const tabs = document.querySelectorAll('.tab');

let currentCategory = 'popular';
let requestId = 0;
let debounceTimer;

/**
 * Escapa texto para insertarlo de forma segura en HTML
 * @param {string} text - texto a escapar
 * @return {string} texto escapado
 */
const escapeHtml = (text = '') =>
    String(text).replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));

/**
 * Muestra tarjetas "esqueleto" mientras cargan las películas
 */
const renderSkeletons = () => {
    grid.setAttribute('aria-busy', 'true');
    grid.innerHTML = Array.from({length: 12}, () => `
        <div class="movie-card skeleton" aria-hidden="true">
            <div class="poster"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line short"></div>
        </div>
    `).join('');
};

/**
 * Muestra un mensaje cuando no hay resultados o hubo un error
 * @param {string} title - título del mensaje
 * @param {string} text - texto descriptivo
 */
const renderEmpty = (title, text) => {
    grid.removeAttribute('aria-busy');
    grid.innerHTML = `
        <div class="empty-state">
            <strong>${escapeHtml(title)}</strong>
            ${escapeHtml(text)}
        </div>
    `;
};

/**
 * Dibuja la grilla de películas
 * @param {object[]} movies - lista de películas de TMDB
 */
const renderMovies = (movies) => {
    grid.removeAttribute('aria-busy');
    grid.innerHTML = movies.map((movie, i) => {
        const year = movie.release_date ? movie.release_date.slice(0, 4) : '';
        const poster = movie.poster_path
            ? `<img src="${IMG_URL}${movie.poster_path}" alt="Póster de ${escapeHtml(movie.title)}" loading="lazy">`
            : `<div class="poster-fallback">${escapeHtml(movie.title)}</div>`;

        return `
            <a class="movie-card" href="description.html?id=${movie.id}" style="animation-delay:${Math.min(i, 20) * 30}ms">
                <div class="poster">
                    ${poster}
                </div>
                <div class="movie-info">
                    <h3 class="movie-title">${escapeHtml(movie.title)}</h3>
                    ${year ? `<div class="movie-year">${year}</div>` : ''}
                </div>
            </a>
        `;
    }).join('');
};

/**
 * Carga las películas: si hay una búsqueda, trae las que coinciden; si no, trae la categoría seleccionada
 * @param {string} query - texto a buscar
 */
const loadMovies = async (query = '') => {
    const id = ++requestId;
    const trimmed = query.trim();
    const url = trimmed
        ? `${API_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(trimmed)}&include_adult=false&language=es-MX&page=1`
        : `${API_URL}/movie/${currentCategory}?api_key=${API_KEY}&language=es-MX&page=1`;

    sectionTitle.textContent = trimmed ? `Resultados para “${trimmed}”` : CATEGORY_TITLES[currentCategory];
    tabs.forEach((tab) => tab.setAttribute('aria-selected', String(!trimmed && tab.dataset.category === currentCategory)));
    renderSkeletons();

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (id !== requestId) return; // llegó una respuesta más nueva

        if (!data.results || data.results.length === 0) {
            renderEmpty('No se encontraron resultados', 'Probá con otro título o revisá la ortografía.');
        } else {
            renderMovies(data.results);
        }
    } catch (error) {
        if (id !== requestId) return;
        console.error(error);
        renderEmpty('Algo salió mal', 'No pudimos cargar las películas. Intentá de nuevo en un momento.');
    }
};

/**
 * Cambia la categoría activa (Populares, Mejor calificadas, En cines)
 * @param {string} category - categoría de TMDB
 */
const selectCategory = (category) => {
    currentCategory = category;
    searchInput.value = '';
    clearButton.hidden = true;
    loadMovies();
};

tabs.forEach((tab) => tab.addEventListener('click', () => selectCategory(tab.dataset.category)));

searchInput.addEventListener('input', () => {
    clearButton.hidden = searchInput.value === '';
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => loadMovies(searchInput.value), 350);
});

searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearTimeout(debounceTimer);
    loadMovies(searchInput.value);
});

clearButton.addEventListener('click', () => {
    searchInput.value = '';
    clearButton.hidden = true;
    searchInput.focus();
    loadMovies();
});

document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== searchInput) {
        e.preventDefault();
        searchInput.focus();
    } else if (e.key === 'Escape' && document.activeElement === searchInput && searchInput.value) {
        clearButton.click();
    }
});

loadMovies();
