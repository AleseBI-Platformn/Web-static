const { createApp } = Vue;

createApp({
    data() {
        return {
            // Auth state
            authenticated: false,
            user: null,
            credentials: {
                username: '',
                password: ''
            },
            
            // UI state
            loading: false,
            loadingMenu: false,
            error: '',
            
            // Menu data
            menus: [],
            currentMenu: null
        }
    },
    
    mounted() {
        this.checkAuth();
    },
    
    methods: {
        // Authentication methods
        checkAuth() {
            const savedUser = localStorage.getItem('aleseUser');
            if (savedUser) {
                this.user = JSON.parse(savedUser);
                this.authenticated = true;
                this.loadMenus();
            }
        },
        
        async login() {
            this.loading = true;
            this.error = '';
            
            try {
                const response = await axios.post('/api/login', {
                    username: this.credentials.username,
                    password: this.credentials.password
                });

                if (response.data.success) {
                    this.user = response.data.user;
                    localStorage.setItem('aleseUser', JSON.stringify(this.user));
                    this.authenticated = true;
                    this.credentials = { username: '', password: '' };
                    await this.loadMenus();
                } else {
                    this.error = response.data.message || 'Error en el login';
                }
            } catch (error) {
                console.error('Error en login:', error);
                if (error.response && error.response.data && error.response.data.message) {
                    this.error = error.response.data.message;
                } else {
                    this.error = 'Error de conexión. Por favor intente nuevamente.';
                }
            }
            
            this.loading = false;
        },
        
        logout() {
            if (confirm('¿Está seguro que desea cerrar sesión?')) {
                localStorage.removeItem('aleseUser');
                this.authenticated = false;
                this.user = null;
                this.currentMenu = null;
                this.menus = [];
            }
        },
        
        // Menu methods
        async loadMenus() {
            try {
                const response = await axios.get('/api/menus');
                this.menus = response.data;
                console.log('Menús cargados desde MySQL:', this.menus);
            } catch (error) {
                console.error('Error loading menus:', error);
                this.error = 'Error cargando los menús. Por favor recargue la página.';
            }
        },
        
        selectMenu(menu) {
            this.loadingMenu = true;
            this.currentMenu = menu;
            
            // Simulate loading time
            setTimeout(() => {
                this.loadingMenu = false;
            }, 500);
        }
    }
}).mount('#app');
