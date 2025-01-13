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

// jsから受け取るキーをuserNameにする
try {
    $pdo = getDatabaseConnection();

    // ログを追加
    error_log("Fetching images for user: $userName");

    $sql = "SELECT category, study_time, created_at, SspentTime, images 
            FROM study_data 
            WHERE username = :username";
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':username', $userName, PDO::PARAM_STR);
    $stmt->execute();

    $images = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $images[] = [
            'category' => $row['category'],
            'study_time' => $row['study_time'],
            'study_date' => $row['created_at'],
            'SspentTime' => $row['SspentTime'],
            'image_path' => $row['images']
        ];
    }

    if (empty($images)) {
        // $imagesが空の場合は、画像が登録されていないことを通知
        echo json_encode(['message' => 'データが存在しません']);
    } else {
        echo json_encode(['images' => $images]);
    }
} catch (PDOException $e) {
    // 接続失敗時のエラーハンドリング
    error_log("Database error: " . $e->getMessage());
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}