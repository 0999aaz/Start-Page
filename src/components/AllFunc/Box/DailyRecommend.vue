<template>
  <div class="movie-recommend">
    <Transition name="fade" mode="out-in">
      <div v-if="loading" class="loading-box">
        <div class="spinner"></div>
        <span>正在突破网络封锁获取数据...</span>
      </div>

      <div v-else class="content-box">
        
        <div class="section">
          <div class="section-header">
            <span class="icon">🔥</span>
            <span class="title">热门电影</span>
          </div>
          <div class="movie-grid">
            <div
              v-for="(item, index) in movies"
              :key="'m'+index"
              class="movie-card"
              @mouseenter="checkHoverPosition"
              @click="toDouban(item.title || item.name)"
            >
              <div class="poster-box">
                <img 
                  :src="`https://i0.wp.com/image.tmdb.org/t/p/w500${item.poster_path}`" 
                  class="poster" 
                  referrerpolicy="no-referrer" 
                  alt="poster"
                />
                <div class="rating" v-if="item.vote_average > 0">
                  ⭐️ {{ item.vote_average.toFixed(1) }}
                </div>
              </div>
              <div class="card-title" :title="item.title || item.name">
                {{ item.title || item.name }}
              </div>

              <div class="info-box">
                <div class="info-title">{{ item.title || item.name }}</div>
                <div class="info-date">{{ item.release_date || item.first_air_date || '未知时间' }}</div>
                <div class="info-overview">
                  {{ item.overview || '暂无中文剧情简介。' }}
                </div>
                <div class="info-hint">点击去豆瓣搜索 ➔</div>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-header">
            <span class="icon">📺</span>
            <span class="title">热门剧集</span>
          </div>
          <div class="movie-grid">
            <div
              v-for="(item, index) in tvShows"
              :key="'t'+index"
              class="movie-card"
              @mouseenter="checkHoverPosition"
              @click="toDouban(item.title || item.name)"
            >
              <div class="poster-box">
                <img 
                  :src="`https://i0.wp.com/image.tmdb.org/t/p/w500${item.poster_path}`" 
                  class="poster" 
                  referrerpolicy="no-referrer" 
                  alt="poster"
                />
                <div class="rating" v-if="item.vote_average > 0">
                  ⭐️ {{ item.vote_average.toFixed(1) }}
                </div>
              </div>
              <div class="card-title" :title="item.title || item.name">
                {{ item.title || item.name }}
              </div>

              <div class="info-box">
                <div class="info-title">{{ item.title || item.name }}</div>
                <div class="info-date">{{ item.release_date || item.first_air_date || '未知时间' }}</div>
                <div class="info-overview">
                  {{ item.overview || '暂无中文剧情简介。' }}
                </div>
                <div class="info-hint">点击去豆瓣搜索 ➔</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const loading = ref(true);
const movies = ref([]);
const tvShows = ref([]);

// 智能判断悬浮框弹出方向 (修复版)
const checkHoverPosition = (e) => {
  const card = e.currentTarget;
  const rect = card.getBoundingClientRect();
  
  // 核心修复：获取当前整个推荐模块容器的实际边界，而不是全屏幕边界
  const container = card.closest('.movie-recommend');
  const containerRect = container.getBoundingClientRect();
  
  const infoBoxWidth = 260; // 悬浮框宽度 + 预留间距
  
  // 判断：如果卡片右边缘到【容器右边缘】的距离，不够放下悬浮框，就向左弹出
  if (containerRect.right - rect.right < infoBoxWidth) {
    card.classList.add('pop-left');
  } else {
    card.classList.remove('pop-left');
  }
};

const fetchWithProxy = async (targetUrl) => {
  const encodedUrl = encodeURIComponent(targetUrl);
  const proxies = [
    `https://api.allorigins.win/raw?url=${encodedUrl}`,
    `https://corsproxy.io/?${encodedUrl}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodedUrl}`
  ];

  for (let proxy of proxies) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      
      const response = await fetch(proxy, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data && data.results && data.results.length > 0) {
          return data; 
        }
      }
    } catch (error) {
      console.warn(`代理节点超时，切换下一个...`);
    }
  }
  throw new Error("所有公共代理均失败");
};

const fetchMovies = async () => {
  loading.value = true;
  try {
    // 💡 这里填入你申请的真实 32 位 API Key
    const apiKey = "ad4a13d21e40800292ac5df94c4f4d91"; 

    if (apiKey !== "YOUR_TMDB_API_KEY") {
      const movieUrl = `https://api.themoviedb.org/3/trending/movie/day?api_key=${apiKey}&language=zh-CN`;
      const tvUrl = `https://api.themoviedb.org/3/trending/tv/day?api_key=${apiKey}&language=zh-CN`;
      
      const [movieData, tvData] = await Promise.all([
        fetchWithProxy(movieUrl),
        fetchWithProxy(tvUrl)
      ]);
      
      if (movieData.results && tvData.results) {
        movies.value = movieData.results.slice(0, 12);
        tvShows.value = tvData.results.slice(0, 12);
        loading.value = false;
        return; 
      }
    }
    throw new Error("未配置 API Key");

  } catch (error) {
    movies.value = [
      { title: "沙丘2", release_date: "2024-02-27", vote_average: 8.3, poster_path: "/1pdfLvkbY9ohJlCjQH2JGjjcEsZ.jpg", overview: "保罗·厄崔迪与契妮和弗雷曼人会合，展开了一场复仇之旅..." },
      { title: "奥本海默", release_date: "2023-07-19", vote_average: 8.6, poster_path: "/rktDFPbfHfUbArZ6OOOKsXcv0Bm.jpg", overview: "讲述了美国“原子弹之父”罗伯特·奥本海默主导制造出世界上第一颗原子弹的故事。" },
      { title: "周处除三害", release_date: "2023-10-06", vote_average: 8.1, poster_path: "/7QjS9hJ4HDEYv3dC2H8sU2OamY.jpg", overview: "通缉犯陈桂林发现自己仅剩半年寿命，决定在死前除掉排在自己前面的两大通缉犯。" },
      { title: "可怜的东西", release_date: "2023-12-07", vote_average: 7.9, poster_path: "/3kOENn7EEXgNqA4v0m50K8R5xJd.jpg", overview: "贝拉·巴斯特是一个被不合常规的科学家救活的年轻女子，她踏上了一场奇幻的冒险。" },
      { title: "坠落的审判", release_date: "2023-08-23", vote_average: 8.5, poster_path: "/2Qo1OQ5BqY1Z3kM8Z6H7B2z8Y3.jpg", overview: "一名作家试图证明自己并非杀害丈夫的凶手，法庭对这段婚姻进行了深度剖析。" },
      { title: "蜘蛛侠：纵横宇宙", release_date: "2023-05-31", vote_average: 8.9, poster_path: "/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg", overview: "迈尔斯·莫拉莱斯穿梭于多元宇宙，遭遇了一支负责保护多重宇宙存在的蜘蛛侠精英小队。" }
    ];
    tvShows.value = [
      { name: "幕府将军", first_air_date: "2024-02-27", vote_average: 8.7, poster_path: "/sBqCj8e0QhA2jK9xQ7qI56K8S2R.jpg", overview: "1600年的日本，两位野心勃勃的男人在权力斗争中走向命运交汇点。" },
      { name: "三体 (网飞版)", first_air_date: "2024-03-21", vote_average: 7.7, poster_path: "/aMrcHofxN3Xik0Ailz1wMvM9bZ.jpg", overview: "人类与一个即将毁灭的外星文明建立联系，并面临着被入侵的危机。" },
      { name: "繁花", first_air_date: "2023-12-27", vote_average: 8.5, poster_path: "/7x9cWwQ2A1x9LpP1X2BqQ7A2y5.jpg", overview: "九十年代的上海处处是机遇与希望。青年阿宝凭借改革开放的春风闯出了一片天。" },
      { name: "辐射", first_air_date: "2024-04-10", vote_average: 8.5, poster_path: "/6hL2T1gY189I1dJ4Z5J3b4M6e7n.jpg", overview: "核战爆发200年后，一个从小在避难所长大的女孩被迫回到地表废土世界。" },
      { name: "绝命毒师", first_air_date: "2008-01-20", vote_average: 9.6, poster_path: "/30erzlzIOtOK3k3T3BAl1GiVMP1.jpg", overview: "一位高中化学老师确诊绝症后，为了给家人留下财产，走上了制造冰毒的道路。" },
      { name: "怪奇物语", first_air_date: "2016-07-15", vote_average: 8.6, poster_path: "/49WJfeN0moxb9IPfGn8TJqDfIj.jpg", overview: "印第安纳州一个小镇上，一个男孩神秘失踪，他的朋友和家人在寻找他的过程中卷入超自然事件。" }
    ];
  } finally {
    loading.value = false;
  }
};

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
  padding: 16px 20px; 
  box-sizing: border-box;
  background-color: var(--main-background-light-color);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  overflow-y: auto; 
  overflow-x: hidden; 

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
  }

  .loading-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
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

  .content-box {
    display: flex;
    flex-direction: column;
    gap: 32px; 
  }

  .section {
    .section-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      
      .icon { font-size: 18px; }
      .title {
        font-size: 16px;
        font-weight: bold;
        color: var(--main-text-color);
        letter-spacing: 1px;
      }
    }
  }

  .movie-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
    gap: 20px 14px; 
    justify-items: center;
  }

  .movie-card {
    position: relative; 
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
    cursor: pointer;
    transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    
    &:hover {
      transform: translateY(-5px); 
      z-index: 10; 
      
      .poster-box {
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4); 
        .poster { transform: scale(1.05); }
      }
      .card-title { color: #ffac2d; }
      .info-box {
        opacity: 1;
        visibility: visible;
        transform: translateY(0) scale(1);
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
      }
    }

    .card-title {
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

    .info-box {
      position: absolute;
      top: 0;
      left: calc(100% + 12px); 
      width: 240px;
      padding: 16px;
      box-sizing: border-box;
      background: rgba(30, 30, 30, 0.85); 
      backdrop-filter: blur(12px) saturate(150%);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
      z-index: 99; /* 提高层级，防止被遮挡 */
      
      opacity: 0;
      visibility: hidden;
      transform: translateY(10px) scale(0.95);
      transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      pointer-events: none; 

      display: flex;
      flex-direction: column;
      gap: 8px;
      color: #fff;
      text-align: left;

      .info-title {
        font-size: 16px;
        font-weight: bold;
        color: #ffac2d;
      }
      .info-date {
        font-size: 12px;
        color: #aaa;
        border-bottom: 1px solid rgba(255,255,255,0.1);
        padding-bottom: 8px;
        margin-bottom: 4px;
      }
      .info-overview {
        font-size: 13px;
        line-height: 1.6;
        color: #eee;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 7;
        overflow: hidden;
      }
      .info-hint {
        margin-top: auto;
        padding-top: 8px;
        font-size: 12px;
        color: #888;
        font-style: italic;
        text-align: right;
      }
    }

    /* 当触发 pop-left 时，悬浮框向左方弹出 */
    &.pop-left {
      .info-box {
        left: auto;
        right: calc(100% + 12px); 
      }
    }
  }
}
</style>
