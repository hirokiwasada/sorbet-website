# sorbet コーポレートサイト

株式会社sorbetの公開コーポレートサイト。

- **URL**: https://sorbet-tokyo.com/
- **正本**: `01_projects/100_SOR/website/`（このディレクトリ）
- **デプロイ**: 独立Vercelプロジェクト `sorbet-www` 経由（独立GitHubリポジトリ `sorbet-website` を連携先に設定）

## 構成

```
.
├── index.html        ロングスクロール本体
├── css/site.css      新カラーパレット（Sky/Aqua/Marine/Slate/Dusk 等）+ レイアウト
├── js/site.js        IntersectionObserver / nav active / hamburger
├── assets/           ロゴ・写真・ファビコン・OGP
├── robots.txt
├── sitemap.xml
└── README.md
```

## 編集 → 公開フロー

1. `index.html` / `css/` / `js/` をローカルで編集
2. ブラウザで `index.html` を直接開いて確認、またはローカルサーバ:
   ```
   cd 01_projects/100_SOR/website
   python3 -m http.server 8000
   # http://localhost:8000 で確認
   ```
3. 機密文言チェック:
   ```
   grep -iE "NVIC|tablemark|テーブルマーク|CONFIDENTIAL|丸亀|NIPPUN|JT|P&G|アコム|LINEヤフー|CBC|カンテレ|PASONA|miyabi-entertainment" index.html css/site.css
   ```
4. 配信用GitHubリポへ rsync → push → Vercel自動デプロイ

## カラーパレット

| トークン | Hex | 用途 |
|:---|:---|:---|
| Sky | `#B8DDED` | ヒーロー背景・グラデ |
| Aqua | `#8EC4DE` | メインアクセント・h2見出し |
| Marine | `#6AADCF` | サブアクセント・リンク |
| Slate | `#4A7A95` | h1見出し・強調 |
| Dusk | `#2C5872` | 最濃ポイント・テーブルヘッダー |
| Pale | `#E8F4FA` | カード背景 |
| Cream | `#F8FBFD` | ページ背景 |
| Text | `#3A5168` | 本文 |
| Muted | `#8FA8B8` | 注釈 |

ロゴ実色（ペールブルー球体）と整合させるため、旧 sorbetデザインシステムから Deep を明度UP（紺 #1E3A52 → ダスティブルー #2C5872）。

## 編集ガイドライン

- **連絡先**: `wasada@sorbet-tokyo.com`（mailto: + JSON-LD email プロパティ）
- **クライアント実績**: 業界別タグのみ。社名列挙はNG
- **MIYABI**: ロゴ・リンク掲載なし。文章でグループ連携言及のみ
- **コスト試算**: TVCM比較・代理店マージン等の数値訴求は載せない
- **USJ実績詳細**: 載せない（leadership のキャリアステップ表記のみ）
