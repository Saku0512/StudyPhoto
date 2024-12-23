#!/bin/bash

# パッケージリストを更新
sudo apt update -y

# 必要なパッケージをインストール
sudo apt install -y apache2 mysql-server php libapache2-mod-php php-mysql curl

# Apacheサービスを再起動
sudo systemctl restart apache2

# Gitを使ってChildAppをクローン
username=$(whoami)
cd /var/www/html
sudo chown -R $username:$username /var/www/html
sudo chmod -R 755 /var/www/html
git clone git@github.com:ComonRaven/ChildApp.git
mkdir /var/www/html/uploads
sudo chmod -R 777 /var/www/html/uploads
sudo chown -R $username:$username /var/www/html/uploads

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

    # アップロードディレクトリへのエイリアス設定
    Alias /uploads /var/www/html/uploads
    <Directory /var/www/html/uploads>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/childapp_error.log
    CustomLog ${APACHE_LOG_DIR}/childapp_access.log combined
</VirtualHost>
EOL"

# 3. パーミッション設定
sudo chown -R $username:$username /var/www/html/ChildApp
sudo chmod -R 755 /var/www/html/ChildApp

# 4. 仮想ホストの有効化
sudo a2ensite childapp.localhost.conf

# 5. Apacheを再起動
sudo systemctl restart apache2



echo "Apache設定が完了しました。childapp.localhostにアクセスして動作確認してください。"
curl childapp.localhost

# MySQLの設定
MYSQL_ROOT_PASSWORD="kH_vYyTq4nLK7_zj5NSfb"
MYSQL_USER="childapp_user"
MYSQL_PASSWORD="sdTJRTPutuXQ-Wlb2WBVE"
MYSQL_DB="childapp_test"

# MySQL rootユーザーでログインして作業を行う
echo "MySQL rootパスワードの設定を行います..."
sudo mysql -u root <<EOF
# 1. データベースの作成
CREATE DATABASE IF NOT EXISTS $MYSQL_DB;

# 2. ユーザーの作成と権限付与
CREATE USER IF NOT EXISTS '$MYSQL_USER'@'localhost' IDENTIFIED BY '$MYSQL_PASSWORD';
GRANT ALL PRIVILEGES ON $MYSQL_DB.* TO '$MYSQL_USER'@'localhost';

# 3. テーブル作成 (users)
USE $MYSQL_DB;

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(8) NOT NULL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

# 4. categoriesテーブル作成
CREATE TABLE IF NOT EXISTS categories (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    category_name VARCHAR(255) NOT NULL,
    FOREIGN KEY (username) REFERENCES users(username)
);

# 5. study_dataテーブル作成
CREATE TABLE IF NOT EXISTS study_data (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    study_time VARCHAR(20) NOT NULL,
    SspentTime TEXT NOT NULL,
    images TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

ALTER TABLE categories DROP FOREIGN KEY categories_ibfk_1;
ALTER TABLE categories ADD CONSTRAINT categories_ibfk_1 
FOREIGN KEY (username) REFERENCES users(username) 
ON UPDATE CASCADE;

ALTER TABLE study_data DROP FOREIGN KEY fk_study_data_username;

ALTER TABLE study_data
ADD CONSTRAINT fk_study_data_username
FOREIGN KEY (username) REFERENCES users(username)
ON DELETE CASCADE;

# 6. 権限の再ロード
FLUSH PRIVILEGES;

EOF

echo "MySQL設定が完了しました。"
