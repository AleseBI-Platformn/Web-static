<?php
require_once 'config.php';

// Script para probar la conexión a la base de datos y verificar las correcciones

echo "<!DOCTYPE html>";
echo "<html><head><title>Test Base de Datos ALESE CORP</title></head><body>";
echo "<h1>🔍 Test de Base de Datos ALESE CORP</h1>";

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    echo "<div style='color: green;'>✅ Conexión a la base de datos exitosa</div><br>";
    
    // 1. Verificar si existe la tabla usuario_permisos
    echo "<h2>1. Verificación de Tablas</h2>";
    
    $tables = ['usuarios', 'usuario_permisos', 'menus', 'perfiles', 'perfil_menus'];
    foreach ($tables as $table) {
        $stmt = $conn->prepare("SHOW TABLES LIKE ?");
        $stmt->execute([$table]);
        if ($stmt->rowCount() > 0) {
            echo "<div style='color: green;'>✅ Tabla '$table' existe</div>";
        } else {
            echo "<div style='color: red;'>❌ Tabla '$table' NO existe</div>";
        }
    }
    
    // 2. Verificar usuarios activos
    echo "<h2>2. Usuarios Activos</h2>";
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM usuarios WHERE UsuEst = '1'");
    $stmt->execute();
    $result = $stmt->fetch();
    echo "<div>Total usuarios activos: <strong>{$result['total']}</strong></div>";
    
    // 3. Verificar algunos usuarios específicos
    echo "<h3>Usuarios de prueba:</h3>";
    $testUsers = ['jpoma', 'cvasquez', 'admin', 'clagos'];
    foreach ($testUsers as $user) {
        $stmt = $conn->prepare("SELECT UsuCod, UsuNom, UsuApePat, UsuPerfil, UsuEst FROM usuarios WHERE UsuCod = ?");
        $stmt->execute([$user]);
        $userData = $stmt->fetch();
        if ($userData) {
            $status = $userData['UsuEst'] == '1' ? 'ACTIVO' : 'INACTIVO';
            echo "<div>👤 <strong>{$userData['UsuCod']}</strong>: {$userData['UsuNom']} {$userData['UsuApePat']} - {$userData['UsuPerfil']} ({$status})</div>";
        } else {
            echo "<div>❌ Usuario '$user' no encontrado</div>";
        }
    }
    
    // 4. Verificar menús
    echo "<h2>3. Menús Disponibles</h2>";
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM menus WHERE estado = '1'");
    $stmt->execute();
    $result = $stmt->fetch();
    echo "<div>Total menús activos: <strong>{$result['total']}</strong></div>";
    
    // 5. Verificar permisos
    echo "<h2>4. Permisos</h2>";
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM usuario_permisos");
    $stmt->execute();
    $result = $stmt->fetch();
    echo "<div>Total permisos de usuario: <strong>{$result['total']}</strong></div>";
    
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM perfil_menus");
    $stmt->execute();
    $result = $stmt->fetch();
    echo "<div>Total permisos de perfil: <strong>{$result['total']}</strong></div>";
    
    // 6. Test de login
    echo "<h2>5. Test de Login</h2>";
    echo "<form method='POST' action=''>
            <input type='text' name='test_user' placeholder='Usuario' value='jpoma' />
            <input type='password' name='test_pass' placeholder='Contraseña' value='jpoma2023' />
            <button type='submit'>Probar Login</button>
          </form>";
    
    if ($_POST['test_user'] && $_POST['test_pass']) {
        $testUser = $_POST['test_user'];
        $testPass = $_POST['test_pass'];
        
        $stmt = $conn->prepare("
            SELECT u.UsuCod, u.UsuNom, u.UsuApePat, u.UsuApeMat, u.UsuEmail, u.UsuPerfil, u.idperfil, u.UsuEst
            FROM usuarios u 
            WHERE u.UsuCod = ? AND u.UsuClave = ? AND u.UsuEst = '1'
        ");
        
        $stmt->execute([$testUser, $testPass]);
        $user = $stmt->fetch();
        
        if ($user) {
            echo "<div style='color: green;'>✅ Login exitoso para: {$user['UsuNom']} {$user['UsuApePat']}</div>";
            
            // Obtener permisos
            $stmt = $conn->prepare("SELECT DISTINCT p.idmenu FROM usuario_permisos p WHERE p.UsuCod = ?");
            $stmt->execute([$testUser]);
            $userPerms = $stmt->fetchAll(PDO::FETCH_COLUMN);
            
            $stmt = $conn->prepare("SELECT DISTINCT pm.idmenu FROM perfil_menus pm WHERE pm.idperfil = ?");
            $stmt->execute([$user['idperfil']]);
            $profilePerms = $stmt->fetchAll(PDO::FETCH_COLUMN);
            
            $totalPerms = array_unique(array_merge($userPerms, $profilePerms));
            
            echo "<div>Permisos de usuario: " . count($userPerms) . "</div>";
            echo "<div>Permisos de perfil: " . count($profilePerms) . "</div>";
            echo "<div>Total permisos: " . count($totalPerms) . "</div>";
        } else {
            echo "<div style='color: red;'>❌ Login fallido</div>";
        }
    }
    
} catch (Exception $e) {
    echo "<div style='color: red;'>❌ Error: " . $e->getMessage() . "</div>";
}

echo "</body></html>";
?>
