<?php
session_start();
$username = $_SESSION['username'];
$category_name = $_POST['category_name'];

try {
    $pdo = new PDO('mysql:host=localhost;dbname=childapp_test', 'childapp_user', 'sdTJRTPutuXQ-Wlb2WBVE');
    $stmt = $pdo->prepare("INSERT INTO user_categories (username, category_name) VALUES (:username, :category_name)");
    $stmt->execute(['username' => $username, 'category_name' => $category_name]);
    echo json_encode(["status" => "success"]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}