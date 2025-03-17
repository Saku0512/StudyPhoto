<?php
session_start();
require './php/db_connection.php';

if (!isset($_GET['token'])) {
    die('トークンが無効です');
    header('Location: ./index.php');
    exit();
}

$token = $_GET['token'];

// トークンをデータベースで検索
$pdo = getDatabaseConnection();
$stmt = $pdo->prepare("SELECT email, expires_at FROM email_verification WHERE token = ?");
$stmt->execute([$token]);
$row = $stmt->fetch();

if (!$row) {
    die('トークンが無効です');
    header('Location: ./index.php');
    exit();
}

// 有効期限のチェック
if (strtotime($row['expires_at']) < time()) {
    die('このリンクは期限切れです');
    header('Location: ./index.php');
    exit();
}

// トークンが正しければ、アカウント作成フォームへ遷移
header("Location: create_account.php?email=" . urlencode($row['email']));
exit();