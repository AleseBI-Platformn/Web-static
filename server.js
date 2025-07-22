const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// MySQL connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000,
    ssl: false
});

// Test database connection and create table if needed
async function initializeDatabase() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conectado a MySQL exitosamente');
        console.log(`📊 Base de datos: ${process.env.DB_NAME}`);
        console.log(`🌐 Host: ${process.env.DB_HOST}`);
        
        // Check if menus table exists, if not create it
        const [tables] = await connection.execute("SHOW TABLES LIKE 'menus'");
        
        if (tables.length === 0) {
            console.log('📋 Creando tabla menus...');
            await connection.execute(`
                CREATE TABLE menus (
                    idmenu INT PRIMARY KEY AUTO_INCREMENT,
                    menu VARCHAR(255) NOT NULL,
                    url VARCHAR(255) NOT NULL,
                    icono VARCHAR(100) DEFAULT 'chart-line',
                    parent INT DEFAULT 0,
                    estado TINYINT DEFAULT 1,
                    vista TEXT,
                    ancho VARCHAR(10) DEFAULT '100%',
                    alto VARCHAR(10) DEFAULT '100%',
                    orden INT DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);
            
            // Insert sample data
            await connection.execute(`
                INSERT INTO menus (menu, url, icono, parent, estado, vista, ancho, alto, orden) VALUES
                ('VENTAS', 'ventas', 'chart-line', 0, 1, 'https://app.powerbi.com/view?r=sample1', '100%', '600px', 1),
                ('DIGITAL', 'digital', 'mobile-alt', 0, 1, 'https://app.powerbi.com/view?r=sample2', '100%', '600px', 2),
                ('RETOMAS', 'retomas', 'exchange-alt', 0, 1, 'https://app.powerbi.com/view?r=sample3', '100%', '600px', 3),
                ('ADMINISTRACION', 'administracion', 'cogs', 0, 1, 'https://app.powerbi.com/view?r=sample4', '100%', '600px', 4),
                ('POSTVENTA', 'postventa', 'tools', 0, 1, 'https://app.powerbi.com/view?r=sample5', '100%', '600px', 5),
                ('F&I', 'finanzas', 'calculator', 0, 1, 'https://app.powerbi.com/view?r=sample6', '100%', '600px', 6),
                ('KPI', 'kpi', 'tachometer-alt', 0, 1, 'https://app.powerbi.com/view?r=sample7', '100%', '600px', 7)
            `);
            console.log('✅ Tabla menus creada y datos insertados');
        } else {
            console.log('✅ Tabla menus ya existe');
        }
        
        connection.release();
    } catch (err) {
        console.error('❌ Error inicializando base de datos:', err);
    }
}

// Initialize database on startup
initializeDatabase();

// API Routes
// Get menus from database with hierarchical structure and permissions
app.get('/api/menus', async (req, res) => {
    try {
        console.log('📋 Solicitando menús jerárquicos de la base de datos...');
        
        // Obtener usuario desde el token si está disponible
        const authHeader = req.headers.authorization;
        let userId = null;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const token = authHeader.substring(7);
                const decoded = Buffer.from(token, 'base64').toString();
                userId = decoded.split(':')[0];
                console.log(`👤 Usuario identificado: ${userId}`);
            } catch (e) {
                console.log('⚠️ Token inválido, mostrando menús públicos');
            }
        }

        // Verificar qué columnas existen en la tabla menus
        const [columns] = await pool.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'menus'
        `, [process.env.DB_NAME]);
        
        const columnNames = columns.map(col => col.COLUMN_NAME);
        console.log('📊 Columnas disponibles en la tabla menus:', columnNames);
        
        let allMenus = [];
        let parentMenus = [];
        
        if (userId) {
            // Obtener TODOS los menús (principales y submenús) con permisos del usuario específico
            try {
                // Primero intentar obtener idperfil del usuario
                const [userRows] = await pool.execute(`
                    SELECT idperfil FROM usuarios WHERE UsuCod = ? AND UsuEst = 'ACT'
                `, [userId]);
                
                if (userRows.length > 0 && userRows[0].idperfil) {
                    // Obtener TODOS los menús por perfil (principales y submenús)
                    const [menuRows] = await pool.execute(`
                        SELECT DISTINCT m.*
                        FROM menus m
                        INNER JOIN perfil_menus pm ON m.idmenu = pm.idmenu
                        WHERE pm.idperfil = ? AND m.estado = 1
                        ORDER BY 
                            CASE WHEN m.parent = 0 THEN m.idmenu ELSE m.parent END ASC,
                            m.parent ASC,
                            m.idmenu ASC
                    `, [userRows[0].idperfil]);
                    allMenus = menuRows;
                    console.log(`📋 Todos los menús obtenidos por perfil: ${allMenus.length}`);
                    
                    // Log para debug - mostrar todos los menús obtenidos
                    console.log('🔍 DEBUG - Menús obtenidos del perfil:');
                    allMenus.forEach(menu => {
                        console.log(`  • ID: ${menu.idmenu}, Nombre: ${menu.menu}, Parent: ${menu.parent || 0}`);
                    });
                }
                
                // Si no tiene menús por perfil, verificar permisos directos
                if (allMenus.length === 0) {
                    const [permissionRows] = await pool.execute(`
                        SELECT DISTINCT m.*
                        FROM menus m
                        INNER JOIN ___________________________permisos p ON m.idmenu = p.idmenu
                        WHERE p.UsuCod = ? AND m.estado = 1
                        ORDER BY 
                            CASE WHEN m.parent = 0 THEN m.idmenu ELSE m.parent END ASC,
                            m.parent ASC,
                            m.idmenu ASC
                    `, [userId]);
                    allMenus = permissionRows;
                    console.log(`📋 Todos los menús obtenidos por permisos directos: ${allMenus.length}`);
                    
                    // Log para debug - mostrar todos los menús obtenidos
                    console.log('🔍 DEBUG - Menús obtenidos por permisos directos:');
                    allMenus.forEach(menu => {
                        console.log(`  • ID: ${menu.idmenu}, Nombre: ${menu.menu}, Parent: ${menu.parent || 0}`);
                    });
                }
            } catch (permError) {
                console.log('⚠️ Error obteniendo permisos, mostrando todos los menús:', permError.message);
            }
        }
        
        // Si no hay menús específicos del usuario, obtener todos los menús activos
        if (allMenus.length === 0) {
            console.log('📋 Obteniendo todos los menús activos...');
            
            // Construir la consulta basada en las columnas disponibles
            let selectFields = 'idmenu, menu';
            let orderBy = 'idmenu ASC';
            
            if (columnNames.includes('url')) selectFields += ', url';
            if (columnNames.includes('icono')) selectFields += ', icono';
            if (columnNames.includes('parent')) selectFields += ', parent';
            if (columnNames.includes('estado')) selectFields += ', estado';
            if (columnNames.includes('vista')) selectFields += ', vista';
            if (columnNames.includes('ancho')) selectFields += ', ancho';
            if (columnNames.includes('alto')) selectFields += ', alto';
            
            // Construir las condiciones WHERE
            let whereConditions = '1=1'; // Siempre verdadero como base
            if (columnNames.includes('estado')) {
                whereConditions += ' AND estado = 1';
            }
            
            const finalQuery = `
                SELECT ${selectFields}
                FROM menus 
                WHERE ${whereConditions}
                ORDER BY ${orderBy}
            `;
            
            console.log('📝 Consulta SQL generada:', finalQuery);
            
            const [rows] = await pool.execute(finalQuery);
            allMenus = rows;
        }
        
        // Separar menús principales de submenús y construir jerarquía
        if (allMenus.length > 0) {
            console.log('🏗️ Construyendo jerarquía de menús...');
            
            // Separar menús principales (parent = 0 o NULL) de submenús
            parentMenus = allMenus.filter(menu => 
                menu.parent === 0 || menu.parent === null || menu.parent === undefined
            );
            
            const subMenus = allMenus.filter(menu => 
                menu.parent && menu.parent !== 0
            );
            
            console.log(`📊 Menús principales encontrados: ${parentMenus.length}`);
            console.log(`📊 Submenús encontrados: ${subMenus.length}`);
            
            // Agregar submenús a cada menú principal
            parentMenus.forEach(parentMenu => {
                console.log(`🔍 Buscando submenús para "${parentMenu.menu}" (ID: ${parentMenu.idmenu})`);
                
                // Buscar submenús por relación parent exacta
                const exactChildMenus = subMenus.filter(submenu => 
                    parseInt(submenu.parent) === parseInt(parentMenu.idmenu)
                );
                
                // También buscar por patrón de IDs (para casos como parent 1 -> hijos 200+, 300+, etc.)
                const patternChildMenus = subMenus.filter(submenu => {
                    if (exactChildMenus.some(exact => exact.idmenu === submenu.idmenu)) {
                        return false; // Ya incluido en exactChildMenus
                    }
                    
                    const parentId = parseInt(parentMenu.idmenu);
                    const childId = parseInt(submenu.idmenu);
                    
                    // Si el menú principal es 1-10 y el hijo es 100+
                    if (parentId <= 10 && childId >= 100) {
                        // Verificar patrones comunes de la base de datos
                        const hundreds = Math.floor(childId / 100);
                        
                        // Pattern 1: Parent 1 -> hijos 200-299, 300-399, 500-599, 1000+
                        if (parentId === 1 && (hundreds === 2 || hundreds === 3 || hundreds === 5 || childId >= 1000)) {
                            console.log(`  🎯 Patrón detectado: ${childId} es hijo de ${parentId} por patrón ID`);
                            return true;
                        }
                        
                        // Pattern 2: Parent N -> hijos N00-N99 (ej: parent 2 -> 200-299)
                        if (hundreds === parentId) {
                            console.log(`  🎯 Patrón detectado: ${childId} es hijo de ${parentId} por patrón cientos`);
                            return true;
                        }
                    }
                    
                    return false;
                });
                
                // Combinar ambos tipos de hijos
                const allChildMenus = [...exactChildMenus, ...patternChildMenus];
                
                parentMenu.submenus = allChildMenus;
                parentMenu.hasSubmenus = allChildMenus.length > 0;
                
                if (allChildMenus.length > 0) {
                    console.log(`✅ ${parentMenu.menu} tiene ${allChildMenus.length} submenús:`, 
                        allChildMenus.map(s => `${s.menu} (${s.idmenu})`).join(', '));
                } else {
                    console.log(`➖ ${parentMenu.menu} no tiene submenús`);
                }
            });
            
            // Ordenar menús principales por idmenu
            parentMenus.sort((a, b) => a.idmenu - b.idmenu);
            
        } else {
            // Si no hay datos reales, enviamos datos de ejemplo con estructura jerárquica
            console.log('⚠️ No hay menús en la base de datos. Enviando datos de ejemplo...');
            
            parentMenus = [
                {
                    idmenu: 1,
                    menu: 'COMERCIAL',
                    url: 'comercial',
                    icono: 'home',
                    parent: 0,
                    estado: 1,
                    vista: null,
                    ancho: '100%',
                    alto: '100%',
                    hasSubmenus: false,
                    submenus: []
                },
                {
                    idmenu: 2,
                    menu: 'GERENCIA',
                    url: 'gerencia',
                    icono: 'eye',
                    parent: 0,
                    estado: 1,
                    vista: null,
                    ancho: '100%',
                    alto: '100%',
                    hasSubmenus: true,
                    submenus: [
                        {
                            idmenu: 201,
                            menu: 'Avance Ventas 1',
                            url: 'avance-ventas-1',
                            icono: 'chart-bar',
                            parent: 2,
                            estado: 1,
                            vista: 'https://app.powerbi.com/reportEmbed?reportId=sample1',
                            ancho: '100%',
                            alto: '900'
                        },
                        {
                            idmenu: 202,
                            menu: 'Avance Ventas 2',
                            url: 'avance-ventas-2',
                            icono: 'chart-line',
                            parent: 2,
                            estado: 1,
                            vista: 'https://app.powerbi.com/reportEmbed?reportId=sample2',
                            ancho: '100%',
                            alto: '1560'
                        }
                    ]
                },
                {
                    idmenu: 3,
                    menu: 'VENTAS',
                    url: 'ventas',
                    icono: 'direction',
                    parent: 0,
                    estado: 1,
                    vista: null,
                    ancho: '100%',
                    alto: '100%',
                    hasSubmenus: true,
                    submenus: [
                        {
                            idmenu: 301,
                            menu: 'Avance General',
                            url: 'avance-general',
                            icono: 'chart-area',
                            parent: 3,
                            estado: 1,
                            vista: null,
                            ancho: '100%',
                            alto: '1540'
                        },
                        {
                            idmenu: 310,
                            menu: 'Stock Maserati',
                            url: 'stock-maserati',
                            icono: 'car',
                            parent: 3,
                            estado: 1,
                            vista: null,
                            ancho: '100%',
                            alto: '940'
                        }
                    ]
                },
                {
                    idmenu: 10,
                    menu: 'KPI',
                    url: 'kpi',
                    icono: 'notepad',
                    parent: 0,
                    estado: 1,
                    vista: null,
                    ancho: '100%',
                    alto: '100%',
                    hasSubmenus: true,
                    submenus: [
                        {
                            idmenu: 1001,
                            menu: 'Ventas Generales',
                            url: 'ventas-generales',
                            icono: 'chart-pie',
                            parent: 10,
                            estado: 1,
                            vista: null,
                            ancho: '100%',
                            alto: '100'
                        },
                        {
                            idmenu: 1002,
                            menu: 'Ventas Alese',
                            url: 'ventas-alese',
                            icono: 'chart-bar',
                            parent: 10,
                            estado: 1,
                            vista: null,
                            ancho: '100%',
                            alto: '1670'
                        }
                    ]
                }
            ];
        }
        
        console.log(`✅ Menús jerárquicos procesados: ${parentMenus.length} principales`);
        console.log('📊 Menús principales:', parentMenus.map(m => m.menu).join(', '));
        
        // Log de estructura jerárquica
        parentMenus.forEach(menu => {
            if (menu.hasSubmenus) {
                console.log(`🌳 ${menu.menu} (${menu.idmenu}) → ${menu.submenus.length} submenús`);
            }
        });
        
        res.json(parentMenus);
        
    } catch (error) {
        console.error('❌ Error obteniendo menús:', error);
        console.error('❌ Código de error:', error.code);
        console.error('❌ Mensaje SQL:', error.sqlMessage);
        
        // Si hay error de conexión, enviamos datos de ejemplo
        console.log('🔄 Enviando datos de ejemplo debido al error...');
        
        const fallbackMenus = [
            {
                idmenu: 1,
                menu: 'DASHBOARD',
                url: 'dashboard',
                icono: 'chart-line',
                parent: 0,
                estado: 1,
                vista: null,
                ancho: '100%',
                alto: '100%',
                hasSubmenus: false,
                submenus: []
            },
            {
                idmenu: 2,
                menu: 'REPORTES',
                url: 'reportes',
                icono: 'file-alt',
                parent: 0,
                estado: 1,
                vista: null,
                ancho: '100%',
                alto: '100%',
                hasSubmenus: false,
                submenus: []
            }
        ];
        
        res.json(fallbackMenus);
    }
});

// New endpoint to get submenus for a specific parent menu
app.get('/api/menus/:parentId/submenus', async (req, res) => {
    try {
        const { parentId } = req.params;
        console.log(`📋 Solicitando submenús para el menú padre: ${parentId}`);
        
        // Obtener usuario desde el token si está disponible
        const authHeader = req.headers.authorization;
        let userId = null;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const token = authHeader.substring(7);
                const decoded = Buffer.from(token, 'base64').toString();
                userId = decoded.split(':')[0];
            } catch (e) {
                console.log('⚠️ Token inválido');
            }
        }

        let submenus = [];

        if (userId) {
            // Obtener submenús con permisos del usuario específico
            try {
                // Primero intentar obtener idperfil del usuario
                const [userRows] = await pool.execute(`
                    SELECT idperfil FROM usuarios WHERE UsuCod = ? AND UsuEst = 'ACT'
                `, [userId]);
                
                if (userRows.length > 0 && userRows[0].idperfil) {
                    // Obtener submenús por perfil
                    const [menuRows] = await pool.execute(`
                        SELECT DISTINCT m.*
                        FROM menus m
                        INNER JOIN perfil_menus pm ON m.idmenu = pm.idmenu
                        WHERE pm.idperfil = ? AND m.estado = 1 AND m.parent = ?
                        ORDER BY m.idmenu ASC
                    `, [userRows[0].idperfil, parentId]);
                    submenus = menuRows;
                }
                
                // Si no tiene submenús por perfil, verificar permisos directos
                if (submenus.length === 0) {
                    const [permissionRows] = await pool.execute(`
                        SELECT DISTINCT m.*
                        FROM menus m
                        INNER JOIN ___________________________permisos p ON m.idmenu = p.idmenu
                        WHERE p.UsuCod = ? AND m.estado = 1 AND m.parent = ?
                        ORDER BY m.idmenu ASC
                    `, [userId, parentId]);
                    submenus = permissionRows;
                }
            } catch (permError) {
                console.log('⚠️ Error obteniendo permisos de submenús:', permError.message);
            }
        }

        // Si no hay submenús específicos del usuario, obtener todos los submenús activos
        if (submenus.length === 0) {
            const [rows] = await pool.execute(`
                SELECT * FROM menus 
                WHERE parent = ? AND estado = 1
                ORDER BY idmenu ASC
            `, [parentId]);
            submenus = rows;
        }

        console.log(`✅ Submenús encontrados para padre ${parentId}: ${submenus.length}`);
        if (submenus.length > 0) {
            console.log('📊 Submenús:', submenus.map(s => s.menu).join(', '));
        }

        res.json({
            success: true,
            parentId: parseInt(parentId),
            data: submenus
        });

    } catch (error) {
        console.error('❌ Error obteniendo submenús:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo submenús'
        });
    }
});

// Login endpoint - Sistema completo con usuarios, perfiles y permisos
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Usuario y contraseña son requeridos'
            });
        }

        console.log(`🔐 Intento de login para: ${username}`);

        // 🧪 USUARIO DE PRUEBA JPOMA - Con menús jerárquicos completos
        if (username === 'jpoma' && password === '123456') {
            console.log('🧪 Acceso como usuario de prueba JPOMA');
            
            const exampleMenus = [
                {
                    idmenu: 1,
                    menu: 'COMERCIAL',
                    url: null,
                    icono: 'chart-line',
                    estado: 1,
                    parent: 0,
                    hasSubmenus: true,
                    submenus: [
                        {
                            idmenu: 201,
                            menu: 'Dashboard Ventas',
                            url: 'https://app.powerbi.com/view?r=eyJrIjoiNzA5M2E0YzQtYWQ5MS00YTJlLWJiMGMtNDQzOWE5ZTMzOGI5IiwidCI6ImJmY2E2MzIwLTI3YTQtNGJhMC04YjE4LWFkYzNkNzAzZjI1NyIsImMiOjl9',
                            icono: 'chart-bar',
                            estado: 1,
                            parent: 1
                        },
                        {
                            idmenu: 202,
                            menu: 'Análisis Clientes',
                            url: 'https://app.powerbi.com/view?r=eyJrIjoiSample2',
                            icono: 'users',
                            estado: 1,
                            parent: 1
                        },
                        {
                            idmenu: 203,
                            menu: 'Reportes Mensuales',
                            url: null,
                            icono: 'calendar-alt',
                            estado: 1,
                            parent: 1
                        }
                    ]
                },
                {
                    idmenu: 2,
                    menu: 'FINANZAS',
                    url: null,
                    icono: 'dollar-sign',
                    estado: 1,
                    parent: 0,
                    hasSubmenus: true,
                    submenus: [
                        {
                            idmenu: 301,
                            menu: 'Flujo de Caja',
                            url: 'https://app.powerbi.com/view?r=eyJrIjoiSample3',
                            icono: 'money-bill-wave',
                            estado: 1,
                            parent: 2
                        },
                        {
                            idmenu: 302,
                            menu: 'Balance General',
                            url: 'https://app.powerbi.com/view?r=eyJrIjoiSample4',
                            icono: 'balance-scale',
                            estado: 1,
                            parent: 2
                        }
                    ]
                },
                {
                    idmenu: 3,
                    menu: 'OPERACIONES',
                    url: null,
                    icono: 'cogs',
                    estado: 1,
                    parent: 0,
                    hasSubmenus: true,
                    submenus: [
                        {
                            idmenu: 501,
                            menu: 'Productividad',
                            url: 'https://app.powerbi.com/view?r=eyJrIjoiSample5',
                            icono: 'tachometer-alt',
                            estado: 1,
                            parent: 3
                        },
                        {
                            idmenu: 502,
                            menu: 'Calidad',
                            url: null,
                            icono: 'star',
                            estado: 1,
                            parent: 3
                        },
                        {
                            idmenu: 503,
                            menu: 'Inventario',
                            url: 'https://app.powerbi.com/view?r=eyJrIjoiSample6',
                            icono: 'boxes',
                            estado: 1,
                            parent: 3
                        }
                    ]
                }
            ];

            return res.json({
                success: true,
                message: 'Login exitoso',
                user: {
                    id: 'jpoma',
                    username: 'jpoma',
                    name: 'Juan Poma',
                    email: 'jpoma@alese.com',
                    profile: 'Administrador',
                    token: Buffer.from(`jpoma:${Date.now()}`).toString('base64'),
                    loginTime: new Date().toISOString(),
                    menus: exampleMenus
                }
            });
        }

        // Buscar usuario en la tabla usuarios
        const [userRows] = await pool.execute(`
            SELECT u.UsuCod, u.UsuNom, u.UsuApePat, u.UsuApeMat, u.UsuEmail, 
                   u.UsuClave, u.UsuPerfil, u.UsuEst, u.idperfil,
                   p.perfil as nombre_perfil, p.activo as perfil_activo
            FROM usuarios u
            LEFT JOIN perfiles p ON u.idperfil = p.idperfil
            WHERE u.UsuCod = ? AND u.UsuEst = 'ACT'
        `, [username]);

        if (userRows.length === 0) {
            console.log('❌ Usuario no encontrado o inactivo');
            return res.status(401).json({
                success: false,
                message: 'Usuario no encontrado o inactivo'
            });
        }

        const user = userRows[0];
        
        // Verificar contraseña (en producción deberías usar hash)
        if (user.UsuClave !== password) {
            console.log('❌ Contraseña incorrecta');
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Obtener menús con permisos del usuario
        let userMenus = [];
        
        if (user.idperfil) {
            // Obtener menús por perfil
            const [menuRows] = await pool.execute(`
                SELECT DISTINCT m.idmenu, m.menu, m.vista, m.icono, m.estado, 
                       m.url, m.ancho, m.alto, m.parent
                FROM menus m
                INNER JOIN perfil_menus pm ON m.idmenu = pm.idmenu
                WHERE pm.idperfil = ? AND m.estado = 1 AND m.parent = 0
                ORDER BY m.idmenu ASC
            `, [user.idperfil]);
            userMenus = menuRows;
        }

        // Si no tiene menús por perfil, verificar permisos directos
        if (userMenus.length === 0) {
            const [permissionRows] = await pool.execute(`
                SELECT DISTINCT m.idmenu, m.menu, m.vista, m.icono, m.estado,
                       m.url, m.ancho, m.alto, m.parent  
                FROM menus m
                INNER JOIN ___________________________permisos p ON m.idmenu = p.idmenu
                WHERE p.UsuCod = ? AND m.estado = 1 AND m.parent = 0
                ORDER BY m.idmenu ASC
            `, [user.UsuCod]);
            userMenus = permissionRows;
        }

        const userResponse = {
            id: user.UsuCod,
            username: user.UsuCod,
            name: `${user.UsuNom} ${user.UsuApePat || ''}`.trim(),
            email: user.UsuEmail,
            perfil: user.nombre_perfil || user.UsuPerfil,
            idperfil: user.idperfil,
            token: Buffer.from(`${user.UsuCod}:${Date.now()}`).toString('base64'),
            loginTime: new Date().toISOString(),
            menus: userMenus
        };

        console.log(`✅ Login exitoso para: ${user.UsuNom} (${user.UsuCod})`);
        console.log(`📋 Perfil: ${user.nombre_perfil || 'Sin perfil'}`);
        console.log(`🔑 Menús disponibles: ${userMenus.length}`);

        res.json({
            success: true,
            user: userResponse,
            message: 'Login exitoso'
        });

    } catch (error) {
        console.error('❌ Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Endpoint para obtener perfiles disponibles
app.get('/api/perfiles', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT idperfil, perfil, activo 
            FROM perfiles 
            WHERE activo = 1 
            ORDER BY perfil ASC
        `);
        
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('❌ Error obteniendo perfiles:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo perfiles'
        });
    }
});

// Endpoint para obtener menús de un perfil específico
app.get('/api/perfil/:idperfil/menus', async (req, res) => {
    try {
        const { idperfil } = req.params;
        
        const [rows] = await pool.execute(`
            SELECT m.idmenu, m.menu, m.icono, m.url, m.estado, m.vista
            FROM menus m
            INNER JOIN perfil_menus pm ON m.idmenu = pm.idmenu
            WHERE pm.idperfil = ? AND m.estado = 1
            ORDER BY m.menu ASC
        `, [idperfil]);
        
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('❌ Error obteniendo menús del perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo menús del perfil'
        });
    }
});

// Endpoint para obtener usuarios
app.get('/api/usuarios', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT u.UsuCod, u.UsuNom, u.UsuApePat, u.UsuApeMat, u.UsuEmail, 
                   u.UsuPerfil, u.UsuEst, u.idperfil, p.perfil as nombre_perfil
            FROM usuarios u
            LEFT JOIN perfiles p ON u.idperfil = p.idperfil
            WHERE u.UsuEst = 'ACT'
            ORDER BY u.UsuNom ASC
        `);
        
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('❌ Error obteniendo usuarios:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo usuarios'
        });
    }
});

// Endpoint para verificar permisos de un usuario
app.get('/api/usuario/:usuCod/permisos', async (req, res) => {
    try {
        const { usuCod } = req.params;
        
        // Obtener permisos por perfil
        const [perfilMenus] = await pool.execute(`
            SELECT DISTINCT m.idmenu, m.menu, 'perfil' as tipo_permiso
            FROM menus m
            INNER JOIN perfil_menus pm ON m.idmenu = pm.idmenu
            INNER JOIN usuarios u ON pm.idperfil = u.idperfil
            WHERE u.UsuCod = ? AND m.estado = 1
        `, [usuCod]);
        
        // Obtener permisos directos
        const [permisosDirectos] = await pool.execute(`
            SELECT DISTINCT m.idmenu, m.menu, 'directo' as tipo_permiso
            FROM menus m
            INNER JOIN ___________________________permisos p ON m.idmenu = p.idmenu
            WHERE p.UsuCod = ? AND m.estado = 1
        `, [usuCod]);
        
        const todosPermisos = [...perfilMenus, ...permisosDirectos];
        
        res.json({
            success: true,
            data: {
                permisos_perfil: perfilMenus,
                permisos_directos: permisosDirectos,
                total_permisos: todosPermisos
            }
        });
    } catch (error) {
        console.error('❌ Error obteniendo permisos:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo permisos del usuario'
        });
    }
});

// Endpoint para debugging - ver datos reales de menús
app.get('/api/debug/menus', async (req, res) => {
    try {
        console.log('🔍 DEBUG: Consultando datos reales de menús...');
        
        // Consulta básica para ver todos los menús
        const [allMenus] = await pool.execute(`
            SELECT * FROM menus 
            ORDER BY idmenu ASC 
            LIMIT 10
        `);
        
        console.log('📊 Menús encontrados:', allMenus.length);
        
        // Ver estructura de cada menú
        allMenus.forEach((menu, index) => {
            console.log(`📋 Menú ${index + 1}:`, {
                idmenu: menu.idmenu,
                menu: menu.menu,
                vista: menu.vista,
                icono: menu.icono,
                url: menu.url,
                estado: menu.estado,
                parent: menu.parent
            });
        });
        
        res.json({
            success: true,
            total: allMenus.length,
            data: allMenus
        });
        
    } catch (error) {
        console.error('❌ Error en debug:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo datos de debug'
        });
    }
});

// Endpoint para debugging - ver datos de un usuario específico  
app.get('/api/debug/usuario/:usuCod', async (req, res) => {
    try {
        const { usuCod } = req.params;
        console.log(`🔍 DEBUG: Consultando datos del usuario: ${usuCod}`);
        
        // Datos del usuario
        const [userData] = await pool.execute(`
            SELECT u.*, p.perfil as nombre_perfil
            FROM usuarios u
            LEFT JOIN perfiles p ON u.idperfil = p.idperfil
            WHERE u.UsuCod = ?
        `, [usuCod]);
        
        // Menús por perfil
        let menusPerfil = [];
        if (userData.length > 0 && userData[0].idperfil) {
            const [menusData] = await pool.execute(`
                SELECT m.*, pm.id as permiso_id
                FROM menus m
                INNER JOIN perfil_menus pm ON m.idmenu = pm.idmenu
                WHERE pm.idperfil = ?
                ORDER BY m.idmenu ASC
            `, [userData[0].idperfil]);
            menusPerfil = menusData;
        }
        
        // Permisos directos
        const [permisosDirectos] = await pool.execute(`
            SELECT m.*, p.id as permiso_id
            FROM menus m
            INNER JOIN ___________________________permisos p ON m.idmenu = p.idmenu
            WHERE p.UsuCod = ?
            ORDER BY m.idmenu ASC
        `, [usuCod]);
        
        console.log(`👤 Usuario encontrado:`, userData[0]?.UsuNom || 'No encontrado');
        console.log(`🏢 Perfil:`, userData[0]?.nombre_perfil || 'Sin perfil');
        console.log(`📋 Menús por perfil:`, menusPerfil.length);
        console.log(`🔑 Permisos directos:`, permisosDirectos.length);
        
        res.json({
            success: true,
            usuario: userData[0] || null,
            menus_perfil: menusPerfil,
            permisos_directos: permisosDirectos
        });
        
    } catch (error) {
        console.error('❌ Error en debug usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo datos del usuario'
        });
    }
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📊 Alese Analytics está listo!`);
});
