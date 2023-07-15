const express = require('express');
const path = require('path');
const app = express();

// 设置静态文件的位置
app.use(express.static(path.join(__dirname, 'dist')));

// 对所有（"/"）请求返回 index.html
app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});


app.listen(3008, function () {
  console.log('App listening on port 3008!')
});
