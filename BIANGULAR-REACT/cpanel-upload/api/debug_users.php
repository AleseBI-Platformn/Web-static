<?php
/**
 * Debug para ver usuarios reales en la base de datos
 * USA PERFIL_MENUS (NO permisos individuales) - Sistema correcto
 */

require_once 'config_dual.php';

try {
    $pdo = getDbConnection();
    
    // Obtener usuarios activos
    $stmt = $pdo->query("
        SELECT 
            UsuCod, 
            UsuNom, 
            UsuApePat, 
            UsuApeMat, 
            UsuEmail, 
            UsuPerfil,
            UsuEst,
            idperfil,
            CONCAT(UsuNom, ' ', UsuApePat, ' ', UsuApeMat) as fullName
        FROM usuarios 
        WHERE UsuEst = '1'
        ORDER BY UsuCod
        LIMIT 10
    ");
    
    $users = $stmt->fetchAll();
    
    // Obtener resumen de permisos desde perfil_menus (NO individuales)
    $stmt = $pdo->query("
        SELECT 
            u.UsuCod, 
            u.idperfil,
            COUNT(pm.idmenu) as total_permisos
        FROM usuarios u
        LEFT JOIN perfil_menus pm ON u.idperfil = pm.idperfil
        WHERE u.UsuEst = '1'
        GROUP BY u.UsuCod, u.idperfil
        ORDER BY total_permisos DESC
        LIMIT 10
    ");
    
    $permissions = $stmt->fetchAll();
    
    sendResponse(true, 'Información de debug obtenida', [
        'users' => $users,
        'permissions_summary' => $permissions,
        'total_users' => count($users)
    ]);
    
} catch (Exception $e) {
    sendResponse(false, 'Error en debug', [
        'error' => $e->getMessage()
    ], 500);
}
?>
