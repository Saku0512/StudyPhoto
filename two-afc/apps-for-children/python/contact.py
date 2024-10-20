from flask import Flask, render_template, request, redirect, session, url_for, flash
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # セッションを有効にするためのシークレットキー

# メール送信先
MYMAIL = 'comonraven113@gmail.com'

# ルート（お問い合わせフォームの表示）
@app.route('/', methods=['GET', 'POST'])
def contact():
    mode = 'input'
    errmessage = []

    if request.method == 'POST':
        # 「戻る」ボタンが押された場合
        if 'back' in request.form:
            pass
        # 「確認する」ボタンが押された場合
        elif 'confirm' in request.form:
            fullname = request.form.get('fullname')
            email = request.form.get('email')
            message = request.form.get('message')

            # 入力チェック
            if not fullname:
                errmessage.append('お名前を入力してください')
            elif len(fullname) > 100:
                errmessage.append('お名前は100文字以内にしてください')

            if not email:
                errmessage.append('メールアドレスを入力してください')
            elif len(email) > 200:
                errmessage.append('メールアドレスは200文字以内にしてください')
            elif not '@' in email:
                errmessage.append('メールアドレスが不正です')

            if not message:
                errmessage.append('お問い合わせ内容を入力してください')
            elif len(message) > 500:
                errmessage.append('お問い合わせ内容は500文字以内にしてください')

            session['fullname'] = fullname
            session['email'] = email
            session['message'] = message

            if errmessage:
                mode = 'input'
            else:
                mode = 'confirm'
        # 「送信」ボタンが押された場合
        elif 'send' in request.form:
            fullname = session.get('fullname')
            email = session.get('email')
            message = session.get('message')

            # メール送信の処理
            send_mail(MYMAIL, email, fullname, message)

            # セッションをクリア
            session.clear()
            mode = 'send'

    return render_template('contact.html', mode=mode, errmessage=errmessage)

# メール送信処理
def send_mail(to_email, from_email, fullname, message):
    try:
        smtp_host = 'smtp.gmail.com'
        smtp_port = 587
        username = 'your_email@gmail.com'  # 送信元メールアドレス
        password = 'your_password'  # パスワード

        # メール本文の構築
        msg = MIMEMultipart()
        msg['From'] = from_email
        msg['To'] = to_email
        msg['Subject'] = 'お問い合わせを受け付けました。'
        body = f"お名前: {fullname}\nEメール: {from_email}\nお問い合わせ内容:\n{message}"
        msg.attach(MIMEText(body, 'plain'))

        # SMTPサーバーへの接続
        server = smtplib.SMTP(smtp_host, smtp_port)
        server.starttls()
        server.login(username, password)
        server.sendmail(from_email, to_email, msg.as_string())
        server.quit()

    except Exception as e:
        print(f"メール送信に失敗しました: {str(e)}")

if __name__ == '__main__':
    app.run(debug=True)