/**
 * Guarda el movie id en el localStorage y redirige a la página de descripción de la película
 * @saveMovieId
 * @param {number} movieid - id de la película
 * @return no retorna ningún valor
 */
let saveMovieId = (moveid) => {
    localStorage.setItem('movieId', moveid);
    window.location.href = 'description.html';
    window.location.target = '_self';
    loadMovie();
}

/**
 * Carga las películas en la página principal, si se escribe algo en el input, carga las películas que coincidan con el input, sino busca las pelicula más populares
 * @loadMovies
 * @param {string} movieName - nombre de la película
 * @return no retorna ningún valor
 */
const loadMovies = async (movieName) => {
    try {
        const key = 'dcfbb1ad76889a2f3af575f398f1ab52';
        let url = ''

        if (movieName === undefined || movieName === '') {
            url = `https://api.themoviedb.org/3/movie/popular?api_key=${key}&language=es-MX&page=1`;
                    // `https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=1`
        }
        else if (movieName === 'rating'){
            url = `https://api.themoviedb.org/3/movie/top_rated?api_key=${key}&language=es-MX&page=1`;
        }
        else {
            url = `https://api.themoviedb.org/3/search/movie?api_key=${key}&query=${movieName}&include_adult=false&language=es-MX&page=1&sort_by=popularity.desc`;
        }

        const response = await fetch(url)
        const data = await response.json();


        if (noResults(data)) {
            document.getElementById('search-bar').value = '';
            alert('No se encontraron resultados');
            document.getElementById('search-bar').innerHTML = ``;
        } else {
            let peliculas = '';
            data.results.forEach(pelicula => {
                peliculas += `
                <div class ='movie-container'>
                    <img class='movie-image' src="https://image.tmdb.org/t/p/w500/${pelicula.poster_path}" alt="movie image">
                    <button class="movie-button"  onclick="saveMovieId(${pelicula.id})" >Ver mas</button>
                </div>
            `;
            })
            document.getElementById('movies-container').innerHTML = peliculas;
        }
    } catch (error) {
        console.log(error)
    }

}

loadMovies();

/**
 * Busca las películas que coincidan con el input
 * @lookMovie
 * @param {none} none- no toma parámetros
 * @return no retorna un valor
 */
const lookMovie = async () => {
    const inputField = document.getElementById("search-bar");
    let inputValue = inputField.value;
    loadMovies(inputValue);
}

/**
 * Si no hay resultados, muestra un alert
 * @noResults
 * @param {object} data - objeto con los datos de la película
 * @return retorna true si no hay resultados
 */
const noResults = (data) => {
    if (data.results.length === 0) {
        if (data.results.title !== document.getElementById("search-bar").value && document.getElementById("search-bar").value !== '') {
            return true;
        }
    }
}
/**
 * Ordena las películas por rating
 * @orderByRating
 * @param {none} none - no toma parámetros
 * @return no retorna un valor
 */
const orderByRating = async () => {
    let heading = document.getElementById("title");
    heading.innerHTML = `<h1 id="new-title">Películas mej<a href="index.html" id="o-tag" target="_self">o<\a>r calificadas<\h1>`;
    loadMovies('rating');
}
