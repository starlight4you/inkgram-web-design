import { useState, useMemo, useEffect, useLayoutEffect, useRef } from "react";
import { flushSync } from "react-dom";
import { ChevronLeft, ChevronRight, Search, Edit3, MoreVertical, Menu, Paperclip, Mic, Send, Image, FileText, Palette, ChevronUp, ChevronDown } from "lucide-react";

type MsgType = "text" | "image" | "sticker" | "sketch";

interface ReplyRef {
  sender: string;
  content: string;
}

interface Message {
  id: string;
  sender: string;
  content: string;
  type: MsgType;
  stickerDesc?: string;
  replyTo?: ReplyRef;
  timestamp: string;
  dateSep?: string;
}

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread?: number;
  isGroup: boolean;
}

// ── Data ───────────────────────────────────────────────────────────────────────

const CHATS: Chat[] = [
  { id: "1", name: "技术读书会", lastMessage: "苏晓宇: 新版本分页功能太流畅了", time: "11:42", unread: 3, isGroup: true },
  { id: "2", name: "陈若曦", lastMessage: "明天下午三点可以吗？", time: "10:15", isGroup: false },
  { id: "3", name: "墨水屏爱好者", lastMessage: "[图片]", time: "昨天", unread: 12, isGroup: true },
  { id: "4", name: "林建国", lastMessage: "好的，已经收到了", time: "昨天", isGroup: false },
  { id: "5", name: "Inkgram 内测群", lastMessage: "方晓燕: 文件已经发过去了", time: "周一", unread: 1, isGroup: true },
  { id: "6", name: "长篇连载讨论", lastMessage: "最新一章更新了", time: "周日", isGroup: true },
  { id: "7", name: "刘洋", lastMessage: "谢谢你的建议！", time: "周六", isGroup: false },
  { id: "8", name: "张伟 (架构师)", lastMessage: "张伟: 后端服务的部署脚本已经更新了", time: "16:20", isGroup: false },
  { id: "9", name: "产品发布委员会", lastMessage: "方晓燕: 大家把明天的发布会物料整理好", time: "15:40", unread: 5, isGroup: true },
  { id: "10", name: "手绘板开发反馈", lastMessage: "苏晓宇: 建议增加橡皮擦粗细调节选项", time: "12:10", isGroup: true },
  { id: "11", name: "李美华", lastMessage: "李美华: 周四的测试报告我发您邮箱了", time: "10:05", isGroup: false },
  { id: "12", name: "编译系统小组", lastMessage: "方晓燕: 依赖树升级后编译快了 20%", time: "昨天", unread: 2, isGroup: true },
  { id: "13", name: "王强 (前端)", lastMessage: "王强: 已经修复了 Spotlight 搜索在 iPad 上的对齐", time: "前天", isGroup: false },
  { id: "14", name: "设计评审会议", lastMessage: "陈若曦: 这是最新的 1-bit Dither 视觉初稿", time: "周五", isGroup: true },
  { id: "15", name: "赵敏 (HR)", lastMessage: "赵敏: 收到，入职流程表已发给候选人", time: "周四", isGroup: false },
];

const MESSAGES: Record<string, Message[]> = {
  "1": [
    {
      id: "1-1", sender: "林建国",
      content: "各位好，今晚的读书会我们继续讨论《Clean Code》第五章，主要是函数这一节。",
      type: "text", timestamp: "19:00", dateSep: "2026年5月25日  周一",
    },
    {
      id: "1-2", sender: "王静",
      content: "我把上周的笔记整理了一下，主要围绕函数命名的几个原则。",
      type: "text", timestamp: "19:03",
    },
    {
      id: "1-3", sender: "王静",
      content: "最核心的一点是: 函数名应该说明它做什么，而不是怎么做。好的函数名即文档。",
      type: "text", timestamp: "19:03",
    },
    {
      id: "1-4", sender: "苏晓宇",
      content: "对，Uncle Bob 举 of getThem 的反例非常典型，改名之后立刻就清晰多了。",
      type: "text", timestamp: "19:05",
      replyTo: { sender: "王静", content: "函数名应该说明它做什么，而不是怎么做。" },
    },
    {
      id: "1-5", sender: "陈若曦",
      content: "我有个问题，如果函数做的事情本身很复杂，名字是不是会变得很长，读起来反而不方便？",
      type: "text", timestamp: "19:07",
    },
    {
      id: "1-6", sender: "林建国",
      content: "这正是单一职责原则的核心——如果函数名需要写得很长，说明函数本身做了太多事情，应该继续拆分。",
      type: "text", timestamp: "19:09",
      replyTo: { sender: "陈若曦", content: "如果函数做的事情很复杂，名字是不是会变得很长？" },
    },
    {
      id: "1-7", sender: "方晓燕",
      content: "我截了书里那个重构示例的图，大家可以对比一下前后的变化。",
      type: "image", timestamp: "19:11",
    },
    {
      id: "1-8", sender: "方晓燕",
      content: "书里还提到要避免双关词，比如不要用 add 同时表示「添加元素」和「相加计算」。",
      type: "text", timestamp: "19:14",
    },
    {
      id: "1-9", sender: "苏晓宇",
      content: "一个词一个含义，pick one word per concept。这个原则非常赞同。",
      type: "text", timestamp: "19:16",
    },
    {
      id: "1-10", sender: "陈若曦",
      content: "嗯，这跟领域驱动设计里的统一语言也是一个思路，ubiquitous language。",
      type: "text", timestamp: "19:18",
    },
    {
      id: "1-11", sender: "王静",
      content: "说到 DDD，下次要不要读 Evans 的那本蓝皮书？",
      type: "text", timestamp: "19:45",
    },
    {
      id: "1-12", sender: "林建国",
      content: "投票结果是《深入理解计算机系统》，第三版，俗称 CSAPP。大家都期待这本！",
      type: "text", timestamp: "20:04",
    },
    {
      id: "1-13", sender: "陈若曦",
      content: "CSAPP！经典中的经典，终于要读了。",
      type: "text", timestamp: "20:05",
    },
    {
      id: "1-14", sender: "苏晓宇",
      content: "哈哈，庆祝一下！",
      type: "sticker", stickerDesc: "熊猫举着书本欢呼跳跃", timestamp: "20:07",
    },
    {
      id: "1-15", sender: "王静",
      content: "那今晚就到这里，下周同一时间见！",
      type: "text", timestamp: "20:08",
    },
    {
      id: "1-16", sender: "林建国",
      content: "好的，感谢各位参与，晚安！",
      type: "text", timestamp: "20:09",
    },
    {
      id: "1-17", sender: "苏晓宇",
      content: "新版本的分页功能真的太流畅了，墨水屏翻页完全没有残影，体验一流！",
      type: "text", timestamp: "11:42", dateSep: "2026年5月26日  周二",
    },
    {
      id: "1-18", sender: "苏晓宇",
      content: "我觉得这本《CSAPP》非常扎实，我已经开始复习二进制 and 汇编语言了。",
      type: "text", timestamp: "19:00", dateSep: "2026年5月27日  周三",
    },
    {
      id: "1-19", sender: "陈若曦",
      content: "哇，行动力太强了！我还要把《Clean Code》最后的附录看完。",
      type: "text", timestamp: "19:02",
    },
    {
      id: "1-20", sender: "林建国",
      content: "没关系，读书会就是循序渐进。CSAPP 读起来可能慢一些，大家做好打持久战的准备。",
      type: "text", timestamp: "19:05",
    },
    {
      id: "1-21", sender: "王静",
      content: "嗯，我们可以配着网上的 CMU 视频课 and 实验（Labs）一起做，特别是 Data Lab 和 Bomb Lab，超经典。",
      type: "text", timestamp: "19:08",
    },
    {
      id: "1-22", sender: "苏晓宇",
      content: "太赞了，期待炸弹实验室！到时候大家一起在群里交流通关技巧。",
      type: "text", timestamp: "19:10",
    },
  ],
  "2": [
    {
      id: "2-1", sender: "陈若曦",
      content: "你好，关于周五的会议，我临时有个冲突，能不能改个时间？",
      type: "text", timestamp: "09:30", dateSep: "今天",
    },
    {
      id: "2-2", sender: "我",
      content: "可以啊，你想改到什么时候？",
      type: "text", timestamp: "09:45",
    },
    {
      id: "2-3", sender: "陈若曦",
      content: "明天下午三点可以吗？",
      type: "text", timestamp: "10:15",
    },
    {
      id: "2-4", sender: "我",
      content: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100" width="200" height="100"><rect x="10" y="25" width="50" height="40" fill="none" stroke="black" stroke-width="2"/><text x="18" y="48" font-size="10" font-family="monospace" font-weight="bold">Input</text><path d="M 60 45 L 90 45" fill="none" stroke="black" stroke-width="2" stroke-dasharray="4"/><polygon points="90,41 98,45 90,49" fill="black"/><rect x="100" y="25" width="80" height="40" fill="none" stroke="black" stroke-width="2"/><text x="108" y="48" font-size="10" font-family="monospace" font-weight="bold">Controller</text></svg>',
      type: "sketch", timestamp: "10:20",
    },
    {
      id: "2-5", sender: "陈若曦",
      content: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100" width="200" height="100"><rect x="60" y="5" width="80" height="90" rx="5" fill="none" stroke="black" stroke-width="2"/><line x1="60" y1="20" x2="140" y2="20" stroke="black" stroke-width="1.5"/><line x1="60" y1="80" x2="140" y2="80" stroke="black" stroke-width="1.5"/><circle cx="100" cy="12" r="2" fill="black"/><text x="82" y="50" font-size="8" font-family="monospace">Inkgram UI</text><path d="M 70 70 L 130 70 M 70 60 L 110 60" stroke="black" stroke-width="1.5" stroke-linecap="round"/></svg>',
      type: "sketch", timestamp: "10:22",
    },
    {
      id: "2-6", sender: "我",
      content: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100" width="200" height="100"><circle cx="100" cy="50" r="35" fill="none" stroke="black" stroke-width="2"/><circle cx="88" cy="42" r="3" fill="black"/><circle cx="112" cy="42" r="3" fill="black"/><path d="M 85 62 Q 100 78 115 62" fill="none" stroke="black" stroke-width="2" stroke-linecap="round"/><text x="75" y="94" font-size="8" font-family="monospace" font-weight="bold">Boox Pen Touch</text></svg>',
      type: "sketch", timestamp: "10:25",
    },
    {
      id: "2-7", sender: "陈若曦",
      content: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100" width="200" height="100"><rect x="70" y="5" width="60" height="25" fill="none" stroke="black" stroke-width="2"/><text x="80" y="20" font-size="9" font-family="monospace">Start</text><path d="M 100 30 L 100 55" fill="none" stroke="black" stroke-width="2"/><polygon points="96,55 100,62 104,55" fill="black"/><rect x="55" y="62" width="90" height="30" fill="none" stroke="black" stroke-width="2"/><text x="65" y="80" font-size="9" font-family="monospace">Process_Msg</text></svg>',
      type: "sketch", timestamp: "10:30",
    },
    {
      id: "2-8", sender: "我",
      content: "画得太生动了！这个消息流的架构非常清晰。那个 Controller 的处理模块我们需要单独封装一下吗？",
      type: "text", timestamp: "10:35",
    },
    {
      id: "2-9", sender: "陈若曦",
      content: "对的，我是这么想的。把事件分发和业务逻辑解耦，将来如果移植到 Android 原生也方便。",
      type: "text", timestamp: "10:38",
    },
    {
      id: "2-10", sender: "我",
      content: "明白。那我先按照这个草图搭建骨架。明天下午三点我们线上碰一下，把接口规范确定下来。",
      type: "text", timestamp: "10:41",
    },
    {
      id: "2-11", sender: "陈若曦",
      content: "没问题。我今天先把接口的 JSON Schema 写出来，发到内测群里供大家参考。",
      type: "text", timestamp: "10:44",
    },
    {
      id: "2-12", sender: "我",
      content: "好的，辛苦了！那咱们明天下午见。",
      type: "text", timestamp: "10:46",
    },
    {
      id: "2-13", sender: "陈若曦",
      content: "嗯嗯，明天见！",
      type: "text", timestamp: "10:48",
    },
    {
      id: "2-14", sender: "我",
      content: "噢对了，别忘了把最新的依赖库版本同步到 package.json。",
      type: "text", timestamp: "10:50",
    },
    {
      id: "2-15", sender: "陈若曦",
      content: "明天下午三点可以吗？",
      type: "text", timestamp: "10:15",
    },
  ],
  "3": [
    {
      id: "3-1", sender: "极简墨迹",
      content: "大家好，分享一张今天用 Boox Note Air3 C 阅读时的截图。",
      type: "image", timestamp: "09:00", dateSep: "昨天",
    },
    {
      id: "3-2", sender: "极简墨迹",
      content: "彩色墨水屏真的很惊艳，虽然颜色没有 LCD 鲜艳，但看长文非常护眼。",
      type: "text", timestamp: "09:01",
    },
    {
      id: "3-3", sender: "书海泛舟",
      content: "我用的是 Onyx Boox Page，纯黑白，阅读体验一流，字体渲染比手机好太多了。",
      type: "text", timestamp: "09:15",
    },
    {
      id: "3-4", sender: "陆晴文",
      content: "有人试过 Inkgram 的 E-ink 模式吗？据说专门为墨水屏优化了翻页，没有残影。",
      type: "text", timestamp: "09:22",
    },
    {
      id: "3-5", sender: "书海泛舟",
      content: "用过！就是现在这个界面，非常干净，纯黑白排版，看起来就像在读一本书。强烈推荐！",
      type: "text", timestamp: "09:30",
      replyTo: { sender: "陆晴文", content: "有人试过 Inkgram 的 E-ink 模式吗？" },
    },
    {
      id: "3-6", sender: "陆晴文",
      content: "太棒了，我也去下载试试！",
      type: "text", timestamp: "09:35",
    },
    {
      id: "3-7", sender: "极简墨迹",
      content: "哈哈，欢迎加入！用墨水屏看书聊天绝对是全新的体验。",
      type: "text", timestamp: "09:40",
    },
    {
      id: "3-8", sender: "电子墨水小王子",
      content: "有人对比过 Boox Palma 吗？像个大号手机，不知道单手持握感怎么样？",
      type: "text", timestamp: "09:45",
    },
    {
      id: "3-9", sender: "书海泛舟",
      content: "Palma 非常好用！我买了一个当备用机，坐地铁时单手刷墨水屏新闻，简直是神器。",
      type: "text", timestamp: "09:48",
    },
    {
      id: "3-10", sender: "陆晴文",
      content: "Palma 电池能用多久啊？毕竟屏幕小，不知道续航如何。",
      type: "text", timestamp: "09:50",
    },
    {
      id: "3-11", sender: "电子墨水小王子",
      content: "如果只看纯文字，开 A2 刷新模式，一般能撑个三四天。但如果连着 WiFi 刷网页就比较耗电了。",
      type: "text", timestamp: "09:53",
    },
    {
      id: "3-12", sender: "极简墨迹",
      content: "对，墨水屏最大的杀手就是频繁的全屏刷新和 WiFi 连接。建议把后台自动清理打开。",
      type: "text", timestamp: "09:56",
    },
    {
      id: "3-13", sender: "书海泛舟",
      content: "顺便安利一下，配合 Inkgram 的手绘功能，配合手写笔记录灵感简直绝了，几乎没有延迟。",
      type: "text", timestamp: "10:00",
    },
    {
      id: "3-14", sender: "电子墨水小王子",
      content: "手写延迟这么低？是一边写一边在底层渲染吗？",
      type: "text", timestamp: "10:02",
    },
    {
      id: "3-15", sender: "书海泛舟",
      content: "是的，他们用了 HTML5 Canvas 的即时绘制，避开了浏览器的重排，所以在墨水屏上也非常跟手。",
      type: "text", timestamp: "10:05",
    },
    {
      id: "3-16", sender: "极简墨迹",
      content: "这真的挺厉害，普通网页的输入框在墨水屏上打字卡得不行，Inkgram 做得很丝滑。",
      type: "text", timestamp: "10:08",
    },
    {
      id: "3-17", sender: "陆晴文",
      content: "我刚刚下载安装了，这个纯黑白的界面在我的 Boox Page 上看起来太舒服了！",
      type: "text", timestamp: "10:12",
    },
    {
      id: "3-18", sender: "书海泛舟",
      content: "是吧！特别是那个半色调的马赛克背景，比普通 LCD 上的高斯模糊高级多了。",
      type: "text", timestamp: "10:15",
    },
    {
      id: "3-19", sender: "极简墨迹",
      content: "我发张图给你看，这就是我在墨水屏上截的图，灰度清晰度拉满。",
      type: "text", timestamp: "10:18",
    },
    {
      id: "3-20", sender: "电子墨水小王子",
      content: "我的桌面搭配，Boox + 机械键盘，完美！",
      type: "image", timestamp: "10:20",
    },
  ],
  "4": [
    {
      id: "4-1", sender: "我",
      content: "林总，您好！Inkgram Android 客户端的最新优化包已经打包完成了。",
      type: "text", timestamp: "09:00", dateSep: "昨天",
    },
    {
      id: "4-2", sender: "林建国",
      content: "收到。这次的包体积缩减得怎么样？之前超过 100MB 实在是有点太臃肿了。",
      type: "text", timestamp: "09:05",
    },
    {
      id: "4-3", sender: "我",
      content: "这次做了深度优化。首先是精简了内置的 PDF 渲染引擎，去除了不常用的字体 and 功能，直接减掉了 35MB。",
      type: "text", timestamp: "09:08",
    },
    {
      id: "4-4", sender: "林建国",
      content: "做得好！PDF 是咱们的核心阅读功能之一，性能没有受影响吧？",
      type: "text", timestamp: "09:12",
    },
    {
      id: "4-5", sender: "我",
      content: "完全没有，我们对常用文档做了解析测试，渲染速度反而提升了约 15%。",
      type: "text", timestamp: "09:15",
    },
    {
      id: "4-6", sender: "我",
      content: "另外，我们把部分第三方大库改为了按需动态加载（Dynamic Delivery），这也极大地减小了首包的体积。",
      type: "text", timestamp: "09:16",
    },
    {
      id: "4-7", sender: "林建国",
      content: "动态加载是个好方向。那现在的 APK 最终大小是多少？",
      type: "text", timestamp: "09:20",
    },
    {
      id: "4-8", sender: "我",
      content: "目前已经成功压缩到了 42.5MB，比上一版减小了近 60%！",
      type: "text", timestamp: "09:22",
    },
    {
      id: "4-9", sender: "林建国",
      content: "非常优秀的成果！测试部门验证过稳定性了吗？",
      type: "text", timestamp: "09:25",
    },
    {
      id: "4-10", sender: "我",
      content: "已经跑了一轮自动化兼容性测试，在主流的墨水屏和平板设备上运行都非常稳定，没有发现崩溃现象。",
      type: "text", timestamp: "09:28",
    },
    {
      id: "4-11", sender: "林建国",
      content: "很好，明天早会你详细同步一下这个进展，给大家鼓鼓劲。",
      type: "text", timestamp: "09:30",
    },
    {
      id: "4-12", sender: "我",
      content: "好的，没问题。另外关于 iOS 端的开发进度，我们也已经在推进 Swift 原生 UI 的适配了。",
      type: "text", timestamp: "09:32",
    },
    {
      id: "4-13", sender: "林建国",
      content: "iOS 端也要注意墨水屏的灰阶表现。现在也有不少用户在墨水屏设备上运行 iOS 客户端。",
      type: "text", timestamp: "09:35",
    },
    {
      id: "4-14", sender: "我",
      content: "是的，我们会保持多端视觉设计的高度统一，全平台都支持精细的半色调和防残影翻页。",
      type: "text", timestamp: "09:38",
    },
    {
      id: "4-15", sender: "林建国",
      content: "把这次优化的详细技术总结和对比图表整理一份发给我，我想看一下具体的数据线索。",
      type: "text", timestamp: "09:40",
    },
    {
      id: "4-16", sender: "我",
      content: "好的，我已经整理成 PDF 报告了，包含体积占比图、启动耗时对比以及内存占用曲线。",
      type: "text", timestamp: "09:42",
    },
    {
      id: "4-17", sender: "我",
      content: "[文档] Inkgram_APK_Optimization_Report.pdf (1.8 MB)",
      type: "text", timestamp: "09:43",
    },
    {
      id: "4-18", sender: "林建国",
      content: "好的，已经收到了",
      type: "text", timestamp: "09:45",
    },
  ],
  "5": [
    {
      id: "5-1", sender: "苏晓宇",
      content: "大家早上好！今天测试新版的 Spotlight 全局搜索，感觉这个功能太强了！",
      type: "text", timestamp: "08:30", dateSep: "周一",
    },
    {
      id: "5-2", sender: "王静",
      content: "对啊，按快捷键或者点击左上角直接就弹出来了，全局搜索聊天记录和会话非常迅速。",
      type: "text", timestamp: "08:33",
    },
    {
      id: "5-3", sender: "方晓燕",
      content: "而且这个“黑色与透明的小方块马赛克”背景简直绝了！在我的墨水屏上看起来既高级又完全不卡顿。",
      type: "text", timestamp: "08:35",
    },
    {
      id: "5-4", sender: "陈若曦",
      content: "是的，以前的高斯模糊在墨水屏上会产生大面积的灰阶渐变，刷新时会非常卡，而且残影很重。",
      type: "text", timestamp: "08:38",
    },
    {
      id: "5-5", sender: "极简墨迹",
      content: "点赞！这种 1-bit 的半色调网点 dither 很有当年早期 Macintosh 的复古版画感，设计美学拉满。",
      type: "text", timestamp: "08:42",
    },
    {
      id: "5-6", sender: "我",
      content: "感谢大家的支持！这是我们特意为墨水屏硬件特性量身定制的。半色调只包含纯黑和透明像素，不会触发灰阶刷新，性能极其流畅。",
      type: "text", timestamp: "08:45",
    },
    {
      id: "5-7", sender: "陆晴文",
      content: "我想反馈一个小 Bug：当全局搜索框弹出时，如果在搜索框里输入文字，用物理键盘的 Esc 键能退出吗？",
      type: "text", timestamp: "08:48",
    },
    {
      id: "5-8", sender: "我",
      content: "可以的，我们监听了全局的 Escape 键盘事件，按下 Esc 键会自动关闭搜索框并聚焦回聊天窗口。",
      type: "text", timestamp: "08:50",
    },
    {
      id: "5-9", sender: "陆晴文",
      content: "太棒了，键盘党的福音！",
      type: "text", timestamp: "08:52",
    },
    {
      id: "5-10", sender: "苏晓宇",
      content: "对了，手绘功能大家试了吗？附件菜单里的手绘！",
      type: "text", timestamp: "08:55",
    },
    {
      id: "5-11", sender: "王静",
      content: "试了，点开就是一个全屏的画板。我刚才手写了一段公式发给同事，体验极佳。",
      type: "text", timestamp: "08:58",
    },
    {
      id: "5-12", sender: "方晓燕",
      content: "手绘的清除画布和取消按钮去掉了黑色框线，只有纯文本下划线，非常干净。",
      type: "text", timestamp: "09:00",
    },
    {
      id: "5-13", sender: "陈若曦",
      content: "这个细节改得好，去掉了冗余的线框之后，界面的呼吸感更强了。",
      type: "text", timestamp: "09:02",
    },
    {
      id: "5-14", sender: "我",
      content: "是的，我们一直在做减法。墨水屏上的线条如果太多，会显得十分凌乱。我们只保留了最核心的画板四方形外框。",
      type: "text", timestamp: "09:05",
    },
    {
      id: "5-15", sender: "极简墨迹",
      content: "说到线框，附件小窗现在只有‘图片、文件、手绘’三项，比之前的一大堆选项清爽多了。",
      type: "text", timestamp: "09:08",
    },
    {
      id: "5-16", sender: "我",
      content: "对，之前的‘视频’由于墨水屏刷新率限制被删除，‘共享位置’升级为了‘分享手绘’。这样分类更聚焦。",
      type: "text", timestamp: "09:12",
    },
    {
      id: "5-17", sender: "苏晓宇",
      content: "哈哈，用墨水屏看视频确实有点难为它了，纯文字和图文才是墨水屏的统治区。",
      type: "text", timestamp: "09:15",
    },
    {
      id: "5-18", sender: "王静",
      content: "晓燕，你之前说的那个最新的内测反馈文档整理好了吗？我想看一下大家对刷新模式的偏好。",
      type: "text", timestamp: "09:18",
    },
    {
      id: "5-19", sender: "方晓燕",
      content: "整理好了，包含这周收集的 200 份调查问卷分析。",
      type: "text", timestamp: "09:20",
    },
    {
      id: "5-20", sender: "方晓燕",
      content: "文件已经发过去了",
      type: "text", timestamp: "09:21",
    },
  ],
  "6": [
    {
      id: "6-1", sender: "书海泛舟",
      content: "各位书友，大家看完《深空之下》昨晚更新的第 450 章了吗？",
      type: "text", timestamp: "10:00", dateSep: "周日",
    },
    {
      id: "6-2", sender: "陆晴文",
      content: "看完了！这一章信息量太大了。主角终于发现那个所谓的‘星门’其实是一个远古高等文明的超级计算机。",
      type: "text", timestamp: "10:05",
    },
    {
      id: "6-3", sender: "电子墨水小王子",
      content: "天哪，原来所有的物理学常数都是这个计算机的运行参数！难怪之前伏笔说常数在微幅波动。",
      type: "text", timestamp: "10:08",
    },
    {
      id: "6-4", sender: "极简墨迹",
      content: "这个脑洞太绝了。作者伏笔埋得真深，从第 50 章开始就在铺垫宇宙常数漂移的现象。",
      type: "text", timestamp: "10:12",
    },
    {
      id: "6-5", sender: "书海泛舟",
      content: "是的，而且这一章关于‘硅基意识’ and ‘碳基肉身’的辩论非常精彩，很有哲学深度。",
      type: "text", timestamp: "10:15",
    },
    {
      id: "6-6", sender: "陆晴文",
      content: "我觉得主角的导师最后选择和星门融合是一个必然。他追求了一辈子的真理，朝闻道，夕死可矣。",
      type: "text", timestamp: "10:18",
    },
    {
      id: "6-7", sender: "电子墨水小王子",
      content: "可怜了主角，失去了在这个世界上唯一的指路明灯，接下来的路只能他自己走了。",
      type: "text", timestamp: "10:22",
    },
    {
      id: "6-8", sender: "极简墨迹",
      content: "但是这也意味着主角要正式接过导师的衣钵，开始探索更深邃的星系外围了。期待主角的蜕变。",
      type: "text", timestamp: "10:25",
    },
    {
      id: "6-9", sender: "书海泛舟",
      content: "你们说，作者今天能准时更新吗？按照之前的规律，今天应该是揭晓星门另一端秘密的时候。",
      type: "text", timestamp: "10:30",
    },
    {
      id: "6-10", sender: "陆晴文",
      content: "不好说，作者最近身体好像不太好，经常请假，希望他能保重身体，稳定更新。",
      type: "text", timestamp: "10:33",
    },
    {
      id: "6-11", sender: "极简墨迹",
      content: "对，宁可慢一点，也不要烂尾。这本书现在的架构非常宏大，千万别写崩了。",
      type: "text", timestamp: "10:35",
    },
    {
      id: "6-12", sender: "电子墨水小王子",
      content: "今天下午我一直在刷更新，每隔半小时就刷新一次，太煎熬了。",
      type: "text", timestamp: "15:00",
    },
    {
      id: "6-13", sender: "书海泛舟",
      content: "哈哈，同感，我也是用我的 Boox 看，眼睛不酸，但是心里痒痒得很。",
      type: "text", timestamp: "15:15",
    },
    {
      id: "6-14", sender: "陆晴文",
      content: "刚收到推送通知了！作者说今天按时上传，已经在排队审核了。",
      type: "text", timestamp: "18:20",
    },
    {
      id: "6-15", sender: "极简墨迹",
      content: "太好啦！今晚又有得看了。大家看完记得在群里准时讨论啊。",
      type: "text", timestamp: "18:25",
    },
    {
      id: "6-16", sender: "电子墨水小王子",
      content: "一定一定，准备好瓜子和热茶了。",
      type: "text", timestamp: "18:30",
    },
    {
      id: "6-17", sender: "书海泛舟",
      content: "最新一章更新了",
      type: "text", timestamp: "19:00",
    },
  ],
  "7": [
    {
      id: "7-1", sender: "刘洋",
      content: "兄弟，你在墨水屏适配方面经验多，想向你请教个问题。",
      type: "text", timestamp: "14:00", dateSep: "周六",
    },
    {
      id: "7-2", sender: "我",
      content: "客气了，随便问，咱们互相交流。",
      type: "text", timestamp: "14:05",
    },
    {
      id: "7-3", sender: "刘洋",
      content: "是这样，我最近在开发一个 e-ink 设备上的新闻阅读器，发现文章翻页的时候总是非常卡顿，刷新机制让人很头疼。",
      type: "text", timestamp: "14:08",
    },
    {
      id: "7-4", sender: "我",
      content: "翻页卡顿很常见。首先，你是用传统的滚动（Scroll）还是用分页（Page-by-Page）的形式？",
      type: "text", timestamp: "14:12",
    },
    {
      id: "7-5", sender: "刘洋",
      content: "目前用的是滚动。但用户反馈说滚动在墨水屏上简直是灾难，残影重重，根本没法看。",
      type: "text", timestamp: "14:15",
    },
    {
      id: "7-6", sender: "我",
      content: "对，墨水屏由于物理特性的限制，液晶响应时间长，绝对不能用连续滚动。必须用分页（Pagination）机制。",
      type: "text", timestamp: "14:18",
    },
    {
      id: "7-7", sender: "刘洋",
      content: "如果是分页的话，怎么在前端精准计算一页能放多少内容呢？因为字体大小、设备高度都不太一样。",
      type: "text", timestamp: "14:22",
    },
    {
      id: "7-8", sender: "我",
      content: "你可以写一个估算行数的算法。根据屏幕可用高度 and 行高计算出 linesPerPage，再根据每行字符数估算每条消息或段落所占的行数。",
      type: "text", timestamp: "14:25",
    },
    {
      id: "7-9", sender: "我",
      content: "就像我们 Inkgram 做的：根据字符长度 `Math.ceil(length / CHARS_PER_LINE)` 来累加，一旦超过 linesPerPage 就切分到下一页。这样就不需要浏览器重排，性能非常高。",
      type: "text", timestamp: "14:28",
    },
    {
      id: "7-10", sender: "刘洋",
      content: "原来如此！怪不得 Inkgram 的翻页这么流畅，原来是在渲染前就已经把页面切好了。",
      type: "text", timestamp: "14:32",
    },
    {
      id: "7-11", sender: "我",
      content: "对的。另外，为了防止翻页时大面积的黑闪，可以让用户手动触发全屏清除残影，平时用局刷就行。",
      type: "text", timestamp: "14:35",
    },
    {
      id: "7-12", sender: "刘洋",
      content: "懂了，局刷 and 全刷配合使用。那在 CSS 样式上有什么需要注意的吗？",
      type: "text", timestamp: "14:38",
    },
    {
      id: "7-13", sender: "我",
      content: "尽量避免任何 CSS 动画，比如 `transition`、`transform` 等，这些会让墨水屏疯狂刷新。所有状态变化都要是瞬间完成的。",
      type: "text", timestamp: "14:41",
    },
    {
      id: "7-14", sender: "我",
      content: "另外，背景尽量用纯白色，如果要设计质感，就用我们那种 1-bit dither 点阵，绝对不要用透明度高斯模糊。",
      type: "text", timestamp: "14:43",
    },
    {
      id: "7-15", sender: "刘洋",
      content: "非常实用的避坑指南！我这就去把滚动的代码改成你说的估算分页，样式也全部简化。",
      type: "text", timestamp: "14:45",
    },
    {
      id: "7-16", sender: "刘洋",
      content: "谢谢你的建议！",
      type: "text", timestamp: "14:48",
    },
  ],
  "8": [
    {
      id: "8-1", sender: "我",
      content: "伟哥，K8s 上的后端服务这几天运行很稳定，但是有些内存抖动。",
      type: "text", timestamp: "15:30", dateSep: "今天",
    },
    {
      id: "8-2", sender: "张伟",
      content: "我查了 Prometheus 监控，是 JVM 垃圾回收触发时的短暂峰值，属于正常现象。",
      type: "text", timestamp: "15:35",
    },
    {
      id: "8-3", sender: "我",
      content: "好的，那我们需要调优 GC 参数或者增加 Pod 的内存 Limit 吗？",
      type: "text", timestamp: "15:40",
    },
    {
      id: "8-4", sender: "张伟",
      content: "暂时不用，我调整了 HPA（水平Pod扩缩容）的 CPU 阈值，会自动扩容应对流量峰值。",
      type: "text", timestamp: "15:45",
    },
    {
      id: "8-5", sender: "我",
      content: "明白。另外，CI/CD 流水线这块，自动化部署脚本有变动吗？",
      type: "text", timestamp: "15:50",
    },
    {
      id: "8-6", sender: "张伟",
      content: "有的，我增加了构建镜像后自动上传镜像仓库和滚动更新的阶段。",
      type: "text", timestamp: "16:00",
    },
    {
      id: "8-7", sender: "我",
      content: "太好了，这样我们就不用手动去执行 kubectl rollout 了。",
      type: "text", timestamp: "16:10",
    },
    {
      id: "8-8", sender: "张伟",
      content: "后端服务的部署脚本已经更新了",
      type: "text", timestamp: "16:20",
    },
  ],
  "9": [
    {
      id: "9-1", sender: "林建国",
      content: "各位，明天的内测版线上发布会非常关键，所有人做好最终核对。",
      type: "text", timestamp: "14:00", dateSep: "今天",
    },
    {
      id: "9-2", sender: "我",
      content: "客户端演示版本已冻结，在 Boox Note Air 3 和 Page 上均做过双轮测试，演示非常稳定。",
      type: "text", timestamp: "14:10",
    },
    {
      id: "9-3", sender: "王静",
      content: "PPT 已经修改完第三版，主要是墨水屏特性的表现力对比部分，逻辑很顺畅。",
      type: "text", timestamp: "14:20",
    },
    {
      id: "9-4", sender: "陈若曦",
      content: "手绘模块和全局 Spotlight 的切图物料也已提供给宣发团队了。",
      type: "text", timestamp: "14:30",
    },
    {
      id: "9-5", sender: "方晓燕",
      content: "收到，所有大屏幕展示的视频和海报物料已全部就位。",
      type: "text", timestamp: "15:00",
    },
    {
      id: "9-6", sender: "林建国",
      content: "晓燕，你再做一次播放核对，千万不要出现模糊或者花屏。",
      type: "text", timestamp: "15:20",
    },
    {
      id: "9-7", sender: "方晓燕",
      content: "放心，我已经用墨水屏专用比例适配过了，对比度调高到了最高阶。",
      type: "text", timestamp: "15:30",
    },
    {
      id: "9-8", sender: "方晓燕",
      content: "大家把明天的发布会物料整理好",
      type: "text", timestamp: "15:40",
    },
  ],
  "10": [
    {
      id: "10-1", sender: "苏晓宇",
      content: "手绘板今天用起来真爽，纯线条感觉很有铅笔的质感。",
      type: "text", timestamp: "11:00", dateSep: "今天",
    },
    {
      id: "10-2", sender: "我",
      content: "感谢反馈！我们使用了标准的 Canvas 画笔算法，线条宽度和防抖算法都是专门调校过的。",
      type: "text", timestamp: "11:15",
    },
    {
      id: "10-3", sender: "王静",
      content: "我写字的时候觉得如果能有细橡皮擦就更好了，现在的橡皮擦有点大，容易把周围的公式蹭掉。",
      type: "text", timestamp: "11:30",
    },
    {
      id: "10-4", sender: "陈若曦",
      content: "确实，细微部分的修整需要小尺寸 of 橡皮擦或者撤销功能。",
      type: "text", timestamp: "11:45",
    },
    {
      id: "10-5", sender: "我",
      content: "我们这周会安排上多档位粗细选择，画笔和橡皮擦都会支持 3 档调节。",
      type: "text", timestamp: "12:00",
    },
    {
      id: "10-6", sender: "苏晓宇",
      content: "太赞了，期待这个更新！",
      type: "text", timestamp: "12:05",
    },
    {
      id: "10-7", sender: "苏晓宇",
      content: "建议增加橡皮擦粗细调节选项",
      type: "text", timestamp: "12:10",
    },
  ],
  "11": [
    {
      id: "11-1", sender: "李美华",
      content: "组长，这周的 Android 灰阶渲染稳定性测试已经收网了。",
      type: "text", timestamp: "09:10", dateSep: "周四",
    },
    {
      id: "11-2", sender: "我",
      content: "好的，结果怎么样？有没有出现内存泄漏或者闪退？",
      type: "text", timestamp: "09:20",
    },
    {
      id: "11-3", sender: "李美华",
      content: "有 1 个已知的内存升高问题，发生在频繁切换大图的时候，排查发现是 Bitmap 没有及时 recycle。",
      type: "text", timestamp: "09:30",
    },
    {
      id: "11-4", sender: "我",
      content: "明白，这个我们明天上午通过 Glide 的内存清理解决。其他的呢？",
      type: "text", timestamp: "09:40",
    },
    {
      id: "11-5", sender: "李美华",
      content: "其他的比如电量消耗、页面加载延迟指标全线飘绿，表现甚至超出了预期。",
      type: "text", timestamp: "09:50",
    },
    {
      id: "11-6", sender: "我",
      content: "优秀！把具体的泄漏调用栈和完整的测试数据同步发给我。",
      type: "text", timestamp: "10:00",
    },
    {
      id: "11-7", sender: "李美华",
      content: "周四的测试报告我发您邮箱了",
      type: "text", timestamp: "10:05",
    },
  ],
  "12": [
    {
      id: "12-1", sender: "王强",
      content: "编译最近怎么变慢了？npm install 耗时也增加了好久。",
      type: "text", timestamp: "14:00", dateSep: "昨天",
    },
    {
      id: "12-2", sender: "我",
      content: "应该是最近引入的一些工具库嵌套依赖太深，导致打包体积和构建解析变慢。",
      type: "text", timestamp: "14:15",
    },
    {
      id: "12-3", sender: "方晓燕",
      content: "我正在对依赖树做一轮 prune（剪枝），把一些冗余的子依赖扁平化。",
      type: "text", timestamp: "14:30",
    },
    {
      id: "12-4", sender: "苏晓宇",
      content: "支持！之前有一些 duplicate 的 core-js 版本太恶心了。",
      type: "text", timestamp: "14:45",
    },
    {
      id: "12-5", sender: "方晓燕",
      content: "清理完成了！去掉了 12 个冗余模块，并把 packages 锁死在了扁平层级。",
      type: "text", timestamp: "15:00",
    },
    {
      id: "12-6", sender: "我",
      content: "我拉下来测试一下构建。哇，真的很明显，Vite 打包时间瞬间缩短了。",
      type: "text", timestamp: "15:15",
    },
    {
      id: "12-7", sender: "王强",
      content: "我这边的构建也提速了，赞一个！",
      type: "text", timestamp: "15:30",
    },
    {
      id: "12-8", sender: "方晓燕",
      content: "依赖树升级后编译快了 20%",
      type: "text", timestamp: "15:40",
    },
  ],
  "13": [
    {
      id: "13-1", sender: "我",
      content: "强子，昨天测试发现，在 iPad 或者是大横屏设备上，Spotlight 搜索的输入框好像有些偏左？",
      type: "text", timestamp: "09:00", dateSep: "前天",
    },
    {
      id: "13-2", sender: "王强",
      content: "我看一下，因为使用了 absolute 的 left-1/2 和 -translate-x-1/2，可能是某些 Safari 浏览器的 translate3d 渲染机制有兼容性问题。",
      type: "text", timestamp: "09:15",
    },
    {
      id: "13-3", sender: "我",
      content: "对，横屏下确实有几像素的偏移，看起来不是很精致。",
      type: "text", timestamp: "09:30",
    },
    {
      id: "13-4", sender: "王强",
      content: "我把定位改为了更加保险的 `flex` 居中容器布局，并在各种屏幕比例下都测试了。",
      type: "text", timestamp: "09:45",
    },
    {
      id: "13-5", sender: "我",
      content: "太好啦。那侧边栏和主界面的过渡动效，在低配置设备上体验如何？",
      type: "text", timestamp: "10:00",
    },
    {
      id: "13-6", sender: "王强",
      content: "在 E-ink 平板上我们完全关闭了滑动抽屉过渡，直接瞬间切过去，体验无比清爽。",
      type: "text", timestamp: "10:10",
    },
    {
      id: "13-7", sender: "我",
      content: "这样最好，墨水屏不需要多余的渐变过渡。",
      type: "text", timestamp: "10:20",
    },
    {
      id: "13-8", sender: "王强",
      content: "已经修复了 Spotlight 搜索在 iPad 上的对齐",
      type: "text", timestamp: "10:30",
    },
  ],
  "14": [
    {
      id: "14-1", sender: "陈若曦",
      content: "各位，这一版我们讨论如何让界面在 1-bit 纯黑白（没有灰阶）的情况下呈现质感。",
      type: "text", timestamp: "09:00", dateSep: "周五",
    },
    {
      id: "14-2", sender: "我",
      content: "半色调抖动（Halftone Dithering）是个绝佳思路，就像老报纸印刷那样。",
      type: "text", timestamp: "09:15",
    },
    {
      id: "14-3", sender: "方晓燕",
      content: "对，利用微小的黑白相间像素网点，在人眼中能融合成灰色，既好看又性能卓越。",
      type: "text", timestamp: "09:30",
    },
    {
      id: "14-4", sender: "林建国",
      content: "这个方案设计感极强，不仅解决了墨水屏没有灰度渐变的缺陷，还能做出高端印刷的复古质感。",
      type: "text", timestamp: "09:45",
    },
    {
      id: "14-5", sender: "陈若曦",
      content: "对的。我用 CSS Grid 和 SVG 做了一批不同网点密度的图案，效果非常惊喜。",
      type: "text", timestamp: "10:00",
    },
    {
      id: "14-6", sender: "我",
      content: "太好了，我们这就把马赛克网点应用到全局 Spotlight 搜索的背景遮罩上。",
      type: "text", timestamp: "10:10",
    },
    {
      id: "14-7", sender: "陈若曦",
      content: "这是最新的 1-bit Dither 视觉初稿",
      type: "text", timestamp: "10:20",
    },
  ],
  "15": [
    {
      id: "15-1", sender: "赵敏",
      content: "总监，咱们组新招的那个资深 Android 墨水屏工程师，这周五能来办理入职手续。",
      type: "text", timestamp: "09:00", dateSep: "周四",
    },
    {
      id: "15-2", sender: "我",
      content: "太好了！他之前的背景非常契合，做过多年的墨水屏底层刷新驱动优化。",
      type: "text", timestamp: "09:15",
    },
    {
      id: "15-3", sender: "赵敏",
      content: "是的，他的薪资和期权方案在上周五已经审批通过，三方协议也签好了。",
      type: "text", timestamp: "09:30",
    },
    {
      id: "15-4", sender: "我",
      content: "那就好。帮他申请一下最新的 Onyx Boox 电子墨水开发测试平板作为入职装备。",
      type: "text", timestamp: "09:45",
    },
    {
      id: "15-5", sender: "赵敏",
      content: "没问题，我已经给行政和 IT 部门发提单了，明天就会准备好在工位上。",
      type: "text", timestamp: "10:00",
    },
    {
      id: "15-6", sender: "我",
      content: "行，流程上麻烦敏姐多跟进一下，让他快速融入咱们团队。",
      type: "text", timestamp: "10:10",
    },
    {
      id: "15-7", sender: "赵敏",
      content: "收到，入职流程表已发给候选人",
      type: "text", timestamp: "10:20",
    },
  ],
};

// ── Pagination ─────────────────────────────────────────────────────────────────

interface MsgMetrics {
  availableHeightPx: number;
  lineHeightPx: number;
  charsPerLine: number;
  linesPerPage: number;
}

const DEFAULT_MSG_METRICS: MsgMetrics = {
  availableHeightPx: 400,
  lineHeightPx: 25.6,
  charsPerLine: 22,
  linesPerPage: 18,
};

const PAGE_HEIGHT_BUFFER = 6;

function estimateLines(msg: Message, showSender: boolean, charsPerLine: number): number {
  let n = 0;
  if (msg.dateSep) n += 1.8;
  if (showSender) n += 1;
  if (msg.replyTo) {
    const len = msg.replyTo.sender.length + 1 + msg.replyTo.content.length;
    n += Math.max(1, Math.ceil(len / charsPerLine));
  }
  if (msg.type === "image" || msg.type === "sticker") {
    n += 3.5;
  } else if (msg.type === "sketch") {
    n += 5.5;
  } else {
    n += Math.max(1, Math.ceil(msg.content.length / charsPerLine));
  }
  return n + 0.65;
}

function paginate(messages: Message[], linesPerPage: number, charsPerLine: number): Message[][] {
  const pages: Message[][] = [];
  let page: Message[] = [];
  let used = 0;
  let prev = "";
  for (const msg of messages) {
    const show = msg.sender !== prev;
    const need = estimateLines(msg, show, charsPerLine);
    if (used + need > linesPerPage && page.length > 0) {
      pages.push(page);
      page = [];
      used = 0;
      prev = "";
    }
    page.push(msg);
    used += need;
    prev = msg.sender;
  }
  if (page.length > 0) pages.push(page);
  return pages.length ? pages : [[]];
}

function refinePages(
  initialPages: Message[][],
  maxHeight: number,
  measureFn: (msgs: Message[]) => number
): Message[][] {
  const pages = initialPages.map((p) => [...p]);

  for (let i = 0; i < pages.length; i++) {
    while (i + 1 < pages.length && pages[i + 1].length > 0) {
      const candidate = pages[i + 1][0];
      const trial = [...pages[i], candidate];
      if (measureFn(trial) <= maxHeight) {
        pages[i].push(pages[i + 1].shift()!);
      } else {
        break;
      }
    }
    if (pages[i + 1]?.length === 0) {
      pages.splice(i + 1, 1);
    }
  }

  for (let i = 0; i < pages.length; i++) {
    while (pages[i].length > 1 && measureFn(pages[i]) > maxHeight) {
      const overflow = pages[i].pop()!;
      if (!pages[i + 1]) pages.push([]);
      pages[i + 1].unshift(overflow);
    }
  }

  while (pages.length > 1 && pages[pages.length - 1].length === 0) {
    pages.pop();
  }

  return pages.length ? pages : [[]];
}

function buildMsgBlocks(msgs: Message[]) {
  let prev = "";
  return msgs.map((msg) => {
    const showSender = msg.sender !== prev;
    prev = msg.sender;
    return { msg, showSender };
  });
}

// ── Components ─────────────────────────────────────────────────────────────────

function DateSep({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-3">
      <div className="flex-1 border-t border-black" />
      <span
        className="text-[10px] font-bold tracking-[0.18em] px-1"
        style={{ fontFamily: "monospace" }}
      >
        {label}
      </span>
      <div className="flex-1 border-t border-black" />
    </div>
  );
}

function ReplyBlock({ reply }: { reply: ReplyRef }) {
  return (
    <div className="flex mb-1.5">
      <div className="w-[2px] bg-black flex-shrink-0 mr-3" />
      <p className="text-sm leading-snug italic m-0">
        <span className="font-bold not-italic">{reply.sender}：</span>
        {reply.content}
      </p>
    </div>
  );
}

function MsgBlock({ msg, showSender }: { msg: Message; showSender: boolean }) {
  return (
    <div className="mb-2.5">
      {msg.dateSep && <DateSep label={msg.dateSep} />}
      {showSender && (
        <div className="flex items-baseline justify-between mb-0.5">
          <span className="text-xs font-bold tracking-tight">{msg.sender}</span>
          <span className="text-[11px]" style={{ fontFamily: "monospace" }}>
            {msg.timestamp}
          </span>
        </div>
      )}
      {msg.replyTo && <ReplyBlock reply={msg.replyTo} />}
      <div className="text-base leading-[1.6] m-0">
        {msg.type === "image" ? (
          <span
            className="inline-block border border-black px-2 text-sm not-italic"
            style={{ fontFamily: "monospace" }}
          >
            [图片]
          </span>
        ) : msg.type === "sticker" ? (
          <span
            className="inline-block border border-black px-2 text-sm not-italic"
            style={{ fontFamily: "monospace" }}
          >
            [贴纸: {msg.stickerDesc}]
          </span>
        ) : msg.type === "sketch" ? (
          <div className="mt-1 flex flex-col">
            <span
              className="inline-block border border-black px-2 text-[10px] font-bold bg-black text-white self-start mb-1.5"
              style={{ fontFamily: "monospace" }}
            >
              [🎨 手绘草图]
            </span>
            <div className="border border-black p-1.5 bg-white inline-block max-w-[240px] select-none">
              <img 
                src={msg.content} 
                alt="手绘草图" 
                className="max-h-[140px] w-auto object-contain block" 
                style={{ imageRendering: "pixelated" }}
              />
            </div>
          </div>
        ) : (
          msg.content
        )}
      </div>
    </div>
  );
}

// ── Hand-drawn Board Component ──────────────────────────────────────────────────

interface SketchBoardProps {
  onClose: () => void;
  onSend: (dataUrl: string) => void;
}

function SketchBoard({ onClose, onSend }: SketchBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Initialize canvas size and background
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#000000";
    }
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    
    if ("touches" in e) {
      if (e.touches.length === 0) return null;
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const coords = getCoordinates(e);
    if (!coords) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
      setIsDrawing(true);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const coords = getCoordinates(e);
    if (!coords) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleSend = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    onSend(dataUrl);
  };

  return (
    <div className="absolute inset-0 bg-white z-40 flex flex-col animate-fade-in" style={{ fontFamily: '"Noto Serif SC", Georgia, serif' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-3 flex-shrink-0">
        <div>
          <span className="font-bold text-base leading-tight">手绘板</span>
          <div className="text-[10px] tracking-wider text-gray-500 font-bold mt-0.5" style={{ fontFamily: "monospace" }}>
            使用鼠标或手写笔绘制草图
          </div>
        </div>
        <button 
          onClick={clearCanvas}
          className="px-3 py-1 text-xs font-bold text-black hover:underline transition-all cursor-pointer"
        >
          清除画布
        </button>
      </div>

      {/* Canvas Drawing Area - enclosed in a complete square box frame */}
      <div className="flex-1 px-6 py-2 flex flex-col min-h-0">
        <div ref={containerRef} className="flex-1 bg-white border border-black cursor-crosshair relative">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="absolute inset-0 block"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 px-6 py-4 flex-shrink-0 bg-white">
        <button
          onClick={onClose}
          className="px-4 py-2 text-xs font-bold text-black hover:underline transition-all cursor-pointer"
        >
          取消
        </button>
        <button
          onClick={handleSend}
          className="px-4 py-2 text-xs font-bold border border-black bg-black text-white hover:bg-white hover:text-black transition-colors cursor-pointer"
        >
          发送
        </button>
      </div>
    </div>
  );
}

// ── Spotlight Search Modal ──────────────────────────────────────────────────────

interface SpotlightSearchProps {
  onClose: () => void;
  chats: Chat[];
  messages: Record<string, Message[]>;
  onSelectChat: (id: string, selectMessageId?: string) => void;
}

function SpotlightSearch({ onClose, chats, messages, onSelectChat }: SpotlightSearchProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Listen for escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Filter chats matching query
  const filteredChats = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return chats.filter(c => c.name.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q));
  }, [query, chats]);

  // Filter messages matching query
  const filteredMessages = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const results: { chatName: string; chatId: string; msg: Message }[] = [];
    
    Object.entries(messages).forEach(([chatId, msgList]) => {
      const chat = chats.find(c => c.id === chatId);
      if (!chat) return;
      msgList.forEach(msg => {
        if (msg.content.toLowerCase().includes(q) && msg.sender !== "我") {
          results.push({
            chatName: chat.name,
            chatId,
            msg
          });
        }
      });
    });
    return results.slice(0, 5);
  }, [query, messages, chats]);

  return (
    <>
      {/* E-ink Checkerboard Halftone Overlay (Pure Black & transparent small square mosaic) */}
      <div 
        className="fixed inset-0 z-40 cursor-default" 
        style={{ 
          backgroundImage: "conic-gradient(#000000 25%, transparent 0 50%, #000000 0 75%, transparent 0)",
          backgroundSize: "2px 2px"
        }}
        onClick={onClose}
      />

      {/* Spotlight Search Box */}
      <div 
        className="absolute top-12 left-1/2 -translate-x-1/2 w-[90%] max-w-[460px] z-50 bg-white border border-black flex flex-col py-1 animate-fade-in"
        style={{ 
          fontFamily: '"Noto Serif SC", Georgia, serif'
        }}
      >
        {/* Input Bar */}
        <div className="flex items-center gap-3 px-4 py-2 flex-shrink-0">
          <Search size={18} strokeWidth={2} className="text-black flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="搜索会话或消息..."
            className="flex-1 text-sm bg-transparent border-none outline-none focus:ring-0 placeholder:text-gray-400 font-bold py-1 text-black"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button 
              onClick={() => setQuery("")}
              className="text-xs font-bold text-black hover:underline cursor-pointer"
            >
              清除
            </button>
          )}
        </div>

        {/* Results list */}
        {query.trim() && (
          <div className="border-t border-black flex flex-col divide-y divide-black max-h-[320px] overflow-y-auto">
            {/* Chats category */}
            {filteredChats.length > 0 && (
              <div className="flex flex-col">
                <div className="bg-gray-100 px-4 py-1.5 text-[10px] font-bold tracking-wider text-gray-500 uppercase select-none border-b border-black">
                  会话匹配
                </div>
                <div className="flex flex-col divide-y divide-black/10">
                  {filteredChats.map(c => (
                    <button
                      key={c.id}
                      onClick={() => {
                        onSelectChat(c.id);
                        onClose();
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-black hover:text-white transition-colors cursor-pointer flex flex-col gap-0.5"
                    >
                      <span className="text-xs font-bold">{c.name}</span>
                      <span className="text-[10px] opacity-70 truncate font-sans">{c.lastMessage}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages category */}
            {filteredMessages.length > 0 && (
              <div className="flex flex-col">
                <div className="bg-gray-100 px-4 py-1.5 text-[10px] font-bold tracking-wider text-gray-500 uppercase select-none border-b border-black">
                  消息内容匹配
                </div>
                <div className="flex flex-col divide-y divide-black/10">
                  {filteredMessages.map(item => (
                    <button
                      key={item.msg.id}
                      onClick={() => {
                        onSelectChat(item.chatId, item.msg.id);
                        onClose();
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-black hover:text-white transition-colors cursor-pointer flex flex-col gap-0.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-current">{item.msg.sender} ({item.chatName})</span>
                        <span className="text-[9px] font-mono opacity-70">{item.msg.timestamp}</span>
                      </div>
                      <span className="text-[10px] opacity-80 font-serif line-clamp-1 italic">"{item.msg.content}"</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* No matches */}
            {filteredChats.length === 0 && filteredMessages.length === 0 && (
              <div className="px-4 py-6 text-center text-xs font-bold text-gray-500 font-sans">
                未找到匹配的会话或消息内容
              </div>
            )}
          </div>
        )}

        {/* Empty state: popular shortcuts */}
        {!query.trim() && (
          <div className="border-t border-black flex flex-col">
            <div className="bg-gray-100 px-4 py-1.5 text-[10px] font-bold tracking-wider text-gray-500 uppercase select-none border-b border-black">
              快速浏览
            </div>
            <div className="flex flex-col divide-y divide-black/10 max-h-[220px] overflow-y-auto">
              {chats.slice(0, 4).map(c => (
                <button
                  key={c.id}
                  onClick={() => {
                    onSelectChat(c.id);
                    onClose();
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-black hover:text-white transition-colors cursor-pointer flex items-center justify-between"
                >
                  <span className="text-xs font-bold">{c.name}</span>
                  <span className="text-[10px] font-mono opacity-70">进入会话 ➔</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

interface GlobalModalProps {
  type: "new_chat" | "contacts" | "settings";
  onClose: () => void;
  onSelectChat: (id: string) => void;
}

const SIDEBAR_CONTACTS = [
  { name: "张伟", role: "系统架构师", id: "8" },
  { name: "陈若曦", role: "高级 UI 设计师", id: "2" },
  { name: "苏晓宇", role: "前端开发人员", id: "10" },
  { name: "林建国", role: "项目总监", id: "4" },
  { name: "方晓燕", role: "发布经理", id: "9" },
  { name: "李美华", role: "测试工程师", id: "11" },
  { name: "王强", role: "系统编译专家", id: "13" },
  { name: "赵敏", role: "HRBP", id: "15" },
  { name: "刘洋", role: "后端开发人员", id: "7" }
];

function GlobalModal({ type, onClose, onSelectChat }: GlobalModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Settings States
  const [fontSize, setFontSize] = useState("normal");
  const [inkDensity, setInkDensity] = useState(4);
  const [regalMode, setRegalMode] = useState(true);
  const [refreshCycle, setRefreshCycle] = useState("10");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Group contacts by initial for contacts view
  const groupedContacts = useMemo(() => {
    const groups: Record<string, typeof SIDEBAR_CONTACTS> = {};
    SIDEBAR_CONTACTS.forEach(c => {
      let initial = "Z"; // Fallback
      if (c.name.startsWith("陈")) initial = "C";
      else if (c.name.startsWith("方")) initial = "F";
      else if (c.name.startsWith("林") || c.name.startsWith("刘") || c.name.startsWith("李")) initial = "L";
      else if (c.name.startsWith("苏")) initial = "S";
      else if (c.name.startsWith("王")) initial = "W";
      else if (c.name.startsWith("张") || c.name.startsWith("赵")) initial = "Z";
      
      if (!groups[initial]) groups[initial] = [];
      groups[initial].push(c);
    });
    // Sort keys alphabetically
    return Object.keys(groups).sort().reduce((acc, key) => {
      acc[key] = groups[key];
      return acc;
    }, {} as Record<string, typeof SIDEBAR_CONTACTS>);
  }, []);

  const filteredContacts = useMemo(() => {
    return SIDEBAR_CONTACTS.filter(c => 
      c.name.includes(searchQuery) || c.role.includes(searchQuery)
    );
  }, [searchQuery]);

  return (
    <>
      {/* 1-bit Checkerboard Backdrop */}
      <div 
        className="fixed inset-0 z-40 cursor-default animate-fade-in" 
        style={{ 
          backgroundImage: "conic-gradient(#000000 25%, transparent 0 50%, #000000 0 75%, transparent 0)",
          backgroundSize: "2px 2px"
        }}
        onClick={onClose}
      />

      {/* 2:3 Modal Box */}
      <div 
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[540px] z-50 bg-white border border-black flex flex-col animate-fade-in"
        style={{ fontFamily: '"Noto Serif SC", Georgia, serif' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-black flex-shrink-0">
          <div>
            <span className="font-bold text-sm leading-tight">
              {type === "new_chat" ? "新建会话" : type === "contacts" ? "通讯录" : "设置"}
            </span>
            <div className="text-[10px] text-gray-500 font-bold mt-0.5" style={{ fontFamily: "monospace" }}>
              {type === "new_chat" && "选择联系人以开始新对话"}
              {type === "contacts" && "联系人花名册 (A-Z)"}
              {type === "settings" && "墨水屏显示与刷新配置"}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-xs font-bold border border-black px-2 py-0.5 hover:bg-black hover:text-white transition-colors cursor-pointer"
          >
            关闭
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 min-h-0">
          {type === "new_chat" && (
            <div className="flex flex-col h-full">
              <input
                type="text"
                placeholder="搜索姓名或职位..."
                className="w-full text-xs font-bold border border-black px-3 py-2 focus:outline-none placeholder:text-gray-400 mb-3"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <div className="flex-1 overflow-y-auto flex flex-col gap-1.5">
                {filteredContacts.map(c => (
                  <button 
                    key={c.id}
                    onClick={() => {
                      onSelectChat(c.id);
                      onClose();
                    }}
                    className="w-full text-left py-2 px-2 border border-transparent hover:border-black flex items-center gap-3 transition-colors cursor-pointer bg-white"
                  >
                    <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center text-[10px] font-bold border border-black leading-none bg-white">
                      {c.name.slice(0,2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold truncate">{c.name}</div>
                      <div className="text-[10px] text-gray-500 font-sans truncate mt-0.5">{c.role}</div>
                    </div>
                    <span className="text-[9px] font-mono opacity-50">发起会话 ➔</span>
                  </button>
                ))}
                {filteredContacts.length === 0 && (
                  <div className="text-center text-xs text-gray-400 font-bold py-8">未找到匹配的联系人</div>
                )}
              </div>
            </div>
          )}

          {type === "contacts" && (
            <div className="flex flex-col gap-4">
              {Object.entries(groupedContacts).map(([initial, list]) => (
                <div key={initial} className="flex flex-col">
                  <div className="text-xs font-black tracking-wider text-black bg-gray-100 px-2 py-0.5 mb-1.5 self-start border border-black" style={{ fontFamily: "monospace" }}>
                    {initial}
                  </div>
                  <div className="flex flex-col divide-y divide-black/10 border-t border-black/10">
                    {list.map(c => (
                      <div key={c.id} className="py-2.5 flex items-center gap-3 bg-white">
                        <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center text-[10px] font-bold border border-black bg-white leading-none">
                          {c.name.slice(0,2)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold">{c.name}</div>
                          <div className="text-[10px] text-gray-500 font-sans mt-0.5">{c.role}</div>
                        </div>
                        <button 
                          onClick={() => {
                            onSelectChat(c.id);
                            onClose();
                          }}
                          className="text-[10px] font-bold border border-black px-2 py-0.5 hover:bg-black hover:text-white transition-colors cursor-pointer"
                        >
                          发消息
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {type === "settings" && (
            <div className="flex flex-col gap-5 text-xs font-bold pb-2">
              {/* Option 1: Font Size */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-black">字号大小 (Font Scale)</span>
                <div className="grid grid-cols-3 border border-black divide-x divide-black text-center">
                  <button 
                    onClick={() => setFontSize("small")}
                    className={`py-1.5 text-[10px] font-bold transition-colors cursor-pointer ${fontSize === "small" ? "bg-black text-white" : "bg-white hover:bg-black/5"}`}
                  >
                    紧凑 (14px)
                  </button>
                  <button 
                    onClick={() => setFontSize("normal")}
                    className={`py-1.5 text-[10px] font-bold transition-colors cursor-pointer ${fontSize === "normal" ? "bg-black text-white" : "bg-white hover:bg-black/5"}`}
                  >
                    标准 (16px)
                  </button>
                  <button 
                    onClick={() => setFontSize("large")}
                    className={`py-1.5 text-[10px] font-bold transition-colors cursor-pointer ${fontSize === "large" ? "bg-black text-white" : "bg-white hover:bg-black/5"}`}
                  >
                    特大 (18px)
                  </button>
                </div>
              </div>

              {/* Option 2: Ink Density */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-black">物理墨水浓度</span>
                  <span className="text-[11px] font-mono border border-black px-1.5 bg-gray-50">{inkDensity} 档</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="7" 
                  value={inkDensity}
                  onChange={e => setInkDensity(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 accent-black rounded-none appearance-none cursor-pointer border border-black"
                />
                <div className="flex justify-between text-[8px] font-bold opacity-50 px-0.5" style={{ fontFamily: "monospace" }}>
                  <span>LIGHT (淡)</span>
                  <span>DEEP (浓)</span>
                </div>
              </div>

              {/* Option 3: Regal Anti-Ghosting */}
              <div className="flex items-center justify-between border-t border-b border-black py-3">
                <div>
                  <span className="text-xs font-bold text-black">Regal 防残影算法模式</span>
                  <div className="text-[9px] text-gray-500 font-sans mt-0.5">自适应消除电子墨水瓶颗粒印记</div>
                </div>
                <button 
                  onClick={() => setRegalMode(!regalMode)}
                  className={`w-5 h-5 border border-black flex items-center justify-center transition-colors cursor-pointer ${regalMode ? "bg-black text-white" : "bg-white"}`}
                >
                  {regalMode && "✓"}
                </button>
              </div>

              {/* Option 4: Full Refresh Frequency */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-black">系统级深度全刷频率</span>
                <div className="flex flex-col border border-black divide-y divide-black">
                  {[
                    { label: "每 5 页列表翻页进行全刷", value: "5" },
                    { label: "每 10 页列表翻页进行全刷 (推荐)", value: "10" },
                    { label: "从不自动全刷 (完全依靠局刷清除)", value: "never" }
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setRefreshCycle(opt.value)}
                      className={`w-full text-left px-3 py-2 text-[10px] font-bold flex items-center justify-between cursor-pointer ${refreshCycle === opt.value ? "bg-black text-white" : "bg-white hover:bg-black/5"}`}
                    >
                      <span>{opt.label}</span>
                      {refreshCycle === opt.value && <span>●</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-5 py-3 border-t border-black bg-white flex-shrink-0">
          {type === "settings" ? (
            <button
              onClick={() => {
                alert(`设置保存成功！\n字号: ${fontSize}\n墨水浓度: ${inkDensity}\n防残影: ${regalMode ? "开启" : "关闭"}\n全刷频率: ${refreshCycle}`);
                onClose();
              }}
              className="w-full py-2 text-xs font-bold border border-black bg-black text-white hover:bg-white hover:text-black transition-colors cursor-pointer text-center"
            >
              保存配置并全刷屏幕
            </button>
          ) : (
            <div className="text-[10px] text-gray-500 font-bold self-center" style={{ fontFamily: "monospace" }}>
              Inkgram 拟真沙盒系统 (Aspect 2:3)
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────

interface TelegramClientProps {
  deviceOrient?: "portrait" | "landscape";
}

export default function TelegramClient({ deviceOrient = "portrait" }: TelegramClientProps) {
  const isDrawerLayout = deviceOrient === "landscape";
  const chatListRef = useRef<HTMLDivElement>(null);
  const [chatPageIdx, setChatPageIdx] = useState(0);
  const [chatsPerPage, setChatsPerPage] = useState(6);
  const totalChatPages = useMemo(() => Math.ceil(CHATS.length / chatsPerPage), [chatsPerPage]);

  const handleChatPageUp = () => {
    setChatPageIdx((p) => Math.max(0, p - 1));
  };

  const handleChatPageDown = () => {
    setChatPageIdx((p) => Math.min(totalChatPages - 1, p + 1));
  };

  useEffect(() => {
    const el = chatListRef.current;
    if (!el) return;

    const measure = () => {
      const computed = Math.max(1, Math.floor((el.clientHeight - 12) / 62));
      setChatsPerPage(computed);
      setChatPageIdx((currentIdx) => {
        const totalPages = Math.ceil(CHATS.length / computed);
        return Math.min(totalPages - 1, Math.max(0, currentIdx));
      });
    };

    measure();

    const resizeObserver = new ResizeObserver(() => {
      measure();
    });
    resizeObserver.observe(el);
    return () => resizeObserver.disconnect();
  }, []);
  const [chatId, setChatId] = useState<string>("1");
  const [pageIdx, setPageIdx] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [deviceOrient]);

  const [allMessages, setAllMessages] = useState<Record<string, Message[]>>(MESSAGES);
  const [inputVal, setInputVal] = useState("");
  const [attachMenuOpen, setAttachMenuOpen] = useState(false);
  const [sketchBoardOpen, setSketchBoardOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<"new_chat" | "contacts" | "settings" | null>(null);

  const msgAreaRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLSpanElement>(null);
  const [msgMetrics, setMsgMetrics] = useState<MsgMetrics>(DEFAULT_MSG_METRICS);
  const [measureMsgs, setMeasureMsgs] = useState<Message[]>([]);
  const [pages, setPages] = useState<Message[][]>([[]]);

  useEffect(() => {
    const el = msgAreaRef.current;
    if (!el) return;

    const measure = () => {
      const width = el.clientWidth;
      const fontSize = parseFloat(getComputedStyle(el).fontSize) || 16;
      const probe = probeRef.current;
      let lineHeightPx = fontSize * 1.6;
      if (probe) {
        const lh = parseFloat(getComputedStyle(probe).lineHeight);
        if (!Number.isNaN(lh)) lineHeightPx = lh;
      }
      const charsPerLine = Math.max(12, Math.floor(width / (fontSize * 0.95)));
      const availableHeightPx = el.clientHeight;
      const linesPerPage = Math.max(8, Math.floor(availableHeightPx / lineHeightPx));
      setMsgMetrics({ availableHeightPx, lineHeightPx, charsPerLine, linesPerPage });
    };

    measure();

    const resizeObserver = new ResizeObserver(() => {
      measure();
    });
    resizeObserver.observe(el);
    return () => resizeObserver.disconnect();
  }, [deviceOrient, isDrawerLayout]);

  const msgs = useMemo(() => allMessages[chatId] ?? [], [allMessages, chatId]);

  const initialPages = useMemo(
    () => paginate(msgs, msgMetrics.linesPerPage, msgMetrics.charsPerLine),
    [msgs, msgMetrics]
  );

  useLayoutEffect(() => {
    if (!measureRef.current || msgMetrics.availableHeightPx <= 0) {
      setPages(initialPages);
      return;
    }

    const maxHeight = msgMetrics.availableHeightPx - PAGE_HEIGHT_BUFFER;
    const measureFn = (batch: Message[]) => {
      flushSync(() => setMeasureMsgs(batch));
      return measureRef.current?.scrollHeight ?? Infinity;
    };

    setPages(refinePages(initialPages, maxHeight, measureFn));
  }, [initialPages, msgMetrics]);

  useEffect(() => {
    setPageIdx((p) => Math.min(p, Math.max(0, pages.length - 1)));
  }, [pages.length]);

  const handleSendMessage = () => {
    const text = inputVal.trim();
    if (!text) return;

    const newMessage: Message = {
      id: `${chatId}-${Date.now()}`,
      sender: "我",
      content: text,
      type: "text",
      timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false })
    };

    setAllMessages(prev => {
      const updated = {
        ...prev,
        [chatId]: [...(prev[chatId] || []), newMessage]
      };
      // 计算页码自动翻到最后一页
      const newMsgs = updated[chatId] ?? [];
      const newPages = paginate(newMsgs, msgMetrics.linesPerPage, msgMetrics.charsPerLine);
      setPageIdx(Math.max(0, newPages.length - 1));
      return updated;
    });

    setInputVal("");
  };

  const handleSendAttachment = (type: "image" | "file" | "sketch") => {
    let content = "";
    let msgType: MsgType = "text";

    if (type === "image") {
      content = "发送了一张图片";
      msgType = "image";
    } else if (type === "file") {
      content = "[文档] clean_code_notes.pdf (1.2 MB)";
      msgType = "text";
    } else if (type === "sketch") {
      content = "新版 UI 布局草图.png";
      msgType = "sketch";
    }

    const newMessage: Message = {
      id: `${chatId}-${Date.now()}`,
      sender: "我",
      content,
      type: msgType,
      timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false })
    };

    setAllMessages(prev => {
      const updated = {
        ...prev,
        [chatId]: [...(prev[chatId] || []), newMessage]
      };
      const newMsgs = updated[chatId] ?? [];
      const newPages = paginate(newMsgs, msgMetrics.linesPerPage, msgMetrics.charsPerLine);
      setPageIdx(Math.max(0, newPages.length - 1));
      return updated;
    });

    setAttachMenuOpen(false);
  };

  const total = pages.length;
  const current = Math.min(pageIdx, Math.max(0, total - 1));
  const pageMsgs = pages[current] ?? [];
  const chat = CHATS.find((c) => c.id === chatId)!;

  const handleSelect = (id: string, selectMessageId?: string) => {
    setChatId(id);
    setDrawerOpen(false);
    
    // Automatically switch chat list page so that the selected chat is visible
    const targetChatIdx = CHATS.findIndex(c => c.id === id);
    if (targetChatIdx !== -1) {
      setChatPageIdx(Math.floor(targetChatIdx / chatsPerPage));
    }
    
    if (selectMessageId) {
      const msgList = allMessages[id] ?? [];
      const computedPages = paginate(msgList, msgMetrics.linesPerPage, msgMetrics.charsPerLine);
      let targetPageIdx = 0;
      computedPages.forEach((p, idx) => {
        if (p.some(m => m.id === selectMessageId)) {
          targetPageIdx = idx;
        }
      });
      setPageIdx(targetPageIdx);
    } else {
      setPageIdx(0);
    }
  };

  const renderedMsgs = buildMsgBlocks(pageMsgs).map(({ msg, showSender }) => (
    <MsgBlock key={msg.id} msg={msg} showSender={showSender} />
  ));

  return (
    <div
      className="relative flex h-full w-full bg-white text-black overflow-hidden"
      style={{ fontFamily: '"Noto Serif SC", Georgia, "Times New Roman", serif' }}
    >
      {/* Spotlight Search Overlay */}
      {searchOpen && (
        <SpotlightSearch 
          onClose={() => setSearchOpen(false)}
          chats={CHATS}
          messages={allMessages}
          onSelectChat={handleSelect}
        />
      )}
      {/* 2:3 Global Modal System */}
      {activeModal && (
        <GlobalModal 
          type={activeModal} 
          onClose={() => setActiveModal(null)} 
          onSelectChat={handleSelect}
        />
      )}
      {/* Drawer overlay (landscape only) */}
      {isDrawerLayout && drawerOpen && (
        <div
          className="absolute inset-0 z-10"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ── Left Sidebar: Chat List ── */}
      <aside
        className={[
          isDrawerLayout ? "absolute" : "relative",
          "inset-y-0 left-0 z-20",
          "flex flex-col bg-white",
          "w-72 lg:w-80 flex-shrink-0",
          isDrawerLayout
            ? drawerOpen ? "translate-x-0" : "-translate-x-full"
            : "translate-x-0",
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-6 pb-2">
          <div>
            <span className="text-xl font-bold tracking-tighter">Inkgram</span>
          </div>
          <div className="flex gap-3 relative">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="搜索"
              className="text-black hover:underline transition-all cursor-pointer"
            >
              <Search size={17} />
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="主菜单"
              className="text-black hover:underline transition-all cursor-pointer"
            >
              <Menu size={17} />
            </button>

            {menuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-30 cursor-default" 
                  onClick={() => setMenuOpen(false)}
                />
                <div 
                  className="absolute top-full right-0 mt-2 z-40 bg-white border border-black w-40 flex flex-col py-1.5 animate-fade-in"
                  style={{ 
                    fontFamily: '"Noto Serif SC", Georgia, serif'
                  }}
                >
                  <button
                    onClick={() => {
                      setActiveModal("new_chat");
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-bold bg-white text-black hover:bg-black hover:text-white transition-colors cursor-pointer"
                  >
                    新建会话
                  </button>
                  <div className="h-px bg-black opacity-15 mx-4 my-1" />
                  <button
                    onClick={() => {
                      setActiveModal("contacts");
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-bold bg-white text-black hover:bg-black hover:text-white transition-colors cursor-pointer"
                  >
                    通讯录
                  </button>
                  <div className="h-px bg-black opacity-15 mx-4 my-1" />
                  <button
                    onClick={() => {
                      setActiveModal("settings");
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-bold bg-white text-black hover:bg-black hover:text-white transition-colors cursor-pointer"
                  >
                    设置
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Chat items list (Fully Paginated Style, No Scrollbars) */}
        <div ref={chatListRef} className="flex-1 pt-3 overflow-hidden">
          {(() => {
            const pagedChats = CHATS.slice(chatPageIdx * chatsPerPage, (chatPageIdx + 1) * chatsPerPage);
            return pagedChats.map((c) => {
            const selected = c.id === chatId;
            return (
              <button
                key={c.id}
                onClick={() => handleSelect(c.id)}
                className={[
                  "w-full text-left px-5 py-3 h-[62px]",
                  "flex items-start gap-3 transition-colors cursor-pointer",
                  selected ? "bg-black text-white" : "bg-white text-black hover:bg-black hover:text-white",
                ].join(" ")}
              >
                {/* Text avatar */}
                <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center text-[10px] font-bold leading-none">
                  {c.name.slice(0, 2)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-1">
                    <span className="text-sm font-bold truncate">{c.name}</span>
                    <span
                      className="text-[11px] flex-shrink-0"
                      style={{ fontFamily: "monospace" }}
                    >
                      {c.time}
                    </span>
                  </div>
                  <div className="text-xs mt-0.5 truncate">{c.lastMessage}</div>
                </div>

                {c.unread != null && (
                  <span
                    className="self-center flex-shrink-0 text-[11px] font-bold"
                    style={{ fontFamily: "monospace" }}
                  >
                    ({c.unread})
                  </span>
                )}
              </button>
            );
          });
          })()}
        </div>

        {/* Sidebar Footer with Page Up/Down buttons (Fully Paginated) */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-white flex-shrink-0">
          <button
            onClick={handleChatPageUp}
            disabled={chatPageIdx === 0}
            aria-label="列表向上翻页"
            className={[
              "w-8 h-8 flex items-center justify-center border border-black transition-colors",
              chatPageIdx === 0 ? "opacity-30 cursor-not-allowed" : "hover:bg-black hover:text-white cursor-pointer"
            ].join(" ")}
          >
            <ChevronUp size={14} strokeWidth={2.5} />
          </button>
          
          <span
            className="text-xs font-bold tracking-wider"
            style={{ fontFamily: "monospace" }}
          >
            {chatPageIdx + 1} / {totalChatPages}
          </span>

          <button
            onClick={handleChatPageDown}
            disabled={chatPageIdx === totalChatPages - 1}
            aria-label="列表向下翻页"
            className={[
              "w-8 h-8 flex items-center justify-center border border-black transition-colors",
              chatPageIdx === totalChatPages - 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-black hover:text-white cursor-pointer"
            ].join(" ")}
          >
            <ChevronDown size={14} strokeWidth={2.5} />
          </button>
        </div>
      </aside>

      {/* Thin rule separating columns — portrait split layout only */}
      {!isDrawerLayout && (
        <div className="w-px bg-transparent flex-shrink-0 self-stretch" />
      )}

      {/* ── Right Panel: Chat View ── */}
      <main className="relative flex flex-col flex-1 min-w-0">
        {/* Hand-drawn Sketch Board Modal */}
        {sketchBoardOpen && (
          <SketchBoard 
            onClose={() => setSketchBoardOpen(false)}
            onSend={(dataUrl) => {
              const newMessage: Message = {
                id: `${chatId}-${Date.now()}`,
                sender: "我",
                content: dataUrl,
                type: "sketch",
                timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false })
              };
              setAllMessages(prev => {
                const updated = {
                  ...prev,
                  [chatId]: [...(prev[chatId] || []), newMessage]
                };
                const newMsgs = updated[chatId] ?? [];
                const newPages = paginate(newMsgs, msgMetrics.linesPerPage, msgMetrics.charsPerLine);
                setPageIdx(Math.max(0, newPages.length - 1));
                return updated;
              });
              setSketchBoardOpen(false);
            }}
          />
        )}

        {/* Chat header */}
        <div className="flex items-center gap-3 px-6 pt-5 pb-3">
          {isDrawerLayout && (
            <button
              className="text-black cursor-pointer"
              onClick={() => setDrawerOpen(true)}
              aria-label="打开列表"
            >
              <Menu size={17} />
            </button>
          )}

          <div className="flex-1 min-w-0">
            <div className="font-bold text-base leading-tight truncate">{chat.name}</div>
            <div
              className="text-[11px]"
              style={{ fontFamily: "monospace" }}
            >
              {chat.isGroup ? "群组" : "私聊"}
            </div>
          </div>

          <button aria-label="搜索消息" className="text-black hover:underline transition-all">
            <Search size={17} />
          </button>
          <button aria-label="更多选项" className="text-black hover:underline transition-all">
            <MoreVertical size={17} />
          </button>
        </div>

        {/* Message area */}
        <div ref={msgAreaRef} className="flex-1 overflow-hidden px-8 pb-2 min-h-0 relative">
          <span
            ref={probeRef}
            className="absolute opacity-0 pointer-events-none text-base leading-[1.6]"
            aria-hidden
          >
            A
          </span>
          <div
            ref={measureRef}
            aria-hidden
            className="absolute left-8 right-8 top-0 invisible pointer-events-none overflow-hidden"
            style={{ visibility: "hidden" }}
          >
            {buildMsgBlocks(measureMsgs).map(({ msg, showSender }) => (
              <MsgBlock key={msg.id} msg={msg} showSender={showSender} />
            ))}
          </div>
          <div className="h-full overflow-hidden">
            {pageMsgs.length === 0 ? (
              <p className="text-sm text-center mt-8">此页无消息</p>
            ) : (
              renderedMsgs
            )}
          </div>
        </div>

        {/* ── Message Input Bar (No borders, flush borderless integration) ── */}
        <div className="relative flex items-center gap-3 px-8 py-3 bg-white flex-shrink-0">
          {/* Attachment Popover Menu */}
          {attachMenuOpen && (
            <>
              {/* Invisible overlay backdrop for click-outside close */}
              <div 
                className="fixed inset-0 z-30 cursor-default" 
                onClick={() => setAttachMenuOpen(false)}
              />
              
              {/* E-ink style Popover Menu */}
              <div 
                className="absolute bottom-full left-8 mb-2 z-40 bg-white border border-black w-40 flex flex-col py-1.5"
                style={{ 
                  fontFamily: '"Noto Serif SC", Georgia, serif'
                }}
              >
                <button
                  onClick={() => handleSendAttachment("image")}
                  className="w-full text-left px-4 py-2 text-xs font-bold bg-white text-black hover:bg-black hover:text-white transition-colors flex items-center gap-2.5 cursor-pointer"
                >
                  <Image size={15} strokeWidth={2} />
                  <span>图片</span>
                </button>
                <div className="h-px bg-black opacity-15 mx-4 my-1" />
                <button
                  onClick={() => handleSendAttachment("file")}
                  className="w-full text-left px-4 py-2 text-xs font-bold bg-white text-black hover:bg-black hover:text-white transition-colors flex items-center gap-2.5 cursor-pointer"
                >
                  <FileText size={15} strokeWidth={2} />
                  <span>文件</span>
                </button>
                <div className="h-px bg-black opacity-15 mx-4 my-1" />
                <button
                  onClick={() => {
                    setSketchBoardOpen(true);
                    setAttachMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-bold bg-white text-black hover:bg-black hover:text-white transition-colors flex items-center gap-2.5 cursor-pointer"
                >
                  <Palette size={15} strokeWidth={2} />
                  <span>手绘</span>
                </button>
              </div>
            </>
          )}

          {/* Insert Attachment */}
          <button 
            aria-label="插入附件" 
            className={`p-1 flex-shrink-0 transition-all cursor-pointer ${attachMenuOpen ? "bg-black text-white" : "text-black hover:opacity-75"}`}
            onClick={() => setAttachMenuOpen(!attachMenuOpen)}
          >
            <Paperclip size={18} strokeWidth={2} />
          </button>

          {/* Borderless Input Field */}
          <input
            type="text"
            placeholder="输入消息..."
            className="flex-1 text-sm bg-transparent border-none outline-none focus:ring-0 placeholder:text-gray-400 py-1"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendMessage();
            }}
          />

          {/* Voice Input */}
          <button 
            aria-label="语音输入" 
            className="text-black hover:opacity-75 p-1 flex-shrink-0 transition-opacity cursor-pointer"
            onClick={() => alert("已调起平板麦克风，正在聆听语音...")}
          >
            <Mic size={18} strokeWidth={2} />
          </button>

          {/* Send Message */}
          <button 
            aria-label="发送消息" 
            className={`p-1 flex-shrink-0 transition-opacity ${inputVal.trim() ? "text-black hover:opacity-75 cursor-pointer" : "text-gray-300 cursor-not-allowed"}`}
            onClick={handleSendMessage}
            disabled={!inputVal.trim()}
          >
            <Send size={18} strokeWidth={2} />
          </button>
        </div>
 
        {/* Pagination */}
        <div className="flex-shrink-0 px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setPageIdx((p) => Math.max(0, p - 1))}
              disabled={current === 0}
              className={[
                "flex items-center gap-1 text-sm font-bold transition-all",
                current === 0
                  ? "cursor-not-allowed"
                  : "hover:underline underline-offset-2 cursor-pointer",
              ].join(" ")}
              style={current === 0 ? { textDecoration: "line-through" } : undefined}
            >
              <ChevronLeft size={14} />
              上一页
            </button>

            <span
              className="text-xs font-bold tracking-wider"
              style={{ fontFamily: "monospace" }}
            >
              {current + 1} / {total}
            </span>

            <button
              onClick={() => setPageIdx((p) => Math.min(total - 1, p + 1))}
              disabled={current === total - 1}
              className={[
                "flex items-center gap-1 text-sm font-bold transition-all",
                current === total - 1
                  ? "cursor-not-allowed"
                  : "hover:underline underline-offset-2 cursor-pointer",
              ].join(" ")}
              style={current === total - 1 ? { textDecoration: "line-through" } : undefined}
            >
              下一页
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
