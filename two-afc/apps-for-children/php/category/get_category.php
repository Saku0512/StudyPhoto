<?php
session_start();
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// データベース接続ファイルをインクルード
require '../db_connection.php'; 

$username = $_SESSION['username'];

try {
    // カテゴリーを取得するためのSQLクエリ
    $stmt = $pdo->prepare("SELECT category_name FROM user_categories WHERE username = ?");
    $stmt->execute([$username]);
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // JSONレスポンスを出力
    header('Content-Type: application/json');
    echo json_encode($categories);
} catch (PDOException $e) {
    // エラーメッセージをJSON形式で返す
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}