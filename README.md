# ChildApp
児童の交通安全推進アプリを作る。<br>
two-afcディレクトリの中の、apps-for-childrenディレクトリで基本操作してほしい。<br>
今どうゆうものを作るかはまだ決まってないから、「お問い合わせ」だけ作ってる。<br>
<br>
随時更新するので必ず読んでほしい。<br>
<br>
進捗<br>
・<del> Google認証 </del> <br>
・ 課金画面 <br>
・ ホーム画面 <br>
・ 私たちについて <br>
・ サービス <br>
・ クイズ画面 <br>
・ クイズ実装 <br>
・<del> お問い合わせ </del> <br>
・<del> ログアウト </del> <br>
<br>
<git,githubの使い方><br>
詳しくは右のサイト→ https://qiita.com/renesisu727/items/248cb9468a402c622003 <br>
<br>
STEP0:githubのコードを自分の作業環境に持ってくる<br>
$ sudo apt install git //gitを入れる<br>
$ mkdir hoge //作業用のディレクトリを作る<br>
$ cd hoge<br>
$ git clone https://github.com/ComonRaven/ChildApp.git //githubの中身を自分の実行環境にコピーする<br>
上のcloneで行けなかった場合は、下のほうでやって<br> <br>
$ sudo apt install git <br>
$ mkdir hoge <br>
$ cd ~/.ssh //デフォルトでなければ作成 <br>
$ ssh-keygen -t rsa //なんか聞かれたらEnterを連打 <br>
$ less id_rsa.pub //最後のメールアドレス以外をコピー <br>
githubを開き、自分のアイコン→settings→SSH and GPG keys→New SSH key <br>
titleは適当でいい。typeはAuthentication Key。Keyに先ほどコピーしたid_rsa.pubをペースト。Add SSH keyをクリック。<br>
接続確認 <br>
$ cd hoge <br>
$ ssh -T git@github.com //Hi ユーザー名! You've successfully authenticated, but GitHub does not provide shell access.って表示されたらok <br>
$ git clone git@github.com:ComonRaven/ChildApp.git <br>
<br>
STEP1:自分の実行環境でコード等の編集を行う。<br>
$ git checkout -b develop //developという役割を作成し、developに変更する。デフォルトではmainになっているはず。<br>
$ git checkout -b hoge //編集をするときに適当な名前の役割を作成し、自分をその役割に変更する。<br>
<br>
STEP2:githubに変更内容を反映させる<br>
$ git add . && git commit -m "hoge" <br>
// hogeの部分は"[自分の名前] 月/日 時間　変更内容"の書式で書いてほしい<br>
//例) git commit -m "[佑作] 8/7 20:16 index.htmlの修正"<br>
$ git push origin hoge //githubに反映させる。<br>
githubのPull requestタブをクリック。New pull requestをクリック。<br>
base:をdevelop,compare:をSTEP1で作成したhogeにする。<br>
Creat pull requestを押す。右下のCreat pull requestを押す。<br>
Merge pull requestを押す。Confirm mergeを押す。<br>
編集を終了する時は、Delete branchを押してhogeを消す。<br>

STEP++:他の人が編集し、githubに反映させた後に自分の実行環境にほかの人の編集内容を反映させる。<br>
$ git fetch origin //githubの変更内容を取得する<br>
$ git merge origin/develop //githubの変更内容を反映させる。<br>
※うまくmergeされない時がある。その時は自分でファイルを編集し、反映させる。<br>

<firebaseの使い方><br>
今回の開発はfirebaseというのもを使った行っている。<br>
詳しくはまだ俺も分からないから、色々調べがついたら更新する。<br>
