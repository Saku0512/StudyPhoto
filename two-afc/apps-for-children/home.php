<?php
session_start();
$nonce = base64_encode(random_bytes(16));
header("Content-Security-Policy:
    default-src 'self';
    script-src 'self' 'nonce-" . $nonce . "';
    style-src 'self' 'nonce-" . $nonce . "';
    frame-src 'self';
    frame-ancestors 'none';
");

if (!isset($_SESSION['language'])) {
    $_SESSION['language'] = 'ja'; // デフォルトは日本語
}

require_once('php/db_connection.php');

$pdo = getDatabaseConnection();

//ユーザーIDをセッションから取得
$userId = $_SESSION['user_id'] ?? null;
if ($userId === null) {
    header("Location: index.php");
    exit();
}
//ユーザー情報を取得
$stmt = $pdo->prepare("SELECT id, username, email FROM users WHERE id = :id");
$stmt->bindParam(":id", $userId);
$stmt->execute();
$user = $stmt->fetch(PDO::FETCH_ASSOC);

// POSTリクエストで更新処理が送信された場合
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    var_dump($_SESSION);
    if (isset($_POST['language'])) {
        // 言語設定の更新
        $_SESSION['language'] = $_POST['language'] === 'ja' ? 'ja' : 'en';
        header("Location: " . $_SERVER['REQUEST_URI']);
        exit();
    }
    try {
        // JSONデータを受け取る
        $input = json_decode(file_get_contents('php://input'), true);

        // 更新するフィールドと新しい値
        if (isset($input['field']) && isset($input['newValue'])) {
            $field = $input['field'];
            $newValue = $input['newValue'];

            $pdo->beginTransaction();  // トランザクション開始

            if ($field === 'nameField') {
                // ユーザー名の更新処理

                // ユーザーIDに基づいて現在のユーザー名を取得
                $stmt = $pdo->prepare("SELECT username FROM users WHERE id = :id");
                $stmt->bindParam(":id", $userId);
                $stmt->execute();
                $oldUsername = $stmt->fetchColumn(); // 現在のユーザー名

                if (!$oldUsername) {
                    // ユーザーが見つからなかった場合
                    if ($_SESSION['language'] == 'ja') {
                        throw new Exception("ユーザーが見つかりませんでした。");
                    } elseif ($_SESSION['language'] == 'en') {
                        throw new Exception("User not found.");
                    }
                }

                // ユーザー名が既に存在するかをチェック
                $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE username = :username AND id != :id");
                $stmt->bindParam(":username", $newValue);
                $stmt->bindParam(":id", $userId);
                $stmt->execute();
                $count = $stmt->fetchColumn();

                if ($count > 0) {
                    // ユーザー名がすでに存在する場合は、エラーメッセージを返す
                    if ($_SESSION['language'] == 'ja') {
                        echo json_encode(['success' => false, 'error' => 'このユーザー名は既に使用されています。']);
                    } elseif ($_SESSION['language'] == 'en') {
                        echo json_encode(['success' => false, 'error' => 'This user name is already in use.']);
                    }
                    exit();
                }
                // 最初に、users テーブルの username を更新
                $stmt = $pdo->prepare("UPDATE users SET username = :username WHERE id = :id");
                $stmt->bindParam(":username", $newValue);
                $stmt->bindParam(":id", $userId);
                if (!$stmt->execute()) {
                    if ($_SESSION['language'] == 'ja') {
                        throw new Exception("users テーブルの更新に失敗しました。");
                    } elseif ($_SESSION['language'] == 'en') {
                        throw new Exception("Failed to update the users table.");
                    }
                }
            } elseif ($field === 'passwordField') {
                // パスワードの更新処理
                $stmt = $pdo->prepare("UPDATE users SET password = :password WHERE id = :id");
                $newValue = password_hash($newValue, PASSWORD_DEFAULT); // パスワードをハッシュ化
                $stmt->bindParam(":password", $newValue);
                $stmt->bindParam(":id", $userId);
                if (!$stmt->execute()) {
                    if ($_SESSION['language'] == 'ja') {
                        throw new Exception("パスワードの更新に失敗しました。");
                    } elseif ($_SESSION['language'] == 'en') {
                        throw new Exception("Failed to update the password.");
                    }
                }
            }

            $pdo->commit();  // トランザクション確定

            // 成功レスポンス
            echo json_encode(['success' => true]);
        } else {
            // 必要なデータが不足している場合
            if ($_SESSION['language'] == 'ja') {
                throw new Exception('データが不足しています。');
            } elseif ($_SESSION['language'] == 'en') {
                throw new Exception('Invalid data received.');
            }
        }
    } catch (Exception $e) {
        $pdo->rollBack();  // エラー発生時にロールバック
        // エラーが発生した場合、エラーメッセージを返す
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit();
}

$_SESSION['email'] = $user['email'];

$passwordHidden = str_repeat('*', strlen($_SESSION['password'] ?? ''));
$idHidden = str_repeat('*', strlen($user['id'] ?? ''));
$nameHidden = str_repeat('*', strlen($user['username'] ?? ''));
$emailHidden = str_repeat('*', strlen($user['email'] ?? ''));

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="css/main.css" />
    <link rel="stylesheet" href="css/home.css" />
    <link rel="stylesheet" href="css/scss/load.css" />
    <link rel="shortcut icon" href="favicon.ico">
    <script src="./js/load.js" nonce="<?= htmlspecialchars($nonce, ENT_QUOTES, 'UTF-8') ?>" defer></script>
    <script src="./js/home.js" nonce="<?= htmlspecialchars($nonce, ENT_QUOTES, 'UTF-8') ?>" defer></script>
    <title>ホーム</title>
</head>
<body>
    <div class="loading active">
        <div class="loading__icon"></div>
        <p class="loading__text">
            <?php echo ($_SESSION['language'] == 'ja' ? '読み込み中' : 'loading'); ?>
        </p>
    </div>
    <main class="main">
        <div class="logo">
            <img src="./ui_image/logo.png" alt="logo" title="logo">
        </div>
        <div class="contents">
            <a href="./pages/study/study.html" class="study">
                <?php echo ($_SESSION['language'] == 'ja' ? '勉強する' : 'Study'); ?>
            </a>
            <div class="space-h"></div>
            <a href="./pages/record/record_time.php" class="note">
                <?php echo ($_SESSION['language'] == 'ja' ? '記録を見る' : 'View Record'); ?>
            </a>
        </div>
        <div class="footer" type="button">
            <button class="setting" onclick="togglePopup('show')">
                <?php echo ($_SESSION['language'] == 'ja' ? '設定' : 'Settings'); ?>
            </button>
            <div class="settingPanel" id="settingPanel">
                <div class="setting_header">
                    <p>
                        <?php echo ($_SESSION['language'] == 'ja' ? '設定' : 'Settings'); ?>
                    </p>
                    <form method="post" action="">
                        <div>
                            <label for="switch" class="switch_label">
                                <span class="title">
                                    <?php echo ($_SESSION['language'] == 'ja' ? '英語' : 'En'); ?>
                                </span>
                                <div class="swith">
                                <input type="hidden" name="language" value="en" />
                                <input type="checkbox" id="switch" name="language" value="ja" <?php echo ($_SESSION['language'] == 'ja' ? 'checked' : ''); ?> />
                                <div class="circle"></div>
                                <div class="base"></div>
                                </div>
                                <span class="title">
                                    <?php echo ($_SESSION['language'] == 'ja' ? '日本語' : 'Ja'); ?>
                                </span>
                            </label>
                        </div>
                    </form>
                </div>
                <p>
                    <?php echo ($_SESSION['language'] == 'ja' ? 'ユーザー名' : 'Username'); ?>: 
                    <img class="hide_show_Name" id="toggleName" src="./ui_image/close_eye.png">
                    <img class="editName" id="editName" src="./ui_image/pencil.png">
                    <img class="copyName" id="copyName" src="./ui_image/copy_mark.png">
                    <pre class="code-block" id="nameField" data-name="<?php echo htmlspecialchars($user['username']); ?>"><?php echo $nameHidden; ?></pre>
                </p>
                <p>
                    <?php echo ($_SESSION['language'] == 'ja' ? 'ユーザーID' : 'User ID'); ?>: 
                    <img class="hide_show_Id" id="toggleId" src="./ui_image/close_eye.png">
                    <img class="copyId" id="copyId" src="./ui_image/copy_mark.png">
                    <pre class="code-block" id="idField" data-id="<?php echo htmlspecialchars($user['id']); ?>"><?php echo $idHidden; ?></pre>
                </p>
                <p>
                    <?php echo ($_SESSION['language'] == 'ja' ? 'メールアドレス' : 'Email Address'); ?>: 
                    <img class="hide_show_Email" id="toggleEmail" src="./ui_image/close_eye.png">
                    <img class="copyEmail" id="copyEmail" src="./ui_image/copy_mark.png">
                    <pre class="code-block" id="emailField" data-email="<?php echo htmlspecialchars($user['email']); ?>"><?php echo $emailHidden; ?></pre>
                </p>
                <p>
                    <?php echo ($_SESSION['language'] == 'ja' ? 'パスワード' : 'Password'); ?>: 
                    <img class="hide_show_Pass" id="togglePass" src="./ui_image/close_eye.png">
                    <img class="editPass" id="editPass" src="./ui_image/pencil.png">
                    <img class="copyPass" id="copyPass" src="./ui_image/copy_mark.png">
                    <pre class="code-block" id="passwordField" data-password="<?php echo htmlspecialchars($_SESSION['password']); ?>"><?php echo $passwordHidden; ?></pre>
                </p>
                <div class="button-container2">
                    <button onclick="togglePopup('hide')">
                        <?php echo ($_SESSION['language'] == 'ja' ? '閉じる' : 'Close'); ?>
                    </button>
                    <button class="logout" onclick="window.location.href='php/logout.php'">
                        <?php echo ($_SESSION['language'] == 'ja' ? 'ログアウト' : 'Logout'); ?>
                    </button>
                </div>
            </div>
            <a href="./contact.php" class="contact">
                <?php echo ($_SESSION['language'] == 'ja' ? '問い合わせ' : 'Contact Us'); ?>
            </a>
        </div>
    </main>
    <input type="hidden" id="hidden_language" value="<?php echo ($_SESSION['language']); ?>" />
</body>
</html>