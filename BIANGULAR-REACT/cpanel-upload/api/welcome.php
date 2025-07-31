<?php
/**
 * Welcome Controller Replication - ALESE CORP
 * Replicando exactamente: Welcome::index() de BiAleseCorp
 * 
 * Este endpoint simula el flujo completo del controlador Welcome
 * que maneja las rutas dinámicas como /ventas, /digital, etc.
 */

require_once 'config_dual.php';

try {
    // ✅ OBTIENE LA URL ACTUAL (como $this->uri->uri_string)
    $pageLoad = null;
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $pageLoad = $_GET['page'] ?? 'dashboard';
    } else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $pageLoad = $input['page'] ?? 'dashboard';
    }
    
    // Limpiar la URL como lo haría CodeIgniter
    $pageLoad = trim($pageLoad, '/');
    if (empty($pageLoad)) {
        $pageLoad = 'dashboard';
    }
    
    debugLog("WELCOME CONTROLLER - Procesando página", [
        'page_load' => $pageLoad,
        'method' => $_SERVER['REQUEST_METHOD']
    ]);
    
    // Conexión a la base de datos
    $pdo = getDbConnection();
    
    // ✅ BUSCA EL MENÚ POR URL (como $this->menu->getMenu($pageLoad))
    // Menu::getMenu() - SELECT * FROM menus WHERE url = 'ventas' LIMIT 1
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
        WHERE url = ? 
        LIMIT 1
    ");
    
    $stmt->execute([$pageLoad]);
    $pagina = $stmt->fetch(PDO::FETCH_ASSOC);
    
    debugLog("MENU SEARCH RESULT", [
        'url_buscada' => $pageLoad,
        'menu_encontrado' => $pagina ? 'SÍ' : 'NO',
        'menu_data' => $pagina
    ]);
    
    // ✅ OBTIENE TODOS LOS MENÚS PRINCIPALES (como $this->menu->getMenus())
    // Menu::getMenus() - SELECT * FROM menus WHERE estado = 1 AND parent = 0
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
        WHERE estado = '1' 
        AND parent = 0
        ORDER BY idmenu ASC
    ");
    
    $stmt->execute();
    $enlaces = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Enriquecer enlaces con submenús (como hace Api::menus())
    foreach ($enlaces as &$enlace) {
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
            WHERE parent = ?
            ORDER BY idmenu ASC
        ");
        
        $subStmt->execute([$enlace['idmenu']]);
        $enlace['submenus'] = $subStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Convertir campos numéricos
        $enlace['idmenu'] = (int)$enlace['idmenu'];
        $enlace['parent'] = $enlace['parent'] ? (int)$enlace['parent'] : null;
        
        foreach ($enlace['submenus'] as &$submenu) {
            $submenu['idmenu'] = (int)$submenu['idmenu'];
            $submenu['parent'] = $submenu['parent'] ? (int)$submenu['parent'] : null;
        }
    }
    
    // Convertir página actual si existe
    if ($pagina) {
        $pagina['idmenu'] = (int)$pagina['idmenu'];
        $pagina['parent'] = $pagina['parent'] ? (int)$pagina['parent'] : null;
    }
    
    debugLog("WELCOME CONTROLLER - Datos obtenidos", [
        'total_enlaces' => count($enlaces),
        'pagina_actual' => $pagina ? $pagina['menu'] : 'NO_ENCONTRADA',
        'enlaces_resumen' => array_map(function($e) { 
            return [
                'id' => $e['idmenu'], 
                'name' => $e['menu'], 
                'submenus_count' => count($e['submenus'])
            ]; 
        }, $enlaces)
    ]);
    
    // ✅ CARGA LA VISTA CON LOS DATOS (como $this->load->view('menu', $data, TRUE))
    $responseData = [
        'enlaces' => $enlaces,      // Para navegación (menús principales + submenús)
        'pagina' => $pagina,        // Página actual
        'page_load' => $pageLoad,   // URL solicitada
        'breadcrumb' => [
            ['name' => 'Home', 'url' => '/'],
            ['name' => $pagina ? $pagina['menu'] : 'Página no encontrada', 'url' => $pageLoad]
        ]
    ];
    
    // Simular lo que haría la vista menu.php
    if ($pagina) {
        $responseData['view_data'] = [
            'title' => $pagina['menu'],
            'iframe_url' => $pagina['vista'],
            'iframe_width' => $pagina['ancho'] ?: '100%',
            'iframe_height' => $pagina['alto'] ?: '600px',
            'breadcrumb_active' => $pagina['menu']
        ];
        
        sendResponse(true, 'Página cargada exitosamente', $responseData);
    } else {
        // Página no encontrada - como manejaría CodeIgniter show_404()
        debugLog("PÁGINA NO ENCONTRADA", ['url' => $pageLoad]);
        
        sendResponse(false, 'Página no encontrada', [
            'page_load' => $pageLoad,
            'enlaces' => $enlaces, // Aún enviar menús para navegación
            'suggestion' => 'Verifica que la URL existe en el menú'
        ], 404);
    }
    
} catch (Exception $e) {
    debugLog("ERROR EN WELCOME CONTROLLER", [
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
    
    sendResponse(false, 'Error interno del servidor', [
        'debug' => ENVIRONMENT === 'local' ? $e->getMessage() : null
    ], 500);
}
?>
