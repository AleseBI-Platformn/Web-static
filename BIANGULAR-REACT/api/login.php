<?php
require_once 'config.php';

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
    
    // Verify user credentials
    $stmt = $conn->prepare("
        SELECT u.UsuCod, u.UsuNom, u.UsuApePat, u.UsuApeMat, u.UsuEmail, u.UsuPerfil, u.idperfil, u.UsuEst
        FROM usuarios u 
        WHERE u.UsuCod = ? AND u.UsuClave = ? AND u.UsuEst = '1'
    ");
    
    $stmt->execute([$username, $password]);
    $user = $stmt->fetch();
    
    if (!$user) {
        sendErrorResponse('Invalid credentials or inactive user', 401);
    }
    
    // Get user permissions using the corrected table name
    $stmt = $conn->prepare("
        SELECT DISTINCT p.idmenu 
        FROM usuario_permisos p 
        WHERE p.UsuCod = ?
    ");
    
    $stmt->execute([$username]);
    $permissions = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    // Get user profile permissions if user has a profile
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
    
    // Combine user and profile permissions
    $allPermissions = array_unique(array_merge($permissions, $profilePermissions));
    
    // Generate session token (simple approach for static sites)
    $sessionToken = bin2hex(random_bytes(32));
    $sessionData = [
        'user' => $user,
        'permissions' => $allPermissions,
        'timestamp' => time()
    ];
    
    // In a real application, you'd store this in a database or cache
    // For this example, we'll return it to the client to store in localStorage
    
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
        'permissions' => $allPermissions,
        'token' => $sessionToken
    ]);
    
} catch (PDOException $e) {
    sendErrorResponse('Database error: ' . $e->getMessage(), 500);
} catch (Exception $e) {
    sendErrorResponse('Server error: ' . $e->getMessage(), 500);
}
?>
