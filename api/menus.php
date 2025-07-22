<?php
require_once 'config.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        sendErrorResponse('Method not allowed', 405);
    }

    // Get user permissions from token
    $headers = getallheaders();
    $authorization = $headers['Authorization'] ?? '';
    
    if (empty($authorization) || !str_starts_with($authorization, 'Bearer ')) {
        sendErrorResponse('Authorization token required', 401);
    }

    $token = substr($authorization, 7); // Remove 'Bearer ' prefix
    $tokenData = json_decode(base64_decode($token), true);

    if (!$tokenData || !isset($tokenData['user_id']) || $tokenData['expires'] < time()) {
        sendErrorResponse('Invalid or expired token', 401);
    }

    $userId = $tokenData['user_id'];

    // Connect to database
    $db = new Database();
    $pdo = $db->getConnection();

    // Get user info and permissions
    $stmt = $pdo->prepare("
        SELECT UsuCod, idperfil 
        FROM usuarios 
        WHERE UsuCod = ? AND UsuEst = '1'
    ");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    if (!$user) {
        sendErrorResponse('User not found', 404);
    }

    // Get user direct permissions
    $stmt = $pdo->prepare("
        SELECT DISTINCT idmenu 
        FROM ___________________________permisos 
        WHERE UsuCod = ?
    ");
    $stmt->execute([$user['UsuCod']]);
    $userPermissions = $stmt->fetchAll(PDO::FETCH_COLUMN);

    // Get profile permissions
    $profilePermissions = [];
    if (!empty($user['idperfil'])) {
        $stmt = $pdo->prepare("
            SELECT DISTINCT idmenu 
            FROM perfil_menus 
            WHERE idperfil = ?
        ");
        $stmt->execute([$user['idperfil']]);
        $profilePermissions = $stmt->fetchAll(PDO::FETCH_COLUMN);
    }

    // Merge all permissions
    $allPermissions = array_unique(array_merge($userPermissions, $profilePermissions));

    if (empty($allPermissions)) {
        sendJsonResponse([
            'success' => true,
            'menus' => []
        ]);
    }

    // Get menus based on permissions - REAL DATABASE QUERY
    $placeholders = str_repeat('?,', count($allPermissions) - 1) . '?';
    $stmt = $pdo->prepare("
        SELECT 
            idmenu,
            menu,
            vista,
            icono,
            estado,
            url,
            ancho,
            alto,
            parent
        FROM menus 
        WHERE idmenu IN ($placeholders) 
        AND estado = '1'
        ORDER BY parent ASC, menu ASC
    ");
    $stmt->execute($allPermissions);
    $menus = $stmt->fetchAll();

    // Build hierarchical menu structure
    $menuTree = [];
    $menuMap = [];

    // First pass: create menu map
    foreach ($menus as $menu) {
        $menuMap[$menu['idmenu']] = [
            'idmenu' => (int)$menu['idmenu'],
            'menu' => $menu['menu'],
            'vista' => $menu['vista'],
            'icono' => $menu['icono'],
            'estado' => $menu['estado'],
            'url' => $menu['url'],
            'ancho' => $menu['ancho'],
            'alto' => $menu['alto'],
            'parent' => $menu['parent'] ? (int)$menu['parent'] : null,
            'children' => []
        ];
    }

    // Second pass: build hierarchy
    foreach ($menuMap as $menu) {
        if ($menu['parent'] === null) {
            // Root menu
            $menuTree[] = $menu;
        } else {
            // Child menu - add to parent if parent exists
            if (isset($menuMap[$menu['parent']])) {
                $menuMap[$menu['parent']]['children'][] = $menu;
            }
        }
    }

    // Update parent references in tree
    function updateParentReferences(&$tree, $menuMap) {
        foreach ($tree as &$item) {
            if (isset($menuMap[$item['idmenu']])) {
                $item['children'] = $menuMap[$item['idmenu']]['children'];
                if (!empty($item['children'])) {
                    updateParentReferences($item['children'], $menuMap);
                }
            }
        }
    }

    updateParentReferences($menuTree, $menuMap);

    sendJsonResponse([
        'success' => true,
        'menus' => $menuTree,
        'total_permissions' => count($allPermissions),
        'user_permissions' => count($userPermissions),
        'profile_permissions' => count($profilePermissions)
    ]);

} catch (Exception $e) {
    error_log("Menus error: " . $e->getMessage());
    sendErrorResponse('Database error: ' . $e->getMessage(), 500);
}
?>
