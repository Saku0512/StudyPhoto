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

$allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/PNG', 'image/JPG', 'image/JPEG',]; // 許可されたファイルタイプ
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

        // PDFのページサイズに合わせて画像を挿入
        if ($orientation === 'L') {
            $pdf->AddPage($orientation,[297, 210]); // 横向き
        } else {
            $pdf->AddPage($orientation, [210,297]); //縦向き
        }

        // アスペクト比を維持するためにサイズを計算
        $pageWidth = ($orientation === 'L') ? 297 : 210;
        $pageHeight = ($orientation === 'L') ? 210 : 297;
        $imageRatio = $width / $height;
        $pageRatio = $pageWidth / $pageHeight;

        // 縮小比率の調整 (余白削減)
        $scaleFactor = 1.055; // この値を調整して余白を減らす（0.95は余白を5%減らす）


        if ($imageRatio > $pageRatio) {
            // 幅に合わせて縮小
            $displayWidth = $pageWidth * $scaleFactor;
            $displayHeight = ($pageWidth / $imageRatio) * $scaleFactor;
            $x = 0;
            //$y = ($pageHeight - $displayHeight) / 2;
            $y = 0;
        } else {
            // 高さに合わせて縮小
            $displayHeight = $pageHeight * $scaleFactor;
            $displayWidth = ($pageHeight * $imageRatio) * $scaleFactor;
            //$x = ($pageWidth - $displayWidth) / 2;
            $x = 0;
            $y = 0;
        }

        // PDFのページサイズに合わせて画像を挿入
        $pdf->Image(file: $imagePath, x: $x, y: $y, w: $displayWidth, h: $displayHeight);
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
        header('Location: ../../home.php');
        exit;
    } else {
        echo json_encode(['success' => false, 'error' => 'セッションがありません。']);
        header('Location: ../../home.php');
        exit;
    }
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'databaseError: ' . $e->getMessage(),
    ]);
    header('Location: ../../home.php');
    exit;
}