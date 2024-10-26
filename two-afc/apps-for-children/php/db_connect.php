<?php
$servername = "localhost";
$username = "childapp_user";  // 先ほど作成したユーザー名
$password = "bMFQ-N-36&+6>L}!";  // 先ほど設定したパスワード
$dbname = "childapp_test";

// データベース接続
$conn = new mysqli($servername, $username, $password, $dbname);

// 接続確認
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
echo "データベース接続成功!";
