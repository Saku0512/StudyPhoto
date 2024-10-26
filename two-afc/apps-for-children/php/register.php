<?php
//デバッグ用
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // データベース接続設定
    $servername = "127.0.0.1";
    $username = "childapp_user";
    $password = "sdTJRTPutuXQ-Wlb2WBVE";
    $dbname = "childapp_test";


    $user_name = $_POST['username'] ?? null;
    $email = $_POST['email'] ?? null;
    $password = $_POST['password'] ?? null;

    if (!empty($user_name) && !empty($email) && !empty($password)) {
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
        $conn = new mysqli($servername, $username, $password, $dbname);

        if ($conn->connect_error) {
            die("接続失敗: " . $conn->connect_error);
        }

        $sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
        $stmt = $conn->prepare($sql);

        if ($stmt === false) {
            die("SQL文の準備失敗: " . $conn->error);
        }

        $stmt->bind_param("sss", $user_name, $email, $hashed_password);

        if ($stmt->execute()) {
            echo "<p>ユーザーが正常に登録されました</p>";
        } else {
            echo "<p>ユーザー登録失敗: " . $stmt->error . "</p>";
        }

        $stmt->close();
        $conn->close();
    } else {
        echo "<p>すべてのフィールドを入力してください</p>";
    }
}