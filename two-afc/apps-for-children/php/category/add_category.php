<?php
session_start();
require '../db_connection.php';


header('Content-Type: application/json'); // JSON レスポンス

/**
 * カテゴリー名のバリデーション
 * 
 * @param string $category_name
 * @return string クリーンなカテゴリー名
 * @throws Exception バリデーションエラー時に例外をスロー
 */
function validateCategoryName($category_name) {
    $category_name = trim($category_name);

    if (empty($category_name)) {
        echo json_encode(["status" => "error", "message" => "カテゴリー名が必要です"]);
        exit();
    }
    
    if (mb_strlen($category_name) > 255) {
        echo json_encode(["status" => "error", "message" => "カテゴリー名は255文字以内で入力してください"]);
        exit();
    }

    if (!preg_match('/^[a-zA-Z0-9ぁ-んァ-ヶ一-龥ー\s\-]+$/u', $category_name)) {
        echo json_encode(["status" => "error", "message" => "カテゴリー名に使用できない文字が含まれています"]);
        exit();
    }

    return $category_name;
}

try {
    if (!isset($_SESSION['username'])) {
        throw new Exception("User not logged in");
    }

    $category_name = $_POST['category_name'] ?? '';
    $username = $_SESSION['username'] ?? null;

    if ($username === null) {
        throw new Exception("ユーザー名が不明です");
    }

    $category_name = validateCategoryName($category_name);

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