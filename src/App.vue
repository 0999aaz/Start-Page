<template>
  <Provider>
    <Cover @loadComplete="loadComplete" />
    <Transition name="fade" mode="out-in">
      <main
        v-if="status.imgLoadStatus"
        tabindex="0"
        id="main"
        :class="`main-${status.siteStatus}`"
        :style="{ pointerEvents: mainClickable ? 'auto' : 'none' }"
        @click="status.setSiteStatus('normal')"
        @contextmenu="mainContextmenu"
        @keydown="mainPressKeyboard"
      >
        <WeatherTime />
        <SearchInp @contextmenu.stop />
        <AllFunc @contextmenu.stop />
        <Footer />
        
        <Transition name="fade">
          <div
            class="top-left-menu"
            title="上传本地图片作为壁纸"
            v-show="status.siteStatus === 'normal' || status.siteStatus === 'focus'"
            @click.stop="triggerBgUpload"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            <input type="file" id="bg-upload-input" accept="image/*" style="display: none" @change="handleBgUpload" />
          </div>
        </Transition>

        <Transition name="fade">
          <div
            class="top-right-menu"
            title="打开捷径与便签"
            v-show="status.siteStatus === 'normal' || status.siteStatus === 'focus'"
            @click.stop="status.setSiteStatus('box')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="5" cy="12" r="2"></circle>
              <circle cx="12" cy="12" r="2"></circle>
              <circle cx="19" cy="12" r="2"></circle>
            </svg>
          </div>
        </Transition>

        <Transition name="fade">
          <div
            class="all-controls"
            v-show="status.siteStatus !== 'focus' && status.siteStatus !== 'normal'"
          >
            <div
              class="change-status"
              :title="status.mainBoxBig ? '收起' : '展开'"
              @click.stop="status.setMainBoxBig(!status.mainBoxBig)"
            >
              <Transition name="fade" mode="out-in">
                <SvgIcon
                  :iconName="`icon-${status.mainBoxBig ? 'packup' : 'unfold'}`"
                  :key="status.mainBoxBig ? 'packup' : 'unfold'"
                />
              </Transition>
            </div>
            <div
              class="change-status"
              :title="status.siteStatus !== 'set' ? '设置' : '首页'"
              @click.stop="status.setSiteStatus(status.siteStatus !== 'set' ? 'set' : 'normal')"
            >
              <Transition name="fade" mode="out-in">
                <SvgIcon
                  :iconName="`icon-${status.siteStatus !== 'set' ? 'setting' : 'home'}`"
                  :key="status.siteStatus !== 'set' ? 'setting' : 'home'"
                />
              </Transition>
            </div>
          </div>
        </Transition>
      </main>
      <div v-else id="loading">
        <img src="/icon/logo.png" alt="logo" class="logo" />
        <span class="tip">开发中</span>
      </div>
    </Transition>
  </Provider>
</template>

<script setup>
import { onMounted, nextTick, watch, ref } from "vue";
import { statusStore, setStore } from "@/stores";
import { getGreeting } from "@/utils/timeTools";
import Provider from "@/components/Provider.vue";
import Cover from "@/components/Cover.vue";
import WeatherTime from "@/components/WeatherTime.vue";
import SearchInp from "@/components/SearchInput/SearchInp.vue";
import AllFunc from "@/components/AllFunc/AllFunc.vue";
import Footer from "@/components/Footer.vue";

const set = setStore();
const status = statusStore();
const mainClickable = ref(false);

// 获取配置
const welcomeText = import.meta.env.VITE_WELCOME_TEXT ?? "欢迎访问本站";

// 鼠标右键
const mainContextmenu = (event) => {
  event.preventDefault();
  status.setSiteStatus("box");
};

// 加载完成事件
const loadComplete = () => {
  nextTick().then(() => {
    mainClickable.value = true;
    $message.info(getGreeting() + "，" + welcomeText, {
      showIcon: false,
      duration: 3000,
    });
  });
};

// 全局键盘事件
const mainPressKeyboard = (event) => {
  const keyCode = event.keyCode;
  // 回车
  if (keyCode === 13) {
    // focus 元素
    const mainInput = document.getElementById("main-input");
    status.setSiteStatus("focus");
    mainInput?.focus();
  }
};

// 根据主题类别更改 (做了兼容修改，支持 custom 属性映射)
const changeThemeType = (val) => {
  const htmlElement = document.querySelector("html");
  let themeType = "light";
  if (val === "dark") themeType = "dark";
  else if (val === "custom") themeType = "custom"; // 增加对自定义模式的属性标识
  
  htmlElement.setAttribute("theme", themeType);
};

// 触发本地图片上传
const triggerBgUpload = () => {
  document.getElementById("bg-upload-input").click();
};

// 处理图片上传并自动压缩
const handleBgUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      let width = img.width;
      let height = img.height;
      const MAX_WIDTH = 1920;
      const MAX_HEIGHT = 1080;
      
      // 等比例缩放压缩，防止存入缓存时超出最大限制
      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      // 转换为 base64
      const dataUrl = canvas.toDataURL("image/jpeg", 0.7);

      try {
        set.uploadedBackground = dataUrl;
        set.backgroundType = 5;
        window.$message.success("壁纸上传成功！如果想恢复，可以前往“设置”中修改。");
      } catch (err) {
        window.$message.error("图片数据过大保存失败，请尝试更小的图片！");
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
  event.target.value = ''; // 允许重复上传同一张图片
};

// 【新增核心修改】：监听主题状态变化，并应用全局 CSS 变量
watch(
  () => set.themeType,
  (val) => {
    changeThemeType(val);
    set.applyTheme(); // 将色彩配置写入全局变量
  },
);

// 【新增核心修改】：监听壁纸模糊度的变化，使滑块调节能实时映射到全局变量
watch(
  () => set.backgroundBlur,
  () => {
    set.applyTheme();
  }
);

onMounted(() => {
  changeThemeType(set.themeType);
  set.applyTheme(); // 页面加载时立即初始化应用 CSS 变量主题
});
</script>

<style lang="scss" scoped>
#main,
#loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  &.main-normal,
  &.main-focus {
    .main-box {
      opacity: 0;
      margin-top: 0;
      transform: scale(0.35);
      pointer-events: none;
    }
  }
  &.main-box,
  &.main-set {
    .main-box {
      opacity: 1;
      margin-top: 20vh;
      transform: scale(1);
      visibility: visible;
      @media (max-width: 478px) {
        margin-top: 22vh;
      }
    }
    .search-input {
      :deep(.all) {
        opacity: 0;
        width: 0;
        visibility: hidden;
      }
    }
  }
  .all-controls {
    position: fixed;
    width: 100%;
    top: 0;
    padding: 10px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
    .change-status {
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
      padding: 8px;
      border-radius: 8px;
      color: var(--main-text-color);
      z-index: 1;
      transition:
        opacity 0.3s,
        background-color 0.3s,
        transform 0.3s;
      &:hover {
        backdrop-filter: blur(20px);
        background-color: var(--main-background-light-color);
      }
      &:active {
        transform: scale(0.95);
      }
    }
  }

  /* 左上角图片上传菜单 */
  .top-left-menu {
    position: fixed;
    top: 20px;
    left: 20px;
    cursor: pointer;
    color: var(--main-text-color);
    opacity: 0.6;
    z-index: 99;
    transition: opacity 0.3s, background-color 0.3s, transform 0.3s;
    padding: 8px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
      opacity: 1;
      backdrop-filter: blur(20px);
      background-color: var(--main-background-light-color);
      transform: scale(1.05);
    }
    
    &:active {
      transform: scale(0.95);
    }
  }
  
  .top-right-menu {
    position: fixed;
    top: 20px;
    right: 20px;
    cursor: pointer;
    color: var(--main-text-color);
    opacity: 0.6;
    z-index: 99;
    transition: opacity 0.3s, background-color 0.3s, transform 0.3s;
    padding: 8px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
      opacity: 1;
      backdrop-filter: blur(20px);
      background-color: var(--main-background-light-color);
      transform: scale(1.05);
    }
    
    &:active {
      transform: scale(0.95);
    }
  }
}
#loading {
  color: var(--main-text-color);
  .logo {
    width: 100px;
    height: 100px;
    margin-bottom: 24px;
    animation: logo-breathe 3s infinite alternate;
  }
  .tip {
    font-size: 20px;
  }
}
</style>
