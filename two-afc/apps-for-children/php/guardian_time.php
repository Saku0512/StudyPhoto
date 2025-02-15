<?php
session_start();

ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

require './db_connection.php';

if (!isset($_SESSION['guardian_username'])) {
    echo json_encode(['error' => 'User not logged in']);
    exit;
}

$userName = $_SESSION['guardian_username'];
$unit = $_GET['unit'] ?? 'week';
$date = new DateTime($_GET['date'] ?? 'now');

// jsから受け取るキーをuserNameにする
try {
    $pdo = getDatabaseConnection();

    // ログを追加
    error_log("Fetching images for user: $userName, unit: $unit");

    // 期間に応じてSQLクエリを変更
    switch($unit) {
        case 'week':
            $startDate = clone $date;
            $startDate->modify('last sunday'); // その週の日曜日
            $endDate = clone $startDate;
            $endDate->modify('+6 days'); // 土曜日
            
            $sql = "SELECT 
                    DATE(created_at) as date,
                    SEC_TO_TIME(SUM(TIME_TO_SEC(study_time))) as study_time,
                    MIN(DAYOFWEEK(created_at) - 1) as index_num
                   FROM study_data 
                   WHERE username = :username 
                   AND DATE(created_at) BETWEEN :start_date AND :end_date
                   GROUP BY DATE(created_at)
                   ORDER BY DATE(created_at)";
            break;
            
        case 'month':
            $sql = "SELECT 
                    DATE(created_at) as date,
                    SEC_TO_TIME(SUM(TIME_TO_SEC(study_time))) as study_time,
                    MIN(DAY(created_at) - 1) as index_num
                   FROM study_data 
                   WHERE username = :username 
                   AND YEAR(created_at) = :year 
                   AND MONTH(created_at) = :month
                   GROUP BY DATE(created_at)
                   ORDER BY DATE(created_at)";
            break;
            
        case 'year':
            $sql = "SELECT 
                    MIN(created_at) as date,
                    SEC_TO_TIME(SUM(TIME_TO_SEC(study_time))) as study_time,
                    MONTH(created_at) - 1 as index_num
                   FROM study_data 
                   WHERE username = :username 
                   AND YEAR(created_at) = :year
                   GROUP BY MONTH(created_at), index_num
                   ORDER BY MONTH(created_at)";
            break;
    }
    
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':username', $userName, PDO::PARAM_STR);
    
    // バインドパラメータの設定
    switch($unit) {
        case 'week':
            $stmt->bindValue(':start_date', $startDate->format('Y-m-d'));
            $stmt->bindValue(':end_date', $endDate->format('Y-m-d'));
            break;
            
        case 'month':
            $stmt->bindValue(':year', $date->format('Y'));
            $stmt->bindValue(':month', $date->format('m'));
            break;
            
        case 'year':
            $stmt->bindValue(':year', $date->format('Y'));
            break;
    }

    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $values = [];
    
    // データを整形
    foreach ($results as $row) {
        $values[] = [
            'index' => (int)$row['index_num'],
            'study_time' => $row['study_time']
        ];
    }

    // JSONとして返す
    echo json_encode([
        'values' => $values
    ]);

} catch (PDOException $e) {
    // 接続失敗時のエラーハンドリング
    error_log("Database error: " . $e->getMessage());
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}