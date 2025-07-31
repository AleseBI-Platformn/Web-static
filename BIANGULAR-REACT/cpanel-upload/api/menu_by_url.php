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
    $pdo = getDbConnection();
    
    // LÓGICA EXACTA DE BIALESECORP: Menu::getMenu($url)
    // $this->db->where('url', $idmenu); return $this->db->get('menus')->row_array();
    // SQL generado: SELECT * FROM menus WHERE url = 'ventas' LIMIT 1
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
    
    $stmt->execute([$url]);
    $menu = $stmt->fetch(PDO::FETCH_ASSOC);
    
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
        'vista' => $menuData['vista']
    ]);
    
    sendResponse(true, 'Menú obtenido exitosamente', $menuData);
    
} catch (Exception $e) {
    debugLog("Error obteniendo menú por URL", ['error' => $e->getMessage()]);
    sendResponse(false, 'Error interno del servidor', [
        'debug' => ENVIRONMENT === 'local' ? $e->getMessage() : null
    ], 500);
}
?>
