const fs = require("fs-extra");
const path = require("path");
const { marked } = require("marked");
const matter = require("gray-matter");

// 时间格式化函数
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}年${month}月${day}日`;
}

// 配置marked选项
marked.setOptions({
  gfm: true, // 启用GitHub风格的Markdown
  breaks: true, // 启用回车换行
  headerIds: true, // 为标题添加id
  mangle: false, // 不转义标题中的特殊字符
  highlight: function (code, lang) {
    const lines = code
      .split("\n")
      .map((line) =>
        line
          ? `<span class="line">${line}</span>`
          : '<span class="line"> </span>'
      )
      .join("");

    return `<div class="code-block" data-language="${lang || "text"}">
              <button class="copy-button" onclick="copyCode(this)">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>复制代码</span>
              </button>
              <pre><code class="language-${
                lang || "text"
              }">${lines}</code></pre>
            </div>`;
  },
});

// HTML模板
const htmlTemplate = (content, metadata, relatedArticles) => `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${metadata.title || "Untitled"}</title>
    <link rel="shortcut icon" href="code.svg" type="image/x-icon" />
    <link rel="stylesheet" href="../skill/css/article.css">
    <link rel="stylesheet" href="../skill/css/prism.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&display=swap">
</head>
<body class="line-numbers">
    <nav class="nav-bar">
        <a href="index.html" class="nav-home">首页</a>
    </nav>
    <article class="article-container">
        <!-- 左侧目录 -->
        <aside class="article-toc">
            <div class="toc-header">
                <div class="toc-title">
                    <i class="fas fa-list"></i>
                    <span>文章目录</span>
                </div>
            </div>
            <div class="toc-content"></div>
        </aside>

        <!-- 中间文章主体 -->
        <main class="article-main">
            <header class="article-header">
                <h1>${metadata.title || "Untitled"}</h1>
                <div class="article-meta">
                    ${
                      metadata.time
                        ? `
                    <time datetime="${metadata.time}">
                        <i class="far fa-calendar-alt"></i>
                        ${formatDate(metadata.time)}
                    </time>`
                        : ""
                    }
                    ${
                      metadata.tags
                        ? `
                    <div class="article-tags">
                        ${metadata.tags
                          .map(
                            (tag) =>
                              `<span class="tag"><i class="fas fa-tag"></i>${tag}</span>`
                          )
                          .join("")}
                    </div>
                    `
                        : ""
                    }
                </div>
            </header>
            <div class="article-content">
                ${content}
            </div>
            <div class="article-footer">
                <div class="article-share">
                    <span>分享文章：</span>
                    <a href="javascript:void(0)" class="share-btn" data-platform="twitter"><i class="fab fa-twitter"></i></a>
                    <a href="javascript:void(0)" class="share-btn" data-platform="facebook"><i class="fab fa-facebook"></i></a>
                    <a href="javascript:void(0)" class="share-btn" data-platform="linkedin"><i class="fab fa-linkedin"></i></a>
                </div>
                <div class="article-actions">
                    <button class="action-btn" id="backToTop"><i class="fas fa-arrow-up"></i> 返回顶部</button>
                </div>
            </div>
        </main>

        <!-- 右侧相关文章 - 简化版 -->
        ${
          relatedArticles && relatedArticles.length > 0
            ? `
        <aside class="article-sidebar">
            <div class="related-articles">
                <div class="related-header">
                    <div class="toc-title">
                        <i class="fas fa-link"></i>
                        <span>相关文章</span>
                    </div>
                </div>
                <div class="related-list">
                    ${relatedArticles
                      .map(
                        (article) => `
                        <a href="${article.filename}" class="related-item">
                            <h3>${article.title}</h3>
                        </a>
                    `
                      )
                      .join("")}
                </div>
            </div>
        </aside>
        `
            : ""
        }
        
        <!-- 移动端目录切换按钮 -->
        <button class="toc-toggle" aria-label="切换目录">
            <i class="fas fa-chevron-right"></i>
        </button>
    </article>
    <script src="../skill/js/prism.js"></script>
    <script>
    document.addEventListener('DOMContentLoaded', () => {
        // 目录切换功能
        const toc = document.querySelector('.article-toc');
        const tocToggle = document.querySelector('.toc-toggle');
        
        // 从 localStorage 获取目录状态
        const tocCollapsed = localStorage.getItem('tocCollapsed') === 'true';
        
        // 初始化目录状态
        if (tocCollapsed) {
            toc.classList.add('collapsed');
        }
        
        // 切换按钮点击事件
        tocToggle.addEventListener('click', () => {
            toc.classList.toggle('collapsed');
            localStorage.setItem('tocCollapsed', toc.classList.contains('collapsed'));
        });
        
        // 生成目录
        const content = document.querySelector('.article-content');
        const tocContent = document.querySelector('.toc-content');
        const headings = content.querySelectorAll('h2, h3');
        
        if (headings.length > 0) {
            const tocList = document.createElement('ul');
            
            headings.forEach((heading, index) => {
                // 添加锚点ID
                const id = \`heading-\${index}\`;
                heading.id = id;
                
                // 创建目录项
                const li = document.createElement('li');
                li.className = \`toc-\${heading.tagName.toLowerCase()}\`;
                
                const link = document.createElement('a');
                link.href = \`#\${id}\`;
                link.textContent = heading.textContent;
                
                li.appendChild(link);
                tocList.appendChild(li);
                
                // 添加锚点链接到标题
                const anchor = document.createElement('a');
                anchor.className = 'heading-anchor';
                anchor.href = \`#\${id}\`;
                anchor.innerHTML = '<i class="fas fa-link"></i>';
                anchor.title = '复制链接';
                
                // 点击锚点复制链接
                anchor.addEventListener('click', (e) => {
                    e.preventDefault();
                    const url = window.location.href.split('#')[0] + '#' + id;
                    navigator.clipboard.writeText(url).then(() => {
                        const tooltip = document.createElement('div');
                        tooltip.className = 'copy-tooltip';
                        tooltip.textContent = '链接已复制';
                        document.body.appendChild(tooltip);
                        
                        setTimeout(() => {
                            tooltip.classList.add('show');
                        }, 10);
                        
                        setTimeout(() => {
                            tooltip.classList.remove('show');
                            setTimeout(() => {
                                document.body.removeChild(tooltip);
                            }, 300);
                        }, 2000);
                    });
                });
                
                heading.appendChild(anchor);
                
                // 点击目录项时在移动端收起目录
                link.addEventListener('click', (e) => {
                    if (window.innerWidth <= 1280) {
                        toc.classList.add('collapsed');
                        localStorage.setItem('tocCollapsed', 'true');
                    }
                });
            });
            
            tocContent.appendChild(tocList);
        }
        
        // 目录滚动高亮
        const observerOptions = {
            root: null,
            rootMargin: '-100px 0px -66%',
            threshold: [0, 1]
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const id = entry.target.id;
                const tocItem = document.querySelector(\`.toc-content a[href="#\${id}"]\`);
                
                if (entry.isIntersecting) {
                    // 移除其他项的高亮
                    document.querySelectorAll('.toc-content a').forEach(item => {
                        item.classList.remove('active');
                    });
                    // 添加当前项的高亮
                    tocItem?.classList.add('active');
                    
                    // 将当前项滚动到可视区域
                    if (tocItem) {
                        const tocContent = document.querySelector('.toc-content');
                        const itemTop = tocItem.offsetTop;
                        const contentHeight = tocContent.clientHeight;
                        const scrollTop = tocContent.scrollTop;
                        
                        if (itemTop < scrollTop || itemTop > scrollTop + contentHeight) {
                            tocContent.scrollTo({
                                top: itemTop - contentHeight / 2,
                                behavior: 'smooth'
                            });
                        }
                    }
                }
            });
        }, observerOptions);
        
        headings.forEach(heading => observer.observe(heading));
        
        // 代码块复制功能
        const codeBlocks = document.querySelectorAll('pre');
        codeBlocks.forEach((block, index) => {
            const container = block.parentNode;
            if (container.className === 'code-block') {
                const language = block.querySelector('code').className.match(/language-([a-z]+)/)?.[1] || 'code';
                container.setAttribute('data-language', language);
                
                const copyBtn = document.createElement('button');
                copyBtn.className = 'copy-button';
                copyBtn.innerHTML = '<i class="far fa-copy"></i>';
                copyBtn.title = '复制代码';
                
                copyBtn.addEventListener('click', () => {
                    const code = block.textContent;
                    navigator.clipboard.writeText(code).then(() => {
                        copyBtn.innerHTML = '<i class="fas fa-check"></i>';
                        copyBtn.classList.add('copied');
                        
                        setTimeout(() => {
                            copyBtn.innerHTML = '<i class="far fa-copy"></i>';
                            copyBtn.classList.remove('copied');
                        }, 2000);
                    });
                });
                
                container.appendChild(copyBtn);
            }
        });
        
        // 返回顶部按钮
        const backToTopBtn = document.getElementById('backToTop');
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        // 分享按钮
        const shareButtons = document.querySelectorAll('.share-btn');
        shareButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const platform = btn.getAttribute('data-platform');
                const url = encodeURIComponent(window.location.href);
                const title = encodeURIComponent(document.title);
                
                let shareUrl = '';
                switch (platform) {
                    case 'twitter':
                        shareUrl = \`https://twitter.com/intent/tweet?url=\${url}&text=\${title}\`;
                        break;
                    case 'facebook':
                        shareUrl = \`https://www.facebook.com/sharer/sharer.php?u=\${url}\`;
                        break;
                    case 'linkedin':
                        shareUrl = \`https://www.linkedin.com/sharing/share-offsite/?url=\${url}\`;
                        break;
                }
                
                if (shareUrl) {
                    window.open(shareUrl, '_blank', 'width=600,height=400');
                }
            });
        });
        
        // 图片点击放大
        const images = document.querySelectorAll('.article-content img');
        images.forEach(img => {
            img.addEventListener('click', () => {
                const overlay = document.createElement('div');
                overlay.className = 'image-overlay';
                
                const imgClone = document.createElement('img');
                imgClone.src = img.src;
                imgClone.alt = img.alt;
                
                overlay.appendChild(imgClone);
                document.body.appendChild(overlay);
                
                setTimeout(() => {
                    overlay.classList.add('show');
                }, 10);
                
                overlay.addEventListener('click', () => {
                    overlay.classList.remove('show');
                    setTimeout(() => {
                        document.body.removeChild(overlay);
                    }, 300);
                });
            });
        });
    });
    </script>
</body>
</html>
`;

// 主函数
async function convertMarkdownToHtml() {
  try {
    // 创建输出目录
    await fs.ensureDir(path.join(__dirname, "skill"));

    // 读取markdown目录
    const markdownDir = path.join(__dirname, "markdown");
    const files = await fs.readdir(markdownDir);

    // 存储所有文章的元数据
    const articlesMetadata = [];

    // 处理每个markdown文件
    for (const file of files) {
      if (path.extname(file) === ".md") {
        console.log(`Processing ${file}...`);

        // 读取markdown文件内容
        const fileContent = await fs.readFile(
          path.join(markdownDir, file),
          "utf-8"
        );

        // 解析 frontmatter
        const { data: metadata, content: markdownContent } =
          matter(fileContent);

        // 收集文章元数据
        articlesMetadata.push({
          title: metadata.title || path.basename(file, ".md"),
          tags: metadata.tags || [],
          time: metadata.time || "",
          filename: path.basename(file, ".md") + ".html",
        });
      }
    }

    // 处理每个markdown文件并添加相关文章
    for (const file of files) {
      if (path.extname(file) === ".md") {
        const fileContent = await fs.readFile(
          path.join(markdownDir, file),
          "utf-8"
        );

        const { data: metadata, content: markdownContent } =
          matter(fileContent);
        const htmlContent = marked(markdownContent);

        // 查找相关文章（具有相同标签的文章）
        const relatedArticles = articlesMetadata.filter((article) => {
          return (
            article.filename !== path.basename(file, ".md") + ".html" && // 排除当前文章
            article.tags?.some((tag) => metadata.tags?.includes(tag))
          ); // 至少有一个相同的标签
        });

        // 生成HTML文件名
        const htmlFileName = path.basename(file, ".md") + ".html";
        const htmlFilePath = path.join(__dirname, "skill", htmlFileName);

        // 将内容插入模板
        const finalHtml = htmlTemplate(htmlContent, metadata, relatedArticles);

        // 写入HTML文件
        await fs.writeFile(htmlFilePath, finalHtml, "utf-8");
        console.log(`Created ${htmlFileName}`);
      }
    }

    // 生成文章索引页
    const indexHtml = generateIndexPage(articlesMetadata);
    await fs.writeFile(
      path.join(__dirname, "skill", "index.html"),
      indexHtml,
      "utf-8"
    );
    console.log("Created index.html");

    console.log("Conversion completed successfully!");
  } catch (error) {
    console.error("Error during conversion:", error);
  }
}

// 生成索引页面
function generateIndexPage(articles) {
  const sortedArticles = articles.sort(
    (a, b) => new Date(b.time) - new Date(a.time)
  );

  // 收集所有标签
  const allTags = new Set();
  articles.forEach((article) => {
    article.tags?.forEach((tag) => allTags.add(tag));
  });

  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>技术博客</title>
    <link rel="shortcut icon" href="code.svg" type="image/x-icon" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&family=Noto+Serif+SC:wght@400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="../skill/css/article.css">
</head>
<body>
    <div class="site-header">
        ${
          allTags.size > 0
            ? `
        <div class="tags-filter">
            <div class="tags-list">
                ${Array.from(allTags)
                  .map(
                    (tag) => `
                    <span class="tag" data-tag="${tag}">
                        <i class="fas fa-tag"></i>
                        <span>${tag}</span>
                        <span class="tag-count">0</span>
                    </span>
                `
                  )
                  .join("")}
            </div>
        </div>
        `
            : ""
        }
    </div>
    <div class="articles-list">
        ${sortedArticles
          .map(
            (article, index) => `
            <article class="article-item" data-tags='${JSON.stringify(
              article.tags || []
            )}' style="--item-index: ${index}">
                <div class="article-content">
                    <h2><a href="${article.filename}">${article.title}</a></h2>
                    <div class="article-meta">
                        <div class="meta-left">
                            ${
                              article.time
                                ? `
                                <time datetime="${article.time}">
                                    <i class="far fa-calendar-alt"></i>
                                    ${formatDate(article.time)}
                                </time>
                            `
                                : ""
                            }
                        </div>
                        ${
                          article.tags?.length > 0
                            ? `
                        <div class="article-tags">
                            ${article.tags
                              .map(
                                (tag) => `
                                <span class="tag">
                                    <i class="fas fa-tag"></i>
                                    <span>${tag}</span>
                                </span>
                            `
                              )
                              .join("")}
                        </div>
                        `
                            : ""
                        }
                    </div>
                </div>
                <div class="article-arrow">
                    <i class="fas fa-arrow-right"></i>
                </div>
            </article>
        `
          )
          .join("")}
    </div>
    <script>
    document.addEventListener('DOMContentLoaded', () => {
        // 更新标签计数
        function updateTagCounts() {
            const articles = document.querySelectorAll('.article-item');
            const tagCounts = {};
            
            articles.forEach(article => {
                const tags = JSON.parse(article.dataset.tags);
                tags.forEach(tag => {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });
            });
            
            document.querySelectorAll('.tags-filter .tag').forEach(tagEl => {
                const tag = tagEl.dataset.tag;
                const count = tagCounts[tag] || 0;
                tagEl.querySelector('.tag-count').textContent = count;
            });
        }

        // 标签筛选功能
        const tags = document.querySelectorAll('.tags-filter .tag');
        const articles = document.querySelectorAll('.article-item');
        let activeTag = null;

        tags.forEach(tag => {
            tag.addEventListener('click', () => {
                const tagName = tag.dataset.tag;
                
                // 切换标签激活状态
                if (activeTag === tagName) {
                    tag.classList.remove('active');
                    activeTag = null;
                } else {
                    tags.forEach(t => t.classList.remove('active'));
                    tag.classList.add('active');
                    activeTag = tagName;
                }
                
                // 筛选文章
                articles.forEach(article => {
                    const articleTags = JSON.parse(article.dataset.tags);
                    if (!activeTag || articleTags.includes(activeTag)) {
                        article.style.display = '';
                        setTimeout(() => {
                            article.style.opacity = '1';
                            article.style.transform = 'translateY(0)';
                        }, 10);
                    } else {
                        article.style.opacity = '0';
                        article.style.transform = 'translateY(20px)';
                        setTimeout(() => {
                            article.style.display = 'none';
                        }, 300);
                    }
                });
            });
        });
        
        // 初始化标签计数
        updateTagCounts();
    });
    </script>
</body>
</html>
  `;
}

// 执行转换
convertMarkdownToHtml();
