<?php
if($_SERVER['REQUEST_METHOD'] == 'POST') {
  $name = htmlspecialchars($_POST['name']);
  $tell = htmlspecialchars($_POST['tell']);
  $mail = htmlspecialchars($_POST['mail']);
  $text = htmlspecialchars($_POST['text']);

  //送信先メールアドレス
  $to = "s2301059@sendai-nct.jp";

  //件名
  $subject = "スタディフォトユーザーからのお問い合わせ";

  //本文
  $message = '氏名: ' . $name . "\n";
  $message .= '電話番号: ' . $tell . "\n";
  $message .= 'メールアドレス: ' . $mail . "\n";
  $message .= 'お問い合わせ内容: ' . $text . "\n";

  //送信元のメールアドレス
  $headers = "From: " . $mail;
  //var_dump($message);

  //メール送信
  if(mail($to, $subject, $message, $headers)){
    echo "お問い合わせありがとうございます。";
  }else{
    echo "送信に失敗しました。";
  }
}