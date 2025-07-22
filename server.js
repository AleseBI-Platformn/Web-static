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
        
        const [rows] = await pool.execute(`
            SELECT idmenu, menu, url, icono, parent, estado, vista, ancho, alto, orden 
            FROM menus 
            WHERE estado = 1 AND parent = 0 
            ORDER BY orden ASC, menu ASC
        `);
        
        console.log(`✅ Menús obtenidos: ${rows.length} registros`);
        console.log('📊 Menús:', rows.map(m => m.menu).join(', '));
        
        res.json(rows);
    } catch (error) {
        console.error('❌ Error obteniendo menús:', error);
        
        // Send detailed error for development
        res.status(500).json({ 
            error: 'Error obteniendo menús de la base de datos',
            details: error.message,
            code: error.code || 'UNKNOWN_ERROR'
        });
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
