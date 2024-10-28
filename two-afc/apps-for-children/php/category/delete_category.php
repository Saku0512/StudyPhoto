<?php
session_start();
if (!isset($_SESSION['username'])) {
    echo json_encode(["status" => "error", "message" => "User not logged in"]);
    exit();
}

$category_name = $_POST['category_name'] ?? '';
$username = $_SESSION['username'] ?? null;

if($username == null) {
    header('Location: ../../index.php');
}

if (empty($category_name)) {
    echo json_encode(["status" => "error", "message" => "カテゴリー名が必要です。"]);
    exit();
}

try {
    $pdo = new PDO('mysql:host=localhost;dbname=childapp_test', 'childapp_user', 'sdTJRTPutuXQ-Wlb2WBVE');
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