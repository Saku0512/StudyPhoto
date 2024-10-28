<?php
session_start();
$username = $_SESSION['username'];
$category_id = $_POST['category_id'];
$new_category_name = $_POST['new_category_name'];

try {
    $pdo = new PDO('mysql:host=localhost;dbname=childapp_test', 'childapp_user', 'sdTJRTPutuXQ-Wlb2WBVE');
    $stmt = $pdo->prepare("UPDATE user_categories SET category_name = :new_category_name WHERE id = :category_id AND username = :username");
    $stmt->execute(['new_category_name' => $new_category_name, 'category_id' => $category_id, 'username' => $username]);
    echo json_encode(["status" => "success"]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}