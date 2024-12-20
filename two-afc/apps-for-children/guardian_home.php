<?php
session_start();

//ユーザーIDをセッションから取得
$userName = $_SESSION['guardian_username'] ?? null;
$userId = $_SESSION['guardian_id'] ?? null;
if ($userId === null or $userName === null) {
  header("Location: index.php");
  exit();
}
?>

<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="./css/guardian_home.css">
</head>
<body>
    <mian>
        <h1>保護者用ページ</h1>
        <div class="footer" type="button">
            <button class="setting" onclick="showSPopup()">設定</button>
            <div class="settingPanel" id="settingPanel">
                <p>設定</p>
                <p>ユーザー名: 
                  <pre class="code-block"><?php echo htmlspecialchars($userName); ?></pre></p>
                <p>ユーザーID: 
                  <pre class="code-block"><?php echo htmlspecialchars($userId); ?></pre></p> 
                <div class="button-container2">
                  <button onclick="hideSPopup()">閉じる</button>
                  <button class="logout" onclick="window.location.href='php/logout.php'">ログアウト</button>
                </div>
            </div>
        <a href="./php/contact.php" class="contact">問い合わせ</a>
      </div>
    </mian>
    <script type="text/javascript">
        function showSPopup() {
            document.getElementById("settingPanel").style.display = "block";
        }
        function hideSPopup() {
            document.getElementById("settingPanel").style.display = "none";
        }
    </script>
</body>
</html>