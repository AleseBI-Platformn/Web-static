<?php
/**
 * DEBUG ESPECÍFICO para usuario 'clagos' en BD PRODUCCIÓN
 * 50.31.188.163 -> xqkefqsh_alesecorp_ventas
 * USA PERFIL_MENUS (NO permisos individuales) - Sistema correcto
 */

require_once 'config_dual.php';

try {
    echo "<h2>🔍 DEBUG USUARIO 'clagos' - BD PRODUCCIÓN</h2>";
    echo "<p><strong>BD:</strong> " . DB_HOST . "/" . DB_NAME . "</p>";
    echo "<hr>";
    
    // Conexión a BD PRODUCCIÓN
    $pdo = getDbConnection();
    
    // 1. BUSCAR USUARIO 'clagos' EN BD REAL
    echo "<h3>👤 Buscando usuario 'clagos':</h3>";
    $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE UsuCod = ?");
    $stmt->execute(['clagos']);
    $user = $stmt->fetch();
    
    if ($user) {
        echo "<p>✅ Usuario 'clagos' ENCONTRADO en BD de producción:</p>";
        echo "<table border='1' style='border-collapse: collapse; width: 100%;'>";
        echo "<tr><th>Campo</th><th>Valor</th></tr>";
        foreach ($user as $key => $value) {
            if (!is_numeric($key)) {
                $displayValue = $key === 'UsuClave' ? 
                    substr($value, 0, 10) . '... (longitud: ' . strlen($value) . ')' : 
                    htmlspecialchars($value);
                echo "<tr><td><strong>$key</strong></td><td>$displayValue</td></tr>";
            }
        }
        echo "</table><br>";
        
        // 2. PROBAR CONTRASEÑA 'clagos5263'
        echo "<h3>🔐 Probando contraseña 'clagos5263':</h3>";
        $testPassword = 'clagos5263';
        $dbPassword = $user['UsuClave'];
        
        // Probar diferentes hashes
        $md5Hash = md5($testPassword);
        $sha1Hash = sha1($testPassword);
        $bcryptValid = password_verify($testPassword, $dbPassword);
        
        echo "<table border='1' style='border-collapse: collapse; width: 100%;'>";
        echo "<tr><th>Método</th><th>Hash Generado</th><th>¿Coincide?</th></tr>";
        
        echo "<tr><td>BD Original</td><td>" . htmlspecialchars($dbPassword) . "</td><td>-</td></tr>";
        echo "<tr><td>MD5</td><td>$md5Hash</td><td>" . ($dbPassword === $md5Hash ? '✅ SÍ' : '❌ NO') . "</td></tr>";
        echo "<tr><td>SHA1</td><td>$sha1Hash</td><td>" . ($dbPassword === $sha1Hash ? '✅ SÍ' : '❌ NO') . "</td></tr>";
        echo "<tr><td>Texto Plano</td><td>$testPassword</td><td>" . ($dbPassword === $testPassword ? '✅ SÍ' : '❌ NO') . "</td></tr>";
        echo "<tr><td>BCrypt</td><td>password_verify()</td><td>" . ($bcryptValid ? '✅ SÍ' : '❌ NO') . "</td></tr>";
        
        echo "</table><br>";
        
        // 3. VERIFICAR ESTADO DEL USUARIO
        echo "<h3>📋 Estado del usuario:</h3>";
        echo "<p><strong>UsuEst:</strong> " . htmlspecialchars($user['UsuEst']) . "</p>";
        echo "<p><strong>¿Activo?:</strong> " . ($user['UsuEst'] === '1' ? '✅ SÍ (activo)' : '❌ NO (inactivo - código: ' . $user['UsuEst'] . ')') . "</p>";
        
        // 4. VERIFICAR PERMISOS USANDO perfil_menus (NO individuales)
        echo "<h3>🔐 Permisos del usuario (via perfil_menus):</h3>";
        
        if (!empty($user['idperfil'])) {
            echo "<p><strong>ID Perfil:</strong> " . htmlspecialchars($user['idperfil']) . "</p>";
            
            $stmt = $pdo->prepare("SELECT idmenu FROM perfil_menus WHERE idperfil = ? ORDER BY idmenu");
            $stmt->execute([$user['idperfil']]);
            $permissions = $stmt->fetchAll(PDO::FETCH_COLUMN);
            
            echo "<p><strong>Total permisos:</strong> " . count($permissions) . "</p>";
            if ($permissions) {
                echo "<p><strong>Permisos:</strong> " . implode(', ', $permissions) . "</p>";
            } else {
                echo "<p>❌ No tiene permisos asignados al perfil</p>";
            }
        } else {
            echo "<p>❌ Usuario no tiene perfil asignado (idperfil vacío)</p>";
        }
        
    } else {
        echo "<p>❌ Usuario 'clagos' NO ENCONTRADO en la BD de producción</p>";
        
        // Mostrar usuarios disponibles
        echo "<h4>📋 Usuarios disponibles en BD (primeros 10):</h4>";
        $stmt = $pdo->query("SELECT UsuCod, UsuNom, UsuEst FROM usuarios LIMIT 10");
        $users = $stmt->fetchAll();
        
        echo "<table border='1' style='border-collapse: collapse;'>";
        echo "<tr><th>UsuCod</th><th>UsuNom</th><th>Estado</th></tr>";
        foreach ($users as $u) {
            echo "<tr>";
            echo "<td>" . htmlspecialchars($u['UsuCod']) . "</td>";
            echo "<td>" . htmlspecialchars($u['UsuNom']) . "</td>";
            echo "<td>" . htmlspecialchars($u['UsuEst']) . "</td>";
            echo "</tr>";
        }
        echo "</table>";
    }
    
} catch (Exception $e) {
    echo "<h2>❌ ERROR DE CONEXIÓN A BD PRODUCCIÓN</h2>";
    echo "<p><strong>Error:</strong> " . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<p><strong>Archivo:</strong> " . htmlspecialchars($e->getFile()) . "</p>";
    echo "<p><strong>Línea:</strong> " . $e->getLine() . "</p>";
    echo "<p><strong>BD Host:</strong> " . (defined('DB_HOST') ? DB_HOST : 'NO DEFINIDO') . "</p>";
    echo "<p><strong>BD Name:</strong> " . (defined('DB_NAME') ? DB_NAME : 'NO DEFINIDO') . "</p>";
}
?>
