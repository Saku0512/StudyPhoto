<?php
session_start();

ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

require_once './db_connection.php';  // パスを修正

if (!isset($_SESSION['guardian_username'])) {
    echo json_encode(['error' => 'User not logged in']);
    exit;
}

$userName = $_SESSION['guardian_username'];
$unit = $_GET['unit'] ?? 'week';
$date = new DateTime($_GET['date'] ?? 'now');

try {
    $pdo = getDatabaseConnection();
    
    // デバッグ用のログ追加
    error_log("Category Chart - User: $userName, Unit: $unit, Date: " . $date->format('Y-m-d'));
    
    // 期間に応じてSQLクエリを変更
    switch($unit) {
        case 'week':
            $startDate = clone $date;
            $startDate->modify('last sunday');
            $endDate = clone $startDate;
            $endDate->modify('+6 days');
            
            error_log("Category Chart - Week range: " . $startDate->format('Y-m-d') . " to " . $endDate->format('Y-m-d'));
            
            $sql = "SELECT 
                    c.category_name,
                    COALESCE(SEC_TO_TIME(SUM(TIME_TO_SEC(s.study_time))), '00:00:00') as total_time
                   FROM categories c
                   LEFT JOIN study_data s ON s.username = c.username 
                   AND s.category = c.category_name 
                   AND s.username = :username 
                   AND DATE(s.created_at) BETWEEN :start_date AND :end_date
                   WHERE c.username = :username
                   GROUP BY c.category_name
                   HAVING total_time > '00:00:00'
                   ORDER BY total_time DESC";
            
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(':username', $userName, PDO::PARAM_STR);
            $stmt->bindValue(':start_date', $startDate->format('Y-m-d'));
            $stmt->bindValue(':end_date', $endDate->format('Y-m-d'));
            break;
            
        case 'month':
            error_log("Category Chart - Month: " . $date->format('Y-m'));
            
            $sql = "SELECT 
                    c.category_name,
                    COALESCE(SEC_TO_TIME(SUM(TIME_TO_SEC(s.study_time))), '00:00:00') as total_time
                   FROM categories c
                   LEFT JOIN study_data s ON s.username = c.username 
                   AND s.category = c.category_name 
                   AND s.username = :username 
                   AND YEAR(s.created_at) = :year 
                   AND MONTH(s.created_at) = :month
                   WHERE c.username = :username
                   GROUP BY c.category_name
                   HAVING total_time > '00:00:00'
                   ORDER BY total_time DESC";
            
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(':username', $userName, PDO::PARAM_STR);
            $stmt->bindValue(':year', $date->format('Y'));
            $stmt->bindValue(':month', $date->format('m'));
            break;
            
        case 'year':
            error_log("Category Chart - Year: " . $date->format('Y'));
            
            $sql = "SELECT 
                    c.category_name,
                    COALESCE(SEC_TO_TIME(SUM(TIME_TO_SEC(s.study_time))), '00:00:00') as total_time
                   FROM categories c
                   LEFT JOIN study_data s ON s.username = c.username 
                   AND s.category = c.category_name 
                   AND s.username = :username 
                   AND YEAR(s.created_at) = :year
                   WHERE c.username = :username
                   GROUP BY c.category_name
                   HAVING total_time > '00:00:00'
                   ORDER BY total_time DESC";
            
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(':username', $userName, PDO::PARAM_STR);
            $stmt->bindValue(':year', $date->format('Y'));
            break;
    }

    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // デバッグ用のログ追加
    error_log("Category Chart - Query results: " . print_r($results, true));

    echo json_encode([
        'categories' => $results
    ]);

} catch (PDOException $e) {
    error_log("Category Chart - Database error: " . $e->getMessage());
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}