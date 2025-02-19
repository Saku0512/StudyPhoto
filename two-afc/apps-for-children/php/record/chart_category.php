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

$userName = $_SESSION['username'];
$unit = isset($_GET['unit']) ? $_GET['unit'] : 'week';
$date = isset($_GET['date']) ? $_GET['date'] : date('Y-m-d');

try {
    $pdo = getDatabaseConnection();
    
    switch ($unit) {
        case 'day':
            $sql = "SELECT 
                    category,
                    SEC_TO_TIME(SUM(TIME_TO_SEC(study_time))) as total_time
                FROM study_data 
                WHERE username = :username 
                AND DATE(created_at) = :date
                GROUP BY category
                ORDER BY total_time DESC";
            break;

        case 'week':
            $sql = "SELECT 
                    category,
                    SEC_TO_TIME(SUM(TIME_TO_SEC(study_time))) as total_time
                FROM study_data 
                WHERE username = :username 
                AND DATE(created_at) >= DATE_SUB(:date, INTERVAL (DAYOFWEEK(:date) - 1) DAY)
                AND DATE(created_at) < DATE_ADD(DATE_SUB(:date, INTERVAL (DAYOFWEEK(:date) - 1) DAY), INTERVAL 7 DAY)
                GROUP BY category
                ORDER BY total_time DESC";
            break;

        case 'month':
            $sql = "SELECT 
                    category,
                    SEC_TO_TIME(SUM(TIME_TO_SEC(study_time))) as total_time
                FROM study_data 
                WHERE username = :username 
                AND YEAR(created_at) = YEAR(:date)
                AND MONTH(created_at) = MONTH(:date)
                GROUP BY category
                ORDER BY total_time DESC";
            break;

        case 'year':
            $sql = "SELECT 
                    category,
                    SEC_TO_TIME(SUM(TIME_TO_SEC(study_time))) as total_time
                FROM study_data 
                WHERE username = :username 
                AND YEAR(created_at) = YEAR(:date)
                GROUP BY category
                ORDER BY total_time DESC";
            break;

        default:
            echo json_encode(['error' => '無効な期間単位です']);
            exit;
    }

    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':username', $userName, PDO::PARAM_STR);
    $stmt->bindParam(':date', $date, PDO::PARAM_STR);

    // デバッグ用のログ
    error_log("Category Query parameters - Username: $userName, Date: $date, Unit: $unit");
    
    $stmt->execute();
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 結果を加工して、category_nameとtotal_timeのキーを持つ配列に変換
    $formattedCategories = array_map(function($row) {
        return [
            'category_name' => $row['category'],
            'total_time' => $row['total_time']
        ];
    }, $categories);
    
    // デバッグ用のログ
    error_log("Category Query results: " . print_r($formattedCategories, true));
    
    echo json_encode([
        'categories' => $formattedCategories
    ]);

} catch (PDOException $e) {
    error_log("Database error in category query: " . $e->getMessage());
    echo json_encode(['error' => 'データベースエラーが発生しました: ' . $e->getMessage()]);
}