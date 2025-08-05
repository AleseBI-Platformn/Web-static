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
    $connection = getDbConnection();
    
    // Determinar tipo de conexión y ejecutar consulta
    if ($connection === 'json_db') {
        // Usar base de datos JSON temporal
        debugLog("USANDO BASE DE DATOS JSON TEMPORAL PARA MENÚS", ['permissions' => $permissions]);
        
        // Datos de prueba para menús
        $testMenus = [
            1 => ['idmenu' => 1, 'menu' => 'Dashboard', 'vista' => 'dashboard', 'icono' => 'home', 'estado' => '1', 'url' => '/dashboard', 'ancho' => 12, 'alto' => 6, 'parent' => null],
            2 => ['idmenu' => 2, 'menu' => 'Usuarios', 'vista' => 'usuarios', 'icono' => 'users', 'estado' => '1', 'url' => '/usuarios', 'ancho' => 12, 'alto' => 6, 'parent' => null],
            3 => ['idmenu' => 3, 'menu' => 'Configuración', 'vista' => 'config', 'icono' => 'settings', 'estado' => '1', 'url' => '/config', 'ancho' => 12, 'alto' => 6, 'parent' => null],
            4 => ['idmenu' => 4, 'menu' => 'Reportes', 'vista' => 'reportes', 'icono' => 'chart', 'estado' => '1', 'url' => '/reportes', 'ancho' => 12, 'alto' => 6, 'parent' => null],
            5 => ['idmenu' => 5, 'menu' => 'Administración', 'vista' => 'admin', 'icono' => 'admin', 'estado' => '1', 'url' => '/admin', 'ancho' => 12, 'alto' => 6, 'parent' => null]
        ];
        
        // Filtrar menús según permisos
        $menusData = [];
        foreach ($permissions as $permission) {
            if (isset($testMenus[$permission])) {
                $menusData[] = $testMenus[$permission];
            }
        }
        
    } elseif (is_object($connection) && get_class($connection) === 'mysqli') {
        // Usar mysqli
        debugLog("USANDO MYSQLI PARA MENÚS", ['permissions' => $permissions]);
        
        // Crear placeholders para la consulta IN
        $placeholders = str_repeat('?,', count($permissions) - 1) . '?';
        
        // PASO 1: Obtener menús directos con permisos
        $stmt = $connection->prepare("
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
        
        $stmt->bind_param(str_repeat('i', count($permissions)), ...$permissions);
        $stmt->execute();
        $result = $stmt->get_result();
        $menusDirectos = [];
        while ($row = $result->fetch_assoc()) {
            $menusDirectos[] = $row;
        }
        
        // Obtener menús padre recursivamente
        $menusData = getMenusWithParents($connection, $menusDirectos);
        
    } elseif (is_object($connection) && get_class($connection) === 'PDO') {
        // Usar PDO
        debugLog("USANDO PDO PARA MENÚS", ['permissions' => $permissions]);
        
        // Crear placeholders para la consulta IN
        $placeholders = str_repeat('?,', count($permissions) - 1) . '?';
        
        // PASO 1: Obtener menús directos con permisos
        $stmt = $connection->prepare("
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
        
        // Obtener menús padre recursivamente
        $menusData = getMenusWithParents($connection, $menusDirectos);
        
    } else {
        // Usar mysql_connect (deprecated)
        debugLog("USANDO MYSQL_CONNECT PARA MENÚS", ['permissions' => $permissions]);
        
        // Crear placeholders para la consulta IN
        $placeholders = implode(',', $permissions);
        
        // PASO 1: Obtener menús directos con permisos
        $query = "
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
        ";
        
        $result = mysql_query($query, $connection);
        if (!$result) {
            throw new Exception('Error en consulta: ' . mysql_error($connection));
        }
        
        $menusDirectos = [];
        while ($row = mysql_fetch_assoc($result)) {
            $menusDirectos[] = $row;
        }
        
        // Obtener menús padre recursivamente
        $menusData = getMenusWithParents($connection, $menusDirectos);
    }
    
    debugLog("Menús obtenidos exitosamente", [
        'count' => count($menusData),
        'tipo_conexion' => $connection === 'json_db' ? 'JSON' : (is_object($connection) ? get_class($connection) : 'UNKNOWN')
    ]);
    
    sendResponse(true, 'Menús obtenidos exitosamente', [
        'menus' => $menusData,
        'total' => count($menusData),
        'connection_type' => $connection === 'json_db' ? 'JSON_TEMPORAL' : (is_object($connection) ? get_class($connection) : 'UNKNOWN')
    ]);
    
} catch (Exception $e) {
    debugLog("ERROR CRÍTICO EN MENÚS", [
        'error' => $e->getMessage(),
        'archivo' => $e->getFile(),
        'línea' => $e->getLine()
    ]);
    
    sendResponse(false, 'Error interno del servidor', [
        'debug' => ENVIRONMENT === 'local' ? [
            'error' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ] : null
    ], 500);
}

/**
 * Función auxiliar para obtener menús con padres recursivamente
 */
function getMenusWithParents($connection, $menusDirectos) {
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
        
        if (is_object($connection) && get_class($connection) === 'mysqli') {
            $parentStmt = $connection->prepare("
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
            
            $parentStmt->bind_param(str_repeat('i', count($parentIds)), ...$parentIds);
            $parentStmt->execute();
            $result = $parentStmt->get_result();
            $menusPadre = [];
            while ($row = $result->fetch_assoc()) {
                $menusPadre[] = $row;
            }
            
        } elseif (is_object($connection) && get_class($connection) === 'PDO') {
            $parentStmt = $connection->prepare("
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
            
        } else {
            // mysql_connect
            $parentPlaceholders = implode(',', $parentIds);
            $query = "
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
            ";
            
            $result = mysql_query($query, $connection);
            if (!$result) {
                throw new Exception('Error en consulta padres: ' . mysql_error($connection));
            }
            
            $menusPadre = [];
            while ($row = mysql_fetch_assoc($result)) {
                $menusPadre[] = $row;
            }
        }
        
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
        if (($a['parent'] === null || $a['parent'] === '0' || $a['parent'] === 0) === 
            ($b['parent'] === null || $b['parent'] === '0' || $b['parent'] === 0)) {
            return $a['idmenu'] - $b['idmenu'];
        }
        
        // Padres primero
        if ($a['parent'] === null || $a['parent'] === '0' || $a['parent'] === 0) {
            return -1;
        }
        return 1;
    });
    
    return $menusData;
}
?>
