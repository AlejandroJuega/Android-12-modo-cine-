class VideoPlayer {
    constructor() {
        this.player = null;
        this.video = null;
        this.currentMovie = null;
        this.isFullscreen = false;
        this.isPlaying = false;
        this.currentTime = 0;
        this.duration = 0;
        this.lastSavedTime = 0;
        this.init();
    }

    init() {
        this.createPlayerElement();
        this.setupEventListeners();
        this.setupProgressTracking();
    }

    createPlayerElement() {
        const playerHTML = `
            <div id="videoPlayer" class="video-player hidden">
                <div class="player-container">
                    <div class="video-container">
                        <video id="mainVideo" class="video-element">
                            Tu navegador no soporta el elemento de video.
                        </video>
                        
                        <div class="loading-spinner hidden">
                            <div class="spinner"></div>
                        </div>

                        <div class="player-controls">
                            <div class="progress-bar-container">
                                <div class="progress-bar">
                                    <div class="progress-filled"></div>
                                    <div class="progress-thumb"></div>
                                </div>
                            </div>

                            <div class="controls-bottom">
                                <div class="controls-left">
                                    <button class="control-btn play-pause-btn">
                                        <span class="play-icon">▶</span>
                                        <span class="pause-icon">❚❚</span>
                                    </button>
                                    
                                    <div class="time-display">
                                        <span class="current-time">0:00</span>
                                        <span class="time-separator"> / </span>
                                        <span class="duration">0:00</span>
                                    </div>

                                    <button class="control-btn volume-btn">
                                        <span class="volume-icon">🔊</span>
                                        <span class="mute-icon">🔇</span>
                                    </button>

                                    <div class="volume-slider-container">
                                        <input type="range" class="volume-slider" min="0" max="100" value="100">
                                    </div>
                                </div>

                                <div class="controls-right">
                                    <button class="control-btn playback-speed-btn">
                                        <span class="speed-text">1x</span>
                                    </button>

                                    <button class="control-btn subtitles-btn">
                                        <span class="subtitle-icon">🎯</span>
                                    </button>

                                    <button class="control-btn quality-btn">
                                        <span class="quality-text">HD</span>
                                    </button>

                                    <button class="control-btn fullscreen-btn">
                                        <span class="fullscreen-icon">⛶</span>
                                        <span class="exit-fullscreen-icon">⛷</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="play-pause-overlay hidden">
                            <button class="big-play-btn">▶</button>
                            <button class="big-pause-btn">❚❚</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', playerHTML);
        this.player = document.getElementById('videoPlayer');
        this.video = document.getElementById('mainVideo');
        this.setupVideoEvents();
    }

    setupVideoEvents() {
        this.video.addEventListener('loadedmetadata', () => {
            this.duration = this.video.duration;
            this.updateDurationDisplay();
        });

        this.video.addEventListener('timeupdate', () => {
            this.currentTime = this.video.currentTime;
            this.updateProgressBar();
            this.updateTimeDisplay();
        });

        this.video.addEventListener('play', () => {
            this.isPlaying = true;
            this.updatePlayPauseButtons();
        });

        this.video.addEventListener('pause', () => {
            this.isPlaying = false;
            this.updatePlayPauseButtons();
        });

        this.video.addEventListener('waiting', () => {
            this.showLoading();
        });

        this.video.addEventListener('canplay', () => {
            this.hideLoading();
        });

        this.video.addEventListener('ended', () => {
            this.handleVideoEnd();
        });
    }

    setupEventListeners() {
        document.querySelector('.play-pause-btn').addEventListener('click', () => {
            this.togglePlayPause();
        });

        document.querySelector('.big-play-btn').addEventListener('click', () => {
            this.play();
        });

        document.querySelector('.big-pause-btn').addEventListener('click', () => {
            this.pause();
        });

        document.querySelector('.volume-btn').addEventListener('click', () => {
            this.toggleMute();
        });

        document.querySelector('.volume-slider').addEventListener('input', (e) => {
            this.setVolume(e.target.value / 100);
        });

        const progressBar = document.querySelector('.progress-bar');
        progressBar.addEventListener('click', (e) => {
            this.seek(e);
        });

        document.querySelector('.fullscreen-btn').addEventListener('click', () => {
            this.toggleFullscreen();
        });

        document.addEventListener('keydown', (e) => {
            if (!this.player.classList.contains('hidden')) {
                this.handleKeyPress(e);
            }
        });

        this.video.addEventListener('click', () => {
            this.togglePlayPause();
        });

        this.player.addEventListener('mousemove', () => {
            this.showControls();
        });

        this.player.addEventListener('mouseleave', () => {
            if (this.isPlaying) {
                setTimeout(() => this.hideControls(), 2000);
            }
        });
    }

    setupProgressTracking() {
        this.watchProgressManager = window.watchProgressManager;
        
        this.video.addEventListener('timeupdate', () => {
            if (this.currentMovie && this.duration > 0) {
                const currentTime = this.video.currentTime;
                
                if (Math.floor(currentTime) % 5 === 0 || 
                    Math.abs(currentTime - this.lastSavedTime) > 10) {
                    
                    this.watchProgressManager.updateProgress(
                        this.currentMovie.id,
                        currentTime,
                        this.duration
                    );
                    this.lastSavedTime = currentTime;
                }
            }
        });

        this.video.addEventListener('pause', () => {
            if (this.currentMovie && this.duration > 0) {
                this.watchProgressManager.updateProgress(
                    this.currentMovie.id,
                    this.video.currentTime,
                    this.duration
                );
            }
        });

        this.video.addEventListener('ended', () => {
            if (this.currentMovie) {
                this.watchProgressManager.removeProgress(this.currentMovie.id);
            }
        });
    }

    async playMovie(movie, videoUrl = null, resume = false) {
        this.currentMovie = movie;
        
        const demoVideoUrl = videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
        
        this.showPlayer();
        this.showLoading();
        
        this.video.src = demoVideoUrl;
        
        if (resume && this.watchProgressManager) {
            const resumeTime = this.watchProgressManager.getResumeTime(movie.id);
            if (resumeTime > 0) {
                this.video.currentTime = resumeTime;
            }
        }
        
        try {
            await this.video.play();
            this.updateMovieInfo(movie, resume);
        } catch (error) {
            console.error('Error al reproducir el video:', error);
            this.showError('Error al cargar el video');
        }
    }

    updateMovieInfo(movie, resume = false) {
        if (resume && this.watchProgressManager) {
            const progress = this.watchProgressManager.getProgress(movie.id);
            if (progress) {
                this.showResumeMessage(progress.progress);
            }
        }
    }

    showResumeMessage(progress) {
        const message = document.createElement('div');
        message.className = 'resume-message';
        message.innerHTML = `
            <div class="resume-content">
                <span>Reanudando donde lo dejaste (${Math.round(progress)}%)</span>
                <button class="restart-btn">Ver desde el inicio</button>
            </div>
        `;
        
        message.style.cssText = `
            position: absolute;
            top: 20%;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 30;
            display: flex;
            align-items: center;
            gap: 1rem;
        `;
        
        this.player.appendChild(message);
        
        message.querySelector('.restart-btn').addEventListener('click', () => {
            this.video.currentTime = 0;
            this.watchProgressManager.removeProgress(this.currentMovie.id);
            message.remove();
        });
        
        setTimeout(() => {
            if (message.parentElement) {
                message.remove();
            }
        }, 5000);
    }

    togglePlayPause() {
        if (this.video.paused) {
            this.play();
        } else {
            this.pause();
        }
    }

    play() {
        this.video.play().catch(error => {
            console.error('Error al reproducir:', error);
        });
    }

    pause() {
        this.video.pause();
    }

    toggleMute() {
        this.video.muted = !this.video.muted;
        this.updateVolumeButton();
    }

    setVolume(volume) {
        this.video.volume = volume;
        this.updateVolumeButton();
    }

    seek(e) {
        const progressBar = e.currentTarget;
        const clickPosition = (e.pageX - progressBar.getBoundingClientRect().left) / progressBar.offsetWidth;
        const newTime = clickPosition * this.duration;
        
        this.video.currentTime = newTime;
        this.updateProgressBar();
    }

    toggleFullscreen() {
        if (!this.isFullscreen) {
            this.enterFullscreen();
        } else {
            this.exitFullscreen();
        }
    }

    enterFullscreen() {
        const container = this.player.querySelector('.player-container');
        
        if (container.requestFullscreen) {
            container.requestFullscreen();
        } else if (container.webkitRequestFullscreen) {
            container.webkitRequestFullscreen();
        } else if (container.msRequestFullscreen) {
            container.msRequestFullscreen();
        }
        
        this.isFullscreen = true;
        this.updateFullscreenButton();
    }

    exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        
        this.isFullscreen = false;
        this.updateFullscreenButton();
    }

    showPlayer() {
        this.player.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    hidePlayer() {
        this.player.classList.add('hidden');
        document.body.style.overflow = '';
        this.pause();
        this.video.src = '';
    }

    showLoading() {
        document.querySelector('.loading-spinner').classList.remove('hidden');
    }

    hideLoading() {
        document.querySelector('.loading-spinner').classList.add('hidden');
    }

    showControls() {
        document.querySelector('.player-controls').classList.add('visible');
        document.querySelector('.play-pause-overlay').classList.add('visible');
    }

    hideControls() {
        if (this.isPlaying) {
            document.querySelector('.player-controls').classList.remove('visible');
            document.querySelector('.play-pause-overlay').classList.remove('visible');
        }
    }

    updatePlayPauseButtons() {
        const playPauseBtn = document.querySelector('.play-pause-btn');
        const bigPlayBtn = document.querySelector('.big-play-btn');
        const bigPauseBtn = document.querySelector('.big-pause-btn');
        const overlay = document.querySelector('.play-pause-overlay');

        if (this.isPlaying) {
            playPauseBtn.classList.add('playing');
            bigPlayBtn.classList.add('hidden');
            bigPauseBtn.classList.remove('hidden');
        } else {
            playPauseBtn.classList.remove('playing');
            bigPlayBtn.classList.remove('hidden');
            bigPauseBtn.classList.add('hidden');
        }

        overlay.classList.remove('hidden');
        setTimeout(() => {
            if (this.isPlaying) {
                overlay.classList.add('hidden');
            }
        }, 1000);
    }

    updateVolumeButton() {
        const volumeBtn = document.querySelector('.volume-btn');
        const isMuted = this.video.muted || this.video.volume === 0;
        
        if (isMuted) {
            volumeBtn.classList.add('muted');
        } else {
            volumeBtn.classList.remove('muted');
        }
    }

    updateFullscreenButton() {
        const fullscreenBtn = document.querySelector('.fullscreen-btn');
        
        if (this.isFullscreen) {
            fullscreenBtn.classList.add('fullscreen');
        } else {
            fullscreenBtn.classList.remove('fullscreen');
        }
    }

    updateProgressBar() {
        const progress = (this.currentTime / this.duration) * 100;
        document.querySelector('.progress-filled').style.width = progress + '%';
        document.querySelector('.progress-thumb').style.left = progress + '%';
    }

    updateTimeDisplay() {
        const currentTimeElem = document.querySelector('.current-time');
        const durationElem = document.querySelector('.duration');
        
        currentTimeElem.textContent = this.formatTime(this.currentTime);
        durationElem.textContent = this.formatTime(this.duration);
    }

    updateDurationDisplay() {
        const durationElem = document.querySelector('.duration');
        durationElem.textContent = this.formatTime(this.duration);
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    handleKeyPress(e) {
        switch(e.key.toLowerCase()) {
            case ' ':
            case 'k':
                e.preventDefault();
                this.togglePlayPause();
                break;
            case 'f':
                e.preventDefault();
                this.toggleFullscreen();
                break;
            case 'm':
                e.preventDefault();
                this.toggleMute();
                break;
            case 'arrowleft':
                e.preventDefault();
                this.video.currentTime -= 10;
                break;
            case 'arrowright':
                e.preventDefault();
                this.video.currentTime += 10;
                break;
            case 'escape':
                if (this.isFullscreen) {
                    this.exitFullscreen();
                }
                break;
        }
    }

    handleVideoEnd() {
        setTimeout(() => {
            this.hidePlayer();
        }, 3000);
    }

    showError(message) {
        console.error(message);
        this.hidePlayer();
    }
}

let videoPlayer;

document.addEventListener('DOMContentLoaded', () => {
    videoPlayer = new VideoPlayer();
});
