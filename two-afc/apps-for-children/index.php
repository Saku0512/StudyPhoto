<?php
// デバッグ用
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // データベース接続設定
    $servername = "localhost";
    $username = "childapp_user";
    $password = "sdTJRTPutuXQ-Wlb2WBVE"; // 正しいパスワードを使用
    $db_name = "childapp_test";

    $dbUsername = $_POST['username'] ?? null;
    $dbEmail = $_POST['email'] ?? null;
    $dbPassword = $_POST['password'] ?? null;

    if (!empty($dbUsername) && !empty($dbEmail) && !empty($dbPassword)) {
        $conn = new mysqli($servername, $username, $password, $db_name);

        if ($conn->connect_error) {
            die("接続失敗: " . $conn->connect_error);
        }

        //ユーザー名の重複チェック
        $checkUsernameSql = "SELECT * FROM users WHERE username = ?";
        $checkUsernameStmt = $conn->prepare($checkUsernameSql);
        $checkUsernameStmt->bind_param("s", $dbUsername);
        $checkUsernameStmt->execute();
        $usernameResult = $checkUsernameStmt->get_result();

        //メールアドレスの重複チェック
        $checkEmailSql = "SELECT * FROM users WHERE email = ?";
        $checkEmailStmt = $conn->prepare($checkEmailSql);
        $checkEmailStmt->bind_param("s", $dbEmail);
        $checkEmailStmt->execute();
        $emailResult = $checkEmailStmt->get_result();

        //重複チェック
        if($usernameResult->num_rows > 0) {
            echo "<p>このユーザー名は既に登録されています</p>";
        }elseif($emailResult->num_rows > 0) {
            echo "<p>このメールアドレスは既に登録されています</p>";
        }else{
            //パスワードをハッシュ化
            $hashed_password = password_hash($dbPassword, PASSWORD_DEFAULT);
            $sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)"; // 修正: カラム名を正しく指定
            $stmt = $conn->prepare($sql);

            if ($stmt === false) {
                die("SQL文の準備失敗: " . $conn->error);
            }
            
            $stmt->bind_param("sss", $dbUsername, $dbEmail, $hashed_password);

            if ($stmt->execute()) {
            echo "<p>ユーザーが正常に登録されました</p>";
            } else {
                echo "<p>ユーザー登録失敗: " . $stmt->error . "</p>";
            }

            $stmt->close();
        }

        $checkEmailStmt->close();
        $checkUsernameStmt->close();
        $conn->close();
    } else {
        echo "<p>すべてのフィールドを入力してください</p>";
    }
}
?>

<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="css/main.css" />
    <title>子供アプリ</title>
    <style>
        .logo {
            display: flex;
            justify-content: center;
            margin: 0 auto 0;
            height: 400px;
            width: 400px;
        }
        .logo img {
            width: 100%;
            height: 100%;
            padding: 0;
        }
        .text {
            display: flex;
            justify-content: center;
            margin-top: 40px;
        }
    </style>
</head>
<body>
    <main>
        <div class="logo">
            <img src="./ui_image/logo.png" alt="logo" title="logo">
        </div>
        <div class="text">
            <form action="" method="post">
                <label for="username">ユーザー名:</label>
                <input type="text" id="username" name="username" required><br>
                <label for="email">メールアドレス:</label>
                <input type="email" id="email" name="email" required><br>
                <label for="password">パスワード:</label>
                <input type="password" id="password" name="password" required><br>
                <button type="submit">登録</button>
            </form>
        </div>
    </main>
</body>
</html>