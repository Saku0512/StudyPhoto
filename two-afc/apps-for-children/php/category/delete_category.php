<?php
session_start();
$username = $_SESSION['username'];
$category_id = $_POST['category_id'];

try {
    $pdo = new PDO('mysql:host=localhost;dbname=childapp_test', 'childapp_user', 'sdTJRTPutuXQ-Wlb2WBVE');
    $stmt = $pdo->prepare("DELETE FROM user_categories WHERE id = :category_id AND username = :username");
    $stmt->execute(['category_id' => $category_id, 'username' => $username]);
    echo json_encode(["status" => "success"]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}