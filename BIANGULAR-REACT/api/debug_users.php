<?php
/**
 * Debug para ver usuarios reales en la base de datos
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
    
    // Obtener algunos permisos de ejemplo
    $stmt = $pdo->query("
        SELECT UsuCod, COUNT(*) as total_permisos
        FROM ___________________________permisos
        GROUP BY UsuCod
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
