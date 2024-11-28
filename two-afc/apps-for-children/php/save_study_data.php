<?php
// アップロードディレクトリの設定
$uploadDir = '/var/www/html/uploads/';

error_reporting(E_ALL);
ini_set('display_errors', 1);

// ディレクトリが存在しない場合は作成
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true); // 権限を777にして、すべてのユーザーが書き込みできるようにする
}

// 書き込み権限の確認
if (!is_writable($uploadDir)) {
  echo json_encode(['success' => false, 'error' => 'ディレクトリに書き込み権限がありません。']);
  exit;
}

// POSTデータとファイルデータの取得
$images = $_FILES['images'] ?? null;

// ファイルの存在確認
if ($images === null || empty($images['tmp_name'])) {
    echo json_encode(['success' => false, 'error' => '画像が選択されていません。']);
    exit;
}

$allowedTypes = ['image/jpeg', 'image/png', 'image/gif']; // 許可されたファイルタイプ
$maxFileSize = 10 * 1024 * 1024; // 最大ファイルサイズ (10MB)

$uploadedImagePaths = []; // アップロードされた画像パスを格納

// 画像のアップロード処理
foreach ($images['tmp_name'] as $key => $tmpName) {
    // アップロードエラーの確認
    if ($images['error'][$key] !== UPLOAD_ERR_OK) {
        $errorMessage = '画像のアップロード中にエラーが発生しました: ' . $images['error'][$key];
        echo json_encode(['success' => false, 'error' => $errorMessage]);
        exit;
    }

    // ファイルタイプとサイズの確認
    if (!in_array($images['type'][$key], $allowedTypes)) {
        echo json_encode(['success' => false, 'error' => '許可されていないファイルタイプです。']);
        exit;
    }

    if ($images['size'][$key] > $maxFileSize) {
        echo json_encode(['success' => false, 'error' => 'ファイルサイズが大きすぎます。']);
        exit;
    }

    // ユニークなファイル名を生成
    $uniqueName = uniqid() . '_' . basename($images['name'][$key]);
    $targetFilePath = $uploadDir . $uniqueName;

    // ファイルを指定されたディレクトリに移動
    if (move_uploaded_file($tmpName, $targetFilePath)) {
        $uploadedImagePaths[] = $targetFilePath; // 成功した場合、パスを配列に追加
    } else {
        echo json_encode([
            'success' => false,
            'error' => '画像のアップロードに失敗しました。',
            'debug' => [
                'tmpName' => $tmpName,
                'targetFilePath' => $targetFilePath,
                'is_writable' => is_writable($uploadDir),
                'files' => $_FILES, // POSTデータの構造確認用
            ],
        ]);
        exit;
    }
}

// 成功した場合のレスポンス
echo json_encode([
    'success' => true,
    'message' => '画像が正常にアップロードされました。',
    'uploadedPaths' => $uploadedImagePaths, // アップロードされた画像パスを含める
]);