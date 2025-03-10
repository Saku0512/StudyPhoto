<?php
session_start();
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// データベース接続ファイルをインクルード
require '../db_connection.php'; // db_connection.phpをインクルード

if (!isset($_SESSION['username'])) {
    echo json_encode(["status" => "error", "message" => "User not logged in"]);
    exit();
}

$username = $_SESSION['username'];

try {
    // db_connection.php の getDatabaseConnection() を使用
    $pdo = getDatabaseConnection();

    // カテゴリーを取得するSQLクエリ
    $sql = "SELECT category_name FROM categories WHERE username = ?";
    $stmt = $pdo->prepare($sql); // ここを$pdoに変更
    $stmt->execute([$username]);

    // 結果を配列として取得
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // JSONレスポンスを出力
    header('Content-Type: application/json');
    echo json_encode($categories);

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}