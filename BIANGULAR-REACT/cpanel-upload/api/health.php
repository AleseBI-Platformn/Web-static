<?php
/**
 * API Health Check - ALESE CORP
 * Endpoint: GET /api/health
 * Replicando: Api::health() de BiAleseCorp
 */

require_once 'config_dual.php';

try {
    // Test de conexión a la base de datos
    $pdo = getDbConnection();
    
    // Verificar conexión ejecutando una consulta simple
    $stmt = $pdo->prepare("SELECT 1 as test, NOW() as timestamp");
    $stmt->execute();
    $dbTest = $stmt->fetch();
    
    // Información del sistema
    $systemInfo = [
        'php_version' => PHP_VERSION,
        'server_time' => date('Y-m-d H:i:s'),
        'environment' => ENVIRONMENT,
        'database' => [
            'host' => DB_HOST,
            'database' => DB_NAME,
            'connection_status' => 'OK',
            'test_query' => $dbTest['test'],
            'db_time' => $dbTest['timestamp']
        ],
        'api_endpoints' => [
            'login' => '/api/login_dual.php',
            'menus' => '/api/menus_dual.php',
            'all_menus' => '/api/all_menus.php',
            'menu_by_url' => '/api/menu_by_url.php',
            'submenus' => '/api/submenus.php',
            'health' => '/api/health.php'
        ]
    ];
    
    debugLog("Health check exitoso", $systemInfo);
    
    sendResponse(true, 'API funcionando correctamente', $systemInfo);
    
} catch (Exception $e) {
    debugLog("Health check falló", ['error' => $e->getMessage()]);
    
    $errorInfo = [
        'php_version' => PHP_VERSION,
        'server_time' => date('Y-m-d H:i:s'),
        'environment' => ENVIRONMENT,
        'database' => [
            'host' => DB_HOST ?? 'NOT_DEFINED',
            'database' => DB_NAME ?? 'NOT_DEFINED',
            'connection_status' => 'FAILED',
            'error' => ENVIRONMENT === 'local' ? $e->getMessage() : 'Database connection failed'
        ]
    ];
    
    sendResponse(false, 'API con problemas', $errorInfo, 500);
}
?>
