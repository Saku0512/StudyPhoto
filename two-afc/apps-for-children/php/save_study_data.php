<?php
session_start();

ini_set('display_errors', 1);
error_reporting(E_ALL);
// データベース接続ファイルの読み込み
include('db_connection.php');

// アップロードディレクトリの設定
$uploadDir = '/var/www/html/uploads/';

// ディレクトリが存在しない場合は作成
if (!is_dir($uploadDir)) {
    if (!mkdir($uploadDir, 0777, true)) {
        echo json_encode(['success' => false, 'error' => 'ディレクトリの作成に失敗しました。']);
        exit;
    }
}

// 書き込み権限の確認
if (!is_writable($uploadDir)) {
    echo json_encode(['success' => false, 'error' => 'ディレクトリに書き込み権限がありません。']);
    exit;
}

// POSTデータとファイルデータの取得
$images = $_FILES['images'] ?? null;
$username = $_SESSION['username'] ?? null;
$SspentTime = $_POST['SspentTime'] ?? null;  // 追加: 経過時間（SspentTime）の取得

// 必須データの確認
if ($username === null) {
    echo json_encode(['success' => false, 'error' => 'ユーザーがログインしていません。']);
    exit;
}

if ($images === null || empty($images['tmp_name'])) {
    echo json_encode(['success' => false, 'error' => '画像が選択されていません。']);
    exit;
}

if ($SspentTime === null) {
    echo json_encode(['success' => false, 'error' => '経過時間が送信されていません。']);
    exit;
}

$allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/PNG', 'image/JPG', 'image/JPEG', 'image/GIF']; // 許可されたファイルタイプ
$maxFileSize = 10 * 1024 * 1024 * 8; // 最大ファイルサイズ (10MB)

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
    $fileType = mime_content_type($tmpName); // MIMEタイプを取得
    if (!in_array($fileType, $allowedTypes)) {
        echo json_encode(['success' => false, 'error' => "許可されていないファイルタイプです: $fileType"]);
        exit;
    }

    if ($images['size'][$key] > $maxFileSize) {
        echo json_encode([ 
            'success' => false, 
            'error' => 'ファイルサイズが大きすぎます。許可されている最大サイズは ' . ($maxFileSize / 1024 / 1024) . ' MB です。' 
        ]);
        exit;
    }
    if ($images['error'][$key] === UPLOAD_ERR_INI_SIZE) {
        echo json_encode([ 
            'success' => false, 
            'error' => 'ファイルサイズがサーバーで許可されている最大値を超えています。' 
        ]);
        exit;
    }

    // ユニークなファイル名を生成
    $extension = strtolower(pathinfo($images['name'][$key], PATHINFO_EXTENSION));
    $uniqueName = uniqid() . '.' . $extension;
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
                'files' => $_FILES, 
            ], 
        ]);
        exit;
    }
}

// 画像パスを暗号化
$encryptedImagePaths = array_map('base64_encode', $uploadedImagePaths);
$encryptedImages = implode(",", $encryptedImagePaths);

// その他のPOSTデータ
$category = $_POST['category'] ?? '';
$studyTime = $_POST['study_time'] ?? '';

try {
    // データベース接続の取得
    $pdo = getDatabaseConnection();

    // INSERTクエリの準備
    $sql = "INSERT INTO study_data (username, category, study_time, images, SspentTime, created_at) 
            VALUES (:username, :category, :study_time, :images, :SspentTime, NOW())";

    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':username', $username);
    $stmt->bindParam(':category', $category);
    $stmt->bindParam(':study_time', $studyTime);
    $stmt->bindParam(':images', $encryptedImages);
    $stmt->bindParam(':SspentTime', $SspentTime); // 変更: SspentTimeをバインド

    // クエリの実行
    $stmt->execute();

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    echo json_encode([ 
        'success' => false, 
        'error' => 'データベースエラー: ' . $e->getMessage(), 
    ]);
}