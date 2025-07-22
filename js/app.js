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
            rememberMe: false,
            
            // UI state
            loading: false,
            loadingMenu: false,
            error: '',
            
            // Menu data with hierarchical structure
            menus: [],
            currentMenu: null,
            currentSubmenu: null,
            activeParentMenu: null,
            showSubmenuFor: null
        }
    },
    
    mounted() {
        this.checkAuth();
        this.setupAxiosInterceptors();
        
        // Event listener para cerrar submenús al hacer clic fuera
        document.addEventListener('click', (event) => {
            const menuItems = document.querySelectorAll('.menu-item');
            let clickedInside = false;
            
            menuItems.forEach(item => {
                if (item.contains(event.target)) {
                    clickedInside = true;
                }
            });
            
            if (!clickedInside && this.showSubmenuFor) {
                this.showSubmenuFor = null;
                this.activeParentMenu = null;
            }
        });
    },
    
    computed: {
        selectedMenu() {
            const selected = this.currentSubmenu || this.currentMenu;
            
            // Si no hay menú seleccionado pero hay menús disponibles, seleccionar el primero
            if (!selected && this.menus && this.menus.length > 0) {
                console.log('⚠️ Sin menú seleccionado, intentando auto-seleccionar...');
                const firstMenu = this.menus[0];
                if (firstMenu) {
                    // Seleccionar inmediatamente para evitar undefined
                    this.currentMenu = firstMenu;
                    return firstMenu;
                }
            }
            
            // Devolver un objeto por defecto si no hay menú seleccionado
            return selected || { 
                menu: 'Cargando...', 
                url: null, 
                icono: 'spinner',
                ancho: '100%',
                alto: '600px',
                estado: 1
            };
        }
    },
    
    methods: {
        // Authentication methods
        setupAxiosInterceptors() {
            // Agregar token a todas las requests
            axios.interceptors.request.use(
                (config) => {
                    if (this.user && this.user.token) {
                        config.headers.Authorization = `Bearer ${this.user.token}`;
                    }
                    return config;
                },
                (error) => {
                    return Promise.reject(error);
                }
            );

            // Manejar respuestas de error
            axios.interceptors.response.use(
                (response) => response,
                (error) => {
                    if (error.response && error.response.status === 401) {
                        console.log('🔐 Token expirado, cerrando sesión...');
                        this.logout();
                    }
                    return Promise.reject(error);
                }
            );
        },

        checkAuth() {
            let savedUser = localStorage.getItem('aleseUser') || sessionStorage.getItem('aleseUser');
            if (savedUser) {
                this.user = JSON.parse(savedUser);
                this.authenticated = true;
                console.log('👤 Usuario autenticado:', this.user.name || this.user.username);
                console.log('🏢 Perfil:', this.user.perfil);
                console.log('🔑 Token:', this.user.token ? '✅ Presente' : '❌ Ausente');
                
                // Si el usuario ya tiene menús jerárquicos, usarlos
                if (this.user.menus && this.user.menus.length > 0) {
                    this.menus = this.user.menus;
                    console.log('📋 Menús jerárquicos del usuario:', this.menus.map(m => m.menu).join(', '));
                    this.logMenuHierarchy();
                } else {
                    this.loadMenus();
                }
            }
        },
        
        async login() {
            this.loading = true;
            this.error = '';
            
            try {
                console.log('🔐 Intentando login con:', this.credentials.username);
                
                const response = await axios.post('/api/login', {
                    username: this.credentials.username,
                    password: this.credentials.password
                });

                if (response.data.success) {
                    this.user = response.data.user;
                    
                    console.log('✅ Login exitoso:');
                    console.log('👤 Usuario:', this.user.name || this.user.username);
                    console.log('📧 Email:', this.user.email);
                    console.log('🏢 Perfil:', this.user.perfil);
                    console.log('🔑 Menús asignados:', this.user.menus?.length || 0);
                    
                    // Guardar en localStorage si está marcado "recordar"
                    if (this.rememberMe) {
                        localStorage.setItem('aleseUser', JSON.stringify(this.user));
                    } else {
                        sessionStorage.setItem('aleseUser', JSON.stringify(this.user));
                    }
                    
                    this.authenticated = true;
                    this.credentials = { username: '', password: '' };
                    
                    // Si el usuario tiene menús específicos, usarlos directamente
                    if (this.user.menus && this.user.menus.length > 0) {
                        this.menus = this.user.menus;
                        console.log('📋 Usando menús jerárquicos del perfil:', this.menus.map(m => m.menu).join(', '));
                        this.logMenuHierarchy();
                    } else {
                        await this.loadMenus();
                    }
                } else {
                    this.error = response.data.message || 'Error en el login';
                }
            } catch (error) {
                console.error('❌ Error en login:', error);
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
                // Limpiar ambos storages
                localStorage.removeItem('aleseUser');
                sessionStorage.removeItem('aleseUser');
                
                this.authenticated = false;
                this.user = null;
                this.currentMenu = null;
                this.currentSubmenu = null;
                this.activeParentMenu = null;
                this.showSubmenuFor = null;
                this.menus = [];
                
                console.log('👋 Sesión cerrada correctamente');
            }
        },
        
        // Menu methods with hierarchical support
        async loadMenus() {
            try {
                console.log('📋 Cargando menús jerárquicos desde la API...');
                const response = await axios.get('/api/menus');
                this.menus = response.data;
                console.log('✅ Menús jerárquicos cargados desde MySQL:', this.menus.length);
                this.logMenuHierarchy();
            } catch (error) {
                console.error('❌ Error loading menus:', error);
                this.error = 'Error cargando los menús. Por favor recargue la página.';
            }
        },

        logMenuHierarchy() {
            console.log('🌳 ESTRUCTURA JERÁRQUICA DE MENÚS:');
            this.menus.forEach(menu => {
                console.log(`📁 ${menu.menu} (ID: ${menu.idmenu})`);
                if (menu.hasSubmenus && menu.submenus) {
                    menu.submenus.forEach(submenu => {
                        console.log(`  └── ${submenu.menu} (ID: ${submenu.idmenu})`);
                    });
                }
            });
            
            // Auto-seleccionar el primer menú al cargar
            if (this.menus.length > 0 && !this.currentMenu && !this.currentSubmenu) {
                const firstMenu = this.menus[0];
                console.log('🎯 Auto-seleccionando primer menú:', firstMenu.menu);
                
                // Asignar inmediatamente para evitar undefined
                this.currentMenu = firstMenu;
                
                // Si el primer menú tiene submenús, seleccionar el primer submenú
                if (firstMenu.hasSubmenus && firstMenu.submenus && firstMenu.submenus.length > 0) {
                    console.log('📋 Primer menú tiene submenús, seleccionando primer submenú');
                    this.currentSubmenu = firstMenu.submenus[0];
                    this.currentMenu = null; // Limpiar menú principal cuando hay submenú
                }
                
                // Simular la selección completa
                this.selectMenu(this.currentSubmenu || this.currentMenu, !!this.currentSubmenu);
            }
        },

        // Select parent menu (toggle submenu visibility)
        selectParentMenu(menu) {
            console.log('🔄 Seleccionando menú principal:', menu.menu);
            
            if (menu.hasSubmenus && menu.submenus && menu.submenus.length > 0) {
                // Si tiene submenús, toggle la visibilidad
                if (this.showSubmenuFor === menu.idmenu) {
                    // Si ya está abierto, cerrarlo
                    this.showSubmenuFor = null;
                    this.activeParentMenu = null;
                    console.log('📂 Cerrando submenús de:', menu.menu);
                } else {
                    // Abrir submenús
                    this.showSubmenuFor = menu.idmenu;
                    this.activeParentMenu = menu;
                    console.log(`📂 Abriendo ${menu.submenus.length} submenús de:`, menu.menu);
                    console.log('📋 Submenús:', menu.submenus.map(s => s.menu).join(', '));
                }
            } else {
                // Si no tiene submenús, seleccionar directamente
                this.selectMenu(menu);
            }
        },

        // Select menu (parent or submenu)
        selectMenu(menu, isSubmenu = false) {
            console.log('🔄 Seleccionando menú:', menu.menu);
            console.log('📊 Tipo:', isSubmenu ? 'Submenú' : 'Menú principal');
            console.log('📊 Datos del menú:', JSON.stringify(menu, null, 2));
            
            this.loadingMenu = true;
            
            if (isSubmenu) {
                this.currentSubmenu = menu;
                this.currentMenu = null;
            } else {
                this.currentMenu = menu;
                this.currentSubmenu = null;
                // Si selecciona un menú principal, cerrar submenús
                this.showSubmenuFor = null;
                this.activeParentMenu = null;
            }
            
            // Verificar si tiene URL configurada
            if (!menu.vista || menu.vista === null || menu.vista === 'null') {
                console.log('⚠️ Menú sin URL configurada:', menu.menu);
                console.log('🔧 Estado: En configuración');
            } else {
                console.log('✅ URL del iframe disponible:', menu.vista);
            }
            
            // Simulate loading time
            setTimeout(() => {
                this.loadingMenu = false;
                const selectedMenu = this.currentMenu || this.currentSubmenu;
                console.log('✅ Menú cargado:', selectedMenu.menu);
                
                if (selectedMenu.vista && selectedMenu.vista !== null && selectedMenu.vista !== 'null') {
                    console.log('🔗 Cargando iframe con URL:', selectedMenu.vista);
                } else {
                    console.log('📋 Mostrando pantalla de configuración pendiente');
                }
            }, 500);
        },

        // Toggle submenu visibility (for dropdown functionality)
        toggleSubmenu(menuId) {
            console.log('🔄 Toggle submenu para ID:', menuId);
            
            if (this.showSubmenuFor === menuId) {
                // Si ya está abierto, cerrarlo
                this.showSubmenuFor = null;
                this.activeParentMenu = null;
                console.log('📂 Cerrando submenu');
            } else {
                // Cerrar cualquier otro submenu abierto y abrir este
                this.showSubmenuFor = menuId;
                const menu = this.menus.find(m => m.idmenu === menuId);
                this.activeParentMenu = menu;
                console.log('📂 Abriendo submenu para:', menu?.menu);
                console.log('📋 Cantidad de submenús:', menu?.submenus?.length || 0);
            }
        },

        // Check if submenu should be shown
        shouldShowSubmenus(menuId) {
            return this.showSubmenuFor === menuId;
        },

        // Check if menu is active
        isMenuActive(menu, isSubmenu = false) {
            if (isSubmenu) {
                return this.currentSubmenu && this.currentSubmenu.idmenu === menu.idmenu;
            } else {
                return this.currentMenu && this.currentMenu.idmenu === menu.idmenu;
            }
        },

        // Check if parent menu is active (has open submenus)
        isParentMenuActive(menu) {
            return this.activeParentMenu && this.activeParentMenu.idmenu === menu.idmenu;
        },

        // Get currently selected menu for display
        getCurrentSelectedMenu() {
            const selected = this.currentSubmenu || this.currentMenu;
            
            // Si no hay menú seleccionado pero hay menús disponibles, seleccionar el primero
            if (!selected && this.menus && this.menus.length > 0) {
                console.log('⚠️ Sin menú seleccionado, intentando auto-seleccionar...');
                const firstMenu = this.menus[0];
                if (firstMenu) {
                    // Seleccionar inmediatamente para evitar undefined
                    this.currentMenu = firstMenu;
                    return firstMenu;
                }
            }
            
            // Devolver un objeto por defecto si no hay menú seleccionado
            return selected || { 
                menu: 'Cargando...', 
                url: null, 
                icono: 'spinner',
                ancho: '100%',
                alto: '600px',
                estado: 1
            };
        }
    }
}).mount('#app');
