<?php
require_once 'config.php';

// Función para logging de errores
function logError($message, $context = []) {
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] $message";
    if (!empty($context)) {
        $logMessage .= " Context: " . json_encode($context);
    }
    error_log($logMessage);
}

// Función para logging de accesos
function logAccess($username, $success, $ip = null) {
    $timestamp = date('Y-m-d H:i:s');
    $ip = $ip ?: ($_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown');
    $status = $success ? 'SUCCESS' : 'FAILED';
    $logMessage = "[$timestamp] LOGIN $status - User: $username, IP: $ip";
    error_log($logMessage);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendErrorResponse('Method not allowed', 405);
}

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['username']) || !isset($input['password'])) {
    sendErrorResponse('Username and password are required');
}

$username = trim($input['username']);
$password = trim($input['password']);

if (empty($username) || empty($password)) {
    sendErrorResponse('Username and password cannot be empty');
}

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    // Logging del intento de login
    logAccess($username, false);
    
    // Verificar credenciales del usuario
    $stmt = $conn->prepare("
        SELECT u.UsuCod, u.UsuNom, u.UsuApePat, u.UsuApeMat, u.UsuEmail, u.UsuPerfil, u.idperfil, u.UsuEst
        FROM usuarios u 
        WHERE u.UsuCod = ? AND u.UsuClave = ? AND u.UsuEst = '1'
    ");
    
    $stmt->execute([$username, $password]);
    $user = $stmt->fetch();
    
    if (!$user) {
        logError("Login failed for user: $username", ['reason' => 'invalid_credentials']);
        sendErrorResponse('Invalid credentials or inactive user', 401);
    }
    
    // Obtener permisos directos del usuario
    $stmt = $conn->prepare("
        SELECT DISTINCT p.idmenu 
        FROM usuario_permisos p 
        WHERE p.UsuCod = ?
    ");
    
    $stmt->execute([$username]);
    $userPermissions = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    // Obtener permisos del perfil del usuario
    $profilePermissions = [];
    if (!empty($user['idperfil'])) {
        $stmt = $conn->prepare("
            SELECT DISTINCT pm.idmenu 
            FROM perfil_menus pm 
            WHERE pm.idperfil = ?
        ");
        
        $stmt->execute([$user['idperfil']]);
        $profilePermissions = $stmt->fetchAll(PDO::FETCH_COLUMN);
    }
    
    // Combinar permisos del usuario y del perfil
    $allPermissions = array_unique(array_merge($userPermissions, $profilePermissions));
    
    // Generar token de sesión
    $sessionToken = bin2hex(random_bytes(32));
    
    // Logging del login exitoso
    logAccess($username, true);
    logError("Successful login for user: $username", [
        'user_permissions' => count($userPermissions),
        'profile_permissions' => count($profilePermissions),
        'total_permissions' => count($allPermissions)
    ]);
    
    sendJsonResponse([
        'success' => true,
        'user' => [
            'UsuCod' => $user['UsuCod'],
            'UsuNom' => $user['UsuNom'],
            'UsuApePat' => $user['UsuApePat'],
            'UsuApeMat' => $user['UsuApeMat'],
            'UsuEmail' => $user['UsuEmail'],
            'UsuPerfil' => $user['UsuPerfil'],
            'fullName' => trim($user['UsuNom'] . ' ' . $user['UsuApePat'] . ' ' . $user['UsuApeMat'])
        ],
        'permissions' => array_map('intval', $allPermissions),
        'token' => $sessionToken,
        'login_time' => date('c'),
        'permissions_breakdown' => [
            'user_permissions' => count($userPermissions),
            'profile_permissions' => count($profilePermissions),
            'total_permissions' => count($allPermissions)
        ]
    ]);
    
} catch (PDOException $e) {
    logError("Database error during login", ['error' => $e->getMessage(), 'user' => $username]);
    sendErrorResponse('Database error occurred', 500);
} catch (Exception $e) {
    logError("General error during login", ['error' => $e->getMessage(), 'user' => $username]);
    sendErrorResponse('Server error occurred', 500);
}
?>
