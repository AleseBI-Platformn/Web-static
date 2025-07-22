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
// Get menus from database
app.get('/api/menus', async (req, res) => {
    try {
        console.log('📋 Solicitando menús de la base de datos...');
        
        // Primero verificamos qué columnas existen en la tabla
        const [columns] = await pool.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'menus'
        `, [process.env.DB_NAME]);
        
        const columnNames = columns.map(col => col.COLUMN_NAME);
        console.log('📊 Columnas disponibles en la tabla menus:', columnNames);
        
        // Construir la consulta basada en las columnas disponibles
        let selectFields = 'idmenu, menu, url';
        let orderBy = 'menu ASC';
        
        if (columnNames.includes('icono')) selectFields += ', icono';
        if (columnNames.includes('parent')) selectFields += ', parent';
        if (columnNames.includes('estado')) selectFields += ', estado';
        if (columnNames.includes('vista')) selectFields += ', vista';
        if (columnNames.includes('ancho')) selectFields += ', ancho';
        if (columnNames.includes('alto')) selectFields += ', alto';
        
        // Si existe la columna orden, la incluimos y ordenamos por ella
        if (columnNames.includes('orden')) {
            selectFields += ', orden';
            orderBy = 'orden ASC, menu ASC';
        }
        
        // Construir las condiciones WHERE
        let whereConditions = '1=1'; // Siempre verdadero como base
        if (columnNames.includes('estado')) {
            whereConditions += ' AND estado = 1';
        }
        if (columnNames.includes('parent')) {
            whereConditions += ' AND parent = 0';
        }
        
        const finalQuery = `
            SELECT ${selectFields}
            FROM menus 
            WHERE ${whereConditions}
            ORDER BY ${orderBy}
        `;
        
        console.log('📝 Consulta SQL generada:', finalQuery);
        
        const [rows] = await pool.execute(finalQuery);
        
        // Si no hay datos reales, enviamos datos de ejemplo
        if (rows.length === 0) {
            console.log('⚠️ No hay menús en la base de datos. Enviando datos de ejemplo...');
            
            const sampleMenus = [
                {
                    idmenu: 1,
                    menu: 'VENTAS',
                    url: 'ventas',
                    icono: 'chart-line',
                    parent: 0,
                    estado: 1,
                    vista: 'https://app.powerbi.com/view?r=demo-ventas',
                    ancho: '100%',
                    alto: '100%',
                    orden: 1
                },
                {
                    idmenu: 2,
                    menu: 'DIGITAL',
                    url: 'digital',
                    icono: 'mobile-alt',
                    parent: 0,
                    estado: 1,
                    vista: 'https://app.powerbi.com/view?r=demo-digital',
                    ancho: '100%',
                    alto: '100%',
                    orden: 2
                },
                {
                    idmenu: 3,
                    menu: 'RETOMAS',
                    url: 'retomas',
                    icono: 'exchange-alt',
                    parent: 0,
                    estado: 1,
                    vista: 'https://app.powerbi.com/view?r=demo-retomas',
                    ancho: '100%',
                    alto: '100%',
                    orden: 3
                },
                {
                    idmenu: 4,
                    menu: 'ADMINISTRACION',
                    url: 'administracion',
                    icono: 'cogs',
                    parent: 0,
                    estado: 1,
                    vista: 'https://app.powerbi.com/view?r=demo-admin',
                    ancho: '100%',
                    alto: '100%',
                    orden: 4
                },
                {
                    idmenu: 5,
                    menu: 'POSTVENTA',
                    url: 'postventa',
                    icono: 'tools',
                    parent: 0,
                    estado: 1,
                    vista: 'https://app.powerbi.com/view?r=demo-postventa',
                    ancho: '100%',
                    alto: '100%',
                    orden: 5
                },
                {
                    idmenu: 6,
                    menu: 'F&I',
                    url: 'finanzas',
                    icono: 'calculator',
                    parent: 0,
                    estado: 1,
                    vista: 'https://app.powerbi.com/view?r=demo-finanzas',
                    ancho: '100%',
                    alto: '100%',
                    orden: 6
                },
                {
                    idmenu: 7,
                    menu: 'KPI',
                    url: 'kpi',
                    icono: 'tachometer-alt',
                    parent: 0,
                    estado: 1,
                    vista: 'https://app.powerbi.com/view?r=demo-kpi',
                    ancho: '100%',
                    alto: '100%',
                    orden: 7
                }
            ];
            
            console.log('📋 Enviando menús de ejemplo:', sampleMenus.map(m => m.menu).join(', '));
            res.json(sampleMenus);
            return;
        }
        
        console.log(`✅ Menús obtenidos: ${rows.length} registros`);
        console.log('📊 Menús:', rows.map(m => m.menu).join(', '));
        
        res.json(rows);
        
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
                vista: '#',
                ancho: '100%',
                alto: '100%',
                orden: 1
            },
            {
                idmenu: 2,
                menu: 'REPORTES',
                url: 'reportes',
                icono: 'file-alt',
                parent: 0,
                estado: 1,
                vista: '#',
                ancho: '100%',
                alto: '100%',
                orden: 2
            },
            {
                idmenu: 3,
                menu: 'ANALYTICS',
                url: 'analytics',
                icono: 'chart-bar',
                parent: 0,
                estado: 1,
                vista: '#',
                ancho: '100%',
                alto: '100%',
                orden: 3
            }
        ];
        
        res.json(fallbackMenus);
    }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Usuario y contraseña son requeridos'
            });
        }

        // Por ahora simulamos la autenticación
        // En el futuro puedes agregar validación contra la BD
        if (username && password) {
            const user = {
                id: 1,
                username: username,
                token: Buffer.from(`${username}:${Date.now()}`).toString('base64'),
                loginTime: new Date().toISOString()
            };

            res.json({
                success: true,
                user: user,
                message: 'Login exitoso'
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
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
