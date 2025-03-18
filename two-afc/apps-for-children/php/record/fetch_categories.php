<?php
session_start();
require '../db_connection.php';

header('Content-Type: application/json');

if (!isset($_SESSION['username'])) {
    echo json_encode(['error' => 'User not logged in']);
    exit;
}

try {
    $pdo = getDatabaseConnection();
    $username = $_SESSION['username'];

    // プリペアドステートメントを正しく使う
    $stmt = $pdo->prepare("SELECT category_name FROM categories WHERE username = :username");
    $stmt->execute([':username' => $username]);

    // 結果を取得し、単純な配列に変換
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if ($_SESSION['language'] == 'ja') {
        array_unshift($categories, ['category_name' => '全て']);
    } elseif ($_SESSION['language'] == 'en') {
        array_unshift($categories, ['category_name' => 'ALL']);
    }

    echo json_encode($categories);
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}