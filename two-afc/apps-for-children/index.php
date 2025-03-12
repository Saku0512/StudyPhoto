<?php
session_start();
$FormNonce = base64_encode(random_bytes(16));
header("Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-" . $FormNonce . "';");

ini_set('display_errors', 1);
error_reporting(E_ALL);

require __DIR__ . '/vendor/autoload.php';

use Dotenv\Dotenv;


$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

function generateRandomID($conn) {
    $characters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    $id = "";
    do {
        $id = "";
        for($i = 0; $i < 8; $i++){
            $id .= $characters[rand(0, strlen($characters) -1)];
        }

        //重複確認
        $stmt = $conn->prepare("SELECT id FROM users WHERE id = ?");
        $stmt->bind_param("s", $id);
        $stmt->execute();
        $result = $stmt->get_result();
    } while ($result->num_rows > 0); // 重複があれば再生成

    $stmt->close();
    return $id;
}

$message = ""; //メッセージを格納する変数

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // データベース接続設定
    $servername = $_ENV['DB_SERVERNAME'] ?? $_SERVER['DB_SERVERNAME'] ?? null;
    $username = $_ENV['DB_USERNAME'] ?? $_SERVER['DB_USERNAME'] ?? null;
    $password = $_ENV['DB_USERPASSWORD'] ?? $_SERVER['DB_USERPASSWORD'] ?? null;
    $db_name = $_ENV['DB_NAME'] ?? $_SERVER['DB_NAME'] ?? null;

    $dbUsername = $_POST['username'] ?? null;
    $dbEmail = $_POST['email'] ?? null;
    $dbPassword = $_POST['password'] ?? null;
    $dbId = $_POST['id'] ?? null;

    if (!empty($dbUsername) && !empty($dbEmail) && !empty($dbPassword)) {
        //メールアドレスの形式検証
        if (!filter_var($dbEmail, FILTER_VALIDATE_EMAIL)) {
            $message = '無効なメールアドレスです。';
        }else {
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
                $message = "このユーザー名は既に登録されています";
            }elseif($emailResult->num_rows > 0) {
                $message = "このメールアドレスは既に登録されています";
            }else{
                $uniqueID = generateRandomID($conn);
                //パスワードをハッシュ化
                $hashed_password = password_hash($dbPassword, PASSWORD_DEFAULT);
                $sql = "INSERT INTO users (id, username, email, password) VALUES (?, ?, ?, ?)";
                $stmt = $conn->prepare($sql);

                if ($stmt === false) {
                    die("SQL文の準備失敗: " . $conn->error);
                }
            
                $stmt->bind_param("ssss", $uniqueID, $dbUsername, $dbEmail, $hashed_password);

                if ($stmt->execute()) {
                    $message = "ユーザーが正常に登録されました";
                    // デフォルトのカテゴリーを追加
                    $defaultCategories = ["数学", "英語", "国語"];
                    foreach ($defaultCategories as $category) {
                    $categorySql = "INSERT INTO categories (username, category_name) VALUES (?, ?)";
                    $categoryStmt = $conn->prepare($categorySql);
                    $categoryStmt->bind_param("ss", $dbUsername, $category);
                    $categoryStmt->execute();
                    $categoryStmt->close();
                    }
                } else {
                    $message = "ユーザー登録失敗: " . $stmt->error;
                }
                $stmt->close();
            }

            $checkEmailStmt->close();
            $checkUsernameStmt->close();
            $conn->close();
        }
    } elseif (isset($_POST['login'])) {
        // サインイン処理
        $loginUsername = $_POST['login_username'] ?? null;
        $loginPassword = $_POST['login_password'] ?? null;

        if (!empty($loginUsername) && !empty($loginPassword)) {
            $conn = new mysqli($servername,  $username, $password, $db_name);
            if ($conn->connect_error) {
                die('接続失敗: '. $conn->connect_error);
            }

            // ユーザー名で検索
            $loginSql = "SELECT * FROM users WHERE username = ?";
            $loginStmt = $conn->prepare($loginSql);
            $loginStmt->bind_param("s", $loginUsername);
            $loginStmt->execute();
            $loginResult = $loginStmt->get_result();

            if ($loginResult->num_rows > 0) {
                $user = $loginResult->fetch_assoc();
                if (password_verify($loginPassword, $user['password'])) {
                    $message = "ログイン成功";
                    session_start();
                    $_SESSION['user_id'] = $user['id'];
                    $_SESSION['username'] = $user['username'];
                    $_SESSION['password'] = $loginPassword;
                    header("Location: home.php");
                } else {
                    $message = "パスワードが間違っています";
                }
            } else {
                $message = "ユーザー名が見つかりません";
            }

            $loginStmt->close();
            $conn->close();
        } else {
            $message = "全てのフィールドを入力してください";
        }
    } else if (isset($_POST['guardian'])) {
        // ログイン情報を取得
        $loginUsername = $_POST['guardian_username'] ?? null;
        $loginId = $_POST['guardian_id'] ?? null;

        if (!empty($loginUsername) && !empty($loginId)) {
            $conn = new mysqli($servername, $username, $password, $db_name);
            if ($conn->connect_error) {
                die('接続失敗： '. $conn->connect_error);
            }

            $loginSql = "SELECT username, id FROM users WHERE username = ? AND id = ?";
            $loginStmt = $conn->prepare($loginSql);
            $loginStmt->bind_param("ss", $loginUsername, $loginId);
            $loginStmt->execute();
            $loginResult = $loginStmt->get_result();

            if ($loginResult->num_rows > 0) {
                //ログイン成功
                $guardianUser = $loginResult->fetch_assoc();
                session_start();
                $_SESSION['guardian_username'] = $guardianUser['username'];
                $_SESSION['guardian_id'] = $guardianUser['id'];
                $message = "保護者ログイン成功";
                header("Location: guardian_home.php"); // 保護者用のホームページにリダイレクト
                exit;
            } else {
                // 照合失敗
                $message = "ユーザー名またはIDが正しくありません";
            }
        } else {
            $message = "全てのフィールドを入力してください";
        }
    } else {
        $message = "全てのフィールドを入力してください";
    }
}
?>

<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="css/main.css" />
    <link rel="stylesheet" href="css/index.css" />
    <script src="js/index.js" nonce="<?= htmlspecialchars($FormNonce, ENT_QUOTES, 'UTF-8') ?>" defer></script>
    <title>子供アプリ</title>
    <script nonce="<?= htmlspecialchars($FormNonce, ENT_QUOTES, 'UTF-8') ?>">
        window.onload = function(){
            <?php if(!empty($message)): ?>
                alert("<?php echo addslashes($message); ?>");
            <?php endif; ?>
        }
    </script>
</head>
<body>
    <main>
        <div class="logo">
            <img src="./ui_image/logo.png" alt="logo" title="logo">
        </div>
        <div class="index-buttons">
            <a href="#demo" class="demo">Try Now ➡</a>
            <button class="loginForm">Login</button>
            <button class="guardianForm">Guardian</button>
        </div>
        <div class="overlay" id="overlay"></div>
        <div class="loginPopup" id="loginPopup">
            <h2>Welcome Back</h2>
            <form id="loginForm" action="" method="post">
                <input type="text" id="login_username" name="login_username" required autocomplete="username" placeholder="Username">
                <input type="password" id="login_password" name="login_password" required autocomplete="current-password" placeholder="Password">
                <button type="submit" name="login">LogIn</button>
            </form>
        </div>
        <div class="signupPopup" id="signupPopup">
            <h2>Signup For Free</h2>
            <form id="signupForm" action="" method="post">
                <input type="text" id="username" name="username" required placeholder="Username">
                <input type="email" id="email" name="email" required placeholder="Email">
                <input type="password" id="password" name="password" required placeholder="Password">
                <button type="submit" name="signup">SignUp</button>
            </form>
        </div>
        <div class="guardianPopup" id="guardianPopup">
            <h2>Guardian Login</h2>
            <form id="guardianForm" action="" method="post">
                <input type="text" id="guardian_username" name="guardian_username" required autocomplete="username" placeholder="Child's Username">
                <input type="password" id="guardian_password" name="guadian_password" required autocomplete="current-password" placeholder="Child's Password">
                <button type="submit" name="guardian">LogIn</button>
            </form>
        </div>
    </main>
</body>
</html>