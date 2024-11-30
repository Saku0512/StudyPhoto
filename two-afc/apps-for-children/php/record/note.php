<?php
session_start();

ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

require_once '../db_connection.php';

if (!isset($_SESSION['username'])) {
    echo json_encode(['error' => 'User not logged in']);
    exit;
}

$username = $_SESSION['username'];
$category = isset($_GET['category']) ? $_GET['category'] : null;

if (!$category) {
    echo json_encode(['error' => 'Category not provided']);
    exit;
}

try {
    $pdo = getDatabaseConnection();
    
    // ログを追加
    error_log("Fetching images for user: $username, category: $category");
    
    $sql = "SELECT images 
            FROM study_data 
            WHERE username = :username 
              AND category = :category";
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':username', $username, PDO::PARAM_STR);
    $stmt->bindParam(':category', $category, PDO::PARAM_STR);
    $stmt->execute();

    $images = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $images[] = $row['images']; // パスを格納
    }

    if (empty($images)) {
        echo json_encode(['error' => 'No images found for this category']);
    } else {
        echo json_encode(['images' => $images]);
    }
} catch (PDOException $e) {
    // エラーをログに記録
    error_log("Database error: " . $e->getMessage());
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}