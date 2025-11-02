class AuthManager {
    constructor() {
        this.isLoggedIn = false;
        this.currentUser = null;
        this.init();
    }

    init() {
        this.checkExistingSession();
        this.setupEventListeners();
    }

    checkExistingSession() {
        const savedUser = localStorage.getItem('cineplus_user');
        const savedSession = localStorage.getItem('cineplus_session');
        
        if (savedUser && savedSession) {
            this.currentUser = JSON.parse(savedUser);
            this.isLoggedIn = true;
            this.showMainApp();
        } else {
            this.showLoginScreen();
        }
    }

    setupEventListeners() {
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        document.getElementById('googleLogin').addEventListener('click', () => {
            this.handleGoogleLogin();
        });

        document.getElementById('startCinemaMode').addEventListener('click', () => {
            this.activateCinemaMode();
        });

        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });

        document.getElementById('showSignup').addEventListener('click', (e) => {
            e.preventDefault();
            this.showSignup();
        });
    }

    switchTab(tabName) {
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');
    }

    async handleLogin() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        if (!this.validateEmail(email)) {
            this.showError('emailError', 'Por favor, introduce un email válido');
            return;
        }

        if (password.length < 6) {
            this.showError('passwordError', 'La contraseña debe tener al menos 6 caracteres');
            return;
        }

        try {
            await this.simulateLogin(email, password, rememberMe);
        } catch (error) {
            this.showError('passwordError', 'Credenciales incorrectas');
        }
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    async simulateLogin(email, password, rememberMe) {
        await new Promise(resolve => setTimeout(resolve, 1500));

        if (password.length >= 6) {
            this.currentUser = {
                email: email,
                name: email.split('@')[0],
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&background=e50914&color=fff`
            };
            
            this.isLoggedIn = true;
            
            localStorage.setItem('cineplus_user', JSON.stringify(this.currentUser));
            localStorage.setItem('cineplus_session', 'active');
            
            if (rememberMe) {
                localStorage.setItem('cineplus_remember', 'true');
            }
            
            this.showMainApp();
        } else {
            throw new Error('Invalid credentials');
        }
    }

    async handleGoogleLogin() {
        const googleBtn = document.getElementById('googleLogin');
        const originalText = googleBtn.innerHTML;
        
        googleBtn.innerHTML = '<span class="google-icon">G</span> Conectando...';
        googleBtn.disabled = true;

        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.currentUser = {
                email: 'usuario@gmail.com',
                name: 'Usuario Google',
                avatar: 'https://ui-avatars.com/api/?name=Usuario+Google&background=4285f4&color=fff'
            };
            
            this.isLoggedIn = true;
            localStorage.setItem('cineplus_user', JSON.stringify(this.currentUser));
            localStorage.setItem('cineplus_session', 'active');
            
            this.showMainApp();
        } catch (error) {
            this.showError('passwordError', 'Error al conectar con Google');
        } finally {
            googleBtn.innerHTML = originalText;
            googleBtn.disabled = false;
        }
    }

    activateCinemaMode() {
        const cinemaBtn = document.getElementById('startCinemaMode');
        const originalText = cinemaBtn.innerHTML;
        
        cinemaBtn.innerHTML = 'Activando Modo Cine...';
        cinemaBtn.disabled = true;

        setTimeout(() => {
            alert('Modo Cine activado! Disfruta de la experiencia cinematográfica premium.');
            cinemaBtn.innerHTML = originalText;
            cinemaBtn.disabled = false;
            this.switchTab('signin');
        }, 2000);
    }

    showMainApp() {
        if (window.musicPlayer) {
            window.musicPlayer.stopOnLogin();
        }
        
        document.getElementById('loginScreen').classList.remove('active');
        document.getElementById('mainApp').classList.add('active');
        
        if (this.currentUser) {
            document.getElementById('userEmail').textContent = this.currentUser.email;
        }
        
        if (typeof app !== 'undefined' && !app.initialized) {
            app.init();
        }
    }

    showLoginScreen() {
        document.getElementById('loginScreen').classList.add('active');
        document.getElementById('mainApp').classList.remove('active');
    }

    handleLogout() {
        this.isLoggedIn = false;
        this.currentUser = null;
        
        localStorage.removeItem('cineplus_user');
        localStorage.removeItem('cineplus_session');
        localStorage.removeItem('cineplus_remember');
        
        if (window.musicPlayer) {
            window.musicPlayer.resumeOnLogout();
        }
        
        this.showLoginScreen();
        document.getElementById('loginForm').reset();
    }

    showError(fieldId, message) {
        const errorElement = document.getElementById(fieldId);
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 3000);
    }

    showSignup() {
        alert('Funcionalidad de registro en desarrollo. Por ahora, usa cualquier email y contraseña de al menos 6 caracteres para hacer login de prueba.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});
