# ChildApp
児童の交通安全推進アプリを作る。
two-afcディレクトリの中の、apps-for-childrenディレクトリで基本操作してほしい。
今どうゆうものを作るかはまだ決まってないから、「お問い合わせ」だけ作ってる。

随時更新するので必ず読んでほしい。

<git,githubの使い方>

STEP0:githubのコードを自分の作業環境に持ってくる<br>
$ sudo apt install git //gitを入れる<br>
$ mkdir hoge //作業用のディレクトリを作る<br>
$ cd hoge<br>
$ git clone https://github.com/ComonRaven/ChildApp.git //githubの中身を自分の実行環境にコピーする<br>
<br>
STEP1:自分の実行環境でコード等の編集を行う。<br>
$ git checkout -b develop //developという役割を作成し、developに変更する。デフォルトではmainになっているはず。<br>
$ git checkout -b hoge //編集をするときに適当な名前の役割を作成し、自分をその役割に変更する。
<br>
STEP2:githubに変更内容を反映させる<br>
$ git add . && git commit -m "hoge" <br>
// hogeの部分は"[自分の名前] 月/日 変更内容"の書式で書いてほしい<br>
$ git push origin hoge //githubに反映させる。<br>
githubのPull requestタブをクリック。New pull requestをクリック。<br>
base:をdevelop,compare:をSTEP1で作成したhogeにする。<br>
Creat pull requestを押す。右下のCreat pull requestを押す。<br>
Merge pull requestを押す。Confirm mergeを押す。<br>
編集を終了する時は、Delete branchを押してhogeを消す。

STEP++:他の人が編集し、githubに反映させた後に自分の実行環境にほかの人の編集内容を反映させる。<br>
$ git fetch origin //githubの変更内容を取得する<br>
$ git merge origin/develop //githubの変更内容を反映させる。<br>
※うまくmergeされない時がある。その時は自分でファイルを編集し、反映させる。
