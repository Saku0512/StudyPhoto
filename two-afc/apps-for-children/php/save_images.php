<?php
// upload_image.php
session_start();

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

// データベース接続ファイルの読み込み
include('db_connection.php');
// FPDF の読み込み
require('../../../vendor/autoload.php');
// 必要なクラスをインポート
use setasign\Fpdi\Fpdi;

// アップロードディレクトリの設定
$uploadDir = '/var/www/html/uploads/images/';
$pdfUploadDir = '/var/www/html/uploads/pdfs/';

// imagesディレクトリが存在しない場合は作成
if (!is_dir($uploadDir)) {
    if (!mkdir($uploadDir, 0777, true)) {
        echo json_encode(['success' => false, 'error' => 'ディレクトリの作成に失敗しました。']);
        exit;
    }
}
// pdfsディレクトリが存在しない場合は作成
if (!is_dir($pdfUploadDir)) {
    if (!mkdir($pdfUploadDir, 0777, true)) {
        echo json_encode(['success' => false, 'error' => 'ディレクトリの作成に失敗しました。']);
        exit;
    }
}

// 書き込み権限の確認
if (!is_writable($uploadDir)) {
    echo json_encode(['success' => false, 'error' => 'ディレクトリに書き込み権限がありません。']);
    exit;
}
if (!is_writable($pdfUploadDir)) {
    echo json_encode(['success' => false, 'error' => 'ディレクトリに書き込み権限がありません。']);
    exit;
}   

$username = $_SESSION['username'] ?? null;
// アップロードされた画像の取得
$images = [];
if (!empty($_FILES['images']['name'][0])) {
    foreach ($_FILES['images']['tmp_name'] as $key => $tmpName) {
        $fileName = $_FILES['images']['name'][$key];
        $fileTmpName = $_FILES['images']['tmp_name'][$key];
        $fileSize = $_FILES['images']['size'][$key];
        $fileType = $_FILES['images']['type'][$key];
        $images[] = [
            'name' => $fileName,
            'tmp_name' => $fileTmpName,
            'size' => $fileSize,
            'type' => $fileType
        ];
    }
}

// 画像が選ばれているかのチェック
if (empty($images)) {
    echo json_encode(['success' => false, 'error' => 'images is not selected']);
    exit;
}

$allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/PNG', 'image/JPG', 'image/JPEG', 'image/GIF']; // 許可されたファイルタイプ
$maxFileSize = 10 * 1024 * 1024 * 8; // 最大ファイルサイズ (10MB)

$uploadedImagePaths = []; // アップロードされた画像パスを格納

// 画像のアップロード処理
foreach ($images as $image) {
    $tmpName = $image['tmp_name'];
    $fileName = $image['name'];
    
    // ファイルタイプとサイズの確認
    $fileType = mime_content_type($tmpName); // MIMEタイプを取得
    if (!in_array($fileType, $allowedTypes)) {
        echo json_encode(['success' => false, 'error' => "許可されていないファイルタイプです: $fileType"]);
        exit;
    }

    if ($image['size'] > $maxFileSize) {
        echo json_encode([ 
            'success' => false, 
            'error' => 'ファイルサイズが大きすぎます。許可されている最大サイズは ' . ($maxFileSize / 1024 / 1024) . ' MB です。' 
        ]);
        exit;
    }

    // ユニークなファイル名を生成
    $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
    $uniqueName = uniqid() . '.' . $fileExtension;
    $targetFilePath = $uploadDir . $uniqueName;

    // 画像を指定したディレクトリに移動
    if (move_uploaded_file($tmpName, $targetFilePath)) {
        $uploadedImagePaths[] = $targetFilePath;
    } else {
        echo json_encode([ 
            'success' => false, 
            'error' => '画像のアップロードに失敗しました。', 
        ]);
        exit;
    }
}

// 画像をpdf化
$pdfFileName = uniqid() . '.pdf';
$pdfFilePath = $pdfUploadDir . $pdfFileName;
try {
    $pdf = new Fpdi();
    $pdf->SetAutoPageBreak(false);

    foreach ($uploadedImagePaths as $imagePath) {
        $size = getimagesize($imagePath);
        $width = $size[0];
        $height = $size[1];
        $orientation = ($width > $height) ? 'L' : 'P';

        $pdf->AddPage($orientation);
        // PDFのページサイズに合わせて画像を挿入
        $pdf->Image($imagePath, 0, 0, 210, 297);
    }

    $pdf->Output('F', $pdfFilePath); // PDFを保存
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'cannot generate PDF: ' . $e->getMessage()]);
    exit;
}
// データベースに保存
try {
    $pdo = getDatabaseConnection();
    if (isset($_SESSION['lastInsertId'])) {
        $lastInsertId = $_SESSION['lastInsertId'];

        // 画像パスを暗号化
        $encryptedImagePaths = array_map('base64_encode', $uploadedImagePaths);
        $encryptedImages = implode(",", $encryptedImagePaths);

        // PDFファイルパスを暗号化
        $encryptedPdfPath = base64_encode($pdfFilePath);
    
        // 画像保存処理
        $sql = "UPDATE study_data SET images = :images, updated_at = NOW() WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':id', $lastInsertId);
        $stmt->bindParam(':images', $encryptedPdfPath);
        $stmt->execute();

        echo json_encode(['success' => true, 'message' => 'Saved images and PDF.']);
    } else {
        echo json_encode(['success' => false, 'error' => 'セッションがありません。']);
    }
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'databaseError: ' . $e->getMessage(),
    ]);
}