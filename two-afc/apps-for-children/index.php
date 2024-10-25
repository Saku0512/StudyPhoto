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
    
        <?php
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            // データベース接続設定
            $servername = "localhost";
            $username = "childapp_user";
            $password = "bMFQ-N-36&+6>L}!"; // 必要に応じて変更
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
        ?>
    </main>
</body>
</html>