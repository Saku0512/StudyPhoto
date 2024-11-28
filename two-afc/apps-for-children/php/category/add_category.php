<?php
session_start();
require_once 'db_connection.php'; // db_connection.phpをインクルード

if (!isset($_SESSION['username'])) {
    echo json_encode(["status" => "error", "message" => "User not logged in"]);
    exit();
}

$category_name = $_POST['category_name'] ?? '';
$username = $_SESSION['username'] ?? null;

if ($username === null) {
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
    
    $stmt = $pdo->prepare("INSERT INTO categories (category_name, username) VALUES (:category_name, :username)");
    $stmt->execute(['category_name' => $category_name, 'username' => $username]);
    
    echo json_encode(["status" => "success"]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}