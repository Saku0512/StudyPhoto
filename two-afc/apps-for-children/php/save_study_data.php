<?php
require 'db_connection.php'; // データベース接続を含める

// POSTデータの取得
$category = $_POST['category'] ?? null;
$study_time = $_POST['study_time'] ?? null;
$images = $_FILES['images'] ?? null;

if ($images === null) {
    echo json_encode(['success' => false, 'error' => '画像が選択されていません。']);
    exit;
}

// アップロードディレクトリの設定
$uploadDir = '/var/www/html/uploads/';
$uploadedImagePaths = [];

// 画像のアップロード処理
foreach ($images['tmp_name'] as $key => $tmpName) {
    $targetFilePath = $uploadDir . basename($images['name'][$key]);

    if (move_uploaded_file($tmpName, $targetFilePath)) {
        // アップロード成功
        $uploadedImagePaths[] = $targetFilePath; // 成功した場合にパスを追加
    } else {
        echo json_encode(['success' => false, 'error' => '画像のアップロードに失敗しました。']);
        exit;
    }
}

// データベースへの保存
try {
    $stmt = $pdo->prepare("INSERT INTO study_data (category, study_time, images) VALUES (:category, :study_time, :images)");
    $stmt->bindParam(':category', $category);
    $stmt->bindParam(':study_time', $study_time);
    $stmt->bindParam(':images', json_encode(value: $uploadedImagePaths)); // 配列をJSON形式で保存

    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'データの保存に失敗しました。']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'データベースエラー: ' . $e->getMessage()]);
}