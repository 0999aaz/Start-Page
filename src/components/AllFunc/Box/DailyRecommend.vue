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
              :src="`https://wsrv.nl/?url=image.tmdb.org/t/p/w500${item.poster_path}`" 
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

// 控制显示数量，展示 8 个刚刚好排成两行或一行
const displayMovies = computed(() => movies.value.slice(0, 8));

// 获取影视数据
const fetchMovies = async () => {
  loading.value = true;
  try {
    // 填入你刚才申请的 API Key
    const apiKey = "ad4a13d21e40800292ac5df94c4f4d91"; 

    if (apiKey !== "YOUR_TMDB_API_KEY") {
      // 目标 API 地址
      const targetUrl = `https://api.themoviedb.org/3/trending/all/day?api_key=${apiKey}&language=zh-CN`;
      
      // 核心修复：使用 AllOrigins 代理请求，绕过国内对 TMDB API 的网络屏蔽
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
      
      const response = await fetch(proxyUrl);
      const data = await response.json();
      
      if (data.results) {
        movies.value = data.results;
        loading.value = false;
        return; // 成功获取则直接退出函数
      }
    }
    
    throw new Error("未配置 API Key 或请求失败");

  } catch (error) {
    console.log("提示：API 请求失败或未配置，使用默认精选影视数据。");
    // 兜底精选数据
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

// 点击卡片：带上电影名字跳转到豆瓣搜索页面
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
  padding: 16px; 
  box-sizing: border-box;
  background-color: var(--main-background-light-color);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  overflow-y: auto; 

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

  .movie-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
    gap: 16px 12px; 
    justify-items: center;
  }

  .movie-card {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
    cursor: pointer;
    transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

    &:hover {
      transform: translateY(-5px); 
      
      .poster-box {
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3); 
        .poster {
          transform: scale(1.05); 
        }
      }
      .title {
        color: #ffac2d; 
      }
    }

    .poster-box {
      position: relative;
      width: 100%;
      aspect-ratio: 2 / 3; 
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
        color: #ffac2d; 
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
