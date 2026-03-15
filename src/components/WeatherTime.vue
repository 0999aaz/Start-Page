<template>
  <div
    :class="[
      'weather-time',
      status.siteStatus,
      status.mainBoxBig && status.siteStatus !== 'normal' && status.siteStatus !== 'focus'
        ? 'hidden'
        : null,
      set.showLunar ? 'lunar' : null,
      set.timeStyle,
    ]"
    @click.stop
  >
    <div
      class="time"
      @click.stop="
        status.setSiteStatus(
          status.siteStatus !== 'normal' && status.siteStatus !== 'focus' ? 'normal' : 'box',
        )
      "
    >
      <span class="hour">{{ timeData.hour ?? "00" }}</span>
      <span class="separator" :key="set.showSeconds">:</span>
      <span class="minute">{{ timeData.minute ?? "00" }}</span>
      <Transition name="fade" mode="out-in">
        <span v-if="set.showSeconds" class="second">
          <span class="separator">:</span>
          <span class="second-num">{{ timeData.second ?? "00" }}</span>
        </span>
      </Transition>
      <template v-if="set.use12HourFormat">
        <span class="amPm">{{ timeData.amPm ?? "am" }}</span>
      </template>
    </div>
    <div v-if="set.showLunar" class="lunar">
      <span class="year">{{ timeData.lunar?.GanZhiYear }}</span>
      <span class="text">{{ timeData.lunar?.text }}</span>
    </div>
    <div class="date">
      <span class="month">{{ timeData.month ?? "0" }}</span>
      <span class="day">{{ timeData.day ?? "0" }}</span>
      <span class="weekday">{{ timeData.weekday ?? "星期八" }}</span>
    </div>
    
    <div v-if="set.showWeather" class="weather">
      <span v-if="weatherData?.location" class="location">{{ weatherData.location }}</span>
      <span class="status">{{ weatherData?.condition ?? "N/A" }}</span>
      <span class="temperature">{{ weatherData?.temp ?? "N/A" }} ℃</span>
      <span class="wind">{{ weatherData?.windDir ?? "N/A" }}</span>
      <span v-if="weatherData?.windLevel" class="wind-level"> {{ weatherData.windLevel }} 级 </span>
    </div>
  </div>
</template>

<script setup>
import { getCurrentTime } from "@/utils/timeTools";
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import { statusStore, setStore } from "@/stores";
import { getAdcode, getWeather } from "@/api";

const set = setStore();
const status = statusStore();

// 时间数据
const timeData = ref({});
const timeInterval = ref(null);

// 天气数据
const weatherData = ref(null);
const weatherKey = import.meta.env.VITE_WEATHER_KEY;

// 更新时间
const updateTimeData = () => {
  timeData.value = getCurrentTime(set.showZeroTime, set.use12HourFormat);
};

// 获取天气与定位数据
const getWeatherData = async () => {
  if (!weatherKey) {
    return $message.warning("请配置天气 Key");
  }
  
  const currentTime = Date.now();
  let lastWeatherData = JSON.parse(localStorage.getItem("lastWeatherData")) || {
    data: {},
    lastFetchTime: 0,
  };

  // 检查缓存是否超过 5 分钟
  if (currentTime - lastWeatherData.lastFetchTime >= 5 * 60 * 1000) {
    try {
      // 1. 获取定位
      const adCodeResult = await getAdcode(weatherKey);
      if (adCodeResult.infocode !== "10000") throw new Error("定位失败");

      // 2. 获取天气
      const weatherResult = await getWeather(weatherKey, adCodeResult.adcode);
      if (weatherResult.infocode !== "10000") throw new Error("天气获取失败");

      const data = weatherResult.lives[0];
      
      // 解析地理位置名称（优先取城市，城市为空则取省份）
      const locationName = (adCodeResult.city && typeof adCodeResult.city === 'string') 
        ? adCodeResult.city 
        : adCodeResult.province;

      // 3. 组装数据
      weatherData.value = {
        location: locationName,
        condition: data.weather,
        temp: data.temperature,
        windDir: data.winddirection + "风",
        windLevel: data.windpower,
      };

      // 4. 存入缓存
      lastWeatherData = { data: weatherData.value, lastFetchTime: currentTime };
      localStorage.setItem("lastWeatherData", JSON.stringify(lastWeatherData));
    } catch (error) {
      console.error(error);
      $message.error("天气数据更新失败");
    }
  } else {
    // 从缓存读取
    weatherData.value = lastWeatherData.data;
  }
};

watch(
  () => [set.showZeroTime, set.use12HourFormat],
  () => {
    updateTimeData();
  },
);

onMounted(() => {
  updateTimeData();
  timeInterval.value = setInterval(updateTimeData, 1000);
  getWeatherData();
});

onBeforeUnmount(() => {
  clearInterval(timeInterval.value);
});
</script>

<style lang="scss" scoped>
.weather-time {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
  transform: translateY(-140px);
  color: var(--main-text-color);
  animation: fade-time-in 0.6s cubic-bezier(0.21, 0.78, 0.36, 1);
  transition: transform 0.3s, opacity 0.5s, margin-bottom 0.3s;
  z-index: 1;

  .time {
    cursor: pointer;
    font-size: 3rem;
    margin: 6px 0px;
    text-shadow: var(--main-text-shadow);
    transition: transform 0.3s;
    .separator {
      opacity: 0.8;
      font-size: 2.8rem;
      display: inline-block;
      margin: 0 5px;
      transform: translateY(-4px);
      animation: separator-breathe 0.7s infinite alternate;
    }
    .amPm {
      font-size: 1rem;
      opacity: 0.6;
      margin-left: 6px;
    }
    &:hover { transform: scale(1.08); }
    &:active { transform: scale(1); }
  }

  .date {
    font-size: 1.15rem;
    opacity: 0.8;
    margin: 4px 0px;
    text-shadow: var(--main-text-shadow);
    .month::after { content: "月"; margin: 0 4px; }
    .day::after { content: "日"; margin: 0 8px 0 4px; }
  }

  .lunar {
    font-size: 0.9rem;
    opacity: 0.6;
    text-shadow: var(--main-text-shadow);
    .year::after { content: "年"; margin-right: 4px; }
  }

  .weather {
    opacity: 0.7;
    font-size: 1rem;
    text-shadow: var(--main-text-shadow);
    display: flex;
    align-items: center;

    .location {
      margin-right: 8px;
      &::after {
        content: "•";
        margin-left: 8px;
        opacity: 0.5;
      }
    }

    .temperature { margin: 0 6px; }
    .wind-level { margin-left: 6px; }
  }

  // 状态位样式
  &.focus { transform: translateY(-180px); }
  &.box, &.set {
    transform: translateY(-34vh);
    @media (max-width: 478px) { transform: translateY(-32vh); }
  }
  &.hidden { transform: translateY(-180px); opacity: 0; }
  &.lunar { margin-bottom: 50px; }
}
</style>
