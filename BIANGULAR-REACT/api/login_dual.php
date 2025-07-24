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
    
    // Conexión DIRECTA a BD de producción
    $pdo = getDbConnection();
    
    // CONSULTA EXACTA según esquema real de la BD
    $stmt = $pdo->prepare("
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
    
    $stmt->execute([$username]);
    $user = $stmt->fetch();
    
    debugLog("RESULTADO CONSULTA USUARIO", [
        'username' => $username,
        'encontrado' => $user ? 'SÍ' : 'NO',
        'estado' => $user ? $user['UsuEst'] : 'N/A',
        'tiene_clave' => $user ? (!empty($user['UsuClave']) ? 'SÍ' : 'NO') : 'N/A'
    ]);
    
    // Verificar si usuario existe
    if (!$user) {
        debugLog("USUARIO NO ENCONTRADO EN BD", ['username' => $username]);
        sendResponse(false, 'Usuario no encontrado en la base de datos', null, 401);
    }
    
    // Verificar si usuario está activo
    if ($user['UsuEst'] !== 'act' && $user['UsuEst'] !== '1') {
        debugLog("USUARIO INACTIVO", [
            'username' => $username,
            'estado' => $user['UsuEst']
        ]);
        sendResponse(false, 'Usuario inactivo', null, 401);
    }
    
    // VERIFICAR CONTRASEÑA - probando todos los hashes posibles
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
    
    debugLog("VERIFICACIÓN CONTRASEÑA", [
        'username' => $username,
        'bd_hash_inicio' => substr($dbPassword, 0, 10) . '...',
        'bd_hash_longitud' => strlen($dbPassword),
        'md5_generado' => substr($md5Hash, 0, 10) . '...',
        'sha1_generado' => substr($sha1Hash, 0, 10) . '...',
        'hash_detectado' => $hashUsed,
        'contraseña_válida' => $passwordValid ? 'SÍ' : 'NO'
    ]);
    
    if (!$passwordValid) {
        debugLog("CONTRASEÑA INCORRECTA", [
            'username' => $username,
            'intentos' => ['MD5', 'SHA1', 'PLAIN', 'BCRYPT']
        ]);
        sendResponse(false, 'Contraseña incorrecta', null, 401);
    }
    
    // OBTENER PERMISOS desde perfil_menus (NO permisos individuales)
    $stmt = $pdo->prepare("
        SELECT DISTINCT idmenu
        FROM perfil_menus
        WHERE idperfil = ?
        ORDER BY idmenu ASC
    ");
    
    $stmt->execute([$user['idperfil']]);
    $permissions = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    debugLog("PERMISOS OBTENIDOS desde perfil_menus", [
        'username' => $username,
        'idperfil' => $user['idperfil'],
        'total_permisos' => count($permissions),
        'permisos' => $permissions
    ]);
    
    // TOKEN DE SESIÓN
    $token = base64_encode($username . ':' . time() . ':PROD:' . DB_HOST);
    
    // RESPUESTA FINAL - incluyendo información del perfil
    $userData = [
        'UsuCod' => $user['UsuCod'],
        'UsuNom' => $user['UsuNom'],
        'UsuApePat' => $user['UsuApePat'],
        'UsuApeMat' => $user['UsuApeMat'],
        'UsuEmail' => $user['UsuEmail'],
        'UsuPerfil' => $user['UsuPerfil'],
        'idperfil' => $user['idperfil'], // Importante para permisos
        'fullName' => $user['fullName']
    ];
    
    debugLog("LOGIN EXITOSO - BD PRODUCCIÓN", [
        'usuario' => $username,
        'nombre_completo' => $user['fullName'],
        'perfil' => $user['UsuPerfil'],
        'idperfil' => $user['idperfil'],
        'total_permisos' => count($permissions),
        'bd_conectada' => DB_HOST . '/' . DB_NAME
    ]);
    
    sendResponse(true, 'Login exitoso - Conectado a BD de producción', [
        'user' => $userData,
        'permissions' => array_map('intval', $permissions),
        'token' => $token,
        'database_info' => [
            'host' => DB_HOST,
            'database' => DB_NAME,
            'hash_method' => $hashUsed
        ]
    ]);
    
} catch (Exception $e) {
    debugLog("ERROR CRÍTICO EN LOGIN", [
        'error' => $e->getMessage(),
        'archivo' => $e->getFile(),
        'línea' => $e->getLine(),
        'bd_host' => DB_HOST ?? 'NO_DEFINIDO',
        'bd_name' => DB_NAME ?? 'NO_DEFINIDO'
    ]);
    
    sendResponse(false, 'Error interno del servidor', [
        'debug' => ENVIRONMENT === 'local' ? [
            'error' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ] : null,
        'database_connection' => 'FAILED'
    ], 500);
}
?>
