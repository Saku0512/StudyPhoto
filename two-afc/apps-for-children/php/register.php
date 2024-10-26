<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: text/html; charset=UTF-8');

$servername = "localhost";
$username = "childapp_user";
$password = "bMFQ-N-36&+6>L}!"; // 必要に応じて変更
$dbname = "childapp_local";

$user_name = $_POST['username'] ?? null;
$email = $_POST['email'] ?? null;
$password = $_POST['password'] ?? null;

if (!empty($user_name) && !empty($email) && !empty($password)) {
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    $conn = new mysqli($servername, $username, $password, $dbname);

    if ($conn->connect_error) {
        die("接続失敗: " . $conn->connect_error);
    } else {
        echo "接続成功<br>";
    }

    if ($conn->ping()) {
        echo "接続は生きています<br>";
    } else {
        echo "接続は失われました<br>";
    }

    $sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($sql);
    
    if ($stmt === false) {
        die("SQL文の準備失敗: " . $conn->error);
    }

    $stmt->bind_param("sss", $user_name, $email, $hashed_password);

    if ($stmt->execute()) {
        echo "ユーザーが正常に登録されました<br>";
    } else {
        echo "ユーザー登録失敗: " . $stmt->error . "<br>";
    }

    $stmt->close();
    $conn->close();
} else {
    echo "すべてのフィールドを入力してください<br>";
}