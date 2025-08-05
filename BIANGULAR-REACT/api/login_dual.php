<?php
/**
 * Login DIRECTO a BD PRODUCCIÓN - ALESE CORP
 * Base de datos: 50.31.188.163 -> xqkefqsh_alesecorp_ventas
 * USA PERFIL_MENUS (NO permisos individuales) - Sistema correcto
 */

require_once 'config_dual.php';

try {
    // Obtener datos del POST
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['username']) || !isset($input['password'])) {
        sendResponse(false, 'Usuario y contraseña son requeridos', null, 400);
    }
    
    $username = trim($input['username']);
    $password = trim($input['password']);
    
    debugLog("INTENTO LOGIN BD PRODUCCIÓN", [
        'username' => $username,
        'bd_host' => DB_HOST,
        'bd_name' => DB_NAME
    ]);
    
    // Conexión a BD
    $connection = getDbConnection();
    
    // Determinar tipo de conexión y ejecutar consulta
    if ($connection === 'json_db') {
        // Usar base de datos JSON temporal
        debugLog("USANDO BASE DE DATOS JSON TEMPORAL", ['username' => $username]);
        
        $user = queryJsonDb("SELECT * FROM usuarios WHERE UsuCod = ?", [$username]);
        
        if (!$user) {
            debugLog("USUARIO NO ENCONTRADO EN JSON DB", ['username' => $username]);
            sendResponse(false, 'Usuario no encontrado en la base de datos', null, 401);
        }
        
        // Verificar contraseña
        if ($user['UsuClave'] !== $password) {
            debugLog("CONTRASEÑA INCORRECTA JSON DB", ['username' => $username]);
            sendResponse(false, 'Contraseña incorrecta', null, 401);
        }
        
        // Obtener permisos
        $permissions = queryJsonDb("SELECT idmenu FROM perfil_menus WHERE idperfil = ?", [$user['idperfil']]);
        
    } elseif (is_object($connection) && get_class($connection) === 'mysqli') {
        // Usar mysqli
        debugLog("USANDO MYSQLI", ['username' => $username]);
        
        $stmt = $connection->prepare("
            SELECT 
                UsuCod, 
                UsuNom, 
                UsuApePat, 
                UsuApeMat, 
                UsuEmail, 
                UsuClave, 
                UsuPerfil,
                UsuEst,
                idperfil,
                CONCAT(TRIM(UsuNom), ' ', TRIM(COALESCE(UsuApePat, '')), ' ', TRIM(COALESCE(UsuApeMat, ''))) as fullName
            FROM usuarios 
            WHERE UsuCod = ?
        ");
        
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();
        
        if (!$user) {
            debugLog("USUARIO NO ENCONTRADO EN MYSQLI", ['username' => $username]);
            sendResponse(false, 'Usuario no encontrado en la base de datos', null, 401);
        }
        
        // Verificar contraseña
        $dbPassword = $user['UsuClave'];
        $passwordValid = false;
        $hashUsed = '';
        
        // Hash MD5
        $md5Hash = md5($password);
        if ($dbPassword === $md5Hash) {
            $passwordValid = true;
            $hashUsed = 'MD5';
        }
        
        // Hash SHA1
        if (!$passwordValid) {
            $sha1Hash = sha1($password);
            if ($dbPassword === $sha1Hash) {
                $passwordValid = true;
                $hashUsed = 'SHA1';
            }
        }
        
        // Texto plano
        if (!$passwordValid) {
            if ($dbPassword === $password) {
                $passwordValid = true;
                $hashUsed = 'PLAIN';
            }
        }
        
        // BCrypt
        if (!$passwordValid) {
            if (password_verify($password, $dbPassword)) {
                $passwordValid = true;
                $hashUsed = 'BCRYPT';
            }
        }
        
        if (!$passwordValid) {
            debugLog("CONTRASEÑA INCORRECTA MYSQLI", ['username' => $username]);
            sendResponse(false, 'Contraseña incorrecta', null, 401);
        }
        
        // Obtener permisos
        $stmt = $connection->prepare("
            SELECT DISTINCT idmenu
            FROM perfil_menus
            WHERE idperfil = ?
            ORDER BY idmenu ASC
        ");
        
        $stmt->bind_param("i", $user['idperfil']);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $permissions = [];
        while ($row = $result->fetch_assoc()) {
            $permissions[] = $row['idmenu'];
        }
        
    } else {
        // Usar mysql_connect (deprecated)
        debugLog("USANDO MYSQL_CONNECT", ['username' => $username]);
        
        $query = "
            SELECT 
                UsuCod, 
                UsuNom, 
                UsuApePat, 
                UsuApeMat, 
                UsuEmail, 
                UsuClave, 
                UsuPerfil,
                UsuEst,
                idperfil,
                CONCAT(TRIM(UsuNom), ' ', TRIM(COALESCE(UsuApePat, '')), ' ', TRIM(COALESCE(UsuApeMat, ''))) as fullName
            FROM usuarios 
            WHERE UsuCod = '$username'
        ";
        
        $result = mysql_query($query, $connection);
        if (!$result) {
            throw new Exception('Error en consulta: ' . mysql_error($connection));
        }
        
        $user = mysql_fetch_assoc($result);
        
        if (!$user) {
            debugLog("USUARIO NO ENCONTRADO EN MYSQL_CONNECT", ['username' => $username]);
            sendResponse(false, 'Usuario no encontrado en la base de datos', null, 401);
        }
        
        // Verificar contraseña
        $dbPassword = $user['UsuClave'];
        $passwordValid = false;
        $hashUsed = '';
        
        // Hash MD5
        $md5Hash = md5($password);
        if ($dbPassword === $md5Hash) {
            $passwordValid = true;
            $hashUsed = 'MD5';
        }
        
        // Hash SHA1
        if (!$passwordValid) {
            $sha1Hash = sha1($password);
            if ($dbPassword === $sha1Hash) {
                $passwordValid = true;
                $hashUsed = 'SHA1';
            }
        }
        
        // Texto plano
        if (!$passwordValid) {
            if ($dbPassword === $password) {
                $passwordValid = true;
                $hashUsed = 'PLAIN';
            }
        }
        
        // BCrypt
        if (!$passwordValid) {
            if (password_verify($password, $dbPassword)) {
                $passwordValid = true;
                $hashUsed = 'BCRYPT';
            }
        }
        
        if (!$passwordValid) {
            debugLog("CONTRASEÑA INCORRECTA MYSQL_CONNECT", ['username' => $username]);
            sendResponse(false, 'Contraseña incorrecta', null, 401);
        }
        
        // Obtener permisos
        $query = "
            SELECT DISTINCT idmenu
            FROM perfil_menus
            WHERE idperfil = {$user['idperfil']}
            ORDER BY idmenu ASC
        ";
        
        $result = mysql_query($query, $connection);
        if (!$result) {
            throw new Exception('Error en consulta permisos: ' . mysql_error($connection));
        }
        
        $permissions = [];
        while ($row = mysql_fetch_assoc($result)) {
            $permissions[] = $row['idmenu'];
        }
    }
    
    // Verificar si usuario está activo
    if ($user['UsuEst'] !== 'act' && $user['UsuEst'] !== '1') {
        debugLog("USUARIO INACTIVO", [
            'username' => $username,
            'estado' => $user['UsuEst']
        ]);
        sendResponse(false, 'Usuario inactivo', null, 401);
    }
    
    debugLog("LOGIN EXITOSO", [
        'usuario' => $username,
        'nombre_completo' => $user['fullName'],
        'perfil' => $user['UsuPerfil'],
        'idperfil' => $user['idperfil'],
        'total_permisos' => count($permissions),
        'tipo_conexion' => $connection === 'json_db' ? 'JSON' : (is_object($connection) && get_class($connection) === 'mysqli' ? 'MYSQLI' : 'MYSQL_CONNECT')
    ]);
    
    // TOKEN DE SESIÓN
    $token = base64_encode($username . ':' . time() . ':PROD:' . DB_HOST);
    
    // RESPUESTA FINAL
    $userData = [
        'UsuCod' => $user['UsuCod'],
        'UsuNom' => $user['UsuNom'],
        'UsuApePat' => $user['UsuApePat'],
        'UsuApeMat' => $user['UsuApeMat'],
        'UsuEmail' => $user['UsuEmail'],
        'UsuPerfil' => $user['UsuPerfil'],
        'idperfil' => $user['idperfil'],
        'fullName' => $user['fullName']
    ];
    
    sendResponse(true, 'Login exitoso', [
        'user' => $userData,
        'permissions' => array_map('intval', $permissions),
        'token' => $token,
        'database_info' => [
            'host' => DB_HOST,
            'database' => DB_NAME,
            'connection_type' => $connection === 'json_db' ? 'JSON_TEMPORAL' : (is_object($connection) && get_class($connection) === 'mysqli' ? 'MYSQLI' : 'MYSQL_CONNECT')
        ]
    ]);
    
} catch (Exception $e) {
    debugLog("ERROR CRÍTICO EN LOGIN", [
        'error' => $e->getMessage(),
        'archivo' => $e->getFile(),
        'línea' => $e->getLine()
    ]);
    
    sendResponse(false, 'Error interno del servidor', [
        'debug' => ENVIRONMENT === 'local' ? [
            'error' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ] : null
    ], 500);
}
?>
