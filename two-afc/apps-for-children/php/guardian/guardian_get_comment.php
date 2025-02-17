<?php
session_start();
header('Content-Type: application/json');

require_once '../db_connection.php';

if (!isset($_SESSION['guardian_username'])) {
    echo json_encode(['error' => 'ユーザーがログインしていません']);
    exit;
}

if (!isset($_GET['date'])) {
    echo json_encode(['error' => '日付が指定されていません']);
    exit;
}

$username = $_SESSION['guardian_username'];
$study_date = $_GET['date'];

try {
    $pdo = getDatabaseConnection();
    
    $sql = "SELECT id, comment_text FROM comment_data 
            WHERE username = :username 
            AND study_date = :study_date 
            AND is_deleted = FALSE";
    
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':username', $username, PDO::PARAM_STR);
    $stmt->bindParam(':study_date', $study_date, PDO::PARAM_STR);
    $stmt->execute();
    
    $comment = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'exists' => $comment !== false,
        'comment' => $comment
    ]);

} catch (PDOException $e) {
    error_log("Database error in guardian_get_comment.php: " . $e->getMessage());
    echo json_encode([
        'error' => 'データベースエラーが発生しました',
        'details' => $e->getMessage()
    ]);
} 