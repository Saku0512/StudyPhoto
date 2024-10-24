const functions = require("firebase-functions");
const nodemailer = require("nodemailer");
const cors = require("cors")({origin: true});
const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;

// メール設定(nodemailer)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: gmailEmail,
    pass: gmailPassword,
  },
});

// メール送信関数
exports.sendMail = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    if (req.method === "OPTIONS") {
      // プリフライトリクエスト対応
      res.set("Access-Control-Allow-Methods", "POST");
      res.set("Access-Control-Allow-Headers", "Content-Type");
      res.set("Access-Control-Allow-Origin", "*"); // CORS対応
      return res.status(204).send("");
    }

    // CORSヘッダーを常に設定
    res.set("Access-Control-Allow-Origin", "*");

    const {name, tell, mail, text} = req.body;

    // メールフォーマット
    const mailOptions = {
      from: mail,
      to: gmailEmail,
      subject: `${name} 新しいお問い合わせ`,
      html: `
        <h3>Contact Form:</h3>
        <p><b>お名前:</b> ${name}</p>
        <p><b>電話番号:</b> ${tell}</p>
        <p><b>メールアドレス:</b> ${mail}</p>
        <p><b>お問い合わせ内容:</b> ${text.replace(/\n/g, `<br>`)}</p>
      `,
    };

    // メール送信ロジック
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).send(error.toString());
      }
      console.log("Email sent:", info.response);
      return res.status(200).send("Email sent: " + info.response);
    });
  });
});
