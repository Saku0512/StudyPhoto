<?php
session_start();

ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

require_once './db_connection.php';

if (!isset($_SESSION['guardian_username'])) {
    echo json_encode(['error' => 'User not logged in']);
    exit;
}

$userName = $_SESSION['guardian_username'];
$unit = $_GET['unit'] ?? 'week'; // デフォルトは 'week'

// jsから受け取るキーをuserNameにする
try {
    $pdo = getDatabaseConnection();

    // ログを追加
    error_log("Fetching images for user: $userName, unit: $unit");

    $sql = "SELECT study_time, created_at
            FROM study_data 
            WHERE username = :username";
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':username', $userName, PDO::PARAM_STR);
    $stmt->execute();

    $datas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($datas)) {
        // $imagesが空の場合は、画像が登録されていないことを通知
        echo json_encode(['message' => 'データの取得に失敗しました']);
        exit;
    }

    // 日時と時間の配列を準備
    $labels = [];
    $values = [];

    foreach ($datas as $row) {
        $createdAt = new DateTime($row['created_at']);
        $studyTime = floatval($row['study_time']);

        $labels[] = $createdAt->format('Y-m-d H:i:s');
        $values[] = $studyTime;
    }

    // ラベルと値を期間に基づいて制限
    $limit = match ($unit) {
        'week' => 7,
        'month' => 12,
        'year' => 12,
        default => null
    };

    if ($limit !== null) {
        $labels = array_slice($labels, 0, $limit);
        $values = array_slice($values, 0, $limit);
    }

    // JSONとして返す
    echo json_encode([
        'labels' => $labels,
        'values' => $values
    ]);

} catch (PDOException $e) {
    // 接続失敗時のエラーハンドリング
    error_log("Database error: " . $e->getMessage());
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}