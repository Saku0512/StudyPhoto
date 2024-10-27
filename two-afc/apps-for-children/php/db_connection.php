<?php
$servername = "localhost"; // データベースサーバーのアドレス（例: localhost）
$username = "childapp_user"; // データベースユーザー名
$password = "sdTJRTPutuXQ-Wlb2WBVE"; // データベースユーザーパスワード
$dbname = "childapp_test"; // データベース名

// データベース接続の作成
$conn = new mysqli($servername, $username, $password, $dbname);

// 接続の確認
if ($conn->connect_error) {
  die("データベース接続に失敗しました: " . $conn->connect_error);
}

// ここに必要に応じてデータベースの設定を記述できます