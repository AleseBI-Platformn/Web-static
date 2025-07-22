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
    timeout: 60000
});

// Test database connection
pool.getConnection()
    .then(connection => {
        console.log('✅ Conectado a MySQL exitosamente');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Error conectando a MySQL:', err);
    });

// API Routes
// Get menus from database
app.get('/api/menus', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT idmenu, menu, url, icono, parent, estado, vista, ancho, alto, orden 
            FROM menus 
            WHERE estado = 1 AND parent = 0 
            ORDER BY orden ASC, menu ASC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error obteniendo menús:', error);
        res.status(500).json({ error: 'Error obteniendo menús de la base de datos' });
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
