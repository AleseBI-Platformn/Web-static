<?php
/**
 * API Login para ALESE CORP - Bluehost Compatible
 * Conexión directa con MySQL
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Solo permitir POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Solo se permiten solicitudes POST']);
    exit;
}

// Configuración de la base de datos ALESE CORP
$DB_CONFIG = [
    'host' => '50.31.188.163',
    'user' => 'xqkefqsh_user_ventas',
    'password' => 'BiAleseCorp2023',
    'database' => 'xqkefqsh_alesecorp_ventas',
    'port' => 3306
];

try {
    // Obtener datos del POST
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['username']) || !isset($input['password'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Usuario y contraseña requeridos']);
        exit;
    }
    
    $username = trim($input['username']);
    $password = trim($input['password']);
    
    // Conectar a MySQL
    $dsn = "mysql:host={$DB_CONFIG['host']};port={$DB_CONFIG['port']};dbname={$DB_CONFIG['database']};charset=utf8mb4";
    $pdo = new PDO($dsn, $DB_CONFIG['user'], $DB_CONFIG['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    
    // Autenticar usuario
    $stmt = $pdo->prepare("
        SELECT 
            UsuCod, UsuNom, UsuApePat, UsuApeMat, UsuEmail, 
            UsuPerfil, idperfil, UsuEst
        FROM usuarios 
        WHERE UsuCod = ? AND UsuClave = ? AND UsuEst = 'act'
    ");
    
    $stmt->execute([$username, $password]);
    $user = $stmt->fetch();
    
    if (!$user) {
        echo json_encode(['success' => false, 'message' => 'Credenciales incorrectas o usuario inactivo']);
        exit;
    }
    
    // Obtener permisos directos del usuario
    $stmt = $pdo->prepare("
        SELECT DISTINCT idmenu 
        FROM ___________________________permisos 
        WHERE UsuCod = ?
    ");
    $stmt->execute([$username]);
    $userPermissions = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    // Obtener permisos del perfil
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
    
    // Combinar permisos únicos
    $allPermissions = array_unique(array_merge($userPermissions, $profilePermissions));
    sort($allPermissions);
    
    // Preparar respuesta
    $userData = [
        'UsuCod' => $user['UsuCod'],
        'UsuNom' => $user['UsuNom'],
        'UsuApePat' => $user['UsuApePat'],
        'UsuApeMat' => $user['UsuApeMat'],
        'UsuEmail' => $user['UsuEmail'],
        'UsuPerfil' => $user['UsuPerfil'],
        'fullName' => trim($user['UsuNom'] . ' ' . $user['UsuApePat'] . ' ' . $user['UsuApeMat'])
    ];
    
    error_log("✅ Usuario autenticado: {$userData['fullName']} - Permisos: " . count($allPermissions));
    
    echo json_encode([
        'success' => true,
        'user' => $userData,
        'permissions' => array_map('intval', $allPermissions),
        'token' => base64_encode($username . ':' . time())
    ]);
    
} catch (PDOException $e) {
    error_log("❌ Error de base de datos: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error de conexión a la base de datos']);
} catch (Exception $e) {
    error_log("❌ Error general: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error interno del servidor']);
}
?>
