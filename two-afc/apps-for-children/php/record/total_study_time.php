<?php
session_start();
require '../db_connection.php';

header('Content-Type: application/json');

if (!isset($_SESSION['username'])) {
    echo json_encode(['error' => 'User not logged in']);
    exit;
}

try {
    $pdo = getDatabaseConnection();
    $username = $_SESSION['username'];
    $category = $_GET['category'];

    if ($category == '全て' | $category == 'ALL') {
        $stmt = $pdo->prepare("
            SELECT SUM(TIME_TO_SEC(study_time)) AS total_seconds
            FROM study_data
            WHERE username = :username
        ");
        $stmt->execute([':username' => $username]);
    } else {
        $stmt = $pdo->prepare("
            SELECT SUM(TIME_TO_SEC(study_time)) AS total_seconds
            FROM study_data
            WHERE username = :username AND category = :category
        ");
        $stmt->execute([':username' => $username, ':category' => $category]);
    }

    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    $total_seconds = $result['total_seconds'] ?? 0;

    // 秒を「時間・分」に変換
    $hours = floor($total_seconds / 3600);
    $minutes = floor(($total_seconds % 3600) / 60);
    echo json_encode([
        'hours' => $hours,
        'minutes' => $minutes
    ]);
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}