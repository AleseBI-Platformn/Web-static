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
 * Conexión a la base de datos
 */
function getDbConnection() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES " . DB_CHARSET
        ]);
        
        return $pdo;
    } catch (PDOException $e) {
        error_log("Error de conexión DB: " . $e->getMessage());
        
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error de conexión a la base de datos',
            'environment' => ENVIRONMENT,
            'error' => ENVIRONMENT === 'local' ? $e->getMessage() : 'Database connection failed'
        ]);
        exit();
    }
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
