<?php
session_start();
require './php/db_connection.php';

// CSP（Content Security Policy）の設定
$nonce = base64_encode(random_bytes(16));
header("Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-" . $nonce . "'; style-src 'self' 'nonce-" . $nonce . "';");

// 不正なアクセス防止
if (!isset($_GET['email'])) {
    header('Location: ./index.php');
    exit();
}

// ランダムなIDを生成
function generateRandomID($pdo) {
    $characters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    do {
        $id = "";
        for ($i = 0; $i < 8; $i++) {
            $id .= $characters[rand(0, strlen($characters) - 1)];
        }

        // 重複チェック
        $stmt = $pdo->prepare("SELECT id FROM users WHERE id = ?");
        $stmt->execute([$id]);
    } while ($stmt->fetchColumn() !== false);

    return $id;
}

// ユーザー登録処理
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $pdo = getDatabaseConnection();
    $email = $_POST['email'];
    $username = $_POST['name'];
    $password = password_hash($_POST['password'], PASSWORD_BCRYPT);
    $id = generateRandomID($pdo);

    // ユーザー名の重複チェック
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE username = ?");
    $stmt->execute([$username]);

    if ($stmt->fetchColumn() > 0) {
        $message = 'このユーザー名は既に使用されています';
    } else {
        // ユーザー登録
        $stmt = $pdo->prepare("INSERT INTO users (id, username, email, password) VALUES (?, ?, ?, ?)");
        if ($stmt->execute([$id, $username, $email, $password])) {
            $message = "ユーザーが正常に登録されました";

            // デフォルトのカテゴリーを追加
            $defaultCategories = ["数学", "英語", "国語"];
            $stmt = $pdo->prepare("INSERT INTO categories (username, category_name) VALUES (?, ?)");
            foreach ($defaultCategories as $category) {
                $stmt->execute([$username, $category]);
            }

            // セッションにユーザー情報を保存
            $_SESSION['username'] = $username;
            $_SESSION['user_id'] = $id;
            $_SESSION['password'] = $_POST['password'];

            header('Location: ./home.php');
            exit();
        } else {
            $message = "ユーザー登録失敗: " . implode(", ", $stmt->errorInfo());
        }
    }
}
?>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>Create Account</title>
    <link rel="stylesheet" href="./css/create_account.css">
    <link rel="stylesheet" href="./css/scss/load.css">
    <script src="./js/load.js" nonce="<?= htmlspecialchars($nonce, ENT_QUOTES, 'UTF-8') ?>" defer></script>
    <script nonce="<?= htmlspecialchars($nonce, ENT_QUOTES, 'UTF-8') ?>">
        window.onload = function() {
            // まだアラートを表示していない場合のみ表示
            if (localStorage.getItem('visited') !== 'true') {
                <?php if (!empty($message)): ?>
                    alert("<?= addslashes($message); ?>");
                <?php endif; ?>
                localStorage.setItem('visited', 'true');
            }
        }
    </script>
</head>
<body>
    <div class="loading active">
        <div class="loading__icon"></div>
        <p class="loading__text">loading</p>
    </div>
    <p class="title">Create Account</p>
    <img class="logo" src="./ui_image/logo.png" alt="logo">
    <form class="createForm" method="post" action="./create_account.php">
        <input type="hidden" name="email" value="<?= htmlspecialchars($_GET['email'], ENT_QUOTES, 'UTF-8'); ?>">
        <input class="createName" type="text" name="name" required placeholder="Name">
        <input class="createPassword" type="password" name="password" required placeholder="Password">
        <button class="submit" type="submit">Submit</button>
    </form>
</body>
</html>