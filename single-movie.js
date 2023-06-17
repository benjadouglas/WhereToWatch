let takeData = localStorage.getItem('movieId');

/**
 * Encuentra la película por id que se transmite al localStorage cuando se apreta ' Ver mas ' y la muestra en pantalla
 * @loadMovie
 * @param {none} none - no toma parámetros
 * @return no retorna un valor
 */
const loadMovie = async () => {
    try {
        let providers = '';
        try {

            const responseProviders = await fetch(`https://api.themoviedb.org/3/movie/${takeData}/watch/providers?api_key=dcfbb1ad76889a2f3af575f398f1ab52&language=en-US`);
            const prov_data = await responseProviders.json();
            // providers = prov_data.results.AR.flatrate[0].provider_name
            // Por ahora solo muestra un proveedor, pero se puede hacer un forEach para mostrar todos los proveedores
            try {
                providers += `${prov_data.results.AR.flatrate[0].provider_name} <br>`;
            } catch (error) {
                providers += 'No hay proveedores disponibles en Argentina <br>';
            }
            document.getElementById('single-movie-provider-div').innerHTML = providers;
        } catch (error) {
            console.log(error)
        }
        const response = await fetch(`https://api.themoviedb.org/3/movie/${takeData}?api_key=dcfbb1ad76889a2f3af575f398f1ab52&language=es-MX`);
        const data = await response.json();

        let pelicula = `
            <h2 class='single-movie-title'>${data.title}</h2>
            <div class='single-movie-container'>
                <img class='single-movie-image' src="https://image.tmdb.org/t/p/w500/${data.poster_path}" alt="imagen de pelicula">
                <div class='single-movie-details'>
                    <div class='single-movie-description-container'>
                        <p class='single-movie-description'>${data.overview}</p>
                    </div>
                    <div class='single-movie-provider-div' id='single-movie-provider-div'>
                        <p class='single-movie-provider'>mirala en: <br>${providers}</p>
                    </div>
                </div>
            </div>
            <button class="single-movie-button"><a href="index.html" target="_self">Regresar</a></button>
        `;

        document.getElementById('single-movie-page').innerHTML = pelicula;
    } catch (error) {
        console.log(error)
    }
}


