const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
//////////////////////////////////////////////////////////////////
// 只需要在这里填入相册地址就行, 多相册或单相册都可以
let link = 'https://y1117.pixnet.net/album/list'
//////////////////////////////////////////////////////////////////
if (link.includes("album/list")) {
  console.log('解析到是多相册');
  getAlbumList(link)
} else {
  console.log('解析到是单相册');
  getScreenHot(link)
}
//解析多相册
async function getAlbumList(link) {
  //开始时间
  const startTime = new Date();
  const browser = await puppeteer.launch({ headless: false });
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
  albumInfoList.userAlbumName = filterPathName(albumInfoList.userAlbumName)
  const useDir = path.join(process.cwd(), albumInfoList.userAlbumName);
  if (!fs.existsSync(useDir)) {
    fs.mkdirSync(useDir);
    console.log(`创建用户文件夹:   ${useDir}  成功`);
  }
  //这里已经获取相册列表
  let AlbumPromise = []
  for (let i = 0; i < albumInfoList.AlbumNamelist.length; i++) {
    // 创建文件夹
    const albumName = filterPathName(albumInfoList.AlbumNamelist[i])
    const dir = path.join(process.cwd(), albumInfoList.userAlbumName, albumName);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
      console.log(`创建文件夹:   ${dir}  成功`);
    }
    //实现相册截图
    AlbumPromise.push(getScreenHot(albumInfoList.linkList[i], albumInfoList.userAlbumName))
  }
  // console.log(AlbumPromise);
  Promise.all(AlbumPromise).then(res => {
    const endTimeCollect = new Date();
    const timeTaken = endTimeCollect - startTime;
    console.log('全部执行完,花费', timeTaken / 1000, '秒');
  })
  browser.close()
}


async function getScreenHot(link, userAlbumName, index) {
  if (!index) {
    index = 1
  }
  if (!userAlbumName) {
    userAlbumName = ''
  }
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({
    width: 1270,
    height: 1080,
    isLandscape: true
  });
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
  await wait(5000)
  await page.screenshot({
    path: `${dir}/${albumName}-${index}.png`, fullPage: true
  });
  console.log(`截图${albumName}-${index}成功`);
  await browser.close()
  if (nextlink) {
    // console.log('立刻执行');
    await getScreenHot(nextlink, userAlbumName, ++index)
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
  return albumName.replace(specialCharsRegex, '').trim();
}
//用来做延迟
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
