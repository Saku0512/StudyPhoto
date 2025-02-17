<?php
session_start();

ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

require_once './db_connection.php';

if (!isset($_SESSION['guardian_username'])) {
    echo json_encode(['error' => 'ユーザーがログインしていません']);
    exit;
}

$userName = $_SESSION['guardian_username'];
$year = isset($_GET['year']) ? (int)$_GET['year'] : (int)date('Y');
$month = isset($_GET['month']) ? (int)$_GET['month'] : (int)date('m');

try {
    $pdo = getDatabaseConnection();
    
    // SQLクエリを修正：日付を1日前にずらす
    $sql = "SELECT 
                DATE_SUB(study_date, INTERVAL 1 DAY) as study_date
            FROM (
                SELECT 
                    DATE(created_at) as study_date,
                    SUM(TIME_TO_SEC(study_time)) as total_study_time
                FROM study_data 
                WHERE username = :username 
                AND YEAR(created_at) = :year 
                AND MONTH(created_at) = :month
                GROUP BY DATE(created_at)
                HAVING total_study_time > 0
            ) AS daily_study
            ORDER BY study_date";
    
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':username', $userName, PDO::PARAM_STR);
    $stmt->bindParam(':year', $year, PDO::PARAM_INT);
    $stmt->bindParam(':month', $month, PDO::PARAM_INT);
    
    // デバッグ用のログ
    error_log("Executing query with params - Username: $userName, Year: $year, Month: $month");
    
    $stmt->execute();
    $dates = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    // 結果のログ
    error_log("Study dates found: " . print_r($dates, true));
    
    // 日付を'Y-m-d'形式に整形
    $formattedDates = array_map(function($date) {
        return date('Y-m-d', strtotime($date));
    }, $dates);
    
    echo json_encode([
        'dates' => $formattedDates,
        'year' => $year,
        'month' => $month
    ]);

} catch (PDOException $e) {
    error_log("Database error in guardian_calender.php: " . $e->getMessage());
    error_log("SQL State: " . $e->getCode());
    echo json_encode([
        'error' => 'データベースエラーが発生しました: ' . $e->getMessage(),
        'code' => $e->getCode()
    ]);
}