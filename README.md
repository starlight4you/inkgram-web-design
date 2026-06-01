# Inkgram Web Design Demo

> **这是 [Inkgram](https://github.com/starlight4you) 在 UI 设计上的演示项目（Demo），不是生产可用的客户端。**

本仓库用于展示 Inkgram 面向 **电子墨水屏（E-Ink）** 场景的 Telegram 风格界面设计，包含设备仿真、刷新模式与残影效果等交互原型，便于评审视觉与体验，而非对接真实 Telegram 后端。

## 项目定位

| 说明 | 内容 |
|------|------|
| **性质** | UI / UX 设计 Demo |
| **目标** | 验证 E-Ink 设备上的布局、对比度、刷新与残影观感 |
| **非目标** | 登录、消息同步、网络 API、完整 Telegram 功能 |

设计稿来源：[Figma — E-ink Telegram Client UI](https://www.figma.com/design/kZwgbkNLUk5cSAWTHcPr6t/E-ink-Telegram-Client-UI)

## 技术栈

- React 18 + Vite 6
- Tailwind CSS 4
- Radix UI / MUI Icons / Lucide（组件与图标）

## 本地运行

```bash
npm install
npm run dev
```

构建静态资源：

```bash
npm run build
```

## 目录结构（简要）

```
src/
  app/          # 主界面与 Telegram 客户端仿真
  styles/       # 全局样式与 E-Ink 仿真样式
```

## 与 Inkgram 主项目的关系

本仓库 **独立** 于 Inkgram 主代码库，仅承载 Web 端 UI 原型。主产品实现、协议与设备适配请在 Inkgram 主仓库中跟踪。

## License

如无另行说明，设计 Demo 仅供 Inkgram 项目内部参考与展示；使用前请确认与主项目一致的许可策略。
