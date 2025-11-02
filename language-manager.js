class LanguageManager {
    constructor() {
        this.currentLanguage = 'es';
        this.supportedLanguages = {
            'es': 'Español',
            'en': 'English', 
            'fr': 'Français',
            'de': 'Deutsch',
            'it': 'Italiano',
            'pt': 'Português',
            'ja': '日本語',
            'ko': '한국어',
            'zh': '中文',
            'ru': 'Русский'
        };
        this.init();
    }

    init() {
        this.loadUserLanguage();
        this.setupLanguageSelector();
    }

    loadUserLanguage() {
        const savedLanguage = localStorage.getItem('cineplus_language');
        if (savedLanguage && this.supportedLanguages[savedLanguage]) {
            this.currentLanguage = savedLanguage;
        } else {
            const browserLang = navigator.language.split('-')[0];
            if (this.supportedLanguages[browserLang]) {
                this.currentLanguage = browserLang;
            }
        }
        this.applyLanguage();
    }

    setupLanguageSelector() {
        const selector = document.getElementById('languageSelect');
        if (selector) {
            selector.innerHTML = '';
            
            Object.entries(this.supportedLanguages).forEach(([code, name]) => {
                const option = document.createElement('option');
                option.value = code;
                option.textContent = name;
                option.selected = code === this.currentLanguage;
                selector.appendChild(option);
            });

            selector.addEventListener('change', (e) => {
                this.setLanguage(e.target.value);
            });
        }
    }

    setLanguage(langCode) {
        if (this.supportedLanguages[langCode]) {
            this.currentLanguage = langCode;
            localStorage.setItem('cineplus_language', langCode);
            this.applyLanguage();
            
            if (typeof app !== 'undefined') {
                app.reloadMoviesWithLanguage();
            }
        }
    }

    applyLanguage() {
        const selector = document.getElementById('languageSelect');
        if (selector) {
            selector.value = this.currentLanguage;
        }
        this.updateUITexts();
    }

    updateUITexts() {
        const translations = {
            'es': {
                searchPlaceholder: 'Buscar películas...',
                featured: 'Películas Destacadas',
                allMovies: 'Todas las Películas',
                categories: 'Categorías',
                apps: 'Apps',
                play: 'Reproducir',
                loadMore: 'Cargar más películas'
            },
            'en': {
                searchPlaceholder: 'Search movies...',
                featured: 'Featured Movies',
                allMovies: 'All Movies',
                categories: 'Categories',
                apps: 'Apps',
                play: 'Play',
                loadMore: 'Load more movies'
            },
            'fr': {
                searchPlaceholder: 'Rechercher des films...',
                featured: 'Films en Vedette',
                allMovies: 'Tous les Films',
                categories: 'Catégories',
                apps: 'Applications',
                play: 'Jouer',
                loadMore: 'Charger plus de films'
            },
            'de': {
                searchPlaceholder: 'Filme suchen...',
                featured: 'Empfohlene Filme',
                allMovies: 'Alle Filme',
                categories: 'Kategorien',
                apps: 'Apps',
                play: 'Abspielen',
                loadMore: 'Mehr Filme laden'
            }
        };

        const langTranslations = translations[this.currentLanguage] || translations['es'];
        
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.placeholder = langTranslations.searchPlaceholder;

        const featuredTitle = document.querySelector('#inicio h3');
        if (featuredTitle) featuredTitle.textContent = langTranslations.featured;

        const allMoviesTitle = document.querySelector('#peliculas h2');
        if (allMoviesTitle) allMoviesTitle.textContent = langTranslations.allMovies;

        const categoriesTitle = document.querySelector('#categorias h2');
        if (categoriesTitle) categoriesTitle.textContent = langTranslations.categories;

        const appsTitle = document.querySelector('#apps h2');
        if (appsTitle) appsTitle.textContent = langTranslations.apps;

        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) loadMoreBtn.textContent = langTranslations.loadMore;

        document.querySelectorAll('.play-movie-btn').forEach(btn => {
            btn.textContent = langTranslations.play;
        });
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }

    getSupportedLanguages() {
        return this.supportedLanguages;
    }
}

let languageManager;

document.addEventListener('DOMContentLoaded', () => {
    languageManager = new LanguageManager();
});
