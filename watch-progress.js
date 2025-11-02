class WatchProgressManager {
    constructor() {
        this.storageKey = 'cineplus_watch_progress';
        this.progressData = this.loadProgressData();
    }

    loadProgressData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('Error loading watch progress:', error);
            return {};
        }
    }

    saveProgressData() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.progressData));
        } catch (error) {
            console.error('Error saving watch progress:', error);
        }
    }

    updateProgress(movieId, currentTime, duration, timestamp = Date.now()) {
        if (duration > 0) {
            const progress = (currentTime / duration) * 100;
            
            if (progress >= 5 && progress <= 95) {
                this.progressData[movieId] = {
                    currentTime,
                    duration,
                    progress,
                    timestamp,
                    movieId
                };
                this.saveProgressData();
            } else if (progress > 95) {
                this.removeProgress(movieId);
            }
        }
    }

    getProgress(movieId) {
        return this.progressData[movieId] || null;
    }

    removeProgress(movieId) {
        delete this.progressData[movieId];
        this.saveProgressData();
    }

    getResumeTime(movieId) {
        const progress = this.getProgress(movieId);
        if (progress && progress.duration > 0) {
            const timeAgo = Date.now() - progress.timestamp;
            const daysAgo = timeAgo / (1000 * 60 * 60 * 24);
            
            if (daysAgo <= 30) {
                return progress.currentTime;
            } else {
                this.removeProgress(movieId);
            }
        }
        return 0;
    }

    shouldShowResume(movieId) {
        const progress = this.getProgress(movieId);
        if (!progress) return false;

        const timeAgo = Date.now() - progress.timestamp;
        const daysAgo = timeAgo / (1000 * 60 * 60 * 24);
        
        return progress.progress >= 5 && progress.progress <= 95 && daysAgo <= 30;
    }

    getProgressPercentage(movieId) {
        const progress = this.getProgress(movieId);
        return progress ? progress.progress : 0;
    }

    cleanupOldProgress() {
        const now = Date.now();
        let cleaned = false;

        Object.keys(this.progressData).forEach(movieId => {
            const progress = this.progressData[movieId];
            const timeAgo = now - progress.timestamp;
            const daysAgo = timeAgo / (1000 * 60 * 60 * 24);

            if (daysAgo > 30) {
                delete this.progressData[movieId];
                cleaned = true;
            }
        });

        if (cleaned) {
            this.saveProgressData();
        }
    }
}

let watchProgressManager;

document.addEventListener('DOMContentLoaded', () => {
    watchProgressManager = new WatchProgressManager();
    watchProgressManager.cleanupOldProgress();
});
