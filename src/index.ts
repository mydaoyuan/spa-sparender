import * as puppeteer from 'puppeteer'
import logger from './utils/logger'
import * as fs from 'fs'
import * as path from 'path'

let visitedPages: Set<string> = new Set()

function isInternalLink(targetUrl: string, linkUrl: string): boolean {
  if (!linkUrl) return false
  logger.info(`Checking ${linkUrl} against ${targetUrl}`)
  const { host: targetHost } = new URL(targetUrl)
  const { host: linkHost } = new URL(linkUrl)

  return targetHost === linkHost
}

function getPathFromUrl(url: string, targetUrl: string): string {
  const urlPath = new URL(url).pathname
  const targetHost = new URL(targetUrl).host
  if (urlPath === '/') {
    return path.join(targetHost, 'index.html')
  }
  const pathParts = urlPath.split('/').filter((part) => part !== '')

  // Make sure .html is appended to the last part of the path
  pathParts[pathParts.length - 1] = pathParts[pathParts.length - 1] + '.html'

  return path.join(targetHost, ...pathParts)
}

async function crawl(page: puppeteer.Page, url: string, targetUrl: string) {
  if (visitedPages.has(url) || !isInternalLink(targetUrl, url)) {
    return
  }
  visitedPages.add(url)

  await page.goto(url, { waitUntil: 'networkidle0' })

  // 保存当前页面的DOM
  const content = await page.content()
  const filePath = getPathFromUrl(url, targetUrl)
  logger.info(`Saving ${url} to ${filePath}`)
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, content)

  // 查找当前页面的所有链接并爬取
  const links = await page.$$eval('a', (as) => as.map((a) => a.href))
  for (let link of links) {
    await crawl(page, link, targetUrl)
  }
}

;(async () => {
  const targetUrl = 'http://localhost:3008'
  const browser: puppeteer.Browser = await puppeteer.launch({
    headless: 'new',
  })
  const page: puppeteer.Page = await browser.newPage()

  await crawl(page, targetUrl, targetUrl)

  await browser.close()
  logger.info('Done!')
})()
