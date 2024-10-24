<?php
// MySQLデータベース接続情報
$servername = "localhost";
$username = "childapp_user";
$password = "bMFQ-N-36&+6>L}!";
$dbname = "childapp_local";

// フォームから送信されたデータを取得
$user_name = $_POST['username'] ?? null;
$email = $_POST['email'] ?? null;
$password = $_POST['password'] ?? null;

if (!empty($user_name) && !empty($email) && !empty($password)) {
    // パスワードをハッシュ化
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // データベースに接続
    $conn = new mysqli($servername, $username, $password, $dbname);

    // 接続をチェック
    if ($conn->connect_error) {
        die("接続に失敗しました: " . $conn->connect_error);
    }else {
        echo "接続成功";
    }

    // ユーザー情報を挿入するSQLクエリ
    $sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";

    // SQLを準備
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sss", $user_name, $email, $hashed_password);

    // SQLクエリを実行
    if ($stmt->execute()) {
        echo "ユーザーが正常に登録されました！";
    } else {
        echo "エラー: " . $stmt->error;
    }

    // データベース接続を閉じる
    $stmt->close();
    $conn->close();
} else {
    echo "すべてのフィールドに入力してください。";
}