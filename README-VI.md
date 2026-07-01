# My Suno Music - Spotify Style

## Cách dùng
1. Upload toàn bộ file/thư mục trong gói này lên GitHub repo.
2. Bật GitHub Pages: Settings > Pages > Deploy from a branch > main > /(root).
3. Thêm nhạc vào thư mục `music`.
4. GitHub Actions tự cập nhật `library.js`.
5. Mở link GitHub Pages để nghe.

## Mật khẩu
Mật khẩu mặc định: `123456`

Đổi trong file `app.js`:
```js
const PASSWORD = '123456';
```

## Cấu trúc album
```text
music/
  Nhac Hoa/
    album.jpg
    Bai 01.mp3
    Bai 02.wav
  Piano/
    cover.png
    Piano 01.flac
```

Tên thư mục con trong `music` sẽ là tên album. Ảnh bìa ưu tiên: `cover.jpg`, `folder.jpg`, `album.jpg`, `artwork.jpg`, hoặc PNG/WEBP tương ứng.

## Định dạng hỗ trợ
MP3, WAV, FLAC, M4A, AAC, OGG, OPUS, WEBM. Trình duyệt có thể không phát một số codec hiếm.
