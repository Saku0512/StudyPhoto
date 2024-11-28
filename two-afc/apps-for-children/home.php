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
?>
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8">
    <meta name="viewpot" content="width=device-width , initial-scale=1.0" />
    <link rel="stylesheet" href="css/main.css" />
    <link rel="stylesheet" href="css/home.css" />
    <link rel="stylesheet" href="css/scss/load.css" />
    <script src="./js/load.js" defer></script>
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
        <a href="#" class="note" onclick="showPopup()">記録する</a>
      </div>
      <div class="footer" type="button">
        <button class="setting" onclick="showSPopup()">設定</button>
        <div class="settingPanel" id="settingPanel">
          <p>設定</p>
          <p>ユーザー名: <?php echo htmlspecialchars($user['username']); ?></p>
          <p>ユーザーID: <?php echo htmlspecialchars($user['id']); ?></p>
          <p>メールアドレス: <?php echo htmlspecialchars($user['email']); ?></p>
          <button onclick="hideSPopup()">閉じる</button>
          <button class="logout" onclick="window.location.href='php/logout.php'">ログアウト</button>
        </div>
        <a href="./php/contact.php" class="contact">問い合わせ</a>
      </div>
      <div class="overlay" id="overlay" onclick="hidePopup()"></div>
      <div class="popup" id="popup">
        <div class="tab">
          <a href="html/record/record_time.html" class="me">自分の記録</a>
          <a href="html/record/record_time.html" class="parent">保護者</a>
        </div>
      </div>
    </main>
    <script type="text/javascript" defer>
      // タイマーをリセット
      document.querySelector('a[href="./html/study/study.html"]').addEventListener('click', () => {
        localStorage.removeItem('stopwatchTime');
        localStorage.removeItem('isRunning');
      });

      function showSPopup() {
        document.getElementById("settingPanel").style.display = "block";
      }
      function hideSPopup() {
        document.getElementById("settingPanel").style.display = "none";
      }

      function showPopup() {
        document.getElementById("overlay").style.display = "block";
        document.getElementById("popup").classList.add("active");
      }

      function hidePopup() {
        document.getElementById("overlay").style.display = "none";
        document.getElementById("popup").classList.remove("active");
      }

      function saveRecord() {
        alert("記録が保存されました。");
        hidePopup();
      }
    </script>
  </body>
</html>