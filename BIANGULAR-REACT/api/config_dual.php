<?php
/**
 * Configuración PHP para ALESE CORP - Dual Environment
 * Detecta automáticamente Local vs Producción
 */

// Detectar entorno
function isLocalEnvironment() {
    $localIndicators = [
        $_SERVER['HTTP_HOST'] === 'localhost',
        isset($_SERVER['HTTP_HOST']) && str_contains($_SERVER['HTTP_HOST'], 'localhost'),
        isset($_SERVER['HTTP_HOST']) && str_contains($_SERVER['HTTP_HOST'], '127.0.0.1'),
        isset($_SERVER['SERVER_NAME']) && str_contains($_SERVER['SERVER_NAME'], 'localhost'),
        !isset($_SERVER['HTTPS'])
    ];
    
    return in_array(true, $localIndicators);
}

// Configuración basada en entorno
if (isLocalEnvironment()) {
    // ===============================
    // CONFIGURACIÓN LOCAL (XAMPP/WAMP)
    // ===============================
    define('DB_HOST', '50.31.188.163');
    define('DB_NAME', 'xqkefqsh_alesecorp_ventas');
    define('DB_USER', 'xqkefqsh_user_ventas');
    define('DB_PASS', 'BiAleseCorp2023');
    define('DB_CHARSET', 'utf8mb4');
    define('ENVIRONMENT', 'local');
    
    // Headers para desarrollo local
    header('Access-Control-Allow-Origin: http://localhost:5173');
    header('Access-Control-Allow-Credentials: true');
    
} else {
    // ===============================
    // CONFIGURACIÓN PRODUCCIÓN (BLUEHOST)
    // ===============================
    define('DB_HOST', '50.31.188.163');
    define('DB_NAME', 'xqkefqsh_alesecorp_ventas');
    define('DB_USER', 'xqkefqsh_user_ventas');
    define('DB_PASS', 'BiAleseCorp2023');
    define('DB_CHARSET', 'utf8mb4');
    define('ENVIRONMENT', 'production');
    
    // Headers para producción
    header('Access-Control-Allow-Origin: https://tu-dominio.com');
    header('Access-Control-Allow-Credentials: true');
}

// Headers comunes
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

// Manejar OPTIONS para CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

/**
 * Conexión a la base de datos usando diferentes métodos
 */
function getDbConnection() {
    try {
        // Intentar con mysqli primero
        if (extension_loaded('mysqli')) {
            $mysqli = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
            
            if ($mysqli->connect_error) {
                throw new Exception('Error de conexión mysqli: ' . $mysqli->connect_error);
            }
            
            if (!$mysqli->set_charset(DB_CHARSET)) {
                throw new Exception('Error al establecer charset: ' . $mysqli->error);
            }
            
            return $mysqli;
        }
        
        // Intentar con mysql_connect (deprecated pero puede funcionar)
        if (function_exists('mysql_connect')) {
            $connection = mysql_connect(DB_HOST, DB_USER, DB_PASS);
            if (!$connection) {
                throw new Exception('Error de conexión mysql: ' . mysql_error());
            }
            
            if (!mysql_select_db(DB_NAME, $connection)) {
                throw new Exception('Error al seleccionar BD: ' . mysql_error());
            }
            
            mysql_query("SET NAMES " . DB_CHARSET, $connection);
            return $connection;
        }
        
        // Si no hay drivers de MySQL, usar base de datos JSON temporal
        return 'json_db';
        
    } catch (Exception $e) {
        error_log("Error de conexión DB: " . $e->getMessage());
        
        // Si no se puede conectar a MySQL, usar JSON
        return 'json_db';
    }
}

/**
 * Función para consultar base de datos JSON temporal
 */
function queryJsonDb($query, $params = []) {
    // Datos de prueba para desarrollo
    $testUsers = [
        'jpoma' => [
            'UsuCod' => 'jpoma',
            'UsuNom' => 'Juan',
            'UsuApePat' => 'Poma',
            'UsuApeMat' => 'Alese',
            'UsuEmail' => 'jpoma@alese.com',
            'UsuClave' => 'jpoma2023', // Contraseña en texto plano para pruebas
            'UsuPerfil' => 'Administrador',
            'UsuEst' => 'act',
            'idperfil' => 1,
            'fullName' => 'Juan Poma Alese'
        ]
    ];
    
    $testPermissions = [
        1 => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] // Todos los permisos para admin
    ];
    
    // Simular consulta de usuario
    if (strpos($query, 'SELECT') !== false && strpos($query, 'usuarios') !== false) {
        $username = $params[0] ?? '';
        return isset($testUsers[$username]) ? $testUsers[$username] : null;
    }
    
    // Simular consulta de permisos
    if (strpos($query, 'SELECT') !== false && strpos($query, 'perfil_menus') !== false) {
        $idperfil = $params[0] ?? 0;
        return isset($testPermissions[$idperfil]) ? $testPermissions[$idperfil] : [];
    }
    
    return null;
}

/**
 * Función de respuesta estándar
 */
function sendResponse($success, $message, $data = null, $httpCode = 200) {
    http_response_code($httpCode);
    
    $response = [
        'success' => $success,
        'message' => $message,
        'environment' => ENVIRONMENT,
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    if ($data !== null) {
        if (is_array($data)) {
            $response = array_merge($response, $data);
        } else {
            $response['data'] = $data;
        }
    }
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit();
}

/**
 * Log de depuración
 */
function debugLog($message, $data = null) {
    if (ENVIRONMENT === 'local') {
        $logMessage = "[" . date('Y-m-d H:i:s') . "] " . $message;
        if ($data) {
            $logMessage .= " | Data: " . json_encode($data);
        }
        error_log($logMessage);
    }
}

// Log de inicio
debugLog("Config cargada", [
    'environment' => ENVIRONMENT,
    'host' => $_SERVER['HTTP_HOST'] ?? 'unknown',
    'method' => $_SERVER['REQUEST_METHOD'] ?? 'unknown'
]);

?>
