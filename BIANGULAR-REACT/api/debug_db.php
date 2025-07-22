<?php
/**
 * Script de DEBUG para analizar la base de datos REAL
 * Consulta la estructura real en 50.31.188.163
 */

require_once 'config_dual.php';

try {
    // Conexión a la base de datos REAL
    $pdo = getDbConnection();
    
    echo "<h2>🔍 ANÁLISIS DE BASE DE DATOS REAL</h2>";
    echo "<p><strong>Servidor:</strong> 50.31.188.163</p>";
    echo "<p><strong>Base de datos:</strong> xqkefqsh_alesecorp_ventas</p>";
    echo "<hr>";
    
    // 1. ESTRUCTURA DE LA TABLA USUARIOS
    echo "<h3>📊 Estructura de tabla 'usuarios':</h3>";
    $stmt = $pdo->query("DESCRIBE usuarios");
    $columns = $stmt->fetchAll();
    
    echo "<table border='1' style='border-collapse: collapse;'>";
    echo "<tr><th>Campo</th><th>Tipo</th><th>Null</th><th>Key</th><th>Default</th></tr>";
    foreach ($columns as $col) {
        echo "<tr>";
        echo "<td>" . htmlspecialchars($col['Field']) . "</td>";
        echo "<td>" . htmlspecialchars($col['Type']) . "</td>";
        echo "<td>" . htmlspecialchars($col['Null']) . "</td>";
        echo "<td>" . htmlspecialchars($col['Key']) . "</td>";
        echo "<td>" . htmlspecialchars($col['Default']) . "</td>";
        echo "</tr>";
    }
    echo "</table><br>";
    
    // 2. VERIFICAR SI EXISTE EL USUARIO 'clagos'
    echo "<h3>👤 Verificando usuario 'clagos':</h3>";
    $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE UsuCod = ?");
    $stmt->execute(['clagos']);
    $user = $stmt->fetch();
    
    if ($user) {
        echo "<p>✅ Usuario 'clagos' ENCONTRADO:</p>";
        echo "<table border='1' style='border-collapse: collapse;'>";
        foreach ($user as $key => $value) {
            if (!is_numeric($key)) {
                echo "<tr><td><strong>$key</strong></td><td>" . htmlspecialchars($value) . "</td></tr>";
            }
        }
        echo "</table><br>";
    } else {
        echo "<p>❌ Usuario 'clagos' NO ENCONTRADO en la tabla usuarios</p>";
        
        // Mostrar todos los usuarios disponibles
        echo "<h4>📋 Usuarios disponibles en la tabla:</h4>";
        $stmt = $pdo->query("SELECT UsuCod, UsuNom, UsuApePat, UsuApeMat, UsuEst FROM usuarios LIMIT 10");
        $users = $stmt->fetchAll();
        
        echo "<table border='1' style='border-collapse: collapse;'>";
        echo "<tr><th>UsuCod</th><th>Nombre</th><th>Apellido Pat</th><th>Apellido Mat</th><th>Estado</th></tr>";
        foreach ($users as $u) {
            echo "<tr>";
            echo "<td>" . htmlspecialchars($u['UsuCod']) . "</td>";
            echo "<td>" . htmlspecialchars($u['UsuNom']) . "</td>";
            echo "<td>" . htmlspecialchars($u['UsuApePat']) . "</td>";
            echo "<td>" . htmlspecialchars($u['UsuApeMat']) . "</td>";
            echo "<td>" . htmlspecialchars($u['UsuEst']) . "</td>";
            echo "</tr>";
        }
        echo "</table><br>";
    }
    
    // 3. ESTRUCTURA DE LA TABLA DE PERMISOS
    echo "<h3>🔐 Estructura de tabla de permisos:</h3>";
    $tables = ['___________________________permisos', 'perfil_menus'];
    
    foreach ($tables as $table) {
        try {
            echo "<h4>Tabla: $table</h4>";
            $stmt = $pdo->query("DESCRIBE $table");
            $columns = $stmt->fetchAll();
            
            echo "<table border='1' style='border-collapse: collapse;'>";
            echo "<tr><th>Campo</th><th>Tipo</th><th>Null</th><th>Key</th><th>Default</th></tr>";
            foreach ($columns as $col) {
                echo "<tr>";
                echo "<td>" . htmlspecialchars($col['Field']) . "</td>";
                echo "<td>" . htmlspecialchars($col['Type']) . "</td>";
                echo "<td>" . htmlspecialchars($col['Null']) . "</td>";
                echo "<td>" . htmlspecialchars($col['Key']) . "</td>";
                echo "<td>" . htmlspecialchars($col['Default']) . "</td>";
                echo "</tr>";
            }
            echo "</table><br>";
            
            // Mostrar algunos datos de ejemplo
            echo "<h5>📋 Datos de ejemplo (primeros 5 registros):</h5>";
            $stmt = $pdo->query("SELECT * FROM $table LIMIT 5");
            $rows = $stmt->fetchAll();
            
            if ($rows) {
                echo "<table border='1' style='border-collapse: collapse;'>";
                // Headers
                echo "<tr>";
                foreach (array_keys($rows[0]) as $key) {
                    if (!is_numeric($key)) {
                        echo "<th>" . htmlspecialchars($key) . "</th>";
                    }
                }
                echo "</tr>";
                
                // Data
                foreach ($rows as $row) {
                    echo "<tr>";
                    foreach ($row as $key => $value) {
                        if (!is_numeric($key)) {
                            echo "<td>" . htmlspecialchars($value) . "</td>";
                        }
                    }
                    echo "</tr>";
                }
                echo "</table><br>";
            } else {
                echo "<p>No hay datos en esta tabla</p>";
            }
            
        } catch (Exception $e) {
            echo "<p>❌ Error consultando tabla $table: " . htmlspecialchars($e->getMessage()) . "</p>";
        }
    }
    
    // 4. VERIFICAR PERMISOS PARA 'clagos'
    echo "<h3>🔐 Permisos para usuario 'clagos':</h3>";
    try {
        $stmt = $pdo->prepare("SELECT * FROM ___________________________permisos WHERE UsuCod = ?");
        $stmt->execute(['clagos']);
        $permissions = $stmt->fetchAll();
        
        if ($permissions) {
            echo "<p>✅ Permisos encontrados (" . count($permissions) . "):</p>";
            echo "<table border='1' style='border-collapse: collapse;'>";
            echo "<tr><th>ID</th><th>UsuCod</th><th>idmenu</th></tr>";
            foreach ($permissions as $perm) {
                echo "<tr>";
                echo "<td>" . htmlspecialchars($perm['id']) . "</td>";
                echo "<td>" . htmlspecialchars($perm['UsuCod']) . "</td>";
                echo "<td>" . htmlspecialchars($perm['idmenu']) . "</td>";
                echo "</tr>";
            }
            echo "</table><br>";
        } else {
            echo "<p>❌ No se encontraron permisos para 'clagos'</p>";
        }
    } catch (Exception $e) {
        echo "<p>❌ Error consultando permisos: " . htmlspecialchars($e->getMessage()) . "</p>";
    }
    
    // 5. ESTRUCTURA DE LA TABLA MENUS
    echo "<h3>📋 Estructura de tabla 'menus':</h3>";
    try {
        $stmt = $pdo->query("DESCRIBE menus");
        $columns = $stmt->fetchAll();
        
        echo "<table border='1' style='border-collapse: collapse;'>";
        echo "<tr><th>Campo</th><th>Tipo</th><th>Null</th><th>Key</th><th>Default</th></tr>";
        foreach ($columns as $col) {
            echo "<tr>";
            echo "<td>" . htmlspecialchars($col['Field']) . "</td>";
            echo "<td>" . htmlspecialchars($col['Type']) . "</td>";
            echo "<td>" . htmlspecialchars($col['Null']) . "</td>";
            echo "<td>" . htmlspecialchars($col['Key']) . "</td>";
            echo "<td>" . htmlspecialchars($col['Default']) . "</td>";
            echo "</tr>";
        }
        echo "</table><br>";
    } catch (Exception $e) {
        echo "<p>❌ Error consultando estructura de menus: " . htmlspecialchars($e->getMessage()) . "</p>";
    }
    
} catch (Exception $e) {
    echo "<h2>❌ ERROR DE CONEXIÓN</h2>";
    echo "<p>No se pudo conectar a la base de datos real:</p>";
    echo "<p><strong>Error:</strong> " . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<p><strong>Servidor:</strong> 50.31.188.163</p>";
    echo "<p><strong>Base de datos:</strong> xqkefqsh_alesecorp_ventas</p>";
}
?>
