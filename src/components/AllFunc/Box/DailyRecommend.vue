<template>
  <div class="daily-recommend" @click="openVideo">
    <Transition name="fade" mode="out-in">
      <div v-if="loading" class="loading-box">
        <div class="spinner"></div>
        <span>获取全网热门推荐中...</span>
      </div>
      <div v-else-if="videoData" class="video-card">
        <img :src="videoData.pic" class="cover" referrerpolicy="no-referrer" alt="cover" />
        <div class="mask"></div>
        <div class="info">
          <div class="title" :title="videoData.title">{{ videoData.title }}</div>
          <div class="meta">
            <span class="author">UP主: {{ videoData.author }}</span>
            <span class="play-btn">去 B 站观看 ➔</span>
          </div>
        </div>
      </div>
      <div v-else class="error-box">
        <span>获取推荐失败，请稍后再试</span>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const loading = ref(true);
const videoData = ref(null);

// 获取 B 站热门推荐数据
const fetchDailyVideo = async () => {
  try {
    loading.value = true;
    
    // 替换为 B 站官方的“综合热门视频”接口，无需任何个人偏好关键词
    const apiUrl = `https://api.bilibili.com/x/web-interface/popular?ps=20&pn=1`;
    
    // 使用全量开源的 CORS 代理，绕过浏览器的跨域拦截
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(apiUrl)}`;

    const response = await fetch(proxyUrl);
    const res = await response.json();

    // 校验数据格式 (热门接口返回的是 res.data.list)
    if (res?.data?.list?.length > 0) {
      const videos = res.data.list;
      
      // 取模算法：利用当前日期 (1-31) 对结果长度取余，每天轮换热榜上的不同视频
      const day = new Date().getDate();
      const targetVideo = videos[day % videos.length];

      videoData.value = {
        title: targetVideo.title,
        // 补全协议头
        pic: targetVideo.pic.startsWith('http') ? targetVideo.pic : `https:${targetVideo.pic}`,
        // 热门接口的作者信息层级在 owner.name
        author: targetVideo.owner.name, 
        bvid: targetVideo.bvid
      };
    }
  } catch (error) {
    console.error("获取每日推荐发生错误:", error);
  } finally {
    loading.value = false;
  }
};

// 点击跳转
const openVideo = () => {
  if (videoData.value?.bvid) {
    window.open(`https://www.bilibili.com/video/${videoData.value.bvid}`, "_blank");
  }
};

// 组件挂载时触发请求
onMounted(() => {
  fetchDailyVideo();
});
</script>

<style lang="scss" scoped>
.daily-recommend {
  width: 100%;
  height: 100%;
  min-height: 160px;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  background-color: var(--main-background-light-color);
  backdrop-filter: blur(10px);
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    .video-card .cover {
      transform: scale(1.05); // 悬浮时图片轻微放大
    }
  }

  .loading-box, .error-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 160px;
    color: var(--main-text-color);
    font-size: 14px;
    opacity: 0.8;
    
    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid var(--main-text-color);
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 12px;
    }
  }

  .video-card {
    position: relative;
    width: 100%;
    height: 160px;
    overflow: hidden;

    .cover {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }

    // 底部暗色渐变遮罩，确保文字不被图片颜色干扰
    .mask {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 60%;
      background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%);
    }

    .info {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      padding: 12px;
      box-sizing: border-box;
      color: #fff;
      display: flex;
      flex-direction: column;
      gap: 6px;

      .title {
        font-size: 14px;
        font-weight: bold;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
        text-shadow: 0 1px 2px rgba(0,0,0,0.5);
      }

      .meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        opacity: 0.9;
        
        .play-btn {
          background: rgba(255,255,255,0.25);
          padding: 4px 10px;
          border-radius: 12px;
          backdrop-filter: blur(4px);
        }
      }
    }
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
}
</style>
