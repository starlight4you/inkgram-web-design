import { useState, useEffect } from "react";
import TelegramClient from "./TelegramClient";

export default function App() {
  // 1. E-Ink 沙盒物理参数状态
  const [deviceType, setDeviceType] = useState<"tablet" | "phone">("tablet");
  const [deviceOrient, setDeviceOrient] = useState<"portrait" | "landscape">("portrait");
  const [filter, setFilter] = useState<"none" | "4bit" | "1bit">("4bit");
  const [ghostingEnabled, setGhostingEnabled] = useState(true);
  const [refreshMode, setRefreshMode] = useState<"instant" | "slow">("instant");
  const [refreshing, setRefreshing] = useState(false);
  const [ghostOpacity, setGhostOpacity] = useState(0.08);
  const [copied, setCopied] = useState(false);

  // 2. 物理闪烁全刷触发器 (Flash Refresh)
  const triggerFullRefresh = (callback?: () => void) => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      if (callback) callback();
      // 全刷后清除全部残影
      setGhostOpacity(0);
    }, 380);
  };

  // 3. 残影仿真自适应 (Ghosting Simulation)
  useEffect(() => {
    if (!ghostingEnabled) {
      setGhostOpacity(0);
    } else {
      // 局刷或重载时，生成轻微的墨水残留
      setGhostOpacity(0.08);
      const timer = setTimeout(() => {
        setGhostOpacity(0.03); // 随着时间推移残影略微淡化，但依然残留，直到下一次全刷
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [deviceType, deviceOrient, filter, ghostingEnabled, refreshMode]);

  // 4. 设备类型/方向切换控制器
  const handleDeviceChange = (type: "tablet" | "phone") => {
    if (refreshMode === "slow") {
      triggerFullRefresh(() => setDeviceType(type));
    } else {
      setDeviceType(type);
      setGhostOpacity(0.08);
    }
  };

  const handleOrientationChange = (orient: "portrait" | "landscape") => {
    if (refreshMode === "slow") {
      triggerFullRefresh(() => setDeviceOrient(orient));
    } else {
      setDeviceOrient(orient);
      setGhostOpacity(0.08);
    }
  };

  const handleFilterChange = (f: "none" | "4bit" | "1bit") => {
    triggerFullRefresh(() => setFilter(f));
  };

  // 5. 硬件全局刷新按键
  const handleHwRefresh = () => {
    triggerFullRefresh();
  };

  // 6. JSON 规约导出数据
  const designTokens = {
    meta: {
      system: "Inkgram E-Ink Design Tokens",
      version: "1.0.0",
      target: "Android Native / WebView Shared",
      timestamp: new Date().toISOString()
    },
    active_state: {
      screen_mode: filter === '1bit' ? "1-Bit Bitonal (Kindle)" : filter === '4bit' ? "4-Bit Grayscale (Onyx)" : "Standard RGB",
      ghosting_simulated: ghostingEnabled,
      refresh_mode: refreshMode === 'slow' ? "Full Flash Refresh" : "Instant Local Refresh",
      device_type: deviceType === 'tablet' ? "10.3\" Tablet" : "6.1\" Phone",
      resolution: deviceType === 'tablet' 
        ? (deviceOrient === 'portrait' ? "1404 × 1872 px" : "1872 × 1404 px") 
        : (deviceOrient === 'portrait' ? "842 × 1648 px" : "1648 × 842 px"),
      orientation: deviceOrient
    },
    tokens: {
      colors: {
        bg_primary: "#FFFFFF",
        bg_secondary: "#F0F0F0",
        text_primary: "#000000",
        text_secondary: "#3F3F3F",
        border_color: "#000000"
      },
      strokes: {
        thin: "1dp",
        thick: "2dp",
        style: "solid"
      },
      typography: {
        sans_serif: "Inter / Roboto",
        serif: "Lora / Georgia",
        base_line_height: 1.45,
        reader_line_height: 1.85,
        min_touch_target: "48dp"
      }
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(designTokens, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // 获取品牌标文字印记
  const getDeviceBrandLabel = () => {
    if (deviceType === "tablet") {
      return deviceOrient === "portrait" ? 'Boox 10.3" | 1404x1872' : 'Boox 10.3" | 1872x1404';
    } else {
      return deviceOrient === "portrait" ? 'Hisense 6.1" | 842x1648' : 'Hisense 6.1" | 1648x842';
    }
  };

  return (
    <div className="sandbox-container">
      
      {/* 左侧：物理仿真机身 */}
      <div 
        id="deviceBody" 
        className={`eink-device device-${deviceType} orientation-${deviceOrient}`}
      >
        <div className="device-header">
          <div className="device-indicator"></div>
          <div className="device-brand" id="deviceBrandLabel">
            {getDeviceBrandLabel()}
          </div>
          <div className="device-indicator" style={{ backgroundColor: "#555" }}></div>
        </div>

        <div className="eink-screen-wrapper" id="screenWrapper">
          
          {/* 残影仿真层 */}
          {ghostingEnabled && (
            <div 
              className="ghost-layer" 
              style={{ 
                opacity: ghostOpacity,
                backgroundImage: `radial-gradient(var(--eink-medium-gray) 1px, transparent 0)`,
                backgroundSize: '4px 4px'
              }}
            >
              {/* 渲染一个虚弱的影子背景，营造胶囊粒感 */}
            </div>
          )}

          {/* 刷新全刷遮罩层 */}
          <div 
            className="screen-flash" 
            style={{ 
              opacity: refreshing ? 1 : 0,
              backgroundColor: refreshing ? "var(--eink-black)" : "transparent",
              transition: "opacity 100ms step-end"
            }}
          ></div>

          {/* 仿真屏幕内容 - 内嵌 Figma 级别 React 聊天客户端 */}
          <div 
            className={`eink-screen ${filter === "4bit" ? "filter-4bit" : filter === "1bit" ? "filter-bitonal" : ""}`}
            id="einkScreen"
          >
            <TelegramClient deviceOrient={deviceOrient} />
          </div>

        </div>

        {/* 物理仿真底部操作按键 */}
        <div className="device-footer">
          <button className="hardware-btn" onClick={handleHwRefresh}>
            ◀ 返回列表
          </button>
          <button 
            className="hardware-btn" 
            style={{ backgroundColor: "#000", color: "#fff", borderColor: "#222" }} 
            onClick={handleHwRefresh}
          >
            ⟳ 深度刷屏 (CLEAR GHOST)
          </button>
          <button className="hardware-btn" onClick={handleHwRefresh}>
            设置 ⚙
          </button>
        </div>
      </div>

      {/* 右侧：现代 Web 设计沙盒控制台 */}
      <aside className="control-panel">
        <div className="panel-title">
          🎨 E-Ink 客户端沙盒 <span>V2.0</span>
        </div>
        
        <div className="console-desc">
          已成功套用 Figma 高保真 React 客户端 UI！
          在此模拟真实 10.3" 墨水屏平板与 6.1" 手机，调试分页无残影交互板式。
        </div>

        {/* 设备选择与分辨率 */}
        <div className="control-section">
          <div className="control-label">📐 仿真设备选择 (物理分辨率)</div>
          <div className="btn-group">
            <button 
              className={`panel-btn ${deviceType === "tablet" ? "active" : ""}`}
              onClick={() => handleDeviceChange("tablet")}
            >
              平板 (1872 × 1404)
            </button>
            <button 
              className={`panel-btn ${deviceType === "phone" ? "active" : ""}`}
              onClick={() => handleDeviceChange("phone")}
            >
              手机 (1648 × 842)
            </button>
          </div>
        </div>

        {/* 屏幕方向切换 */}
        <div className="control-section">
          <div className="control-label">🔄 屏幕显示方向</div>
          <div className="btn-group">
            <button 
              className={`panel-btn ${deviceOrient === "portrait" ? "active" : ""}`}
              onClick={() => handleOrientationChange("portrait")}
            >
              竖屏 (Portrait)
            </button>
            <button 
              className={`panel-btn ${deviceOrient === "landscape" ? "active" : ""}`}
              onClick={() => handleOrientationChange("landscape")}
            >
              横屏 (Landscape)
            </button>
          </div>
        </div>

        {/* 灰度仿真滤镜 */}
        <div className="control-section">
          <div className="control-label">🌗 物理灰度与抖动模拟</div>
          <div className="btn-group">
            <button 
              className={`panel-btn ${filter === "none" ? "active" : ""}`}
              onClick={() => handleFilterChange("none")}
            >
              彩色 (標準 RGB)
            </button>
            <button 
              className={`panel-btn ${filter === "4bit" ? "active" : ""}`}
              onClick={() => handleFilterChange("4bit")}
            >
              4-Bit 灰阶 (Onyx)
            </button>
            <button 
              className={`panel-btn ${filter === "1bit" ? "active" : ""}`}
              onClick={() => handleFilterChange("1bit")}
            >
              1-Bit 黑白 (Kindle)
            </button>
          </div>
        </div>

        {/* 残影模拟器 */}
        <div className="control-section">
          <div className="control-label">👻 物理墨屑残影 (Ghosting)</div>
          <div className="btn-group">
            <button 
              className={`panel-btn ${ghostingEnabled ? "active" : ""}`}
              onClick={() => setGhostingEnabled(true)}
            >
              开启残影
            </button>
            <button 
              className={`panel-btn ${!ghostingEnabled ? "active" : ""}`}
              onClick={() => setGhostingEnabled(false)}
            >
              关闭
            </button>
          </div>
        </div>

        {/* 刷新延迟仿真 */}
        <div className="control-section">
          <div className="control-label">⏳ 刷新模式 (物理延迟仿真)</div>
          <div className="btn-group">
            <button 
              className={`panel-btn ${refreshMode === "instant" ? "active" : ""}`}
              onClick={() => setRefreshMode("instant")}
            >
              0ms (极速局刷)
            </button>
            <button 
              className={`panel-btn ${refreshMode === "slow" ? "active" : ""}`}
              onClick={() => setRefreshMode("slow")}
            >
              350ms (物理全刷)
            </button>
          </div>
        </div>

        {/* Android CSS Tokens 导出 */}
        <div className="control-section export-section">
          <div className="control-label">📦 Android 原生复用 JSON 规约</div>
          <textarea 
            value={JSON.stringify(designTokens, null, 2)} 
            readOnly
          ></textarea>
          <button 
            className="btn-eink-copy" 
            onClick={handleCopyJson}
          >
            {copied ? "✓ 已复制到剪贴板！" : "复制设计规范 JSON"}
          </button>
        </div>

      </aside>

    </div>
  );
}
