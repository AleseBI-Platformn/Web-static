<?php
/**
 * API Directa para ALESE CORP
 * Conexión directa sin fallbacks
 * Autor: Sistema BI ALESE CORP
 * Fecha: Julio 2025
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Habilitar reporte de errores para desarrollo
error_reporting(E_ALL);
ini_set('display_errors', 1);

/**
 * Clase para manejo de conexión directa a base de datos
 */
class AleseCorpDatabase {
    private $connection;
    
    public function __construct($config) {
        try {
            $dsn = "mysql:host={$config['host']};port={$config['port']};dbname={$config['database']};charset=utf8mb4";
            
            $this->connection = new PDO($dsn, $config['user'], $config['password'], [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
            ]);
            
            error_log("✅ Conexión exitosa a base de datos ALESE CORP");
        } catch (PDOException $e) {
            error_log("❌ Error conectando a base de datos: " . $e->getMessage());
            throw new Exception("Error de conexión a la base de datos: " . $e->getMessage());
        }
    }
    
    public function getConnection() {
        return $this->connection;
    }
    
    /**
     * Autenticar usuario
     */
    public function authenticateUser($username, $password) {
        try {
            $stmt = $this->connection->prepare("
                SELECT 
                    UsuCod, UsuNom, UsuApePat, UsuApeMat, UsuEmail, 
                    UsuPerfil, idperfil, UsuEst
                FROM usuarios 
                WHERE UsuCod = ? AND UsuClave = ? AND UsuEst = 'act'
            ");
            
            $stmt->execute([$username, $password]);
            $user = $stmt->fetch();
            
            if (!$user) {
                return ['success' => false, 'message' => 'Credenciales incorrectas o usuario inactivo'];
            }
            
            // Obtener permisos directos del usuario
            $userPermissions = $this->getUserPermissions($username);
            
            // Obtener permisos del perfil
            $profilePermissions = [];
            if (!empty($user['idperfil'])) {
                $profilePermissions = $this->getProfilePermissions($user['idperfil']);
            }
            
            // Combinar permisos
            $allPermissions = array_unique(array_merge($userPermissions, $profilePermissions));
            
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
            
            return [
                'success' => true,
                'user' => $userData,
                'permissions' => array_map('intval', $allPermissions),
                'token' => bin2hex(random_bytes(32)),
                'timestamp' => date('c')
            ];
            
        } catch (Exception $e) {
            error_log("❌ Error en autenticación: " . $e->getMessage());
            return ['success' => false, 'message' => 'Error interno del servidor'];
        }
    }
    
    /**
     * Obtener permisos directos del usuario
     */
    private function getUserPermissions($username) {
        $stmt = $this->connection->prepare("
            SELECT DISTINCT idmenu 
            FROM ___________________________permisos 
            WHERE UsuCod = ?
        ");
        $stmt->execute([$username]);
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }
    
    /**
     * Obtener permisos del perfil
     */
    private function getProfilePermissions($profileId) {
        $stmt = $this->connection->prepare("
            SELECT DISTINCT idmenu 
            FROM perfil_menus 
            WHERE idperfil = ?
        ");
        $stmt->execute([$profileId]);
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }
    
    /**
     * Obtener menús basados en permisos
     */
    public function getMenus($permissions) {
        try {
            if (empty($permissions)) {
                return ['success' => true, 'menus' => []];
            }
            
            $placeholders = str_repeat('?,', count($permissions) - 1) . '?';
            
            $stmt = $this->connection->prepare("
                SELECT 
                    idmenu, menu, vista, icono, estado, url, ancho, alto, parent
                FROM menus 
                WHERE idmenu IN ($placeholders) AND estado = '1'
                ORDER BY parent ASC, idmenu ASC
            ");
            
            $stmt->execute($permissions);
            $menus = $stmt->fetchAll();
            
            // Organizar en estructura jerárquica
            $menuTree = $this->buildMenuTree($menus);
            
            error_log("✅ Menús obtenidos: " . count($menus) . " items");
            
            return [
                'success' => true,
                'menus' => $menuTree,
                'total' => count($menus)
            ];
            
        } catch (Exception $e) {
            error_log("❌ Error obteniendo menús: " . $e->getMessage());
            return ['success' => false, 'message' => 'Error al obtener menús'];
        }
    }
    
    /**
     * Construir árbol jerárquico de menús
     */
    private function buildMenuTree($menus) {
        $menuMap = [];
        $menuTree = [];
        
        // Crear mapa de menús
        foreach ($menus as $menu) {
            $menuMap[$menu['idmenu']] = $menu;
            $menuMap[$menu['idmenu']]['children'] = [];
        }
        
        // Organizar en estructura padre-hijo
        foreach ($menus as $menu) {
            if ($menu['parent'] === null || $menu['parent'] === 0) {
                $menuTree[] = &$menuMap[$menu['idmenu']];
            } else {
                if (isset($menuMap[$menu['parent']])) {
                    $menuMap[$menu['parent']]['children'][] = &$menuMap[$menu['idmenu']];
                }
            }
        }
        
        return $menuTree;
    }
    
    /**
     * Probar conexión
     */
    public function testConnection() {
        try {
            $stmt = $this->connection->prepare("SELECT 1 as test");
            $stmt->execute();
            $result = $stmt->fetch();
            return ['success' => true, 'message' => 'Conexión exitosa'];
        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
}

/**
 * Función para enviar respuesta JSON
 */
function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

// Procesar solicitudes
try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendResponse(['success' => false, 'message' => 'Solo se permiten solicitudes POST'], 405);
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['action'])) {
        sendResponse(['success' => false, 'message' => 'Acción requerida'], 400);
    }
    
    if (!isset($input['db_config'])) {
        sendResponse(['success' => false, 'message' => 'Configuración de base de datos requerida'], 400);
    }
    
    // Crear conexión a la base de datos
    $db = new AleseCorpDatabase($input['db_config']);
    
    switch ($input['action']) {
        case 'login':
            if (!isset($input['username']) || !isset($input['password'])) {
                sendResponse(['success' => false, 'message' => 'Usuario y contraseña requeridos'], 400);
            }
            
            $result = $db->authenticateUser($input['username'], $input['password']);
            sendResponse($result);
            break;
            
        case 'get_menus':
            if (!isset($input['permissions']) || !is_array($input['permissions'])) {
                sendResponse(['success' => false, 'message' => 'Permisos requeridos'], 400);
            }
            
            $result = $db->getMenus($input['permissions']);
            sendResponse($result);
            break;
            
        case 'test_connection':
            $result = $db->testConnection();
            sendResponse($result);
            break;
            
        default:
            sendResponse(['success' => false, 'message' => 'Acción no válida'], 400);
    }
    
} catch (Exception $e) {
    error_log("❌ Error general: " . $e->getMessage());
    sendResponse(['success' => false, 'message' => 'Error interno del servidor'], 500);
}
?>
