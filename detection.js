class AppDetection {
    constructor() {
        this.apps = [
            {
                id: 'primevideo',
                name: 'Prime Video',
                package: 'com.amazon.avod.thirdpartyclient',
                playStore: 'https://play.google.com/store/apps/details?id=com.amazon.avod.thirdpartyclient',
                icon: '🎬',
                rating: 4.2,
                reviews: '2.1M',
                description: 'Disfruta de series y películas populares, incluyendo contenido Amazon Originals. También alquila o compra las últimas películas.',
                features: ['Streaming en HD', 'Descargas offline', 'Perfiles múltiples'],
                price: 'Gratis con compras internas',
                category: 'Entretenimiento',
                size: 'Varía según el dispositivo',
                age: 'Mayores de 12 años',
                version: 'Varía según el dispositivo',
                updated: '2024-01-15'
            },
            {
                id: 'netflix',
                name: 'Netflix',
                package: 'com.netflix.mediaclient',
                playStore: 'https://play.google.com/store/apps/details?id=com.netflix.mediaclient',
                icon: '📺',
                rating: 4.4,
                reviews: '15M',
                description: 'Películas y series de TV ilimitadas y mucho más. Disfruta donde quieras. Cancela cuando quieras.',
                features: ['Contenido original', 'Sin anuncios', 'Descargas offline'],
                price: 'Suscripción requerida',
                category: 'Entretenimiento',
                size: 'Varía según el dispositivo',
                age: 'Mayores de 17 años',
                version: 'Varía según el dispositivo',
                updated: '2024-01-20'
            },
            {
                id: 'hbomax',
                name: 'HBO Max',
                package: 'com.hbo.hbomax',
                playStore: 'https://play.google.com/store/apps/details?id=com.hbo.hbomax',
                icon: '🎥',
                rating: 4.3,
                reviews: '1.8M',
                description: 'Disfruta de todo el catálogo de HBO, series originales, películas de Warner Bros. y mucho más.',
                features: ['Estrenos simultáneos', 'Contenido exclusivo', 'Perfiles infantiles'],
                price: 'Suscripción requerida',
                category: 'Entretenimiento',
                size: 'Varía según el dispositivo',
                age: 'Mayores de 17 años',
                version: 'Varía según el dispositivo',
                updated: '2024-01-18'
            }
        ];
    }

    async checkAppInstalled(packageName) {
        return new Promise((resolve) => {
            if ('launchApp' in window) {
                const timeout = setTimeout(() => {
                    resolve(false);
                }, 1000);

                window.launchApp({
                    appName: packageName,
                    onSuccess: () => {
                        clearTimeout(timeout);
                        resolve(true);
                    },
                    onError: () => {
                        clearTimeout(timeout);
                        resolve(false);
                    }
                });
            } else {
                resolve(false);
            }
        });
    }

    launchAppOrStore(app) {
        this.checkAppInstalled(app.package).then((isInstalled) => {
            if (isInstalled) {
                window.location.href = `intent://${app.package}#Intent;scheme=package;end;`;
            } else {
                window.open(app.playStore, '_blank');
            }
        });
    }

    getAppDetails(appId) {
        return this.apps.find(app => app.id === appId);
    }

    getAllApps() {
        return this.apps;
    }
}
