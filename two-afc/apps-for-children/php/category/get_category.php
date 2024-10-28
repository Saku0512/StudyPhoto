<?php
session_start();
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// データベース接続ファイルをインクルード
require '../db_connection.php'; 

$username = $_SESSION['username'];

// カテゴリーを取得するためのSQLクエリ
$sql = "SELECT category_name FROM categories WHERE username = ?";
$stmt = $pdo->prepare($sql); // ここを$pdoに変更
$stmt->execute([$username]);
$categories = $stmt->fetchAll(PDO::FETCH_ASSOC); // 結果を配列として取得

// JSONレスポンスを出力
header('Content-Type: application/json');
echo json_encode($categories);