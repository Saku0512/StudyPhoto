<?php
session_start();

ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

require_once './db_connection.php';

if (!isset($_SESSION['guardian_username'])) {
    echo json_encode(['error' => 'User not logged in']);
    exit;
}

$userName = $_SESSION['guardian_username'];
$year = isset($_GET['year']) ? (int)$_GET['year'] : (int)date('Y');
$month = isset($_GET['month']) ? (int)$_GET['month'] : (int)date('m');

try {
    $pdo = getDatabaseConnection();
    
    // デバッグ用のログ追加
    error_log("Study Dates - User: $userName, Year: $year, Month: $month");
    
    $sql = "SELECT 
            DISTINCT DATE_FORMAT(created_at, '%Y-%m-%d') as study_date 
            FROM study_data 
            WHERE username = :username 
            AND YEAR(created_at) = :year 
            AND MONTH(created_at) = :month 
            ORDER BY study_date";
    
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':username', $userName, PDO::PARAM_STR);
    $stmt->bindParam(':year', $year, PDO::PARAM_INT);
    $stmt->bindParam(':month', $month, PDO::PARAM_INT);
    
    $stmt->execute();
    $dates = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    // デバッグ用のログ追加
    error_log("Study Dates - Query results: " . print_r($dates, true));
    
    echo json_encode([
        'dates' => $dates
    ]);

} catch (PDOException $e) {
    error_log("Study Dates - Database error: " . $e->getMessage());
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}