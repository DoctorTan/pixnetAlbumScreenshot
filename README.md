用來給痞客邦相冊做個截屏, 以免以後痞客邦不在了,就沒了回憶,如果想下載痞客邦的相冊, 可以看我另外一個倉庫
https://github.com/DoctorTan/pixnetAlbumSaved

js腳本运行在nodejs环境, 先安装nodejs

```js
https://nodejs.org/en
```

如果是linux系統,先安装谷歌瀏覽器的依賴.linux用戶下載linux分支的index.js不然無法運行 
我在linux運行截屏有點問題,不知你們有沒有, 就是文字不顯示,可以參考這個來修改字體
https://www.cnblogs.com/ghostmen/p/17513432.html
win用戶可以跳過這一步
```undefined
sudo yum install -y chromium
```

再安装js依赖
```js
npm i
```

如果是多相冊,例如這種,把這裡的鏈接複製下來
![image](https://github.com/DoctorTan/pixnetAlbumScreenshot/assets/87746911/d5ed4ca3-f097-4d0d-9f62-63a15ec50433)
單相冊是這樣
![image](https://github.com/DoctorTan/pixnetAlbumScreenshot/assets/87746911/97eebf64-06aa-4336-b802-1eabb0500e84)
然後替換js文件裡面的鏈接
![image](https://github.com/DoctorTan/pixnetAlbumScreenshot/assets/87746911/015c8e3d-8229-4f28-8092-e64cf6518742)
cmd控制台輸入
```js
node index.js
```
這是解析之後的結果
![image](https://github.com/DoctorTan/pixnetAlbumScreenshot/assets/87746911/2674f921-9cd8-4901-be22-eb682a99af46)
單圖片是這種效果
![灼眼的夏娜♥-1](https://github.com/DoctorTan/pixnetAlbumScreenshot/assets/87746911/e5e6889a-a4e8-4399-ab0c-22f306ab8154)
有問題聯繫郵箱:**tanyupeng528@gmail.com**
