<?php
/**
 * API: Obtener menú específico por URL
 * Replicando lógica exacta de BiAleseCorp: Menu::getMenu($url)
 */

require_once 'config_dual.php';

try {
    // Obtener URL del parámetro GET o POST
    $url = null;
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $url = $_GET['url'] ?? null;
    } else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $url = $input['url'] ?? null;
    }
    
    if (!$url) {
        sendResponse(false, 'URL es requerida', null, 400);
    }
    
    debugLog("Obteniendo menú por URL", ['url' => $url]);
    
    // Conexión a la base de datos
    $connection = getDbConnection();
    
    // Determinar tipo de conexión y ejecutar consulta
    if ($connection === 'json_db') {
        // Usar base de datos JSON temporal
        debugLog("USANDO BASE DE DATOS JSON TEMPORAL PARA MENÚ POR URL", ['url' => $url]);
        
        // Datos de prueba para menús
        $testMenus = [
            'dashboard' => ['idmenu' => 1, 'menu' => 'Dashboard', 'vista' => 'dashboard', 'icono' => 'home', 'estado' => '1', 'url' => 'dashboard', 'ancho' => 1200, 'alto' => 800, 'parent' => null],
            'usuarios' => ['idmenu' => 2, 'menu' => 'Usuarios', 'vista' => 'usuarios', 'icono' => 'users', 'estado' => '1', 'url' => 'usuarios', 'ancho' => 1200, 'alto' => 800, 'parent' => null],
            'config' => ['idmenu' => 3, 'menu' => 'Configuración', 'vista' => 'config', 'icono' => 'settings', 'estado' => '1', 'url' => 'config', 'ancho' => 1200, 'alto' => 800, 'parent' => null],
            'reportes' => ['idmenu' => 4, 'menu' => 'Reportes', 'vista' => 'reportes', 'icono' => 'chart', 'estado' => '1', 'url' => 'reportes', 'ancho' => 1400, 'alto' => 900, 'parent' => null],
            'admin' => ['idmenu' => 5, 'menu' => 'Administración', 'vista' => 'admin', 'icono' => 'admin', 'estado' => '1', 'url' => 'admin', 'ancho' => 1200, 'alto' => 800, 'parent' => null]
        ];
        
        // Buscar menú por URL
        $menu = $testMenus[$url] ?? null;
        
    } elseif (is_object($connection) && get_class($connection) === 'mysqli') {
        // Usar mysqli
        debugLog("USANDO MYSQLI PARA MENÚ POR URL", ['url' => $url]);
        
        $stmt = $connection->prepare("
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
            WHERE url = ? 
            LIMIT 1
        ");
        
        $stmt->bind_param("s", $url);
        $stmt->execute();
        $result = $stmt->get_result();
        $menu = $result->fetch_assoc();
        
    } elseif (is_object($connection) && get_class($connection) === 'PDO') {
        // Usar PDO
        debugLog("USANDO PDO PARA MENÚ POR URL", ['url' => $url]);
        
        $stmt = $connection->prepare("
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
            WHERE url = ? 
            LIMIT 1
        ");
        
        $stmt->execute([$url]);
        $menu = $stmt->fetch(PDO::FETCH_ASSOC);
        
    } else {
        // Usar mysql_connect (deprecated)
        debugLog("USANDO MYSQL_CONNECT PARA MENÚ POR URL", ['url' => $url]);
        
        $query = "
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
            WHERE url = '$url' 
            LIMIT 1
        ";
        
        $result = mysql_query($query, $connection);
        if (!$result) {
            throw new Exception('Error en consulta: ' . mysql_error($connection));
        }
        
        $menu = mysql_fetch_assoc($result);
    }
    
    if (!$menu) {
        debugLog("Menú no encontrado", ['url' => $url]);
        sendResponse(false, 'Menú no encontrado', null, 404);
    }
    
    // Convertir a formato estándar
    $menuData = [
        'idmenu' => (int)$menu['idmenu'],
        'menu' => $menu['menu'],
        'vista' => $menu['vista'],
        'icono' => $menu['icono'],
        'estado' => $menu['estado'],
        'url' => $menu['url'],
        'ancho' => $menu['ancho'],
        'alto' => $menu['alto'],
        'parent' => $menu['parent'] ? (int)$menu['parent'] : null
    ];
    
    debugLog("Menú encontrado", [
        'id' => $menuData['idmenu'],
        'name' => $menuData['menu'],
        'url' => $menuData['url'],
        'vista' => $menuData['vista'],
        'tipo_conexion' => $connection === 'json_db' ? 'JSON' : (is_object($connection) ? get_class($connection) : 'UNKNOWN')
    ]);
    
    sendResponse(true, 'Menú obtenido exitosamente', $menuData);
    
} catch (Exception $e) {
    debugLog("Error obteniendo menú por URL", ['error' => $e->getMessage()]);
    sendResponse(false, 'Error interno del servidor', [
        'debug' => ENVIRONMENT === 'local' ? $e->getMessage() : null
    ], 500);
}
?>
