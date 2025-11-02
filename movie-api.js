// Configuración de la API
const API_KEY = '3ed6afc36dca3cbe76326252923044e9';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

class MovieAPI {
    constructor() {
        this.currentPage = 1;
        this.currentQuery = '';
        this.currentGenre = '';
        this.currentYear = '';
    }

    async getPopularMovies(page = 1) {
        const lang = window.languageManager ? window.languageManager.getCurrentLanguage() : 'es';
        try {
            const response = await fetch(
                `${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}&language=${lang}`
            );
            return await response.json();
        } catch (error) {
            console.error('Error fetching popular movies:', error);
            return { results: [] };
        }
    }

    async searchMovies(query, page = 1) {
        const lang = window.languageManager ? window.languageManager.getCurrentLanguage() : 'es';
        try {
            const response = await fetch(
                `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}&language=${lang}`
            );
            return await response.json();
        } catch (error) {
            console.error('Error searching movies:', error);
            return { results: [] };
        }
    }

    async getMoviesByGenre(genreId, page = 1) {
        const lang = window.languageManager ? window.languageManager.getCurrentLanguage() : 'es';
        try {
            const response = await fetch(
                `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&page=${page}&language=${lang}`
            );
            return await response.json();
        } catch (error) {
            console.error('Error fetching movies by genre:', error);
            return { results: [] };
        }
    }

    async getMovieDetails(movieId) {
        const lang = window.languageManager ? window.languageManager.getCurrentLanguage() : 'es';
        try {
            const response = await fetch(
                `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=${lang}`
            );
            return await response.json();
        } catch (error) {
            console.error('Error fetching movie details:', error);
            return null;
        }
    }

    async getGenres() {
        const lang = window.languageManager ? window.languageManager.getCurrentLanguage() : 'es';
        try {
            const response = await fetch(
                `${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=${lang}`
            );
            return await response.json();
        } catch (error) {
            console.error('Error fetching genres:', error);
            return { genres: [] };
        }
    }
}

// Instancia global de la API
const movieAPI = new MovieAPI();
