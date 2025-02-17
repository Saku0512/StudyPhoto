<?php
session_start();
header('Content-Type: application/json');

require_once '../db_connection.php';

if (!isset($_SESSION['guardian_username'])) {
    echo json_encode(['error' => 'ユーザーがログインしていません']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['comment_text']) || !isset($data['study_date']) || !isset($data['comment_id'])) {
    echo json_encode(['error' => '必要なデータが不足しています']);
    exit;
}

$username = $_SESSION['guardian_username'];
$comment_text = $data['comment_text'];
$study_date = $data['study_date'];
$comment_id = $data['comment_id'];

try {
    $pdo = getDatabaseConnection();
    
    // コメントの所有者確認
    $checkSql = "SELECT COUNT(*) FROM comment_data 
                 WHERE id = :comment_id 
                 AND username = :username 
                 AND is_deleted = FALSE";
    
    $checkStmt = $pdo->prepare($checkSql);
    $checkStmt->bindParam(':comment_id', $comment_id, PDO::PARAM_INT);
    $checkStmt->bindParam(':username', $username, PDO::PARAM_STR);
    $checkStmt->execute();
    
    if ($checkStmt->fetchColumn() === 0) {
        echo json_encode(['error' => '編集権限がないか、コメントが存在しません']);
        exit;
    }
    
    // コメントを更新
    $sql = "UPDATE comment_data 
            SET comment_text = :comment_text, 
                updated_at = CURRENT_TIMESTAMP 
            WHERE id = :comment_id";
    
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':comment_text', $comment_text, PDO::PARAM_STR);
    $stmt->bindParam(':comment_id', $comment_id, PDO::PARAM_INT);
    $stmt->execute();
    
    echo json_encode([
        'success' => true,
        'message' => 'コメントが更新されました'
    ]);

} catch (PDOException $e) {
    error_log("Database error in update_comment.php: " . $e->getMessage());
    echo json_encode([
        'error' => 'データベースエラーが発生しました',
        'details' => $e->getMessage()
    ]);
} 