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

try {
    $pdo = getDatabaseConnection();
    
    // ログを追加: クエリ開始前
    error_log("Attempting to fetch images for user: " . $username);
    
    $sql = "SELECT images FROM study_data WHERE username = :username";
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':username', $username, PDO::PARAM_STR);
    $stmt->execute();

    $images = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // 画像ファイルのパスをと結合
        $images[] = $row['images']; // /var/www/html/uploads/hoge.png
    }

    // カテゴリーを取得するクエリ
    $sqlCategories = "SELECT category_name FROM categories WHERE username = :username";
    $stmtCategories = $pdo->prepare($sqlCategories);
    $stmtCategories->bindParam(':username', $username, PDO::PARAM_STR);
    $stmtCategories->execute();

    $categories = [];
    while($row = $stmtCategories->fetch(PDO::FETCH_ASSOC)){
      $categories[] = $row['category_name'];
    }


    if (empty($images)) {
        echo json_encode(['error' => 'No images found']);
    } else {
      echo json_encode([
        'images' => $images,
        'categories' => $categories
      ]);
    }
} catch (PDOException $e) {
    // エラーをログに記録
    error_log("Database error: " . $e->getMessage());
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    error_log(mysqli_connect_error());
}