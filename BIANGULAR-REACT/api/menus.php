<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendErrorResponse('Method not allowed', 405);
}

// Get user permissions from query parameter
$permissions = $_GET['permissions'] ?? '';
if (empty($permissions)) {
    sendErrorResponse('Permissions parameter is required');
}

$userPermissions = explode(',', $permissions);

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    // Get all menus that the user has permission to access
    $placeholders = str_repeat('?,', count($userPermissions) - 1) . '?';
    
    $stmt = $conn->prepare("
        SELECT m.idmenu, m.menu, m.vista, m.icono, m.estado, m.url, m.ancho, m.alto, m.parent
        FROM menus m 
        WHERE m.idmenu IN ($placeholders) AND m.estado = '1'
        ORDER BY m.parent ASC, m.idmenu ASC
    ");
    
    $stmt->execute($userPermissions);
    $menus = $stmt->fetchAll();
    
    // Organize menus in hierarchical structure
    $menuTree = [];
    $menuMap = [];
    
    // First, create a map of all menus
    foreach ($menus as $menu) {
        $menuMap[$menu['idmenu']] = $menu;
        $menuMap[$menu['idmenu']]['children'] = [];
    }
    
    // Then, organize them into parent-child relationships
    foreach ($menus as $menu) {
        if ($menu['parent'] === null || $menu['parent'] === 0) {
            // This is a root menu
            $menuTree[] = &$menuMap[$menu['idmenu']];
        } else {
            // This is a child menu
            if (isset($menuMap[$menu['parent']])) {
                $menuMap[$menu['parent']]['children'][] = &$menuMap[$menu['idmenu']];
            }
        }
    }
    
    sendJsonResponse([
        'success' => true,
        'menus' => $menuTree,
        'total' => count($menus)
    ]);
    
} catch (PDOException $e) {
    sendErrorResponse('Database error: ' . $e->getMessage(), 500);
} catch (Exception $e) {
    sendErrorResponse('Server error: ' . $e->getMessage(), 500);
}
?>
