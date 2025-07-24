<?php
/**
 * API: Obtener submenús de un menú padre
 * Replicando lógica exacta de BiAleseCorp: Menu::getSubMenus($parent)
 */

require_once 'config_dual.php';

try {
    // Obtener parent_id del parámetro GET o POST
    $parentId = null;
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $parentId = $_GET['parent_id'] ?? null;
    } else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $parentId = $input['parent_id'] ?? null;
    }
    
    if (!$parentId) {
        sendResponse(false, 'Parent ID es requerido', null, 400);
    }
    
    debugLog("Obteniendo submenús", ['parent_id' => $parentId]);
    
    // Conexión a la base de datos
    $pdo = getDbConnection();
    
    // LÓGICA EXACTA DE BIALESECORP: Menu::getSubMenus($parent)
    // $this->db->where('parent', $parent); return $this->db->get('menus')->result_array();
    // SQL generado: SELECT * FROM menus WHERE parent = 1
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
        WHERE parent = ?
        ORDER BY idmenu ASC
    ");
    
    $stmt->execute([$parentId]);
    $submenus = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Convertir a formato estándar
    $submenuData = [];
    foreach ($submenus as $submenu) {
        $submenuData[] = [
            'idmenu' => (int)$submenu['idmenu'],
            'menu' => $submenu['menu'],
            'vista' => $submenu['vista'],
            'icono' => $submenu['icono'],
            'estado' => $submenu['estado'],
            'url' => $submenu['url'],
            'ancho' => $submenu['ancho'],
            'alto' => $submenu['alto'],
            'parent' => $submenu['parent'] ? (int)$submenu['parent'] : null
        ];
    }
    
    debugLog("Submenús encontrados", [
        'parent_id' => $parentId,
        'count' => count($submenuData),
        'submenus' => array_map(function($s) { 
            return ['id' => $s['idmenu'], 'name' => $s['menu']]; 
        }, $submenuData)
    ]);
    
    sendResponse(true, 'Submenús obtenidos exitosamente', [
        'submenus' => $submenuData,
        'total' => count($submenuData),
        'parent_id' => (int)$parentId
    ]);
    
} catch (Exception $e) {
    debugLog("Error obteniendo submenús", ['error' => $e->getMessage()]);
    sendResponse(false, 'Error interno del servidor', [
        'debug' => ENVIRONMENT === 'local' ? $e->getMessage() : null
    ], 500);
}
?>
