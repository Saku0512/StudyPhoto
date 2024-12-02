<?php
session_start();
require '../db_connection.php';


header('Content-Type: application/json'); // JSON レスポンス

try {
    if (!isset($_SESSION['username'])) {
        throw new Exception("User not logged in");
    }

    $category_name = $_POST['category_name'] ?? '';
    $username = $_SESSION['username'] ?? null;

    if (empty($category_name)) {
        throw new Exception("カテゴリー名が必要です");
    }

    if ($username === null) {
        throw new Exception("ユーザー名が不明です");
    }

    $pdo = getDatabaseConnection();

    // SQL 実行
    $stmt = $pdo->prepare("INSERT INTO categories (category_name, username) VALUES (:category_name, :username)");
    $stmt->execute(['category_name' => $category_name, 'username' => $username]);

    echo json_encode(["status" => "success"]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Error: " . $e->getMessage()]);
}