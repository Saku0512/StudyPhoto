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
require '../vendor/autoload.php';
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
if (!empty($_FILES['images'])) {
    // アップロード制限の確認
    $maxPostSize = ini_get('post_max_size');
    $maxFileSize = ini_get('upload_max_filesize');
    $contentLength = $_SERVER['CONTENT_LENGTH'];
    
    if ($contentLength > return_bytes($maxPostSize)) {
        echo json_encode(['success' => false, 'error' => "POSTサイズ制限（{$maxPostSize}）を超えています"]);
        exit;
    }
    
    foreach ($_FILES['images']['name'] as $key => $name) {
        // エラーチェックを追加
        if ($_FILES['images']['error'][$key] !== UPLOAD_ERR_OK) {
            $errorMessage = match($_FILES['images']['error'][$key]) {
                UPLOAD_ERR_INI_SIZE => 'ファイルサイズがPHPの制限を超えています',
                UPLOAD_ERR_FORM_SIZE => 'ファイルサイズがフォームの制限を超えています',
                UPLOAD_ERR_PARTIAL => 'ファイルの一部のみがアップロードされました',
                UPLOAD_ERR_NO_FILE => 'ファイルがアップロードされていません',
                default => 'アップロードエラーが発生しました'
            };
            echo json_encode(['success' => false, 'error' => $errorMessage]);
            exit;
        }

        $images[] = [
            'name' => $name,
            'tmp_name' => $_FILES['images']['tmp_name'][$key],
            'size' => $_FILES['images']['size'][$key],
            'type' => $_FILES['images']['type'][$key],
            'error' => $_FILES['images']['error'][$key]
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

    // ファイルが正常にアップロードされたか確認
    if (!is_uploaded_file($tmpName)) {
        echo json_encode(['success' => false, 'error' => "正常にアップロードされていないファイルです: $fileName"]);
        exit;
    }
    
    // ファイルタイプとサイズの確認
    $fileType = mime_content_type($tmpName); // MIMEタイプを取得
    if ($fileType === false) {
        echo json_encode(['success' => false, 'error' => "ファイルタイプの取得に失敗しました"]);
        exit;
    }
    
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

        // 画像フォーマットの確認と変換
        $imageInfo = getimagesize($imagePath);
        $tmpJpeg = null;
        
        if ($imageInfo !== false) {
            switch ($imageInfo[2]) {
                case IMAGETYPE_JPEG:
                    $tmpJpeg = $imagePath;
                    break;
                case IMAGETYPE_PNG:
                    // PNGをJPEGに変換
                    $tmpJpeg = sys_get_temp_dir() . '/' . uniqid() . '.jpg';
                    $image = imagecreatefrompng($imagePath);
                    // 透明度の処理
                    $background = imagecreatetruecolor($width, $height);
                    imagefill($background, 0, 0, imagecolorallocate($background, 255, 255, 255));
                    imagealphablending($image, true);
                    imagecopy($background, $image, 0, 0, 0, 0, $width, $height);
                    imagejpeg($background, $tmpJpeg, 100);
                    imagedestroy($image);
                    imagedestroy($background);
                    break;
                default:
                    throw new Exception('未対応の画像形式です');
            }
        }

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

        // 変換した画像を使用
        $pdf->Image($tmpJpeg, $x, $y, $displayWidth, $displayHeight);

        // 一時ファイルの削除
        if ($tmpJpeg !== $imagePath) {
            unlink($tmpJpeg);
        }
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

// ファイル先頭付近に以下の関数を追加
function return_bytes($val) {
    $val = trim($val);
    $last = strtolower($val[strlen($val)-1]);
    $val = substr($val, 0, -1);
    switch($last) {
        case 'g':
            $val *= 1024;
        case 'm':
            $val *= 1024;
        case 'k':
            $val *= 1024;
    }
    return $val;
}