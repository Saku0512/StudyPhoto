#!/bin/bash

# パッケージリストを更新
sudo apt update -y

# 必要なパッケージをインストール
sudo apt install -y apache2 mysql-server php libapache2-mod-php php-mysql curl

# Apacheサービスを再起動
sudo systemctl restart apache2

# Gitを使ってChildAppをクローン
cd /var/www/html
git clone git@github.com:ComonRaven/ChildApp.git
mkdir /var/www/html/uploads
chmod 777 /var/www/html/uploads

# 1. /etc/hosts にエントリを追加
echo "127.0.0.1 childapp.localhost" | sudo tee -a /etc/hosts

# 2. 仮想ホスト設定ファイルの作成
vhost_conf="/etc/apache2/sites-available/childapp.localhost.conf"

sudo bash -c "cat > $vhost_conf <<EOL
<VirtualHost *:80>
    ServerName childapp.localhost
    DocumentRoot /var/www/html/ChildApp/two-afc/apps-for-children
    DirectoryIndex index.php

    <Directory /var/www/html/ChildApp/two-afc/apps-for-children>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/childapp_error.log
    CustomLog ${APACHE_LOG_DIR}/childapp_access.log combined
</VirtualHost>
EOL"

# 3. パーミッション設定
sudo chown -R $USER:$USER /var/www/html/ChildApp
sudo chmod -R 755 /var/www/html/ChildApp

# 4. 仮想ホストの有効化
sudo a2ensite childapp.localhost.conf

# 5. Apacheを再起動
sudo systemctl reload apache2

# Apacheの動作確認
curl http://childapp.localhost

echo "Apache設定が完了しました。childapp.localhostにアクセスして動作確認してください。"

# MySQLの設定
MYSQL_ROOT_PASSWORD="kH_vYyTq4nLK7_zj5NSfb"
MYSQL_USER="childapp_user"
MYSQL_PASSWORD="sdTJRTPutuXQ-Wlb2WBVE"
MYSQL_DB="childapp_test"

# MySQL rootユーザーでログインして作業を行う
echo "MySQL rootパスワードの設定を行います..."
sudo mysql -u root -p $MYSQL_ROOT_PASSWORD <<EOF
# 1. データベースの作成
CREATE DATABASE IF NOT EXISTS $MYSQL_DB;

# 2. ユーザーの作成と権限付与
CREATE USER IF NOT EXISTS '$MYSQL_USER'@'localhost' IDENTIFIED BY '$MYSQL_PASSWORD';
GRANT ALL PRIVILEGES ON $MYSQL_DB.* TO '$MYSQL_USER'@'localhost';

# 3. テーブル作成 (users)
USE $MYSQL_DB;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(8) NOT NULL,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY email (email),
  UNIQUE KEY username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

# 4. categoriesテーブル作成
CREATE TABLE IF NOT EXISTS categories (
  id INT NOT NULL AUTO_INCREMENT,
  username VARCHAR(255) NOT NULL,
  category_name VARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  KEY username (username),
  CONSTRAINT categories_ibfk_1 FOREIGN KEY (username) REFERENCES users(username)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb3;

# 5. study_dataテーブル作成
CREATE TABLE IF NOT EXISTS study_data (
  id INT NOT NULL AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL,
  study_time VARCHAR(20) NOT NULL,
  images TEXT,
  PRIMARY KEY (id)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb3;

# 6. 権限の再ロード
FLUSH PRIVILEGES;

EOF

echo "MySQL設定が完了しました。"