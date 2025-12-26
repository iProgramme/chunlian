const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // 提供静态文件服务

// 获取body内容的端点
app.post('/extract-body', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // 使用axios获取页面内容，设置适当的headers
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://www.google.com/',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0'
      },
      timeout: 10000, // 10秒超时
      maxRedirects: 5 // 最大重定向次数
    });

    // 使用cheerio解析HTML
    const $ = cheerio.load(response.data);

    // 提取body内容
    const bodyContent = $('body').html();

    // 提取特定元素的文本内容
    const detailTitle = $('#detail-title').text().trim();
    const detailDesc = $('#detail-desc').text().trim();

    if (!bodyContent) {
      // 如果没有找到body标签，返回整个HTML
      return res.status(200).json({
        content: response.data,
        source: 'full_html',
        elements: {
          detailTitle: detailTitle || null,
          detailDesc: detailDesc || null
        }
      });
    }

    res.status(200).json({
      content: bodyContent,
      source: 'body_innerHTML',
      elements: {
        detailTitle: detailTitle || null,
        detailDesc: detailDesc || null
      }
    });
  } catch (error) {
    console.error('Error extracting content:', error.message);
    res.status(500).json({ error: `无法获取内容: ${error.message}` });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});