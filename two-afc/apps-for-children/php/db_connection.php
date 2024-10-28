<?php
$servername = "localhost"; // データベースサーバーのアドレス（例: localhost）
$username = "childapp_user"; // データベースユーザー名
$password = "sdTJRTPutuXQ-Wlb2WBVE"; // データベースユーザーパスワード
$dbname = "childapp_test"; // データベース名

try {
  $pdo = new PDO("mysql:host=$servername;dbname=$dbname;charset=utf8", $username, $password);
  $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
  echo "Connection failed: " . $e->getMessage();
  exit; // 接続失敗時はスクリプトを終了
}