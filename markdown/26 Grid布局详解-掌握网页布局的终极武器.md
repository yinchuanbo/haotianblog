---
title: "Grid布局详解-掌握网页布局的终极武器"
tags:
  - Grid
time: 2025-03-18 20:57:14
---

## 一. Grid 布局基础概念

**Grid 布局（网格布局）** 是 CSS 中一种二维布局模型，允许开发者通过行（Row）和列（Column）的组合，将页面划分为多个区域，并精准控制元素的位置和尺寸。它的核心特点是同时管理行和列，适合构建复杂且结构化的布局。

<img src="./images/33.webp" />

### 1. 容器（Container）与项目（Item）

- **容器**：通过`display: grid`或`display: inline-grid`定义（容器元素默认是块级元素，但也可以通过 inline-grid 设成行内元素）
- **项目**：容器的直接子元素自动成为项目，容器包含一个或多个项目（仅第一层子元素参与布局）

```html
<!DOCTYPE html>
<html>
  <head>
    <style>
      .grid-container {
        display: grid;
        grid-template-columns: auto auto auto;
        width: 300px;
        height: 200px;
      }

      .grid-item {
        background-color: #409eff;
        width: 100px;
        height: 100px;
        border: 1px solid #000000;
      }
    </style>
  </head>
  <body>
    <div class="grid-container">
      <div class="grid-item">item 1</div>
      <div class="grid-item">item 2</div>
      <div class="grid-item">item 3</div>
      <div class="grid-item">item 4</div>
      <div class="grid-item">item 5</div>
      <div class="grid-item">item 6</div>
    </div>
  </body>
</html>
```

**不使用** `display: grid` **的效果：**

<img src="./images/34.webp" />

**使用** `display: grid` **的效果：**

<img src="./images/35.webp" />

### 2. 网格线（Grid Line）

- 划分网格的横向（行）和纵向（列）的线，通过数字索引（从 1 开始）或自定义名称引用
- **示例**：一个 3x3 网格有 4 条垂直线（列）和 4 条水平线（行）

### 3. 轨道（Track）

- 两个相邻网格线之间的空间，即行轨道或列轨道
- **示例**：`grid-template-columns: 100px 200px`  定义两列，宽度分别为  **100px**  和  **200px**

### 4. 单元格（Cell）与区域（Area）

- **单元格**：行和列交叉形成的最小单位
- **区域**：一个或多个单元格组成的矩形区域，可通过命名或坐标定义

## 二. 容器属性详解

以下 8 类属性设置在**容器**上：

### 1. `grid-template-columns` / `grid-template-rows`：定义每一行的（显式）列宽 / 行高

```css
.container {
  /* 浏览器自己决定长度 */
  grid-template-columns: auto auto;
  /* 固定列宽，定义了两列 */
  grid-template-columns: 100px 200px;
  grid-template-columns: 25% 75%;
  /* 使用 fr 单位（剩余空间比例） */
  grid-template-columns: 1fr 2fr;
  /* 第一列占 100px，第二、三列按比例分剩余空间且第三列是第二列的两倍 */
  grid-template-columns: 100px 1fr 2fr;
  /* 定义列宽 100px，尽可能多地创建列 */
  grid-template-columns: repeat(auto-fill, 100px);
  /* 规定列宽范围，尽可能撑到最大 */
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  /* 混合单位与函数 */
  grid-template-columns: repeat(3, 1fr) minmax(200px, auto);
}
```

- `fr`：（fraction）一个 fr 单位代表网格容器中剩余可用空间的一等份，表示比例关系
- `repeat()`：接受两个参数，**参数一**是重复的次数，**参数二**是要重复的值

**示例**：

- `repeat(3, 1fr)`  等同于  `1fr 1fr 1fr`，简化代码

- `repeat(2, 50px 100px)`  等同于  `50px 100px 50px 100px`

- `auto-fill`：**单元格宽度固定，容器宽度不固定。**尽可能多地创建列，即使没有内容，也会保留空轨道
- `auto-fit`：**单元格宽度不固定，容器宽度固定。**会将空轨道折叠，让现有列尽量填充空间
- `minmax()`：接受两个参数，**参数一**为最小值，**参数二**为最大值，大小需在这个范围内

**`auto-fill`和`auto-fit`的区别**：

- 当容器足够宽时，auto-fill 可能生成多个空列，而 auto-fit 会让已有的列扩展填满

  **示例**：若容器宽度为 400px，minmax(50px, 1fr)：

- `auto-fill`：生成 8 列（每列 50px），留空未使用空间

- `auto-fit`：生成 8 列后折叠空轨道，将总宽度均分给现有列（如 2 列时每列 400px）

<img src="./images/36.webp" />

### 2. `column-gap` / `row-gap`：设置列间距 / 行间距

```css
.container {
  row-gap: 20px;
  column-gap: 20px;
  gap: 20px; /* 行和列间距均为 20px */
  gap: 10px 30px; /* 行间距 10px，列间距 30px */
}
```

<img src="./images/37.webp" />

### 3. `grid-template-areas`：定义区域

```css
.container {
  display: grid;
  /* 分出9个单元格 */
  grid-template-columns: 100px 100px 100px;
  grid-template-rows: 100px 100px 100px;
  /* 将9个单元格分成多个区域 */
  grid-template-areas:
    "header header header"
    "sidebar main main"
    "footer footer footer";
}
.header {
  grid-area: header;
}
.sidebar {
  grid-area: sidebar;
}
.main {
  grid-area: main;
}
.footer {
  grid-area: footer;
}
```

<img src="./images/38.webp" />

- 不使用的区域用"点"（.）表示。

### 4. `grid-auto-flow`：定义项目放置顺序

```css
.container {
  grid-auto-flow: row | column | row dense | column dense;
}
```

- `row`：默认值，按行填充，从左到右排列项目
- `column`：按列填充，从上到下排列项目
- `dense`：启用“紧凑模式”，自动填补前面留下的空隙

<img src="./images/39.webp" />

### 5. `justify-items` / `align-items` / `place-items`：各个项目在单元格内的对齐方式

```css
.container {
  /* 控制项目在单元格内的水平对齐方式 */
  justify-items: stretch | start | end | center;
  /* 控制项目在单元格内的垂直对齐方式 */
  align-items: stretch | start | end | center;
  /* 简写 */
  place-items: <align-items> <justify-items>;
}
```

- `stretch`：默认值，拉伸至占满单元格的整个宽度（项目大小未指定）
- `start`：对齐单元格的起始边缘
- `end`：对齐单元格的结束边缘
- `center`：单元格内部居中

<img src="./images/40.webp" />

### 6. `justify-content` / `align-content` / `place-content`：整个内容区域在容器内的对齐方式

```css
.container {
  /* 控制整个内容区域在容器内的水平对齐方式 */
  justify-content: stretch | start | end | center | space-around | space-between
    | space-evenly;
  /* 控制整个内容区域在容器内的垂直对齐方式 */
  align-content: stretch | start | end | center | space-around | space-between |
    space-evenly;
  /* 简写 */
  place-items: <align-content> <justify-content>;
}
```

- `stretch`：默认值，拉伸至占满整个网格容器（需配合 grid-template-columns: auto 或未设置固定列宽）
- `start`：对齐容器的起始边缘
- `end`：对齐容器的结束边缘
- `center`：容器内部居中
- `space-between`：两端对齐，项目之间间距相等，首尾项目与容器边缘没有间距
- `space-around`：项目两侧的间距相等，首尾项目与容器边缘的间距是项目之间间距的一半
- `space-evenly`：项目之间间距相等，首尾项目与容器边缘的间距也等于项目之间间距

<img src="./images/41.webp" />

### 7. `grid-auto-columns` / `grid-auto-rows`：定义每一行的（隐式）列宽 / 行高

```css
.container {
  /* 属性值写法和 grid-template-columns 的相同*/
  grid-auto-columns: <track-size>;
}
```

- 当网格项目数量超出显式定义的网格行数时，浏览器会自动创建新的行，而  `grid-auto-columns` / `grid-auto-rows`  决定了这些隐式行的宽度/高度

**触发场景**：

- 项目数量超过显式定义的行数
- 项目通过  `grid-row`  定位到显式行之外

<img src="./images/42.webp" />

### 8. `grid-template`  / `grid`：简写属性

```css
.container {
  grid: 
    /* grid-template-rows 和 grid-template-columns 用 / 分隔 */
    [grid-template-rows] / [grid-template-columns]
    /* 可选，需紧跟在尺寸定义后 */
    [grid-template-areas]
    /* 可选，顺序自由 */
    [grid-auto-flow]
    [grid-auto-rows] [grid-auto-columns] ；;
}
```

- `grid-template`  是  `grid-template-columns`、`grid-template-rows`  和  `grid-template-areas`  这三个属性的简写
- `grid`  是  `grid-template-rows`、`grid-template-columns`、`grid-template-areas`、 `grid-auto-rows`、`grid-auto-columns`、`grid-auto-flow`  这六个属性的简写

## 三、项目属性详解

以下 4 类属性设置在 **项目** 上：

### 1. `grid-column-start` / `grid-column-end` / `grid-row-start` / `grid-row-end` / `grid-column` / `grid-row`：定义项目占据的列/行范围

```css
.item {
  /* 通过网格线编号定位 */
  grid-column-start: 2; /* 项目左边框是第二根垂直网格线 */
  grid-column-end: 3; /* 项目右边框是第三根垂直网格线 */
  grid-row-start: 2; /* 项目上边框是第二根水平网格线 */
  grid-row-end: 4; /* 项目下边框是第四根水平网格线 */
  /* 简写 */
  grid-column: <start-line> / <end-line>;
  grid-row: <start-line> / <end-line>;
  grid-column: 1 / span 2; /* 等同于 grid-column: 1 / 3; */
  grid-row: 1 / span 2;
  /* 可以只写一个编号，默认跨越一个网格 */
  grid-column: 2;
}
```

- `span`：表示跨越多少个网格。
- 除了指定为第几根网格线，还可以指定为网格线的名字，**例如** `grid-column-start: header-start`

<img src="./images/43.webp" />

### 2. `grid-area`：将项目分配到命名区域，或通过行/列起止线自定义位置

```css
.container {
  display: grid;
  grid-template-columns: 100px 100px 100px;
  grid-template-rows: 100px 100px 100px;
  grid-template-areas:
    "header header header"
    "sidebar main main"
    "footer footer footer";
}
.item {
  /* 等同于：grid-row: 1 / 2; grid-column: 1 / 4; */
  grid-area: header; /* 分配到 header 区域 */
  /* 也可以简写为 grid-area: <row-start> / <column-start> / <row-end> / <column-end>; */
  grid-area: 1 / 1 / 2 / 4;
}
```

### 3. `justify-self` / `align-self`  / `place-self`：单个项目在单元格内的对齐方式

```css
.container {
  /* 控制项目在单元格内的水平对齐方式 */
  justify-self: stretch | start | end | center;
  /* 控制项目在单元格内的垂直对齐方式 */
  align-self: stretch | start | end | center;
  /* 简写 */
  place-self: <align-self> <justify-self>;
}
```

## 四、实战代码示例

### 示例 1：响应式网格系统

```html
<!DOCTYPE html>
<html>
  <head>
    <style>
      .grid-container {
        display: grid;
        gap: 20px;
        padding: 20px;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      }

      .grid-item {
        background: #409eff;
        padding: 20px;
        color: white;
        border-radius: 8px;
      }
    </style>
  </head>
  <body>
    <div class="grid-container">
      <div class="grid-item">Item 1</div>
      <div class="grid-item">Item 2</div>
      <div class="grid-item">Item 3</div>
      <div class="grid-item">Item 4</div>
      <div class="grid-item">Item 5</div>
      <div class="grid-item">Item 6</div>
    </div>
  </body>
</html>
```

<img src="./images/44.webp" />

### 示例 2：圣杯布局（Holy Grail）

```html
<!DOCTYPE html>
<html>
  <head>
    <style>
      .layout {
        display: grid;
        height: 100vh;
        grid-template:
          "header header header" 80px
          "nav    main   aside" 1fr
          "footer footer footer" 60px
          / 200px1fr 150px;
      }

      .header {
        grid-area: header;
        background: #333;
        color: white;
        padding: 1rem;
        display: flex;
        align-items: center;
      }

      .nav {
        grid-area: nav;
        background: #f0f0f0;
        padding: 1rem;
        border-right: 1px solid #ddd;
      }

      .main {
        grid-area: main;
        padding: 2rem;
        background: white;
      }

      .aside {
        grid-area: aside;
        background: #f8f8f8;
        padding: 1rem;
        border-left: 1px solid #ddd;
      }

      .footer {
        grid-area: footer;
        background: #333;
        color: white;
        padding: 1rem;
        display: flex;
        align-items: center;
      }
    </style>
  </head>
  <body>
    <div class="layout">
      <header class="header">网站标题</header>
      <nav class="nav">
        <h2>导航菜单</h2>
        <ul>
          <li>菜单项1</li>
          <li>菜单项2</li>
        </ul>
      </nav>
      <main class="main">
        <h1>主要内容区</h1>
        <p>这里是页面主要内容...</p>
      </main>
      <aside class="aside">
        <h3>侧边栏</h3>
        <p>相关链接...</p>
      </aside>
      <footer class="footer">xxx版权所有</footer>
    </div>
  </body>
</html>
```

<img src="./images/45.webp" />

### 示例 3：瀑布流布局

```html
<!DOCTYPE html>
<html>
  <head>
    <style>
      .masonry {
        display: grid;
        gap: 16px;
        padding: 20px;
        grid-template-columns: repeat(4, 1fr);
        grid-auto-rows: 80px;
      }

      .masonry-item {
        background: #2196f3;
        color: white;
        padding: 1rem;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      /* 随机高度模拟 */
      .masonry-item:nth-child(2n) {
        grid-row: span 2;
        background: #ff5722;
      }

      .masonry-item:nth-child(3n) {
        grid-row: span 3;
        background: #4caf50;
      }

      .masonry-item:nth-child(5n) {
        grid-row: span 4;
        background: #9c27b0;
      }
    </style>
  </head>
  <body>
    <div class="masonry">
      <div class="masonry-item">内容块1</div>
      <div class="masonry-item">内容块2</div>
      <div class="masonry-item">内容块3</div>
      <div class="masonry-item">内容块4</div>
      <div class="masonry-item">内容块5</div>
      <div class="masonry-item">内容块6</div>
      <div class="masonry-item">内容块7</div>
      <div class="masonry-item">内容块8</div>
    </div>
  </body>
</html>
```

<img src="./images/46.webp" />