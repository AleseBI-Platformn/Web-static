<?php
/**
 * 🔍 DEBUG: Análisis de Submenús VENTAS
 * Comparación entre BiAleseCorp original y nuestra implementación
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Configuración de base de datos
require_once 'config_dual.php';

try {
    $pdo = new PDO($dsn, $username, $password, $options);
    
    echo json_encode([
        'success' => true,
        'timestamp' => date('Y-m-d H:i:s'),
        'analysis' => [
            'title' => '🔍 ANÁLISIS COMPLETO: Submenús de VENTAS (parent=3)',
            'original_bialese' => 'SELECT * FROM menus WHERE parent = 3',
            'current_implementation' => 'SELECT * FROM menus WHERE parent = 3 AND estado = \'1\'',
            'data' => [
                'all_submenus' => getAllSubmenuAnalysis($pdo),
                'active_submenus' => getActiveSubmenuAnalysis($pdo),
                'inactive_submenus' => getInactiveSubmenuAnalysis($pdo),
                'jpoma_permissions' => getJpomaPermissions($pdo),
                'summary' => getSummary($pdo)
            ]
        ]
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Error: ' . $e->getMessage()
    ]);
}

function getAllSubmenuAnalysis($pdo) {
    $stmt = $pdo->prepare("
        SELECT idmenu, menu, estado, vista IS NOT NULL as has_powerbi
        FROM menus 
        WHERE parent = 3 
        ORDER BY idmenu
    ");
    $stmt->execute();
    $submenus = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    return [
        'count' => count($submenus),
        'description' => 'TODOS los submenús de VENTAS en la base de datos',
        'menus' => $submenus
    ];
}

function getActiveSubmenuAnalysis($pdo) {
    $stmt = $pdo->prepare("
        SELECT idmenu, menu, estado, vista IS NOT NULL as has_powerbi
        FROM menus 
        WHERE parent = 3 AND estado = '1'
        ORDER BY idmenu
    ");
    $stmt->execute();
    $submenus = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    return [
        'count' => count($submenus),
        'description' => 'Submenús ACTIVOS (estado=1) - Como BiAleseCorp original',
        'menus' => $submenus,
        'ids' => array_column($submenus, 'idmenu')
    ];
}

function getInactiveSubmenuAnalysis($pdo) {
    $stmt = $pdo->prepare("
        SELECT idmenu, menu, estado, vista IS NOT NULL as has_powerbi
        FROM menus 
        WHERE parent = 3 AND estado = '0'
        ORDER BY idmenu
    ");
    $stmt->execute();
    $submenus = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    return [
        'count' => count($submenus),
        'description' => 'Submenús INACTIVOS (estado=0) - No se muestran en BiAleseCorp',
        'menus' => $submenus,
        'ids' => array_column($submenus, 'idmenu')
    ];
}

function getJpomaPermissions($pdo) {
    // jpoma tiene perfil 40
    $stmt = $pdo->prepare("
        SELECT pm.idmenu, m.menu, m.estado
        FROM perfil_menus pm
        INNER JOIN menus m ON pm.idmenu = m.idmenu
        WHERE pm.idperfil = 40 AND m.parent = 3
        ORDER BY pm.idmenu
    ");
    $stmt->execute();
    $permissions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    return [
        'count' => count($permissions),
        'description' => 'Permisos específicos de jpoma (perfil 40) para submenús de VENTAS',
        'note' => 'BiAleseCorp original NO usa estos permisos para submenús',
        'permissions' => $permissions,
        'active_count' => count(array_filter($permissions, function($p) { return $p['estado'] == '1'; })),
        'inactive_count' => count(array_filter($permissions, function($p) { return $p['estado'] == '0'; }))
    ];
}

function getSummary($pdo) {
    $all = $pdo->query("SELECT COUNT(*) as count FROM menus WHERE parent = 3")->fetch()['count'];
    $active = $pdo->query("SELECT COUNT(*) as count FROM menus WHERE parent = 3 AND estado = '1'")->fetch()['count'];
    $inactive = $pdo->query("SELECT COUNT(*) as count FROM menus WHERE parent = 3 AND estado = '0'")->fetch()['count'];
    
    return [
        'total_submenus' => (int)$all,
        'active_submenus' => (int)$active,
        'inactive_submenus' => (int)$inactive,
        'expected_jpoma_original' => 14,
        'expected_our_system' => (int)$active,
        'difference_analysis' => [
            'jpoma_sees' => 14,
            'we_should_see' => (int)$active,
            'difference' => abs(14 - (int)$active),
            'possible_causes' => [
                'Different database content',
                'Additional hidden filters in BiAleseCorp',
                'Different estado values in jpoma\'s database',
                'Version differences'
            ]
        ]
    ];
}
?>
