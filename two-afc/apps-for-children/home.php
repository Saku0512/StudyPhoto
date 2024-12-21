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
        <a href="./html/study/study.html" class="study">勉強する</a>
        <div class="space-h"></div>
        <a href="./html/record/record_time.html" class="note">記録を見る</a>
      </div>
      <div class="footer" type="button">
        <button class="setting" onclick="showSPopup()">設定</button>
        <div class="settingPanel" id="settingPanel">
          <p>設定</p>
          <p>ユーザー名: 
            <img class="hide_show_Name" id="toggleName" src="./ui_image/close_eye.png">
            <img class="editName" id="editName" src="./ui_image/pencil.png">
            <pre class="code-block" id="nameField" data-name="<?php echo htmlspecialchars($user['username']); ?>"><?php echo $nameHidden; ?></pre></p>
          <p>ユーザーID: 
            <img class="hide_show_Id" id="toggleId" src="./ui_image/close_eye.png">
            <pre class="code-block" id="idField" data-id="<?php echo htmlspecialchars($user['id']); ?>"><?php echo $idHidden; ?></pre></p> <!--$user['id']-->
          <p>メールアドレス: 
            <img class="hide_show_Email" id="toggleEmail" src="./ui_image/close_eye.png">
            <pre class="code-block" id="emailField" data-email="<?php echo htmlspecialchars($user['email']); ?>"><?php echo $emailHidden; ?></pre></p>
          <p>パスワード: 
            <img class="hide_show_Pass" id="togglePass" src="./ui_image/close_eye.png">
            <img class="editPass" id="editPass" src="./ui_image/pencil.png">
            <pre class="code-block" id="passwordField" data-password="<?php echo htmlspecialchars($_SESSION['password']); ?>"><?php echo $passwordHidden; ?></pre></p>
          <div class="button-container2">
            <button onclick="hideSPopup()">閉じる</button>
            <button class="logout" onclick="window.location.href='php/logout.php'">ログアウト</button>
          </div>
        </div>
        <a href="./php/contact.php" class="contact">問い合わせ</a>
      </div>
    </main>
  </body>
</html>