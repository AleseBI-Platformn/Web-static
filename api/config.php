<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database configuration - REAL ALESE CORP DATABASE
class Database {
    private $host = "50.31.188.163";
    private $dbname = "xqkefqsh_alesecorp_ventas";
    private $username = "xqkefqsh_user_ventas";
    private $password = "BiAleseCorp2023";
    private $port = "3306";
    public $pdo;

    public function getConnection() {
        $this->pdo = null;
        
        try {
            $dsn = "mysql:host=" . $this->host . ";port=" . $this->port . ";dbname=" . $this->dbname . ";charset=utf8mb4";
            $this->pdo = new PDO($dsn, $this->username, $this->password);
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            error_log("Database connection error: " . $e->getMessage());
            throw new Exception("Connection failed: " . $e->getMessage());
        }

        return $this->pdo;
    }
}

// Utility functions
function sendJsonResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit();
}

function sendErrorResponse($message, $status = 500) {
    http_response_code($status);
    echo json_encode([
        'success' => false,
        'error' => $message
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

// Test database connection
function testConnection() {
    try {
        $db = new Database();
        $pdo = $db->getConnection();
        return true;
    } catch(Exception $e) {
        error_log("Database test failed: " . $e->getMessage());
        return false;
    }
}
?>
