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

    if ($category == '全て' || $category == 'ALL') {
        $stmt = $pdo->prepare("
            SELECT COUNT(*) AS study_count
            FROM study_data
            WHERE username = :username
        ");
        $stmt->execute([':username' => $username]);
    } else {
        $stmt = $pdo->prepare("
            SELECT COUNT(*) AS study_count
            FROM study_data
            WHERE username = :username AND category = :category
        ");
        $stmt->execute([':username' => $username, ':category' => $category]);
    }

    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    $study_count = $result['study_count'] ?? 0;

    echo json_encode(['study_count' => $study_count]);
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}