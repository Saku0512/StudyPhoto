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
// hogeの部分は"[自分の名前] 変更内容"の書式で書いてほしい<br>
$ git push origin develop //githubに反映させる。<br>
githubのPull requestタブをクリック。New pull requestをクリック。<br>
base:をdevelop,compare:をSTEP1で作成したhogeにする。<br>
