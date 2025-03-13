<?php
session_start();

//データベースにアクセス
$host = "localhost";
$username = "childapp_user";
$password = "sdTJRTPutuXQ-Wlb2WBVE"; // 正しいパスワードを使用
$dbname = "childapp_test";

//データベースにアクセス
try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo "接続失敗: " . $e->getMessage();
    exit();
}

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
                    throw new Exception("ユーザーが見つかりませんでした。");
                }

                // ユーザー名が既に存在するかをチェック
                $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE username = :username AND id != :id");
                $stmt->bindParam(":username", $newValue);
                $stmt->bindParam(":id", $userId);
                $stmt->execute();
                $count = $stmt->fetchColumn();

                if ($count > 0) {
                    // ユーザー名がすでに存在する場合は、エラーメッセージを返す
                    echo json_encode(['success' => false, 'error' => 'このユーザー名は既に使用されています。']);
                    exit();
                }

                // 最初に、users テーブルの username を更新
                $stmt = $pdo->prepare("UPDATE users SET username = :username WHERE id = :id");
                $stmt->bindParam(":username", $newValue);
                $stmt->bindParam(":id", $userId);
                if (!$stmt->execute()) {
                    throw new Exception("users テーブルの更新に失敗しました。");
                }

                // 次に、categories テーブルの関連するレコードを更新
                $stmt = $pdo->prepare("UPDATE categories SET username = :newUsername WHERE username = :oldUsername");
                $stmt->bindParam(":newUsername", $newValue);
                $stmt->bindParam(":oldUsername", $oldUsername);

                if (!$stmt->execute()) {
                    throw new Exception("categories テーブルの更新に失敗しました。");
                }

                // さらに、study_data テーブルの関連するレコードを更新
                $stmt = $pdo->prepare("UPDATE study_data SET username = :newUsername WHERE username = :oldUsername");
                $stmt->bindParam(":newUsername", $newValue);
                $stmt->bindParam(":oldUsername", $oldUsername);
                if (!$stmt->execute()) {
                    throw new Exception("study_data テーブルの更新に失敗しました。");
                }
            } elseif ($field === 'passwordField') {
                // パスワードの更新処理
                $stmt = $pdo->prepare("UPDATE users SET password = :password WHERE id = :id");
                $newValue = password_hash($newValue, PASSWORD_DEFAULT); // パスワードをハッシュ化
                $stmt->bindParam(":password", $newValue);
                $stmt->bindParam(":id", $userId);
                if (!$stmt->execute()) {
                    throw new Exception("パスワードの更新に失敗しました。");
                }
            }

            $pdo->commit();  // トランザクション確定

            // 成功レスポンス
            echo json_encode(['success' => true]);
        } else {
            // 必要なデータが不足している場合
            throw new Exception('Invalid data received.');
        }
    } catch (Exception $e) {
        $pdo->rollBack();  // エラー発生時にロールバック
        // エラーが発生した場合、エラーメッセージを返す
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit();
}

$passwordHidden = str_repeat('*', strlen($_SESSION['password'] ?? ''));
$idHidden = str_repeat('*', strlen($user['id'] ?? ''));
$nameHidden = str_repeat('*', strlen($user['username'] ?? ''));
$emailHidden = str_repeat('*', strlen($user['email'] ?? ''));

?>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="css/main.css" />
    <link rel="stylesheet" href="css/home.css" />
    <link rel="stylesheet" href="css/scss/load.css" />
    <link rel="shortcut icon" href="favicon.ico">
    <script src="./js/load.js" defer></script>
    <script src="./js/home.js" defer></script>
    <title>ホーム</title>
</head>
<body>
    <div class="loading active">
        <div class="loading__icon"></div>
        <p class="loading__text">loading</p>
    </div>
    <main class="main">
        <div class="logo">
            <img src="./ui_image/logo.png" alt="logo" title="logo">
        </div>
        <div class="contents">
            <a href="./pages/study/study.html" class="study">勉強する</a>
            <div class="space-h"></div>
            <a href="./pages/record/record_time.php" class="note">記録を見る</a>
        </div>
        <div class="footer" type="button">
            <button class="setting" onclick="showSPopup()">設定</button>
            <div class="settingPanel" id="settingPanel">
                <p>設定</p>
                <p>ユーザー名: 
                    <img class="hide_show_Name" id="toggleName" src="./ui_image/close_eye.png">
                    <img class="editName" id="editName" src="./ui_image/pencil.png">
                    <img class="copyName" id="copyName" src="./ui_image/copy_mark.png">
                    <pre class="code-block" id="nameField" data-name="<?php echo htmlspecialchars($user['username']); ?>"><?php echo $nameHidden; ?></pre></p>
                <p>ユーザーID: 
                    <img class="hide_show_Id" id="toggleId" src="./ui_image/close_eye.png">
                    <img class="copyId" id="copyId" src="./ui_image/copy_mark.png">
                    <pre class="code-block" id="idField" data-id="<?php echo htmlspecialchars($user['id']); ?>"><?php echo $idHidden; ?></pre></p>
                <p>メールアドレス: 
                    <img class="hide_show_Email" id="toggleEmail" src="./ui_image/close_eye.png">
                    <img class="copyEmail" id="copyEmail" src="./ui_image/copy_mark.png">
                    <pre class="code-block" id="emailField" data-email="<?php echo htmlspecialchars($user['email']); ?>"><?php echo $emailHidden; ?></pre></p>
                <p>パスワード: 
                    <img class="hide_show_Pass" id="togglePass" src="./ui_image/close_eye.png">
                    <img class="editPass" id="editPass" src="./ui_image/pencil.png">
                    <img class="copyPass" id="copyPass" src="./ui_image/copy_mark.png">
                    <pre class="code-block" id="passwordField" data-password="<?php echo htmlspecialchars($_SESSION['password']); ?>"><?php echo $passwordHidden; ?></pre></p>
                <div class="button-container2">
                    <button onclick="hideSPopup()">閉じる</button>
                    <button class="logout" onclick="window.location.href='php/logout.php'">ログアウト</button>
                </div>
            </div>
            <a href="" class="contact">問い合わせ</a>
        </div>
    </main>
</body>
</html>