<?php
session_start();
require './php/db_connection.php';

if (!isset($_GET['token'])) {
    header('Location: ./index.php');
    exit();
}

$token = $_GET['token'];

// データベース接続
$pdo = getDatabaseConnection();
$stmt = $pdo->prepare("SELECT email, expires_at FROM email_verification WHERE token = ?");
$stmt->execute([$token]);
$row = $stmt->fetch();

if (!$row) {
    header('Location: ./index.php');
    exit();
}

// 有効期限チェック
if (strtotime($row['expires_at']) < time()) {
    header('Location: ./index.php');
    exit();
}

// トークンが正しければ、アカウント作成フォームへリダイレクト
header("Location: create_account.php?email=" . urlencode($row['email']));
exit();