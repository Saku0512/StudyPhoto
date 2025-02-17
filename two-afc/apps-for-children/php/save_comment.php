<?php
session_start();
header('Content-Type: application/json');

require_once './db_connection.php';

// ユーザーがログインしていない場合はエラー
if (!isset($_SESSION['guardian_username'])) {
    echo json_encode(['error' => 'ユーザーがログインしていません']);
    exit;
}

// POSTデータの取得
$data = json_decode(file_get_contents('php://input'), true);

// データのバリデーション
if (!isset($data['comment_text']) || !isset($data['study_date'])) {
    echo json_encode(['error' => '必要なデータが不足しています']);
    exit;
}

$username = $_SESSION['guardian_username'];
$comment_text = $data['comment_text'];
$study_date = $data['study_date'];

// 日付のバリデーション
if ($study_date === 'yyyy-MM-dd') {
    echo json_encode(['error' => '日付を選択してください']);
    exit;
}

try {
    $pdo = getDatabaseConnection();
    
    // 同じ日付のコメントが既に存在するかチェック
    $checkSql = "SELECT COUNT(*) FROM comment_data 
                 WHERE username = :username 
                 AND study_date = :study_date 
                 AND is_deleted = FALSE";
    
    $checkStmt = $pdo->prepare($checkSql);
    $checkStmt->bindParam(':username', $username, PDO::PARAM_STR);
    $checkStmt->bindParam(':study_date', $study_date, PDO::PARAM_STR);
    $checkStmt->execute();
    
    if ($checkStmt->fetchColumn() > 0) {
        echo json_encode(['error' => 'この日付のコメントは既に登録されています']);
        exit;
    }
    
    // コメントを新規登録
    $sql = "INSERT INTO comment_data (username, comment_text, study_date) 
            VALUES (:username, :comment_text, :study_date)";
    $stmt = $pdo->prepare($sql);
    
    $stmt->bindParam(':username', $username, PDO::PARAM_STR);
    $stmt->bindParam(':comment_text', $comment_text, PDO::PARAM_STR);
    $stmt->bindParam(':study_date', $study_date, PDO::PARAM_STR);
    
    $stmt->execute();
    
    echo json_encode([
        'success' => true,
        'message' => 'コメントが保存されました'
    ]);

} catch (PDOException $e) {
    error_log("Database error in save_comment.php: " . $e->getMessage());
    echo json_encode([
        'error' => 'データベースエラーが発生しました',
        'details' => $e->getMessage()
    ]);
}