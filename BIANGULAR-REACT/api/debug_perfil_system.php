<?php
/**
 * DEBUG: Verificar que sistema usa PERFIL_MENUS correctamente
 * Específico para usuario cvasquez
 */

require_once 'config_dual.php';

try {
    echo "<h2>🔍 DEBUG SISTEMA PERFIL_MENUS - Usuario: cvasquez</h2>";
    echo "<p><strong>BD:</strong> " . DB_HOST . "/" . DB_NAME . "</p>";
    echo "<hr>";
    
    $pdo = getDbConnection();
    
    // 1. VERIFICAR USUARIO cvasquez
    echo "<h3>👤 Usuario cvasquez:</h3>";
    $stmt = $pdo->prepare("SELECT UsuCod, UsuNom, UsuApePat, UsuApeMat, UsuPerfil, idperfil, UsuEst FROM usuarios WHERE UsuCod = ?");
    $stmt->execute(['cvasquez']);
    $user = $stmt->fetch();
    
    if ($user) {
        echo "<table border='1' style='border-collapse: collapse;'>";
        echo "<tr><th>Campo</th><th>Valor</th></tr>";
        foreach ($user as $key => $value) {
            if (!is_numeric($key)) {
                echo "<tr><td><strong>$key</strong></td><td>" . htmlspecialchars($value) . "</td></tr>";
            }
        }
        echo "</table><br>";
        
        $idperfil = $user['idperfil'];
        
        // 2. VERIFICAR PERMISOS POR PERFIL (perfil_menus)
        echo "<h3>🔐 Permisos por PERFIL (perfil_menus) - Perfil ID: $idperfil</h3>";
        $stmt = $pdo->prepare("
            SELECT pm.idmenu, m.menu, m.parent 
            FROM perfil_menus pm 
            INNER JOIN menus m ON pm.idmenu = m.idmenu 
            WHERE pm.idperfil = ? 
            ORDER BY pm.idmenu
        ");
        $stmt->execute([$idperfil]);
        $perfilPermisos = $stmt->fetchAll();
        
        echo "<p><strong>Total permisos por perfil:</strong> " . count($perfilPermisos) . "</p>";
        if ($perfilPermisos) {
            echo "<table border='1' style='border-collapse: collapse;'>";
            echo "<tr><th>ID Menú</th><th>Nombre Menú</th><th>Parent</th></tr>";
            foreach ($perfilPermisos as $p) {
                echo "<tr>";
                echo "<td>" . $p['idmenu'] . "</td>";
                echo "<td>" . htmlspecialchars($p['menu']) . "</td>";
                echo "<td>" . ($p['parent'] ?: 'PRINCIPAL') . "</td>";
                echo "</tr>";
            }
            echo "</table><br>";
        }
        
        // 3. VERIFICAR PERMISOS INDIVIDUALES (___________________________permisos) - SOLO PARA COMPARAR
        echo "<h3>⚠️ Permisos INDIVIDUALES (___________________________permisos) - SOLO COMPARACIÓN</h3>";
        $stmt = $pdo->prepare("
            SELECT p.idmenu, m.menu, m.parent 
            FROM ___________________________permisos p 
            INNER JOIN menus m ON p.idmenu = m.idmenu 
            WHERE p.UsuCod = ? 
            ORDER BY p.idmenu
        ");
        $stmt->execute(['cvasquez']);
        $permisosIndividuales = $stmt->fetchAll();
        
        echo "<p><strong>Total permisos individuales:</strong> " . count($permisosIndividuales) . "</p>";
        if ($permisosIndividuales) {
            echo "<table border='1' style='border-collapse: collapse;'>";
            echo "<tr><th>ID Menú</th><th>Nombre Menú</th><th>Parent</th></tr>";
            foreach ($permisosIndividuales as $p) {
                echo "<tr>";
                echo "<td>" . $p['idmenu'] . "</td>";
                echo "<td>" . htmlspecialchars($p['menu']) . "</td>";
                echo "<td>" . ($p['parent'] ?: 'PRINCIPAL') . "</td>";
                echo "</tr>";
            }
            echo "</table><br>";
        }
        
        // 4. RESULTADO ESPERADO CON SISTEMA CORRECTO
        echo "<h3>✅ RESULTADO ESPERADO con perfil_menus:</h3>";
        $stmt = $pdo->prepare("
            SELECT DISTINCT m.idmenu, m.menu 
            FROM menus m 
            INNER JOIN perfil_menus pm ON m.idmenu = pm.idmenu 
            WHERE pm.idperfil = ? 
            AND (m.parent = 0 OR m.parent IS NULL) 
            AND m.estado = '1'
            ORDER BY m.idmenu
        ");
        $stmt->execute([$idperfil]);
        $menusPrincipales = $stmt->fetchAll();
        
        echo "<p><strong>Menús principales que debería ver cvasquez:</strong></p>";
        echo "<ul>";
        foreach ($menusPrincipales as $menu) {
            echo "<li><strong>" . htmlspecialchars($menu['menu']) . "</strong> (ID: " . $menu['idmenu'] . ")</li>";
        }
        echo "</ul>";
        
        // 5. COMPARACIÓN CON SISTEMA ANTERIOR
        echo "<h3>❌ Lo que mostraría sistema anterior (___________________________permisos):</h3>";
        $stmt = $pdo->prepare("
            SELECT DISTINCT m.idmenu, m.menu 
            FROM menus m 
            INNER JOIN ___________________________permisos p ON m.idmenu = p.idmenu 
            WHERE p.UsuCod = ? 
            AND (m.parent = 0 OR m.parent IS NULL) 
            AND m.estado = '1'
            ORDER BY m.idmenu
        ");
        $stmt->execute(['cvasquez']);
        $menusAnteriores = $stmt->fetchAll();
        
        echo "<p><strong>Menús con sistema anterior (INCORRECTO):</strong></p>";
        echo "<ul>";
        foreach ($menusAnteriores as $menu) {
            echo "<li><strong>" . htmlspecialchars($menu['menu']) . "</strong> (ID: " . $menu['idmenu'] . ")</li>";
        }
        echo "</ul>";
        
    } else {
        echo "<p>❌ Usuario cvasquez no encontrado</p>";
    }
    
} catch (Exception $e) {
    echo "<h2>❌ ERROR</h2>";
    echo "<p>" . htmlspecialchars($e->getMessage()) . "</p>";
}
?>
