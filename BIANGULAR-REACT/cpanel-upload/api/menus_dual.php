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
    
    // PASO 1: Obtener menús directos con permisos (SÍ filtrar estado en menús principales)
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
    ");
    
    $stmt->execute($permissions);
    $menusDirectos = $stmt->fetchAll();
    
    debugLog("Menús directos obtenidos", [
        'count' => count($menusDirectos),
        'menus' => array_map(function($m) { 
            return ['id' => $m['idmenu'], 'name' => $m['menu'], 'parent' => $m['parent']]; 
        }, $menusDirectos)
    ]);
    
    // PASO 2: Obtener TODOS los menús padre necesarios (recursivamente)
    $allMenuIds = array_column($menusDirectos, 'idmenu');
    $parentIds = [];
    
    foreach ($menusDirectos as $menu) {
        if ($menu['parent'] !== null && $menu['parent'] !== '0' && $menu['parent'] !== 0) {
            $parentIds[] = (int)$menu['parent'];
        }
    }
    
    // Obtener menús padre recursivamente
    $menusCompletos = $menusDirectos;
    $iteracion = 0;
    $maxIteraciones = 5; // Evitar bucles infinitos
    
    while (!empty($parentIds) && $iteracion < $maxIteraciones) {
        $iteracion++;
        $parentIds = array_unique($parentIds);
        $parentIds = array_diff($parentIds, $allMenuIds); // Solo padres que no tenemos ya
        
        if (empty($parentIds)) break;
        
        debugLog("Iteración $iteracion - Buscando padres", ['parent_ids' => $parentIds]);
        
        $parentPlaceholders = str_repeat('?,', count($parentIds) - 1) . '?';
        $parentStmt = $pdo->prepare("
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
            WHERE m.idmenu IN ($parentPlaceholders)
            AND m.estado = '1'
        ");
        
        $parentStmt->execute($parentIds);
        $menusPadre = $parentStmt->fetchAll();
        
        if (empty($menusPadre)) break;
        
        // Agregar padres encontrados
        $menusCompletos = array_merge($menusCompletos, $menusPadre);
        $allMenuIds = array_merge($allMenuIds, array_column($menusPadre, 'idmenu'));
        
        // Buscar abuelos si es necesario
        $parentIds = [];
        foreach ($menusPadre as $menu) {
            if ($menu['parent'] !== null && $menu['parent'] !== '0' && $menu['parent'] !== 0) {
                $parentIds[] = (int)$menu['parent'];
            }
        }
    }
    
    // Eliminar duplicados por idmenu
    $uniqueMenus = [];
    foreach ($menusCompletos as $menu) {
        $uniqueMenus[$menu['idmenu']] = $menu;
    }
    $menusData = array_values($uniqueMenus);
    
    // Ordenar menús: primero padres (parent=null o 0), luego hijos
    usort($menusData, function($a, $b) {
        // Si ambos son padres o ambos son hijos, ordenar por idmenu
        if (($a['parent'] === null || $a['parent'] === '0') && ($b['parent'] === null || $b['parent'] === '0')) {
            return $a['idmenu'] - $b['idmenu'];
        }
        if (($a['parent'] !== null && $a['parent'] !== '0') && ($b['parent'] !== null && $b['parent'] !== '0')) {
            return $a['idmenu'] - $b['idmenu'];
        }
        // Padres primero
        if ($a['parent'] === null || $a['parent'] === '0') return -1;
        if ($b['parent'] === null || $b['parent'] === '0') return 1;
        return 0;
    });
    
    debugLog("Menús después de obtener padres", [
        'total_menus' => count($menusData),
        'menu_ids' => array_column($menusData, 'idmenu'),
        'padres' => array_filter($menusData, function($m) { return $m['parent'] === null || $m['parent'] === '0'; }),
        'hijos' => array_filter($menusData, function($m) { return $m['parent'] !== null && $m['parent'] !== '0'; })
    ]);
    
    // Organizar menús en estructura jerárquica
    $menus = [];
    $menusByParent = [];
    $menuIndex = [];
    
    // Indexar todos los menús por ID
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
        
        $menuIndex[$menuItem['idmenu']] = $menuItem;
    }
    
    // Separar menús padre de hijos
    foreach ($menuIndex as $menuItem) {
        if ($menuItem['parent'] === null || $menuItem['parent'] === 0) {
            // Es un menú padre
            $menus[] = $menuItem;
        } else {
            // Es un menú hijo - agregarlo al array de hijos de su padre
            if (!isset($menusByParent[$menuItem['parent']])) {
                $menusByParent[$menuItem['parent']] = [];
            }
            $menusByParent[$menuItem['parent']][] = $menuItem;
        }
    }
    
    // Asignar children a los menús padre
    foreach ($menus as &$menu) {
        if (isset($menusByParent[$menu['idmenu']])) {
            $menu['children'] = $menusByParent[$menu['idmenu']];
            
            // Ordenar children por idmenu
            usort($menu['children'], function($a, $b) {
                return $a['idmenu'] - $b['idmenu'];
            });
        }
    }
    
    // Ordenar menús padre por idmenu
    usort($menus, function($a, $b) {
        return $a['idmenu'] - $b['idmenu'];
    });
    
    debugLog("Menús estructurados finales", [
        'total_raw' => count($menusData),
        'total_structured' => count($menus),
        'menus_padre' => array_map(function($m) { 
            return [
                'id' => $m['idmenu'], 
                'name' => $m['menu'], 
                'children_count' => count($m['children'])
            ]; 
        }, $menus),
        'detalle_completo' => $menus
    ]);
    
    sendResponse(true, 'Menús obtenidos exitosamente', [
        'menus' => $menus,
        'total' => count($menusData),
        'structured_count' => count($menus)
    ]);
    
} catch (Exception $e) {
    debugLog("Error obteniendo menús", ['error' => $e->getMessage()]);
    sendResponse(false, 'Error interno del servidor', [
        'debug' => ENVIRONMENT === 'local' ? $e->getMessage() : null
    ], 500);
}
?>
