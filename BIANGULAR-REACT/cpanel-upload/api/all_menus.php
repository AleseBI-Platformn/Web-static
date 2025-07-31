<?php
/**
 * API: Obtener todos los menús principales con submenús basado en perfil de usuario
 * USA PERFIL_MENUS (NO permisos individuales) - Sistema correcto
 */

require_once 'config_dual.php';

try {
    // Obtener usuario del parámetro
    $usuario = $_GET['usuario'] ?? $_POST['usuario'] ?? $_REQUEST['usuario'] ?? null;
    
    if (!$usuario) {
        sendResponse(false, 'Usuario requerido', [], 400);
        exit;
    }
    
    debugLog("Obteniendo menús para usuario con permisos por perfil", ['usuario' => $usuario]);
    
    // Conexión a la base de datos
    $pdo = getDbConnection();
    
    // PASO 1: Obtener idperfil del usuario
    $userStmt = $pdo->prepare("SELECT idperfil FROM usuarios WHERE UsuCod = ?");
    $userStmt->execute([$usuario]);
    $userData = $userStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$userData) {
        sendResponse(false, 'Usuario no encontrado', [], 404);
        exit;
    }
    
    $idperfil = $userData['idperfil'];
    debugLog("Perfil del usuario", ['usuario' => $usuario, 'idperfil' => $idperfil]);
    
    // PASO 2: LÓGICA CORRECTA usando perfil_menus (NO permisos individuales)
    // Obtener menús principales usando perfil_menus basado en el perfil del usuario
    $stmt = $pdo->prepare("
        SELECT DISTINCT
            m.idmenu,
            m.menu,
            m.vista,
            m.icono,
            m.estado,
            m.url,
            m.ancho,
            m.alto,
            m.parent
        FROM menus m 
        INNER JOIN perfil_menus pm ON m.idmenu = pm.idmenu
        WHERE m.estado = '1' 
        AND pm.idperfil = ?
        AND (m.parent = 0 OR m.parent IS NULL)
        ORDER BY m.idmenu ASC
    ");
    
    $stmt->execute([$idperfil]);
    $menusData = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    debugLog("Menús principales obtenidos con perfil_menus", [
        'count' => count($menusData),
        'usuario' => $usuario,
        'idperfil' => $idperfil,
        'menus' => array_map(function($m) { 
            return ['id' => $m['idmenu'], 'name' => $m['menu']]; 
        }, $menusData)
    ]);
    
    // PASO 3: LÓGICA EXACTA DE BIALESECORP: Enriquecer con submenús
    $menus = [];
    foreach ($menusData as $menu) {
        // Convertir menú padre
        $menuItem = [
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
        
        // OBTENER SUBMENÚS con filtro de estado (igual que BiAleseCorp original)
        $subStmt = $pdo->prepare("
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
            WHERE parent = ? AND estado = '1'
            ORDER BY idmenu ASC
        ");
        
        $subStmt->execute([$menuItem['idmenu']]);
        $submenus = $subStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Convertir submenús
        foreach ($submenus as $submenu) {
            $menuItem['children'][] = [
                'idmenu' => (int)$submenu['idmenu'],
                'menu' => $submenu['menu'],
                'vista' => $submenu['vista'],
                'icono' => $submenu['icono'],
                'estado' => $submenu['estado'],
                'url' => $submenu['url'],
                'ancho' => $submenu['ancho'],
                'alto' => $submenu['alto'],
                'parent' => $submenu['parent'] ? (int)$submenu['parent'] : null,
                'children' => []
            ];
        }
        
        $menus[] = $menuItem;
    }
    
    $totalChildren = array_sum(array_map(function($m) { return count($m['children']); }, $menus));
    
    debugLog("Menús con submenús completados con perfil_menus", [
        'total_menus' => count($menus),
        'total_children' => $totalChildren,
        'usuario' => $usuario,
        'idperfil' => $idperfil,
        'detalle' => array_map(function($m) { 
            return [
                'id' => $m['idmenu'], 
                'name' => $m['menu'], 
                'children_count' => count($m['children'])
            ]; 
        }, $menus)
    ]);
    
    sendResponse(true, 'Menús obtenidos exitosamente', [
        'menus' => $menus,
        'total' => count($menus),
        'total_with_children' => $totalChildren,
        'usuario' => $usuario,
        'perfil' => $idperfil
    ]);
    
} catch (Exception $e) {
    debugLog("Error obteniendo menús con permisos", ['error' => $e->getMessage()]);
    sendResponse(false, 'Error interno del servidor', [
        'debug' => ENVIRONMENT === 'local' ? $e->getMessage() : null
    ], 500);
}
?>
