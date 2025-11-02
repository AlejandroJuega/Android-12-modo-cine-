class MovieApp {
    constructor() {
        this.movieAPI = movieAPI;
        this.currentSection = 'inicio';
        this.initialized = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadFeaturedMovies();
        this.populateYearFilter();
        this.setupVideoPlayer();
        this.initialized = true;
    }

    setupEventListeners() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = e.target.getAttribute('href').substring(1);
                this.switchSection(target);
            });
        });

        document.getElementById('searchBtn').addEventListener('click', () => this.handleSearch());
        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });

        document.getElementById('genreFilter').addEventListener('change', (e) => {
            this.movieAPI.currentGenre = e.target.value;
            this.movieAPI.currentPage = 1;
            this.loadAllMovies(true);
        });

        document.getElementById('yearFilter').addEventListener('change', (e) => {
            this.movieAPI.currentYear = e.target.value;
            this.movieAPI.currentPage = 1;
            this.loadAllMovies(true);
        });

        document.getElementById('loadMoreBtn').addEventListener('click', () => this.loadMoreMovies());

        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const genreId = e.currentTarget.getAttribute('data-genre');
                this.switchSection('peliculas');
                document.getElementById('genreFilter').value = genreId;
                this.movieAPI.currentGenre = genreId;
                this.movieAPI.currentPage = 1;
                this.loadAllMovies(true);
            });
        });
    }

    setupVideoPlayer() {
        document.addEventListener('click', (e) => {
            const movieCard = e.target.closest('.movie-card');
            if (movieCard) {
                e.preventDefault();
                const movieId = parseInt(movieCard.dataset.movieId);
                const movie = this.getMovieById(movieId);
                if (movie && window.videoPlayer) {
                    const showResume = window.watchProgressManager ? 
                        window.watchProgressManager.shouldShowResume(movie.id) : false;
                    window.videoPlayer.playMovie(movie, null, showResume);
                }
            }
        });
    }

    getMovieById(movieId) {
        return this.currentMovies ? this.currentMovies.find(m => m.id === movieId) : null;
    }

    switchSection(sectionName) {
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        document.getElementById(sectionName).classList.add('active');
        document.querySelector(`[href="#${sectionName}"]`).classList.add('active');

        this.currentSection = sectionName;

        if (sectionName === 'peliculas') {
            this.loadAllMovies();
        }
    }

    async loadFeaturedMovies() {
        const container = document.getElementById('featuredMovies');
        container.innerHTML = '<div class="loading">Cargando películas destacadas...</div>';

        try {
            const data = await this.movieAPI.getPopularMovies(1);
            this.currentMovies = data.results;
            this.displayMovies(data.results.slice(0, 8), container);
        } catch (error) {
            container.innerHTML = '<div class="error">Error al cargar películas destacadas</div>';
        }
    }

    async loadAllMovies(clear = false) {
        const container = document.getElementById('allMovies');
        
        if (clear) {
            container.innerHTML = '<div class="loading">Cargando películas...</div>';
            this.movieAPI.currentPage = 1;
        }

        try {
            let data;
            if (this.movieAPI.currentQuery) {
                data = await this.movieAPI.searchMovies(this.movieAPI.currentQuery, this.movieAPI.currentPage);
            } else if (this.movieAPI.currentGenre) {
                data = await this.movieAPI.getMoviesByGenre(this.movieAPI.currentGenre, this.movieAPI.currentPage);
            } else {
                data = await this.movieAPI.getPopularMovies(this.movieAPI.currentPage);
            }

            if (clear) {
                container.innerHTML = '';
                this.currentMovies = data.results;
            } else {
                this.currentMovies = this.currentMovies ? [...this.currentMovies, ...data.results] : data.results;
            }

            this.displayMovies(data.results, container);

            document.getElementById('loadMoreBtn').style.display = 
                data.page < data.total_pages ? 'block' : 'none';

        } catch (error) {
            container.innerHTML = '<div class="error">Error al cargar películas</div>';
        }
    }

    async loadMoreMovies() {
        this.movieAPI.currentPage++;
        await this.loadAllMovies(false);
    }

    displayMovies(movies, container) {
        if (!movies || movies.length === 0) {
            container.innerHTML = '<div class="no-results">No se encontraron películas</div>';
            return;
        }

        movies.forEach(movie => {
            const movieCard = this.createMovieCard(movie);
            container.appendChild(movieCard);
        });
    }

    createMovieCard(movie) {
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.dataset.movieId = movie.id;
        
        const progressManager = window.watchProgressManager;
        const showResume = progressManager ? progressManager.shouldShowResume(movie.id) : false;
        const progressPercent = progressManager ? progressManager.getProgressPercentage(movie.id) : 0;
        
        card.innerHTML = `
            <div class="movie-poster-container">
                <img src="${movie.poster_path ? 
                    `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 
                    'https://via.placeholder.com/500x750/333/fff?text=No+Image'
                }" 
                     alt="${movie.title}" 
                     class="movie-poster"
                     onerror="this.src='https://via.placeholder.com/500x750/333/fff?text=No+Image'">
                
                ${showResume ? `
                    <div class="progress-overlay">
                        <div class="progress-bar-movie">
                            <div class="progress-filled-movie" style="width: ${progressPercent}%"></div>
                        </div>
                        <div class="resume-badge">Reanudar</div>
                    </div>
                ` : ''}
                
                <div class="play-overlay">
                    <button class="play-movie-btn" data-movie-id="${movie.id}">
                        ${showResume ? '▶' : '▶'}
                    </button>
                    ${showResume ? `
                        <button class="restart-movie-btn" data-movie-id="${movie.id}" title="Ver desde el inicio">
                            ↺
                        </button>
                    ` : ''}
                </div>
            </div>
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <p class="movie-year">${movie.release_date ? movie.release_date.substring(0,4) : 'N/A'}</p>
                ${showResume ? `
                    <div class="progress-text">Visto al ${Math.round(progressPercent)}%</div>
                ` : ''}
            </div>
        `;

        const playBtn = card.querySelector('.play-movie-btn');
        playBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (window.videoPlayer) {
                window.videoPlayer.playMovie(movie, null, showResume);
            }
        });

        const restartBtn = card.querySelector('.restart-movie-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (window.videoPlayer) {
                    window.videoPlayer.playMovie(movie, null, false);
                    if (window.watchProgressManager) {
                        window.watchProgressManager.removeProgress(movie.id);
                    }
                    card.querySelector('.progress-overlay')?.remove();
                    card.querySelector('.progress-text')?.remove();
                    restartBtn.remove();
                }
            });
        }

        return card;
    }

    async handleSearch() {
        const query = document.getElementById('searchInput').value.trim();
        
        if (query) {
            this.movieAPI.currentQuery = query;
            this.movieAPI.currentGenre = '';
            this.movieAPI.currentYear = '';
            this.movieAPI.currentPage = 1;
            
            this.switchSection('peliculas');
            await this.loadAllMovies(true);
        }
    }

    populateYearFilter() {
        const yearSelect = document.getElementById('yearFilter');
        const currentYear = new Date().getFullYear();
        
        for (let year = currentYear; year >= 1950; year--) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        }
    }

    reloadMoviesWithLanguage() {
        if (this.currentSection === 'inicio') {
            this.loadFeaturedMovies();
        } else if (this.currentSection === 'peliculas') {
            this.loadAllMovies(true);
        }
    }

    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => {
                    console.log('Service Worker registrado con éxito:', registration);
                })
                .catch(error => {
                    console.log('Error al registrar el Service Worker:', error);
                });
        }
    }
}

let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new MovieApp();
    window.app = app;
});
