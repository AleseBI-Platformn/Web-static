<?php
require_once 'config.php';

try {
    // Test database connection
    if (testConnection()) {
        sendJsonResponse([
            'success' => true,
            'message' => 'Database connection successful',
            'server' => '50.31.188.163:3306',
            'database' => 'xqkefqsh_alesecorp_ventas',
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    } else {
        sendErrorResponse('Database connection failed', 500);
    }
} catch (Exception $e) {
    sendErrorResponse('Connection test error: ' . $e->getMessage(), 500);
}
?>
