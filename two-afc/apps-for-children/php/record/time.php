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

$username = $_SESSION['username'];
$unit = $_GET['unit'] ?? 'week'; // デフォルトは 'week'

try {
    $pdo = getDatabaseConnection();

    // ログを記録
    error_log("Fetching study data for user: $username, unit: $unit");

    $sql = "SELECT study_time, created_at
            FROM study_data
            WHERE username = :username
            ORDER BY created_at DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':username', $username, PDO::PARAM_STR);
    $stmt->execute();

    $datas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($datas)) {
        echo json_encode(['message' => 'データを取得できませんでした']);
        exit;
    }

    // 日時と学習時間の配列を準備
    $labels = [];
    $values = [];

    foreach ($datas as $row) {
        $createdAt = new DateTime($row['created_at']);
        $studyTime = floatval($row['study_time']); // 学習時間を数値に変換

        $labels[] = $createdAt->format('Y-m-d H:i:s'); // 日時をフォーマット
        $values[] = $studyTime;
    }

    // ラベルと値を期間に基づいて制限
    $limit = match ($unit) {
        'week' => 7,
        'month' => 30,
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
    error_log('Database error: ' . $e->getMessage());
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    exit;
}