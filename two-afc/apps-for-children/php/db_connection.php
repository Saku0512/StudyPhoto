<?php
function getDatabaseConnection() {
    $servername = "localhost";
    $username = "childapp_user";
    $password = "sdTJRTPutuXQ-Wlb2WBVE";
    $dbname = "childapp_test";

    try {
        $pdo = new PDO("mysql:host=$servername;dbname=$dbname;charset=utf8", $username, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $pdo;
    } catch (PDOException $e) {
        echo "Connection failed: " . $e->getMessage();
        exit;
    }
}