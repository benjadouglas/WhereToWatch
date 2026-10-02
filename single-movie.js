const API_KEY = 'dcfbb1ad76889a2f3af575f398f1ab52';
const API_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p';
const REGION = 'AR';

// El id viene en la URL (?id=123); si no, usamos el último guardado en localStorage
const movieId = new URLSearchParams(window.location.search).get('id') || localStorage.getItem('movieId');
const page = document.getElementById('single-movie-page');

/**
 * Escapa texto para insertarlo de forma segura en HTML
 * @param {string} text - texto a escapar
 * @return {string} texto escapado
 */
const escapeHtml = (text = '') =>
    String(text).replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));

/**
 * Arma la sección de plataformas donde ver la película en Argentina
 * @param {object|undefined} region - proveedores de TMDB para la región
 * @return {string} html de la sección
 */
const renderProviders = (region) => {
    const groups = [
        ['flatrate', 'Streaming'],
        ['rent', 'Alquiler'],
        ['buy', 'Compra'],
    ].filter(([key]) => region && region[key] && region[key].length);

    const content = groups.length
        ? groups.map(([key, label]) => `
            <div class="provider-group">
                <h3>${label}</h3>
                <ul class="provider-list">
                    ${region[key].map((p) => `
                        <li class="provider">
                            <img src="${IMG_URL}/w92${p.logo_path}" alt="" loading="lazy">
                            ${escapeHtml(p.provider_name)}
                        </li>
                    `).join('')}
                </ul>
            </div>
        `).join('')
        : '<p class="no-providers">No hay plataformas disponibles en Argentina por ahora.</p>';

    return `
        <section class="providers">
            <h2>Dónde verla</h2>
            ${content}
        </section>
    `;
};

/**
 * Formatea la duración en horas y minutos
 * @param {number} minutes - duración en minutos
 * @return {string} duración formateada
 */
const formatRuntime = (minutes) => {
    if (!minutes) return '';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h ? `${h} h ${m} min` : `${m} min`;
};

/**
 * Carga la película (y sus plataformas) y la muestra en pantalla
 */
const loadMovie = async () => {
    if (!movieId) {
        showError('No elegiste ninguna película');
        return;
    }

    try {
        const [movieRes, providersRes] = await Promise.all([
            fetch(`${API_URL}/movie/${encodeURIComponent(movieId)}?api_key=${API_KEY}&language=es-MX`),
            fetch(`${API_URL}/movie/${encodeURIComponent(movieId)}/watch/providers?api_key=${API_KEY}`),
        ]);
        if (!movieRes.ok) throw new Error(`HTTP ${movieRes.status}`);

        const data = await movieRes.json();
        const providers = providersRes.ok ? await providersRes.json() : {};

        document.title = `${data.title} · WhereToWatch`;

        if (data.backdrop_path) {
            const backdrop = document.getElementById('backdrop');
            const img = new Image();
            img.onload = () => {
                backdrop.style.backgroundImage = `url(${img.src})`;
                backdrop.classList.add('loaded');
            };
            img.src = `${IMG_URL}/w1280${data.backdrop_path}`;
        }

        const year = data.release_date ? data.release_date.slice(0, 4) : '';
        const chips = [
            data.vote_average ? `<span class="chip score">${data.vote_average.toFixed(1)}</span>` : '',
            year ? `<span class="chip">${year}</span>` : '',
            data.runtime ? `<span class="chip">${formatRuntime(data.runtime)}</span>` : '',
            ...(data.genres || []).map((g) => `<span class="chip">${escapeHtml(g.name)}</span>`),
        ].join('');

        const poster = data.poster_path
            ? `<img src="${IMG_URL}/w500${data.poster_path}" alt="Póster de ${escapeHtml(data.title)}">`
            : '';

        const trailerQuery = encodeURIComponent(`${data.title} ${year} trailer`);

        page.innerHTML = `
            <article class="detail">
                <div class="detail-poster">${poster}</div>
                <div class="detail-body">
                    <h1 class="detail-title">${escapeHtml(data.title)}</h1>
                    ${data.tagline ? `<p class="tagline">${escapeHtml(data.tagline)}</p>` : ''}
                    <div class="meta">${chips}</div>
                    <p class="overview">${escapeHtml(data.overview || 'Sin descripción disponible.')}</p>
                    ${renderProviders(providers.results && providers.results[REGION])}
                    <div class="actions">
                        <a class="btn btn-primary" href="https://www.youtube.com/results?search_query=${trailerQuery}" target="_blank" rel="noopener">▶ Ver tráiler</a>
                        <a class="btn" href="index.html">← Volver</a>
                    </div>
                </div>
            </article>
        `;
    } catch (error) {
        console.error(error);
        showError('No pudimos cargar la película');
    } finally {
        page.removeAttribute('aria-busy');
    }
};

/**
 * Muestra un mensaje de error
 * @param {string} message - mensaje a mostrar
 */
const showError = (message) => {
    page.innerHTML = `
        <div class="error-state">
            <strong>${escapeHtml(message)}</strong>
            <a class="btn btn-primary" href="index.html">Volver al inicio</a>
        </div>
    `;
};

// Si venimos del listado, "Volver" regresa al historial para conservar la búsqueda
document.getElementById('back-link').addEventListener('click', (e) => {
    if (document.referrer && new URL(document.referrer).origin === location.origin) {
        e.preventDefault();
        history.back();
    }
});

loadMovie();
