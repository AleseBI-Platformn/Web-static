<?php
/**
 * Menús para ALESE CORP - Dual Environment
 * Obtención de menús por permisos
 */

require_once 'config_dual.php';

try {
    // Obtener datos del POST
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['permissions']) || !is_array($input['permissions'])) {
        sendResponse(false, 'Permisos son requeridos', null, 400);
    }
    
    $permissions = $input['permissions'];
    
    if (empty($permissions)) {
        sendResponse(true, 'Sin permisos asignados', [
            'menus' => [],
            'total' => 0
        ]);
    }
    
    debugLog("Obteniendo menús", ['permissions' => $permissions]);
    
    // Conexión a la base de datos
    $pdo = getDbConnection();
    
    // Crear placeholders para la consulta IN
    $placeholders = str_repeat('?,', count($permissions) - 1) . '?';
    
    // Consulta para obtener menús
    $stmt = $pdo->prepare("
        SELECT 
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
        WHERE m.idmenu IN ($placeholders)
        AND m.estado = '1'
        ORDER BY m.parent ASC, m.idmenu ASC
    ");
    
    $stmt->execute($permissions);
    $menusData = $stmt->fetchAll();
    
    // Organizar menús en estructura jerárquica
    $menus = [];
    $menusByParent = [];
    
    // Agrupar por parent
    foreach ($menusData as $menu) {
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
        
        if ($menu['parent'] === null || $menu['parent'] === '0') {
            $menus[] = $menuItem;
        } else {
            if (!isset($menusByParent[(int)$menu['parent']])) {
                $menusByParent[(int)$menu['parent']] = [];
            }
            $menusByParent[(int)$menu['parent']][] = $menuItem;
        }
    }
    
    // Asignar children a padres
    foreach ($menus as &$menu) {
        if (isset($menusByParent[$menu['idmenu']])) {
            $menu['children'] = $menusByParent[$menu['idmenu']];
        }
    }
    
    debugLog("Menús obtenidos", [
        'total' => count($menusData),
        'structured' => count($menus)
    ]);
    
    sendResponse(true, 'Menús obtenidos exitosamente', [
        'menus' => $menus,
        'total' => count($menusData)
    ]);
    
} catch (Exception $e) {
    debugLog("Error obteniendo menús", ['error' => $e->getMessage()]);
    sendResponse(false, 'Error interno del servidor', [
        'debug' => ENVIRONMENT === 'local' ? $e->getMessage() : null
    ], 500);
}
?>
