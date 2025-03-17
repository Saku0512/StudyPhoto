<?php
session_start();
require '../db_connection.php';

$nonce = base64_encode(random_bytes(16));
header("Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-" . $nonce . "'; style-src 'self' 'nonce-" . $nonce . "';");


if (!isset($_GET['token'])) {
    die('無効なトークンです');
}

$token = $_GET['token'];

// トークンをデータベースで検索
$pdo = getDatabaseConnection();
$stmt = $pdo->prepare("SELECT email, expires_at FROM password_reset_requests WHERE token = ?");
$stmt->execute([$token]);
$row = $stmt->fetch();

// 有効期限をチェック

if (strtotime($row['expires_at']) < time()) {
    die('このリンクは期限切れです');
}


if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $row['email'];
    $password = $_POST['password'];
    $confirmPassword = $_POST['confirm_password'];
    $username = $_POST['name'];

    // usersテーブルでemailとusernameが一致するかチェック
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? AND username = ?");
    $stmt->execute([$email, $username]);
    if ($stmt->rowCount() > 0) {
        // 一致するユーザーが見つかった場合、新しいパスワードを更新
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        // パスワードの確認
        if ($password === $confirmPassword) {
            // 新しいパスワードをusersテーブルに更新
            $updateStmt = $pdo->prepare("UPDATE users SET password = ? WHERE email = ?");
            if ($updateStmt->execute([$hashedPassword, $email])) {
                $message = 'パスワードが正常に更新されました。';
            } else {
                $message = 'パスワードの更新に失敗しました。';
            }
        } else {
            $message = 'パスワードが一致しません。';
        }
    } else {
        $message = 'ユーザーが見つかりません。';
    }
    header('Location: ../index.php');
    exit();
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Reset Password</title>
    <link rel="stylesheet" href="../../css/scss/load.css">
    <link rel="stylesheet" href="../../css/reset_password.css" >
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
    <p class="title">Reset Password</p>
    <img class="logo" src="../ui_image/logo.png" alt="logo">
    <form class="resetForm" method="post" action="">
        <input class="Name" type="text" name="name" placeholder="Username" required />
        <input class="NewPassword" type="password" name="password" placeholder="New Password" required />
        <input class="ConfirmPassword" type="password" name="confirm_password" placeholder="Confirm Password" required />
        <button class="submit" type="submit" name="reset_password">Reset Password</button>
    </form>
</body>
</html>