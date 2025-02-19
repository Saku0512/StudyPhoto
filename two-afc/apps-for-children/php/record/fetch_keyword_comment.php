<?php
session_start();

ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

require_once '../db_connection.php';

if (!isset($_SESSION['username'])) {
    echo json_encode(['error' => 'User not logged in']);
    exit;
}

if (!isset($_GET['keyword'])) {
    echo json_encode(['error' => 'Keyword not provided']);
    exit;
}

$userName = $_SESSION['username'];
$keyword = '%' . $_GET['keyword'] . '%';

try {
    $pdo = getDatabaseConnection();
    $sql = "SELECT study_date, comment_text FROM comment_data WHERE is_deleted = 0 AND username = :username AND comment_text LIKE :keyword";
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':username', $userName, PDO::PARAM_STR);
    $stmt->bindParam(':keyword', $keyword, PDO::PARAM_STR);
    $stmt->execute();
    $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if ($comments === false) {
        echo json_encode(['error' => 'Failed to fetch comments']);
    } else {
        echo json_encode($comments);
    }
} catch (PDOException $e) {
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
}
?>