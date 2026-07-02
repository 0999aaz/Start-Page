import { defineStore } from "pinia";

const useSetDataStore = defineStore("setData", {
  state: () => {
    return {
      // 主题类别：light 浅色 / dark 深色 / custom 自定义
      themeType: "light",
      // 新增：深度自定义主题的颜色配置（保存Hex颜色和不透明度，方便UI组件回显）
      customThemeColors: {
        textColor: "#333333",
        textHoverColor: "#2563eb",
        bgHex: "#ffffff",
        bgOpacity: 0.7,
        bgLightHex: "#ffffff",
        bgLightOpacity: 0.9,
        inputHoverHex: "#f5f5f5",
        inputHoverOpacity: 0.8,
      },
      // 壁纸类别
      // 0 本地 / 1 必应 / 2 随机风景 / 3 随机动漫 / 4 自定义URL / 5 本地上传
      backgroundType: 2,
      backgroundCustom: "",
      uploadedBackground: "", 
      // 壁纸遮罩与模糊
      showBackgroundGray: true,
      backgroundBlur: 0,
      // 搜索引擎
      searchEngine: "bing",
      lastSearchEngine: "bing",
      customEngineUrl: "",
      // 搜索框收起与清空
      smallInput: false,
      showCleanInput: true,
      autoFocus: false,
      autoInputBlur: true,
      // 时间与天气
      timeStyle: "one",
      showLunar: false,
      showSeconds: false,
      showZeroTime: true,
      use12HourFormat: false,
      showWeather: true,
      showSuggestions: true,
      urlJumpType: "open",
      // 搜索历史记录
      searchHistory: [],
    };
  },
  actions: {
    // 核心方法：将当前主题配置实时应用到全局 CSS 变量
    applyTheme() {
      const root = document.documentElement;
      
      // 辅助函数：将 Hex 和不透明度转换为 rgba 格式
      const hexToRgba = (hex, opacity) => {
        let c;
        if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
          c = hex.substring(1).split("");
          if (c.length === 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
          }
          c = "0x" + c.join("");
          return `rgba(${[(c >> 16) & 255, (c >> 8) & 255, c & 255].join(",")},${opacity})`;
        }
        return hex;
      };

      if (this.themeType === "light") {
        root.style.setProperty("--main-text-color", "#333333");
        root.style.setProperty("--main-text-hover-color", "#2563eb");
        root.style.setProperty("--main-background-color", "rgba(255, 255, 255, 0.7)");
        root.style.setProperty("--main-background-light-color", "rgba(255, 255, 255, 0.9)");
        root.style.setProperty("--main-input-hover-color", "rgba(245, 245, 245, 0.8)");
      } else if (this.themeType === "dark") {
        root.style.setProperty("--main-text-color", "#ffffff");
        root.style.setProperty("--main-text-hover-color", "#60a5fa");
        root.style.setProperty("--main-background-color", "rgba(30, 41, 59, 0.5)");
        root.style.setProperty("--main-background-light-color", "rgba(30, 41, 59, 0.8)");
        root.style.setProperty("--main-input-hover-color", "rgba(15, 23, 42, 0.6)");
      } else if (this.themeType === "custom") {
        const colors = this.customThemeColors;
        root.style.setProperty("--main-text-color", colors.textColor);
        root.style.setProperty("--main-text-hover-color", colors.textHoverColor);
        root.style.setProperty("--main-background-color", hexToRgba(colors.bgHex, colors.bgOpacity));
        root.style.setProperty("--main-background-light-color", hexToRgba(colors.bgLightHex, colors.bgLightOpacity));
        root.style.setProperty("--main-input-hover-color", hexToRgba(colors.inputHoverHex, colors.inputHoverOpacity));
      }
      
      // 同步处理全局壁纸模糊度变量
      root.style.setProperty("--background-blur", `${this.backgroundBlur}px`);
    },

    // 切换主题模式
    setThemeType(type) {
      this.themeType = type;
      this.applyTheme();
    },

    // 更新自定义颜色数据
    updateCustomColors(newColors) {
      this.customThemeColors = { ...this.customThemeColors, ...newColors };
      if (this.themeType === "custom") {
        this.applyTheme();
      }
    },

    setSearchEngine(value, custom = false) {
      if (this.searchEngine !== "custom") {
        this.lastSearchEngine = this.searchEngine;
      }
      if (custom) {
        this.customEngineUrl = value;
        this.searchEngine = "custom";
        return;
      }
      this.searchEngine = value;
    },

    addSearchHistory(keyword) {
      if (!keyword) return;
      this.searchHistory = this.searchHistory.filter((item) => item !== keyword);
      this.searchHistory.unshift(keyword);
      if (this.searchHistory.length > 10) {
        this.searchHistory.pop();
      }
    },

    clearSearchHistory() {
      this.searchHistory = [];
    },

    recoverSiteData(data) {
      let isSuccess = false;
      try {
        for (const key in data) {
          if (Object.hasOwnProperty.call(data, key)) {
            this[key] = data[key];
          }
        }
        // 恢复数据后自动重新应用当前主题
        this.applyTheme();
        isSuccess = true;
      } catch (error) {
        console.error("站点数据恢复时处理失败：", error);
        isSuccess = false;
      }
      return isSuccess;
    },
  },
  persist: {
    key: "setData",
    storage: window.localStorage,
  },
});

export default useSetDataStore;
