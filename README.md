# threejs-cannonjs
cannon.jsを使って物理演算をする

demo
https://yuki-sakaguchi.github.io/threejs-cannonjs/dist/

https://user-images.githubusercontent.com/16290220/224551461-5a4323c8-0576-400c-869c-d8dee98a792d.mov

# 参考
https://blog.nijibox.jp/article/hello-threejs-physics/

# メモ
- 考え方
  - three.jsで普通にシーンを作ってオブジェクトとかを配置する。同じように物理演算用の世界とシーンを意識したbodyを作って両方管理する
  - 物理演算で勝手にbody側のオブジェクトが動くので、その位置とかをscene側に反映して使う
- three.jsとcannon.jsでxyzの扱いが違う
  - yとzのが違うので、90度傾きを変えてあげることで対応
- 動きが遅い
  - MKS単位なので、多きすごると遅い
  - 1 = 1mとして考えると良い
- meshのsizeはbodyのsizeの2倍にする
  - 多きさを揃えるために必要
