<?php
/**
 * Test de conexión para ALESE CORP - Dual Environment
 * Verificar que todo funcione correctamente
 */

require_once 'config_dual.php';

try {
    // Conexión a la base de datos
    $pdo = getDbConnection();
    
    // Test básico de conexión
    $stmt = $pdo->query("SELECT 1 as test");
    $result = $stmt->fetch();
    
    // Test de tablas existentes
    $tables = [];
    $stmt = $pdo->query("SHOW TABLES");
    while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
        $tables[] = $row[0];
    }
    
    // Test de usuarios (contar)
    $userCount = 0;
    if (in_array('usuarios', $tables)) {
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM usuarios");
        $userCount = $stmt->fetch()['count'];
    }
    
    // Test de menús (contar)
    $menuCount = 0;
    if (in_array('menus', $tables)) {
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM menus");
        $menuCount = $stmt->fetch()['count'];
    }
    
    debugLog("Test de conexión exitoso", [
        'tables_found' => count($tables),
        'users' => $userCount,
        'menus' => $menuCount
    ]);
    
    sendResponse(true, 'Conexión exitosa y base de datos operativa', [
        'database' => [
            'connected' => true,
            'tables_count' => count($tables),
            'tables' => $tables,
            'users_count' => $userCount,
            'menus_count' => $menuCount
        ],
        'server' => [
            'php_version' => phpversion(),
            'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
            'document_root' => $_SERVER['DOCUMENT_ROOT'] ?? 'Unknown'
        ]
    ]);
    
} catch (Exception $e) {
    debugLog("Error en test de conexión", ['error' => $e->getMessage()]);
    sendResponse(false, 'Error de conexión', [
        'debug' => ENVIRONMENT === 'local' ? $e->getMessage() : null,
        'server_info' => [
            'php_version' => phpversion(),
            'server' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown'
        ]
    ], 500);
}
?>
