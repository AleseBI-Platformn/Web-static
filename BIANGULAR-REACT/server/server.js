const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configuración de la base de datos ALESE CORP
const DB_CONFIG = {
  host: '50.31.188.163',
  user: 'xqkefqsh_user_ventas',
  password: 'BiAleseCorp2023',
  database: 'xqkefqsh_alesecorp_ventas',
  port: 3306,
  ssl: false,
  timeout: 10000
};

// Crear conexión a la base de datos
async function createConnection() {
  try {
    const connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Conectado a MySQL ALESE CORP');
    return connection;
  } catch (error) {
    console.error('❌ Error conectando a MySQL:', error.message);
    throw error;
  }
}

// Ruta para autenticar usuario
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Usuario y contraseña requeridos'
      });
    }

    console.log('🔐 Intentando autenticar:', username);
    
    const connection = await createConnection();
    
    // Consulta para autenticar usuario
    const [userRows] = await connection.execute(`
      SELECT 
        UsuCod, UsuNom, UsuApePat, UsuApeMat, UsuEmail, 
        UsuPerfil, idperfil, UsuEst
      FROM usuarios 
      WHERE UsuCod = ? AND UsuClave = ? AND UsuEst = 'act'
    `, [username, password]);

    if (userRows.length === 0) {
      await connection.end();
      return res.json({
        success: false,
        message: 'Credenciales incorrectas o usuario inactivo'
      });
    }

    const user = userRows[0];
    
    // Obtener permisos directos del usuario
    const [userPermissions] = await connection.execute(`
      SELECT DISTINCT idmenu 
      FROM ___________________________permisos 
      WHERE UsuCod = ?
    `, [username]);

    // Obtener permisos del perfil
    let profilePermissions = [];
    if (user.idperfil) {
      const [profilePerms] = await connection.execute(`
        SELECT DISTINCT idmenu 
        FROM perfil_menus 
        WHERE idperfil = ?
      `, [user.idperfil]);
      profilePermissions = profilePerms;
    }

    // Combinar permisos
    const allPermissions = [
      ...userPermissions.map(p => p.idmenu),
      ...profilePermissions.map(p => p.idmenu)
    ];
    const uniquePermissions = [...new Set(allPermissions)];

    await connection.end();

    const userData = {
      UsuCod: user.UsuCod,
      UsuNom: user.UsuNom,
      UsuApePat: user.UsuApePat,
      UsuApeMat: user.UsuApeMat,
      UsuEmail: user.UsuEmail,
      UsuPerfil: user.UsuPerfil,
      fullName: `${user.UsuNom} ${user.UsuApePat} ${user.UsuApeMat}`.trim()
    };

    console.log('✅ Usuario autenticado:', userData.fullName);
    console.log('📋 Permisos encontrados:', uniquePermissions.length);

    res.json({
      success: true,
      user: userData,
      permissions: uniquePermissions,
      token: Buffer.from(`${username}:${Date.now()}`).toString('base64')
    });

  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Ruta para obtener menús
app.post('/api/menus', async (req, res) => {
  try {
    const { permissions } = req.body;
    
    if (!permissions || !Array.isArray(permissions) || permissions.length === 0) {
      return res.json({
        success: true,
        menus: []
      });
    }

    console.log('📋 Obteniendo menús para permisos:', permissions);
    
    const connection = await createConnection();
    
    const placeholders = permissions.map(() => '?').join(',');
    
    const [menuRows] = await connection.execute(`
      SELECT 
        idmenu, menu, vista, icono, estado, url, ancho, alto, parent
      FROM menus 
      WHERE idmenu IN (${placeholders}) AND estado = '1'
      ORDER BY parent ASC, idmenu ASC
    `, permissions);

    await connection.end();

    // Organizar en estructura jerárquica
    const menuMap = {};
    const menuTree = [];
    
    // Crear mapa de menús
    menuRows.forEach(menu => {
      menuMap[menu.idmenu] = { ...menu, children: [] };
    });
    
    // Organizar en estructura padre-hijo
    menuRows.forEach(menu => {
      if (menu.parent === null || menu.parent === 0) {
        menuTree.push(menuMap[menu.idmenu]);
      } else {
        if (menuMap[menu.parent]) {
          menuMap[menu.parent].children.push(menuMap[menu.idmenu]);
        }
      }
    });

    console.log('✅ Menús obtenidos:', menuRows.length);

    res.json({
      success: true,
      menus: menuTree,
      total: menuRows.length
    });

  } catch (error) {
    console.error('❌ Error obteniendo menús:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener menús'
    });
  }
});

// Ruta de prueba de conexión
app.get('/api/test', async (req, res) => {
  try {
    const connection = await createConnection();
    await connection.execute('SELECT 1 as test');
    await connection.end();
    
    res.json({
      success: true,
      message: 'Conexión a MySQL exitosa',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log('🚀 Servidor API ALESE CORP ejecutándose en http://localhost:' + PORT);
  console.log('📊 Base de datos: MySQL remoto en 50.31.188.163');
  console.log('🔗 Endpoints disponibles:');
  console.log('   - POST /api/login');
  console.log('   - POST /api/menus');
  console.log('   - GET  /api/test');
});
