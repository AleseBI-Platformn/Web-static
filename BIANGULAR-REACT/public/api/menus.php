<?php
/**
 * API Menús para ALESE CORP - Bluehost Compatible
 * Conexión directa con base de datos
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Solo permitir POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Solo se permiten solicitudes POST']);
    exit;
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
    // Obtener datos del POST
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['permissions']) || !is_array($input['permissions'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Permisos requeridos como array']);
        exit;
    }
    
    $permissions = $input['permissions'];
    
    if (empty($permissions)) {
        echo json_encode(['success' => true, 'menus' => [], 'total' => 0]);
        exit;
    }
    
    // Conectar a base de datos
    $dsn = "mysql:host={$DB_CONFIG['host']};port={$DB_CONFIG['port']};dbname={$DB_CONFIG['database']};charset=utf8mb4";
    $pdo = new PDO($dsn, $DB_CONFIG['user'], $DB_CONFIG['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    
    // Crear placeholders para la consulta IN
    $placeholders = str_repeat('?,', count($permissions) - 1) . '?';
    
    // Obtener menús
    $stmt = $pdo->prepare("
        SELECT 
            idmenu, menu, vista, icono, estado, url, ancho, alto, parent
        FROM menus 
        WHERE idmenu IN ($placeholders) AND estado = '1'
        ORDER BY parent ASC, idmenu ASC
    ");
    
    $stmt->execute($permissions);
    $menus = $stmt->fetchAll();
    
    // Organizar en estructura jerárquica
    $menuMap = [];
    $menuTree = [];
    
    // Crear mapa de menús
    foreach ($menus as $menu) {
        $menu['idmenu'] = (int)$menu['idmenu'];
        $menu['parent'] = $menu['parent'] ? (int)$menu['parent'] : null;
        $menuMap[$menu['idmenu']] = $menu;
        $menuMap[$menu['idmenu']]['children'] = [];
    }
    
    // Organizar en estructura padre-hijo
    foreach ($menus as $menu) {
        $menuId = (int)$menu['idmenu'];
        $parentId = $menu['parent'] ? (int)$menu['parent'] : null;
        
        if ($parentId === null || $parentId === 0) {
            $menuTree[] = &$menuMap[$menuId];
        } else {
            if (isset($menuMap[$parentId])) {
                $menuMap[$parentId]['children'][] = &$menuMap[$menuId];
            }
        }
    }
    
    error_log("✅ Menús obtenidos: " . count($menus) . " items para permisos: " . implode(',', $permissions));
    
    echo json_encode([
        'success' => true,
        'menus' => $menuTree,
        'total' => count($menus)
    ]);
    
} catch (PDOException $e) {
    error_log("❌ Error de base de datos: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error de conexión a la base de datos']);
} catch (Exception $e) {
    error_log("❌ Error general: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error interno del servidor']);
}
?>
