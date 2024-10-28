<?php
session_start();
if (!isset($_SESSION['username'])) {
    echo json_encode(["status" => "error", "message" => "User not logged in"]);
    exit();
}

$category_name = $_POST['category_name'] ?? '';
$username = $_SESSION['username'] ?? '';

if (empty($category_name)) {
    echo json_encode(["status" => "error", "message" => "カテゴリー名が必要です。"]);
    exit();
}

try {
    $pdo = new PDO('mysql:host=localhost;dbname=childapp_test', 'childapp_user', 'sdTJRTPutuXQ-Wlb2WBVE');
    $stmt = $pdo->prepare("INSERT INTO categories (category_name, username) VALUES (:category_name, :username)");
    $stmt->execute(['category_name' => $category_name, 'username' => $username]);
    echo json_encode(["status" => "success"]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}