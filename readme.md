### 使用服务

安装依赖 npm install

修改 src/index.ts 中的 targetUrl http://localhost:3008 改为 自己启动的 spa 应用地址。

PS： 可以使用项目中的 spa-server.js 脚本， 将脚本移动到你的 spa 应用 ，`node spa-server.js` 即可启动一个 SPA 服务， 运行在 localhost:3008。

### spa 渲染

执行 npm run dev 输出 done 日志后，即为转换完成。脚本会访问你启动的 spa 服务，查找页面的所有 a 标签，进行访问爬取。爬取的 html 内容会放到以域名为目录的文件夹下。

当输出 done 日志后，代表爬取完成。此时就得到了 spa 的静态渲染文件了。

接下来就是要让爬虫能访问到爬取的 html 文件。 正常用户访问的时候，返回正常的 spa 页面逻辑。

### 启动静态文件服务

你可以参考项目中的 nginx.conf 配置，启动一个 nginx 服务进行本地验证。 核心逻辑是根据 user_agent 字段，判断是否是爬虫，如果是爬虫访问，我们就把请求转发到另外一个专门为 bot 启动的 server。

因为我直接在 location / 中判断的时候，报错了 nginx: [emerg] "try_files" directive is not allowed。 在 Nginx 中，try_files 指令不能在 if 条件块中使用。 如果有更好的解决方案欢迎你在 issue 中提出。

### 验证服务

【默认你使用了 nginx 代理 spa】

把爬取的静态文件拷贝到 spa 产物 dist 目录下，新建一个 bot 文件夹 存储。

可以本地启动 nginx.conf 进行验证【nginx 文件的 root 目录替换成你自己电脑的地址】。

执行 `curl -H 'User-agent:Googlebot' http://localhost:3008`

查看是否成功返回渲染后的 html 页面

### 服务端动态渲染（利用 user-agent）

为了提高用户体验我们用了 SPA 技术、为了 SEO 我们用了 SSR、预渲染等技术。不同技术方案有一定差距，不能兼顾优点。但仔细想，需要这些技术优点的`用户`，其实时不一样的，SPA 针对的是浏览器普通用户、SSR 针对的是网页爬虫，如 googlebot、baiduspider 等，那为什么我们不能给不同`用户`不同的页面呢，服务端动态渲染就是这种方案。

基本原理： 服务端对请求的 user-agent 进行判断，浏览器端直接给 SPA 页面，如果是爬虫，给经过动态渲染的 html 页面(因为蜘蛛不会造成 DDOS,所以这种方案相对于 SSR 能节省不少服务器资源)

PS： 你可能会问，给了爬虫不同的页面，会不会被认为是网页作弊行为呢？
Google 给了<a href="https://developers.google.com/search/docs/guides/dynamic-rendering" target="_blank">回复</a>：

Dynamic rendering is not cloaking
Googlebot generally doesn't consider dynamic rendering as cloaking. As long as your dynamic rendering produces similar content, Googlebot won't view dynamic rendering as cloaking.
When you're setting up dynamic rendering, your site may produce error pages. Googlebot doesn't consider these error pages as cloaking and treats the error as any other error page.
Using dynamic rendering to serve completely different content to users and crawlers can be considered cloaking. For example, a website that serves a page about cats to users and a page about dogs to crawlers can be considered cloaking.

也就是说，如果我们没有刻意去作弊，而是使用动态渲染方案去解决 SEO 问题，爬虫经过对比网站内容，没有明显差异，不会认为这是作弊行为。

至于百度,请参考
<a href="https://www.zhihu.com/question/19864108" target="_blank">豆丁网是在做黑帽 SEO 吗？</a>

<a href="https://ask.seowhy.com/question/16688" target="_blank">通过 user-agent 判断，将 Baiduspider 定向到 http 页面</a>

基本的解释是:

> 的确从单一 feature 来讲，会比较难区分 cloaking 型的 spam 和豆丁类的搜索优化，但是搜索引擎判断 spam 绝对不会只用一个维度的 feature。docin 这样的网站，依靠它的外链关系、alexa 流量、用户在搜索结果里面的点击行为等等众多信号，都足以将其从 spam 里面拯救出来了。
>
> 何况，一般的 spam 肯定还有关键词堆砌、文本语义前后不搭、link farm 等等众多特征。总之 antispam 一门综合性的算法，会参考很多要素，最后给出判断。
>
> 实在不行了，还可以有白名单作为最后的弥补手段，拯救这批大网站是没什么问题的啦。

所以不做过多的黑帽或者灰帽, 百度也不会做作弊处理

### 感谢

https://github.com/zuoyanart/sparender 项目
