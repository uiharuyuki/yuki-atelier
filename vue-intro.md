# Vue.js 予習ノート（スマホで読む用）

> AltX（サービス・イノベーション事業部＝Webフロント）の選考対策。
> **手を動かす前の地ならし**として、移動中に読むためのノート。
> JS初心者向け・暗記しなくていい・「へぇ」と思えればOK。

---

## 0. これを読む目的

帰宅後に `vue-practice` で実際に Vue を触る。その前に**言葉と全体像だけ**頭に入れておくと、手を動かすときに迷わない。
面接では「説明会で Vue を使うと聞いたので、試しました」と**正直に**言うのがゴール。だから完璧じゃなくていい。

---

## 1. Vue.js ってなに（3行で）

- **画面（HTML）を、データに合わせて自動で書き換えてくれる JavaScript の道具**。
- 素の JS だと「ボタンが押された → 自分で文字を書き換える」を全部手で書く。Vue は**データを変えるだけで画面が勝手に追従**する。
- AltX のフロント業務で使う。React と並ぶ代表的な選択肢のひとつ。

---

## 2. 一番大事な考え方＝「リアクティブ」

Vue の肝はこれひとつ。**値を変えると、その値を使っている画面が自動で更新される**こと。

**素のJSの場合（手動）**

```js
let count = 0;
button.onclick = () => {
  count++;
  display.textContent = count; // ← 画面の更新を自分で書く必要がある
};
```

**Vueの場合（自動）**

```js
const count = ref(0);
const increment = () => { count.value++ }; // 値を変えるだけ。画面はVueが更新
```

> `count` を 1 増やすと、画面の `{{ count }}` の部分が**勝手に**1 増える。この「自動で追従」がリアクティブ。

---

## 3. 最小の動くコード（読むだけでOK）

ビルド環境なし。HTML に Vue を CDN で読み込むだけで動く。

```html
<div id="app">
  <p>{{ message }}</p>   <!-- ② {{ }} の中はデータが入る窓 -->
</div>

<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
<script>
  const { createApp, ref } = Vue

  createApp({
    setup() {
      const message = ref('こんにちは Vue')  // ① リアクティブな値
      return { message }                     // ③ returnして初めてHTMLで使える
    }
  }).mount('#app')   // ④ id="app" の場所にVueを差し込む
</script>
```

読み方：
- `ref('...')` … **変わると画面が追従する値**を作る。JS側で中身を読み書きするときは `message.value`。
- `{{ message }}` … HTML 側に**データを表示する窓**（マスタッシュ＝口ひげ、と呼ぶ）。
- `return { ... }` … ここに入れた値だけが HTML 側で使える。
- `.mount('#app')` … 「この div を Vue が管理するよ」という宣言。

---

## 4. ディレクティブ＝HTMLに付ける `v-○○` の特殊属性

Vue では、HTML タグに `v-○○` という属性を付けて挙動を指定する。これを**ディレクティブ**と呼ぶ。よく使う5つだけ覚えれば Todo は作れる。

| 書き方 | 何をする | 短い例 |
| --- | --- | --- |
| `v-bind:` （略して `:`） | 属性にデータを流し込む | `<img :src="imgUrl">` |
| `v-on:` （略して `@`） | イベントを拾う | `<button @click="increment">+1</button>` |
| `v-model` | 入力欄とデータを**双方向**で繋ぐ | `<input v-model="text">` |
| `v-for` | 配列を**繰り返し表示** | `<li v-for="t in list">{{ t }}</li>` |
| `v-if` | 条件で**出す/消す** | `<p v-if="done">完了</p>` |

ざっくり覚え方：
- `:` は「**渡す**」、`@` は「**受け取る**」。
- `v-model` は「入力欄とデータが**鏡みたいに同期**」。
- `v-for` は「**リストを並べる**」、`v-if` は「**条件で出し分け**」。

---

## 5. Todoアプリの完成イメージ（読むだけ）

帰宅後に作るやつ。今は「こういう形か」と眺めるだけでOK。

```html
<div id="app">
  <input v-model="newText" @keyup.enter="add" placeholder="やることを入力" />
  <button @click="add">追加</button>

  <ul>
    <li v-for="(todo, i) in todos" :key="i">
      <input type="checkbox" v-model="todo.done" />
      <span :class="{ done: todo.done }">{{ todo.text }}</span>
      <button @click="remove(i)">削除</button>
    </li>
  </ul>
</div>

<script>
  const { createApp, ref } = Vue
  createApp({
    setup() {
      const newText = ref('')
      const todos = ref([])                       // 配列もリアクティブにできる
      const add = () => {
        if (newText.value === '') return
        todos.value.push({ text: newText.value, done: false })
        newText.value = ''                        // 入力欄を空に戻す
      }
      const remove = (i) => { todos.value.splice(i, 1) }
      return { newText, todos, add, remove }
    }
  }).mount('#app')
</script>
```

読みどころ：
- `v-for="(todo, i) in todos"` … `todos` 配列を1件ずつ `todo` として並べる。`i` は番号（削除に使う）。
- `v-model="todo.done"` … チェックボックスと `done`（true/false）が同期。
- `:class="{ done: todo.done }"` … `done` が true のときだけ `done` という CSS クラスを付ける（打ち消し線など）。
- `todos.value.push(...)` … 配列に足すと、`v-for` の表示も**自動で増える**（＝リアクティブ）。

---

## 6. 面接で言えること（正直版・盛らない）

- 「説明会で Vue.js を使うと伺ったので、**公式チュートリアルを触って、簡単な Todo アプリを作ってみました**。」
- 「素の JavaScript だと画面の更新を自分で書きますが、Vue は**データを変えると画面が自動で更新される（リアクティブ）**のが新鮮でした。」
- 「`v-for` でリスト表示、`v-model` で入力との同期、といった基本的な書き方を試した段階です。これから実務で深めたいです。」

> ポイント：**「もう触った」事実 ＋ 正直に"基本の段階"と言う**。嘘のない会社という相手に一番効く。

---

## 7. 用語ミニ辞典

| 用語 | ざっくり意味 |
| --- | --- |
| リアクティブ | 値を変えると画面が自動で追従すること。Vueの肝 |
| `ref` | リアクティブな値を作る関数。JS側では `.value` で読み書き |
| マスタッシュ `{{ }}` | HTMLにデータを表示する窓 |
| ディレクティブ | `v-○○` というHTMLの特殊属性（v-for, v-if など） |
| 双方向バインディング | `v-model` による「入力欄 ⇄ データ」の同期 |
| コンポーネント | 画面の部品を再利用できる単位（今回は深入りしない） |
| CDN | ネット経由でライブラリを読み込む仕組み。`<script src>` で書く |

---

## 8. 帰宅後にやること

`B:\vue-practice` フォルダで Claude Code を起動して、ハンズオン開始。
このノートで「言葉」を入れたぶん、手を動かすのが速くなるはず。

1. ② カウンター（ref と @click）
2. ③ ディレクティブを1個ずつ
3. ④ Todoアプリ（この §5 を自分で書けるように）
4. ⑤ 面接トークメモを3行（`練習ログ.md`）

---

*このノートは予習用。暗記不要。「リアクティブ」と「v-for / v-model」だけ頭の隅に残ればOK。*
