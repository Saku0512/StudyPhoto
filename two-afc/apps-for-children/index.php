<?php
session_start();
$FormNonce = base64_encode(random_bytes(16));
header("Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-" . $FormNonce . "'; font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; style-src 'self' https://fonts.googleapis.com;");

ini_set('display_errors', 1);
error_reporting(E_ALL);

use Dotenv\Dotenv;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;


require __DIR__ . '/vendor/autoload.php';
require __DIR__ . '/vendor/phpmailer/phpmailer/src/Exception.php';
require __DIR__ . '/vendor/phpmailer/phpmailer/src/PHPMailer.php';
require __DIR__ . '/vendor/phpmailer/phpmailer/src/SMTP.php';


$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

$Username = $_ENV['MAIL_USERNAME'] ?? $_SERVER['MAIL_USERNAME'];
$Password = $_ENV['MIAL_APP_PASSWORD'] ?? $_SERVER['MIAL_APP_PASSWORD'];

$mail = new PHPMailer(true);

// ランダムなIDを作成する関数
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

// ランダムなユーザーを作成する関数
function generateRandomUser($conn) {
    $characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    $user = "";
    do {
        $user = "test_";
        for($i = 0; $i < 4; $i++) {
            $user .= $characters[rand(0, strlen($characters) -1)];
        }

        // 重複確認
        $stmt = $conn->prepare("SELECT username FROM users WHERE username = ?");
        $stmt->bind_param("s", $user);
        $stmt->execute();
        $result = $stmt->get_result();
    } while ($result->num_rows > 0); // 重複があれば再生成

    $stmt->close();
    return $user;
}

// ランダムなメールアドレスを作成する関数
function generateRandomEmail($conn)  {
    $characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    $email = "";
    do {
        $email = "test_";
        for($i = 0; $i < 4; $i++) {
            $email .= $characters[rand(0, strlen($characters) -1)];
        }
        $email .= "@example.com";

        // 重複確認
        $stmt = $conn->prepare("SELECT email FROM users WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();
    } while ($result->num_rows > 0); // 重複があれば再生成

    $stmt->close();
    return $email;
}

// ランダムなパスワードを作成する関数
function generateRandomPassword($conn) {
    $characters = "1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    $password = "";
    do {
        $password = "";
        for($i = 0; $i < 12; $i++){
            $password .= $characters[rand(0, strlen($characters) -1)];
        }

        // 重複確認
        $stmt = $conn->prepare("SELECT password FROM users WHERE password = ?");
        $stmt->bind_param("s", $password);
        $stmt->execute();
        $result = $stmt->get_result();
    } while ($result->num_rows > 0); // 重複があれば再生成

    $stmt->close();
    return $password;
}


$message = ""; //メッセージを格納する変数

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // データベース接続設定
    $servername = $_ENV['DB_SERVERNAME'] ?? $_SERVER['DB_SERVERNAME'] ?? null;
    $username = $_ENV['DB_USERNAME'] ?? $_SERVER['DB_USERNAME'] ?? null;
    $password = $_ENV['DB_USERPASSWORD'] ?? $_SERVER['DB_USERPASSWORD'] ?? null;
    $db_name = $_ENV['DB_NAME'] ?? $_SERVER['DB_NAME'] ?? null;

    $verification = $_ENV['VERIFICATION_LINK'] ?? $_SERVER['VERIFICATION_LINK'] ?? null;

    $dbUsername = $_POST['username'] ?? null;
    $dbEmail = $_POST['email'] ?? null;
    $dbPassword = $_POST['password'] ?? null;
    $dbId = $_POST['id'] ?? null;

    if (!empty($dbEmail)) {
        //メールアドレスの形式検証
        if (!filter_var($dbEmail, FILTER_VALIDATE_EMAIL)) {
            $message = '無効なメールアドレスです。';
        }else {
            $conn = new mysqli($servername, $username, $password, $db_name);

            if ($conn->connect_error) {
                die("接続失敗: " . $conn->connect_error);
            }

            //ユーザー名の重複チェック
            //$checkUsernameSql = "SELECT * FROM users WHERE username = ?";
            //$checkUsernameStmt = $conn->prepare($checkUsernameSql);
            //$checkUsernameStmt->bind_param("s", $dbUsername);
            //$checkUsernameStmt->execute();
            //$usernameResult = $checkUsernameStmt->get_result();

            //メールアドレスの重複チェック
            $checkEmailSql = "SELECT * FROM users WHERE email = ?";
            $checkEmailStmt = $conn->prepare($checkEmailSql);
            $checkEmailStmt->bind_param("s", $dbEmail);
            $checkEmailStmt->execute();
            $emailResult = $checkEmailStmt->get_result();
            //$emailResult->close();

            //重複チェック
            /*
            if($usernameResult->num_rows > 0) {
                $message = "このユーザー名は既に登録されています";
            }else*/if($emailResult->num_rows > 0) {
                $message = "このメールアドレスは既に登録されています";
            }else{
                // トークンを生成（32バイトのランダムな文字列をbase64エンコード）
                $token = bin2hex(random_bytes(32));
                $expires_at = date('Y-m-d H:i:s', time() + 600); // 10分後に有効期限切れ

                $deleteTokenSql = "DELETE FROM email_verification WHERE email = ?";
                $deleteTokenStmt = $conn->prepare($deleteTokenSql);
                $deleteTokenStmt->bind_param("s", $dbEmail);
                $deleteTokenStmt->execute();
                $deleteTokenStmt->close();

                $insertTokenSql = "INSERT INTO email_verification (email, token, expires_at) VALUES (?, ?, ?)";
                $insertTokenStmt = $conn->prepare($insertTokenSql);
                $insertTokenStmt->bind_param("sss", $dbEmail, $token, $expires_at);
                $insertTokenStmt->execute();
                $insertTokenStmt->close();

                $verification_link = $verification .  $token;

                $mail = new PHPMailer(true);
                $mail->isSMTP();
                $mail->Host       = 'smtp.gmail.com';
                $mail->SMTPAuth   = true;
                $mail->Username   = $Username;
                $mail->Password   = $Password;
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
                $mail->Port       = 587;

                $mail->setFrom($Username, 'StudyPhoto');
                $mail->addAddress($dbEmail);

                $mail->isHTML(true);
                $mail->CharSet = 'UTF-8';
                $mail->Encoding = 'base64';

                $mail->Subject = 'StudyPhoto 仮登録完了';
                $mail->Body = 'StudyPhotoの仮登録が完了しました。 <br />
                               以下のリンクから本登録を行ってください。<br />'
                               . 'リンクの有効期限は10分です。 <br /> <br />'
                               . $verification_link;
                $mail->send();
                $mail->smtpClose();

            }
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
                $_SESSION['language'] = 'en';
                $message = "保護者ログイン成功";
                header("Location: guardian_home.php"); // 保護者用のホームページにリダイレクト
                exit;
            } else {
                // 照合失敗
                $message = "ユーザー名またはIDが正しくありません";
            }
        } else {
            $message = "";

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
            $message = "";
        }
    } else if (isset($_POST['test'])) {
        $conn = new mysqli($servername, $username, $password, $db_name);

        if ($conn->connect_error) {
            die("接続失敗: " . $conn->connect_error);
        }

        $dbTestUserName = generateRandomUser($conn);
        $dbTestMail = generateRandomEmail($conn);
        $dbTestPassworod = generateRandomPassword($conn);
        $dbTestId = generateRandomID($conn);
        $dbTestDeleteAt = date("Y-m-d H:i:s", strtotime("+1 hour"));

        $hashed_password = password_hash($dbTestPassworod, PASSWORD_DEFAULT);
        $sql = "INSERT INTO users (id, username, email, password, delete_at) VALUES (?, ?, ?, ?, NOW() + INTERVAL 1 HOUR)";
        $stmt = $conn->prepare($sql);

        
        //自動削除
        //`php/delete_test_user.php`
        //$ crontab -e

        // */30 * * * * php /var/www/html/ChildApp/two-afc/apps-for-children/php/delete_test_user.php

        if ($stmt === false) {
            die("SQL文の準備失敗: " . $conn->error);
        }

        $stmt->bind_param("ssss", $dbTestId, $dbTestUserName, $dbTestMail, $hashed_password);

        if ($stmt->execute()) {
            $message = "テストユーザーが正常に登録されました。 このユーザーは1時間で自動的に削除されます";
            // デフォルトのカテゴリーを追加
            $defaultCategories = ["数学", "英語", "国語", "化学", "物理"];
            foreach ($defaultCategories as $category) {
                $categorySql = "INSERT INTO categories (username, category_name) VALUES (?, ?)";
                $categoryStmt = $conn->prepare($categorySql);
                $categoryStmt->bind_param("ss", $dbTestUserName, $category);
                $categoryStmt->execute();
                $categoryStmt->close();
            }
            // デフォルトでstudy_dataを入れる
            $studySql = "INSERT INTO study_data (username, category, study_time, SspentTime, images, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, NOW() - INTERVAL ? DAY, NOW() - INTERVAL ? DAY)";
            $studyStmt = $conn->prepare($studySql);
            // 挿入データ（category, study_time, SspentTime, images, created_at, updated_at の日数）
            $data = [
                ['数学', '03:01:00', '10:20-13:21', 'L3Zhci93d3cvaHRtbC91cGxvYWRzL3BkZnMvZGpkYWs1ODJuY3B3cS5wZGY=', 7, 7],
                ['英語', '05:30:00', '13:20-18:50', 'L3Zhci93d3cvaHRtbC91cGxvYWRzL3BkZnMvZmtkazg0b2FuZjRrai5wZGY=', 6, 6],
                ['国語', '01:30:00', '10:34-12:04', 'L3Zhci93d3cvaHRtbC91cGxvYWRzL3BkZnMva2pkaGJlaTgzYjcybi5wZGY=', 5, 5],
                ['化学', '08:20:00', '12:30-20:50', 'L3Zhci93d3cvaHRtbC91cGxvYWRzL3BkZnMvY2pka2FqM2tzODM5MS5wZGY=', 3, 5],
                ['物理', '06:10:00', '14:20-20:30', 'L3Zhci93d3cvaHRtbC91cGxvYWRzL3BkZnMvcGpqZGs4NGg2bmNnZC5wZGY=', 1, 3]
            ];
            foreach ($data as $row) {
                $studyStmt->bind_param("sssssii", $dbTestUserName, $row[0], $row[1], $row[2], $row[3], $row[4], $row[5]);
                $studyStmt->execute();
            }
            $studyStmt->close();
            // デフォルトでcomment_dataを入れる
            $commentSql = "INSERT INTO comment_data (username, comment_text, study_date, created_at, updated_at)
             VALUES (?, ?, DATE(NOW() - INTERVAL ? DAY), NOW() - INTERVAL ? DAY, NOW() - INTERVAL ? DAY)";
            $commentStmt = $conn->prepare($commentSql);
            // 挿入データ
            $data = [
                ['頑張ったね', 7],
                ['たくさん勉強して偉いね', 6],
                ['国語ってなんの勉強しているの？', 5],
                ['勉強しすぎなんじゃないの？', 3],
                ['たまには休みなよ～', 1]
            ];
            foreach ($data as $row) {
                $commentStmt->bind_param("ssiii", $dbTestUserName, $row[0], $row[1], $row[1], $row[1]);
                $commentStmt->execute();
            }
            $commentStmt->close();

            // サインイン処理
            $loginTestUserName = $dbTestUserName;
            $loginTestPassword = $dbTestPassworod;
            $loginSql = "SELECT * FROM users WHERE username = ?";
            $loginStmt = $conn->prepare($loginSql);
            $loginStmt->bind_param("s", $loginTestUserName);
            $loginStmt->execute();
            $loginResult = $loginStmt->get_result();
            if ($loginResult->num_rows > 0) {
                $user = $loginResult->fetch_assoc();
                if (password_verify($loginTestPassword, $user['password'])){
                    $message = "ログイン成功";
                    session_start();
                    $_SESSION['user_id'] = $user['id'];
                    $_SESSION['username'] = $user['username'];
                    $_SESSION['password'] = $loginTestPassword;
                    $_SESSION['language'] = 'en';
                    header("Location: home.php");
                } else {
                    $message = "自動ログインに失敗しました";
                }
            }
        }
    } else {
        $message = "";
    }
}
?>

<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Study with me">
    <link rel="stylesheet" href="css/main.css" />
    <link rel="stylesheet" href="css/index.css" />
    <link rel="shortcut icon" href="favicon.ico">
    <script src="js/index.js" nonce="<?= htmlspecialchars($FormNonce, ENT_QUOTES, 'UTF-8') ?>" defer></script>
    <title>StudyPhoto</title>
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
    <main>
        <div class="logo">
            <img src="./ui_image/logo.png" alt="logo" title="logo">
        </div>
        <div class="index-buttons">
            <form id="testForm" action="" method="post">
                <input type="hidden" name="test" value="try_now" />
                <button type="submit" name="test" class="test">Try Now ➡</button>
            </form>
            <button class="loginForm">Login</button>
            <button class="guardianForm">Guardian</button>
        </div>
        <div class="overlay" id="overlay"></div>
        <div class="loginPopup" id="loginPopup">
            <span class="close-btn">×</span>
            <h2 id="headline">Welcome Back!</h2>
            <form id="loginForm" action="" method="post">
                <input type="text" id="login_username" name="login_username" required autocomplete="username" placeholder="Username">
                <input type="password" id="login_password" name="login_password" required autocomplete="current-password" placeholder="Password">
                <button type="submit" name="login">LogIn</button>
                <p class="message">Not registered? <a href="#">Create an account</a></p>
            </form>
        </div>
        <div class="signupPopup" id="signupPopup">
            <span class="close-btn">×</span>
            <h2 id="headline">Signup For Free</h2>
            <form id="signupForm" action="" method="post">
                <!--<input type="text" id="username" name="username" required placeholder="Username">-->
                <input type="email" id="email" name="email" required placeholder="Email">
                <!--<input type="password" id="password" name="password" required placeholder="Password">-->
                <button type="submit" name="signup">Send Mail</button>
                <p class="message">Already registered? <a href="#">Sign In</a></p>
            </form>
        </div>
        <div class="guardianPopup" id="guardianPopup">
            <span class="close-btn">×</span>
            <h2 id="headline">Guardian Login</h2>
            <form id="guardianForm" action="" method="post">
                <input type="text" id="guardian_username" name="guardian_username" required autocomplete="username" placeholder="Child's Username">
                <input type="password" id="guardian_password" name="guardian_id" required autocomplete="current-password" placeholder="Child's Id">
                <button type="submit" name="guardian">LogIn</button>
            </form>
        </div>
    </main>
</body>
</html>