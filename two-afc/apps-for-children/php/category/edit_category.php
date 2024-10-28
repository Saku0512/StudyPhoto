<?php
session_start();
if (!isset($_SESSION['username'])) {
    echo json_encode(["status" => "error", "message" => "User not logged in"]);
    exit();
}

$old_category_name = $_POST['old_category_name'] ?? '';
$new_category_name = $_POST['new_category_name'] ?? '';
$username = $_SESSION['username'] ?? null;

if($username === null){
    header('Location: ../../index.php');
}

if (empty($old_category_name) || empty($new_category_name)) {
    echo json_encode(["status" => "error", "message" => "両方のカテゴリー名が必要です。"]);
    exit();
}

try {
    $pdo = new PDO('mysql:host=localhost;dbname=childapp_test', 'childapp_user', 'sdTJRTPutuXQ-Wlb2WBVE');

    $stmt = $pdo->prepare("UPDATE categories SET category_name = :new_category_name WHERE category_name = :old_category_name AND username = :username");
    $stmt->execute(['new_category_name' => $new_category_name, 'old_category_name' => $old_category_name, 'username' => $username]);
    
    if ($stmt->rowCount() > 0) {
        echo json_encode(["status" => "success"]);
    } else {
        // どの条件が一致しなかったかを表示
        echo json_encode(["status" => "error", "message" => "カテゴリーが見つかりませんでした。Old Category: $old_category_name, Username: $username"]);
    }
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}