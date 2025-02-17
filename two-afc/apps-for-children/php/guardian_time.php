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
$unit = isset($_GET['unit']) ? $_GET['unit'] : 'week';
$date = isset($_GET['date']) ? $_GET['date'] : date('Y-m-d');

// jsから受け取るキーをuserNameにする
try {
    $pdo = getDatabaseConnection();
    $values = [];

    switch ($unit) {
        case 'day':
            $sql = "SELECT 
                    hour_group as time_index,
                    SEC_TO_TIME(SUM(TIME_TO_SEC(study_time))) as study_time
                FROM (
                    SELECT 
                        HOUR(created_at) as hour_group,
                        study_time
                    FROM study_data 
                    WHERE username = :username 
                    AND DATE(created_at) = :date
                ) as subquery
                GROUP BY hour_group
                ORDER BY hour_group";
            break;

        case 'week':
            $sql = "SELECT 
                    day_index as time_index,
                    SEC_TO_TIME(SUM(TIME_TO_SEC(study_time))) as study_time
                FROM (
                    SELECT 
                        CASE 
                            WHEN DAYOFWEEK(created_at) = 1 THEN 0  # 日曜日
                            WHEN DAYOFWEEK(created_at) = 2 THEN 1  # 月曜日
                            WHEN DAYOFWEEK(created_at) = 3 THEN 2  # 火曜日
                            WHEN DAYOFWEEK(created_at) = 4 THEN 3  # 水曜日
                            WHEN DAYOFWEEK(created_at) = 5 THEN 4  # 木曜日
                            WHEN DAYOFWEEK(created_at) = 6 THEN 5  # 金曜日
                            WHEN DAYOFWEEK(created_at) = 7 THEN 6  # 土曜日
                        END as day_index,
                        study_time
                    FROM study_data 
                    WHERE username = :username 
                    AND DATE(created_at) >= DATE_SUB(:date, INTERVAL (DAYOFWEEK(:date) - 1) DAY)
                    AND DATE(created_at) < DATE_ADD(DATE_SUB(:date, INTERVAL (DAYOFWEEK(:date) - 1) DAY), INTERVAL 7 DAY)
                ) as subquery
                GROUP BY day_index
                ORDER BY day_index";
            break;

        case 'month':
            $sql = "SELECT 
                    day_group - 1 as time_index,
                    SEC_TO_TIME(SUM(TIME_TO_SEC(study_time))) as study_time
                FROM (
                    SELECT 
                        DAY(created_at) as day_group,
                        study_time
                    FROM study_data 
                    WHERE username = :username 
                    AND YEAR(created_at) = YEAR(:date)
                    AND MONTH(created_at) = MONTH(:date)
                ) as subquery
                GROUP BY day_group
                ORDER BY day_group";
            break;

        case 'year':
            $sql = "SELECT 
                    month_group - 1 as time_index,
                    SEC_TO_TIME(SUM(TIME_TO_SEC(study_time))) as study_time
                FROM (
                    SELECT 
                        MONTH(created_at) as month_group,
                        study_time
                    FROM study_data 
                    WHERE username = :username 
                    AND YEAR(created_at) = YEAR(:date)
                ) as subquery
                GROUP BY month_group
                ORDER BY month_group";
            break;

        default:
            echo json_encode(['error' => '無効な期間単位です']);
            exit;
    }

    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':username', $userName, PDO::PARAM_STR);
    $stmt->bindParam(':date', $date, PDO::PARAM_STR);

    // デバッグ用のログ
    error_log("Query parameters - Username: $userName, Date: $date, Unit: $unit");
    
    $stmt->execute();
    $values = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // デバッグ用のログ
    error_log("Query results: " . print_r($values, true));
    
    echo json_encode([
        'values' => $values
    ]);

} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    echo json_encode(['error' => 'データベースエラーが発生しました: ' . $e->getMessage()]);
}