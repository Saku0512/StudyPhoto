<?php
session_start();

ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

require_once '../db_connection.php';

if (!isset($_SESSION['guardian_username'])) {
    echo json_encode(['error' => 'ユーザーがログインしていません']);
    exit;
}

$userName = $_SESSION['guardian_username'];

try {
    $pdo = getDatabaseConnection();
    
    // 日付を取得するクエリ
    $sql = "SELECT DISTINCT DATE(created_at) as study_date
            FROM study_data
            WHERE username = :username
            ORDER BY study_date DESC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':username', $userName, PDO::PARAM_STR);
    
    // デバッグ用ログ
    error_log("Executing query for guardian_calender.php with username: $userName");
    
    $stmt->execute();
    $dates = $stmt->fetchAll(PDO::FETCH_COLUMN);

    if ($dates === false || empty($dates)) {
        echo json_encode(['error' => 'No study dates found']);
    } else {
        // 日付を'Y-m-d'形式に整形
        $formattedDates = array_map(function($date) {
            return date('Y-m-d', strtotime($date));
        }, $dates);

        echo json_encode(['dates' => $formattedDates]);
    }
} catch (PDOException $e) {
    error_log("Database error in guardian_calender.php: " . $e->getMessage());
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
}