<?php
// process_form_data.php
session_start();

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

// データベース接続ファイルの読み込み
include('db_connection.php');

// POSTデータの取得
$username = $_SESSION['username'] ?? null;
$SspentTime = $_POST['SspentTime'] ?? null;
$category = $_POST['category'] ?? '';
$studyTime = $_POST['study_time'] ?? '';

// 必須データの確認
if ($username === null) {
    echo json_encode(['success' => false, 'error' => 'user is not logged in']);
    exit;
}

if ($SspentTime === null) {
    echo json_encode(['success' => false, 'error' => 'elapsed time has not been sent']);
    exit;
}

try {
    // データベース接続の取得
    $pdo = getDatabaseConnection();

    // INSERTクエリの準備
    $sql = "INSERT INTO study_data (username, category, study_time, SspentTime, created_at) 
            VALUES (:username, :category, :study_time, :SspentTime, NOW())";

    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':username', $username);
    $stmt->bindParam(':category', $category);
    $stmt->bindParam(':study_time', $studyTime);
    $stmt->bindParam(':SspentTime', $SspentTime);

    // クエリの実行
    $stmt->execute();

    // 自動生成されたID をセッションに保存
    $_SESSION['lastInsertId'] = $pdo->lastInsertId();

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    echo json_encode([ 
        'success' => false, 
        'error' => 'データベースエラー: ' . $e->getMessage(), 
    ]);
}