<?php
session_start();
require_once 'db_connection.php'; // db_connection.phpをインクルード

if (!isset($_SESSION['username'])) {
    echo json_encode(["status" => "error", "message" => "User not logged in"]);
    exit();
}

$category_name = $_POST['category_name'] ?? '';
$username = $_SESSION['username'] ?? null;

if ($username == null) {
    header('Location: ../../index.php');
    exit;
}

if (empty($category_name)) {
    echo json_encode(["status" => "error", "message" => "カテゴリー名が必要です。"]);
    exit();
}

try {
    // db_connection.php の getDatabaseConnection() を使用
    $pdo = getDatabaseConnection();

    $stmt = $pdo->prepare("DELETE FROM categories WHERE category_name = :category_name AND username = :username");
    $stmt->execute(['category_name' => $category_name, 'username' => $username]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error", "message" => "カテゴリーが見つかりませんでした。"]);
    }
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}