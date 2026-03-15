<template>
  <div class="movie-recommend">
    <Transition name="fade" mode="out-in">
      <div v-if="loading" class="loading-box">
        <div class="spinner"></div>
        <span>获取热门影视中...</span>
      </div>
      
      <div v-else class="movie-grid">
        <div
          v-for="(item, index) in displayMovies"
          :key="index"
          class="movie-card"
          @click="toDouban(item.title || item.name)"
        >
          <div class="poster-box">
            <img 
              :src="`https://image.tmdb.org/t/p/w500${item.poster_path}`" 
              class="poster" 
              referrerpolicy="no-referrer" 
              alt="poster"
            />
            <div class="rating" v-if="item.vote_average > 0">
              ⭐️ {{ item.vote_average.toFixed(1) }}
            </div>
          </div>
          <div class="title" :title="item.title || item.name">
            {{ item.title || item.name }}
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";

const loading = ref(true);
const movies = ref([]);

// 控制显示数量，起始页空间有限，展示 8 个刚刚好排成两行或一行
const displayMovies = computed(() => movies.value.slice(0, 8));

// 获取影视数据
const fetchMovies = async () => {
  loading.value = true;
  try {
    // 【进阶指南】
    // 如果你想让它每天自动更新，请去 https://www.themoviedb.org/ 注册并申请一个免费的 API Key
    // 然后将下方的 "YOUR_TMDB_API_KEY" 替换成你申请到的字母数字串
    const apiKey = "ad4a13d21e40800292ac5df94c4f4d91"; 

    if (apiKey !== "ad4a13d21e40800292ac5df94c4f4d91") {
      // 如果你配置了 Key，就去拉取全球当天的热门电影和剧集
      const response = await fetch(`https://api.themoviedb.org/3/trending/all/day?api_key=${apiKey}&language=zh-CN`);
      const data = await response.json();
      if (data.results) {
        movies.value = data.results;
        loading.value = false;
        return; // 成功获取则直接退出函数
      }
    }
    // 如果没配置 Key，主动抛出错误，进入下方的 catch 备用数据块
    throw new Error("未配置 API Key");

  } catch (error) {
    console.log("提示：使用默认精选影视数据。若需每日自动更新，请配置 TMDB API Key。");
    // 🎨 兜底精选数据（使用了真实的 TMDB 海报路径，确保你立刻就能看到完美效果）
    movies.value = [
      { title: "沙丘2", poster_path: "/1pdfLvkbY9ohJlCjQH2JGjjcEsZ.jpg", vote_average: 8.3 },
      { title: "奥本海默", poster_path: "/rktDFPbfHfUbArZ6OOOKsXcv0Bm.jpg", vote_average: 8.6 },
      { title: "周处除三害", poster_path: "/7QjS9hJ4HDEYv3dC2H8sU2OamY.jpg", vote_average: 8.1 },
      { title: "繁花", poster_path: "/7x9cWwQ2A1x9LpP1X2BqQ7A2y5.jpg", vote_average: 8.5 },
      { title: "可怜的东西", poster_path: "/3kOENn7EEXgNqA4v0m50K8R5xJd.jpg", vote_average: 7.9 },
      { title: "三体(网飞版)", poster_path: "/aMrcHofxN3Xik0Ailz1wMvM9bZ.jpg", vote_average: 7.7 },
      { title: "坠落的审判", poster_path: "/2Qo1OQ5BqY1Z3kM8Z6H7B2z8Y3.jpg", vote_average: 8.5 },
      { title: "蜘蛛侠：纵横宇宙", poster_path: "/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg", vote_average: 8.9 }
    ];
  } finally {
    loading.value = false;
  }
};

// 点击卡片：直接带上电影名字跳转到豆瓣搜索页面
const toDouban = (keyword) => {
  if (keyword) {
    window.open(`https://search.douban.com/movie/subject_search?search_text=${encodeURIComponent(keyword)}`, "_blank");
  }
};

onMounted(() => {
  fetchMovies();
});
</script>

<style lang="scss" scoped>
.movie-recommend {
  width: 100%;
  height: 100%;
  padding: 16px; // 给四周留出呼吸感
  box-sizing: border-box;
  background-color: var(--main-background-light-color);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  overflow-y: auto; // 如果卡片较多允许纵向滑动

  /* 隐藏滚动条让视觉更干净 */
  &::-webkit-scrollbar {
    display: none;
  }

  .loading-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 160px;
    color: var(--main-text-color);
    font-size: 14px;
    
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

  /* 核心：CSS Grid 瀑布流布局 */
  .movie-grid {
    display: grid;
    // auto-fill 会根据父容器宽度自动计算能放下多少列，minmax(90px) 保证每张海报最小宽度
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
    gap: 16px 12px; // 上下间距 16px，左右间距 12px
    justify-items: center;
  }

  .movie-card {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
    cursor: pointer;
    
    // 悬浮时的整体上浮动画
    transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

    &:hover {
      transform: translateY(-5px); // 往上浮动
      
      .poster-box {
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3); // 悬浮阴影加深
        .poster {
          transform: scale(1.05); // 海报图片轻微放大
        }
      }
      .title {
        color: #ffac2d; // 悬浮时标题变成豆瓣橙色
      }
    }

    .poster-box {
      position: relative;
      width: 100%;
      aspect-ratio: 2 / 3; // 强制保持 2:3 的完美电影海报比例
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
      transition: box-shadow 0.3s ease;

      .poster {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.4s ease;
      }

      .rating {
        position: absolute;
        bottom: 6px;
        right: 6px;
        background: rgba(0, 0, 0, 0.75);
        color: #ffac2d; // 豆瓣特征色
        font-size: 12px;
        padding: 2px 6px;
        border-radius: 6px;
        backdrop-filter: blur(4px);
        font-weight: bold;
        letter-spacing: 0.5px;
      }
    }

    .title {
      font-size: 13px;
      color: var(--main-text-color);
      font-weight: 500;
      text-align: center;
      width: 100%;
      // 文字超出一行自动显示省略号
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: color 0.3s ease;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
}
</style>
