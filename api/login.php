<?php
require_once 'config.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendErrorResponse('Method not allowed', 405);
    }

    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['username']) || !isset($input['password'])) {
        sendErrorResponse('Username and password are required', 400);
    }

    $username = trim($input['username']);
    $password = trim($input['password']);

    if (empty($username) || empty($password)) {
        sendErrorResponse('Username and password cannot be empty', 400);
    }

    // Connect to database
    $db = new Database();
    $pdo = $db->getConnection();

    // Check user credentials - REAL DATABASE QUERY
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
            idperfil
        FROM usuarios 
        WHERE UsuCod = ? AND UsuEst = '1'
    ");
    
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if (!$user) {
        sendErrorResponse('Invalid credentials', 401);
    }

    // Verify password (assuming it's stored as plain text or MD5)
    $passwordMatch = false;
    if ($user['UsuClave'] === $password) {
        $passwordMatch = true;
    } elseif ($user['UsuClave'] === md5($password)) {
        $passwordMatch = true;
    } elseif (password_verify($password, $user['UsuClave'])) {
        $passwordMatch = true;
    }

    if (!$passwordMatch) {
        sendErrorResponse('Invalid credentials', 401);
    }

    // Get user permissions from ___________________________permisos table
    $stmt = $pdo->prepare("
        SELECT DISTINCT idmenu 
        FROM ___________________________permisos 
        WHERE UsuCod = ?
    ");
    $stmt->execute([$user['UsuCod']]);
    $userPermissions = $stmt->fetchAll(PDO::FETCH_COLUMN);

    // Get permissions from profile if user has one
    $profilePermissions = [];
    if (!empty($user['idperfil'])) {
        $stmt = $pdo->prepare("
            SELECT DISTINCT idmenu 
            FROM perfil_menus 
            WHERE idperfil = ?
        ");
        $stmt->execute([$user['idperfil']]);
        $profilePermissions = $stmt->fetchAll(PDO::FETCH_COLUMN);
    }

    // Merge permissions
    $allPermissions = array_unique(array_merge($userPermissions, $profilePermissions));

    // Generate session token
    $token = base64_encode(json_encode([
        'user_id' => $user['UsuCod'],
        'timestamp' => time(),
        'expires' => time() + (8 * 60 * 60) // 8 hours
    ]));

    sendJsonResponse([
        'success' => true,
        'message' => 'Login successful',
        'user' => [
            'UsuCod' => $user['UsuCod'],
            'UsuNom' => $user['UsuNom'],
            'UsuApePat' => $user['UsuApePat'],
            'UsuApeMat' => $user['UsuApeMat'],
            'UsuEmail' => $user['UsuEmail'],
            'UsuPerfil' => $user['UsuPerfil'],
            'idperfil' => $user['idperfil'],
            'fullName' => trim($user['UsuNom'] . ' ' . $user['UsuApePat'] . ' ' . $user['UsuApeMat'])
        ],
        'permissions' => $allPermissions,
        'token' => $token
    ]);

} catch (Exception $e) {
    error_log("Login error: " . $e->getMessage());
    sendErrorResponse('Database connection error: ' . $e->getMessage(), 500);
}
?>
