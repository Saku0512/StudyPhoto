<?php
session_start();
require './php/db_connection.php';
$nonce = base64_encode(random_bytes(16));
header("Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-" . $nonce . "'; style-src 'self' 'nonce-" . $nonce . "';");
/*
if (!isset($_GET['email'])) {
    die('不正なアクセスです');
    header('Location: ./index.php');
    exit();
}
*/

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
    $email = $_POST['email'];
    $username = $_POST['name'];
    $password = password_hash($_POST['password'], PASSWORD_BCRYPT);
    $id = generateRandomID($pdo);

    // ユーザー名の重複チェック
    $checkUsernameSql = "SELECT * FROM users WHERE username = :username";
    $checkUsernameStmt = $pdo->prepare($checkUsernameSql);
    $checkUsernameStmt->bindParam(":username", $username, PDO::PARAM_STR);
    $checkUsernameStmt->execute();
    if ($checkUsernameStmt->fetchColumn() > 0) {
        $message = 'このユーザー名は既に使用されています';
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
            session_start();
            $_SESSION['username'] = $username;
            $_SESSION['user_id'] = $id;
            $_SESSION['password'] = $_POST['password'];
            header('Location: ./home.php');
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
    <link rel="stylesheet" href="./css/create_account.css">
    <link rel="stylesheet" href="./css/scss/load.css">
    <script src="./js/load.js" nonce="<?= htmlspecialchars($nonce, ENT_QUOTES, 'UTF-8') ?>" defer></script>
    <script nonce="<?= htmlspecialchars($FormNonce, ENT_QUOTES, 'UTF-8') ?>">
        window.onload = function(){
            // localStorageに保存されたフラグがない場合
            if (!localStorage.getItem('visited') === 'true') {
                <?php if(!empty($message)): ?>
                    alert("<?php echo addslashes($message); ?>");
                <?php endif; ?>

                // フラグをlocalStorageに保存
                localStorage.setItem('visited', 'true');
            }
        }
    </script>
</head>
<body>
    <div class="loading active">
        <div class="loading__icon"></div>
        <p class="loading__text">
            loading
        </p>
    </div>
    <p class="title">Create Account</p>
    <img class="logo" src="./ui_image/logo.png" alt="logo">
    <form class="createForm" method="post" action="./create_account.php">
        <input type="hidden" name="email" value="<?= htmlspecialchars($_GET['email']); ?>">
        <input class="createName" type="text" name="name" required placeholder="Name">
        <input class="createPassword" type="password" name="password" required placeholder="Password">
        <button class="submit" type="submit">Submit</button>
    </form>
</body>
</html>