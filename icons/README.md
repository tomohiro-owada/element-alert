# アイコンファイル

この拡張機能を使用するには、以下のサイズのPNGアイコンファイルが必要です：

- `icon16.png` (16x16ピクセル)
- `icon48.png` (48x48ピクセル)
- `icon128.png` (128x128ピクセル)

## アイコンの作成方法

### オンラインツールを使用

1. [Favicon Generator](https://favicon.io/) にアクセス
2. テキストまたは画像からアイコンを作成
3. 生成されたファイルをこのディレクトリに配置

### 画像編集ソフトを使用

- Photoshop、GIMP、Pixlr などで作成
- 各サイズ（16x16、48x48、128x128）で保存

### コマンドラインツール（ImageMagick）

```bash
# 1つの画像から複数サイズを生成
convert source.png -resize 16x16 icon16.png
convert source.png -resize 48x48 icon48.png
convert source.png -resize 128x128 icon128.png
```

## アイコンなしで使用する場合

アイコンファイルがない場合は、`manifest.json` を編集してアイコン関連の設定を削除してください。
詳細は親ディレクトリの `README.md` を参照してください。
