<?php
session_start();
require '../db_connection.php';

// CSP（Content Security Policy）の設定
$nonce = base64_encode(random_bytes(16));
header("Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-" . $nonce . "'; style-src 'self' 'nonce-" . $nonce . "';");

ini_set('display_errors', 1);
error_reporting(E_ALL);


// 不正なアクセス防止
if (!isset($_GET['email'])) {
    header('Location: ../../index.php');
    exit();
}

// ランダムなIDを生成
function generateRandomID($pdo) {
    $characters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    $id = "";
    
    do {
        $id = "";
        for ($i = 0; $i < 8; $i++) {
            $id .= $characters[rand(0, strlen($characters) - 1)];
        }

        // 重複確認
        $stmt = $pdo->prepare("SELECT id FROM users WHERE id = ?");
        $stmt->execute([$id]);
        $result = $stmt->fetchColumn(); // 既に存在するIDなら値が返る

    } while ($result !== false); // IDが重複した場合は再生成

    return $id;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $pdo = getDatabaseConnection();
    $email = $_GET['email'];
    $username = $_POST['name'];
    $password = password_hash($_POST['password'], PASSWORD_BCRYPT);
    $id = generateRandomID($pdo);

    // ユーザー名の重複チェック
    $checkUsernameSql = "SELECT * FROM users WHERE username = :username";
    $checkUsernameStmt = $pdo->prepare($checkUsernameSql);
    $checkUsernameStmt->bindParam(":username", $username, PDO::PARAM_STR);
    $checkUsernameStmt->execute();
    $result = $checkUsernameStmt->fetchColumn();
    if ($result !== false) {
        echo 'このユーザー名は既に使用されています';
        exit(); // ここでスクリプトを停止
    } else {
        $sql = "INSERT INTO users (id, username, email, password) VALUES (?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        if ($stmt->execute([$id, $username, $email, $password])) {
            $message = "ユーザーが正常に登録されました";
        
            // デフォルトのカテゴリーを追加
            $defaultCategories = ["数学", "英語", "国語"];
            $categorySql = "INSERT INTO categories (username, category_name) VALUES (?, ?)";
            $categoryStmt = $pdo->prepare($categorySql);
        
            foreach ($defaultCategories as $category) {
                $categoryStmt->execute([$username, $category]);
            }
            $_SESSION['username'] = $username;
            $_SESSION['user_id'] = $id;
            $_SESSION['password'] = $_POST['password'];
            header('Location: ../../home.php');
        } else {
            $message = "ユーザー登録失敗: " . implode(", ", $stmt->errorInfo());
        }

        $checkUsernameStmt = null;
        $stmt = null;
    }
    
}
?>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>Create Account</title>
    <link rel="stylesheet" href="../../css/create_account.css">
    <link rel="stylesheet" href="../../css/scss/load.css">
    <script src="../../js/load.js" nonce="<?= htmlspecialchars($nonce, ENT_QUOTES, 'UTF-8') ?>" defer></script>
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
    <img class="logo" src="../../ui_image/logo.png" alt="logo">
    <form class="createForm" method="post" action="">
        <input type="hidden" name="email" value="<?= htmlspecialchars($_GET['email'], ENT_QUOTES, 'UTF-8'); ?>">
        <input class="createName" type="text" name="name" required placeholder="Name">
        <input class="createPassword" type="password" name="password" required placeholder="Password">
        <button class="submit" type="submit">Submit</button>
    </form>
</body>
</html>