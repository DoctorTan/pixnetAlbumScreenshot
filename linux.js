 const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
//////////////////////////////////////////////////////////////////
// 只需要在这里填入相册地址就行, 多相册或单相册都可以
// let link = 'https://xxx.pixnet.net/album/set/14245552'
let link = 'https://xxxx.pixnet.net/album/list'
//如果是多相册的话需要并发地截图,这里填入同时截屏的相册数,不要加太多,默认是3个相册
let limit = 3
//////////////////////////////////////////////////////////////////
let single = false
if (link.includes("album/list")) {
  console.log('解析到是多相册');
  getAlbumList(link)
} else {
  console.log('解析到是单相册');
  single = true
  getScreenHot(link)
}
//解析多相册
const startTime = new Date();
async function getAlbumList(link) {
  //开始时间  
  const browser = await puppeteer.launch({ headless: true,args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto(link);
  // 返回一个包含相册名和相册连接的
  let albumInfoList = await page.evaluate(async () => {
    // 获取用户名字
    const userAlbumName = document.querySelector('meta[name="description"]').getAttribute('content');
    let linkList = []
    // 获取所有类名为 "photolink" 的 DOM 节点
    const photoLinks = document.querySelectorAll('.album-grid-list .grid-photo .photolink');
    // 遍历每个节点并获取其 href 属性值
    photoLinks.forEach((node) => {
      const href = node.getAttribute('href');
      linkList.push(href)
    });
    //获取文件名并创建文件夹
    let AlbumNamelist = []
    const AlbumNameNodes = document.querySelectorAll('.album-grid-list .grid-photo .photolink .thumb');
    AlbumNameNodes.forEach((node) => {
      const alt = node.getAttribute('alt');
      AlbumNamelist.push(alt)
    });
    // console.log(AlbumNamelist);
    return { linkList, AlbumNamelist, userAlbumName }; // 获取 href 属性值
  })
  // 过滤非法字符
  albumInfoList.userAlbumName = filterPathName(albumInfoList.userAlbumName)
  // 先创建用户文件夹
  const useDir = path.join(process.cwd(), albumInfoList.userAlbumName);
  if (!fs.existsSync(useDir)) {
    fs.mkdirSync(useDir);
    console.log(`创建用户文件夹:   ${useDir}  成功`);
  }
  //  然后切割数组,并发
  let chunks = [];//把所有的chunk切割成弄成一个集合
  let AllChunksPromise = [];//当前统计所有执行完成时间
  //先把切割成小数组
  for (let i = 0; i < albumInfoList.linkList.length; i += limit) {
    let chunk = albumInfoList.linkList.slice(i, i + limit);
    chunks.push(chunk)
  }
  browser.close()
  for (let i = 0; i < chunks.length; i++) {
    let promiseChunk = []
    chunks[i].forEach(item => {
      promiseChunk.push(getScreenHot(item, albumInfoList.userAlbumName))
      AllChunksPromise.push(promiseChunk)
    })
    await Promise.all(promiseChunk);
  }

  await Promise.all(AllChunksPromise.flat());
  const endTimeCollect = new Date();
  const timeTaken = endTimeCollect - startTime;
  console.log('全部执行完,花费', timeTaken / 1000, '秒');

}


async function getScreenHot(link, userAlbumName, index) {
  if (!index) {
    index = 1
  }
  if (!userAlbumName) {
    userAlbumName = ''
  }
  const browser = await puppeteer.launch({ headless: true,args: ['--no-sandbox'] });
  const page = await browser.newPage();
  // await page.setViewport({
  //   width: 1270,
  //   height: 1080,
  //   isLandscape: true
  // });
  await page.goto(link);
  let { albumName, nextlink } = await page.evaluate(async () => {
    const element = document.querySelector('.nextBtn'); // 使用类名选择器获取元素
    // const albumName = document.querySelector('meta[name="description"]').getAttribute('content');
    const breadcrumbElement = document.querySelector('#breadcrumb');
    const secondLink = breadcrumbElement.querySelectorAll('a')[1];
    const albumName = secondLink.innerText;
    console.log(albumName);
    return { nextlink: element.href, albumName }; // 获取 href 属性值
  })

  //处理特殊字符
  albumName = filterPathName(albumName)
  const dir = path.join(process.cwd(), userAlbumName, albumName);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
    console.log(`创建文件夹:   ${dir}  成功`);
  }

  //准备截图
  await autoScroll(page)
  // 延迟几秒再截图
  await wait(2000)
  await page.screenshot({
    path: `${dir}/${albumName}-${index}.png`, fullPage: true
  });
  console.log(`截图${albumName}-${index}成功`);
  await browser.close()
  if (nextlink) {
    // console.log('立刻执行');
    await getScreenHot(nextlink, userAlbumName, ++index)
  }
  //如果是单相册就判断
  if (single) {
    const endTimeCollect = new Date();
    const timeTaken = endTimeCollect - startTime;
    console.log('单相册全部执行完,花费', timeTaken / 1000, '秒');
  }
  return 'ok'
}

async function autoScroll(page) {
  return page.evaluate(() => {
    return new Promise((resolve, reject) => {
      let totalHeight = 0;
      let distance = 100;
      let timer = setInterval(() => {
        let scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    })
  });
}
//过滤名字
function filterPathName(albumName) {
  const specialCharsRegex = /[<>:"\/\\|?*\x00-\x1F]/g;
  return albumName.trim().replace(specialCharsRegex, '');
}
//用来做延迟
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
