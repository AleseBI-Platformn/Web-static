<?php
/**
 * API Test para ALESE CORP - Bluehost Compatible
 * Prueba de conexión con base de datos
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Configuración de la base de datos ALESE CORP
$DB_CONFIG = [
    'host' => '50.31.188.163',
    'user' => 'xqkefqsh_user_ventas',
    'password' => 'BiAleseCorp2023',
    'database' => 'xqkefqsh_alesecorp_ventas',
    'port' => 3306
];

try {
    // Conectar a base de datos
    $dsn = "mysql:host={$DB_CONFIG['host']};port={$DB_CONFIG['port']};dbname={$DB_CONFIG['database']};charset=utf8mb4";
    $pdo = new PDO($dsn, $DB_CONFIG['user'], $DB_CONFIG['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    
    // Realizar una consulta simple
    $stmt = $pdo->prepare("SELECT 1 as test, NOW() as timestamp");
    $stmt->execute();
    $result = $stmt->fetch();
    
    echo json_encode([
        'success' => true,
        'message' => 'Conexión exitosa a base de datos ALESE CORP',
        'database' => $DB_CONFIG['database'],
        'host' => $DB_CONFIG['host'],
        'timestamp' => $result['timestamp'],
        'environment' => 'PHP Production'
    ]);
    
} catch (PDOException $e) {
    error_log("❌ Error de base de datos: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error de conexión: ' . $e->getMessage(),
        'environment' => 'PHP Production'
    ]);
} catch (Exception $e) {
    error_log("❌ Error general: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error interno: ' . $e->getMessage(),
        'environment' => 'PHP Production'
    ]);
}
?>
