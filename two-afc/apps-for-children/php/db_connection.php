<?php
require __DIR__ . '/../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

function getDatabaseConnection() {
    $servername = $_ENV['DB_SERVERNAME'] ?? $_SERVER['DB_SERVERNAME'] ?? null;
    $username = $_ENV['DB_USERNAME'] ?? $_SERVER['DB_USERNAME'] ?? null;
    $password = $_ENV['DB_USERPASSWORD'] ?? $_SERVER['DB_USERPASSWORD'] ?? null;
    $db_name = $_ENV['DB_NAME'] ?? $_SERVER['DB_NAME'] ?? null;


    try {
        $pdo = new PDO("mysql:host=$servername;dbname=$db_name;charset=utf8", $username, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $pdo;
    } catch (PDOException $e) {
        echo "Connection failed: " . $e->getMessage();
        exit;
    }
}