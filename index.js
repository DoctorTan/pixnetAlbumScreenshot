const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function getScreenHot(link) {
  let i = 0
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({
    width: 1270,
    height: 1080,
    isLandscape: true

  });
  await page.goto(link);
  // await page.focus("#kw")

  // await page.keyboard.sendCharacter('陈明筠')
  // await page.keyboard.down('Enter');


  const dir = path.join(process.cwd(), '图啊啊');

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
    console.log(`创建文件夹:   ${dir}  成功`);
  }
  // 相册名字
  //获取下一页的页面链接
  let { albumName, nextlink } = await page.evaluate(async () => {
    const element = document.querySelector('.nextBtn'); // 使用类名选择器获取元素
    const albumName = document.querySelector('meta[name="description"]').getAttribute('content');
    return { nextlink: element.href, albumName }; // 获取 href 属性值

  })
  if (nextlink) {
    console.log('立刻执行');
    getScreenHot(nextlink)
  }



  //准备截图
  await autoScroll(page)
  await page.screenshot({
    path: `${dir}/${filterPathName(albumName)}--${++i}.png`, fullPage: true
  });
  await browser.close()
}
getScreenHot('https://abbey1117.pixnet.net/album/set/14245552')
// getScreenHot('https://abbey1117.pixnet.net/album/set/14245552?after=104096618')




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
  return albumName.replace(specialCharsRegex, '');
}
