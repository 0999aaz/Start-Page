import axios from "@/utils/request";
import fetchJsonp from "fetch-jsonp";

/**
 * 获取天气
 * https://lbs.amap.com/api/webservice/guide/api/weatherinfo
 */
// 获取高德地理位置信息
export const getAdcode = async (key) => {
  return axios({
    method: "GET",
    url: "https://restapi.amap.com/v3/ip",
    params: { key },
  });
};

// 获取高德地理天气信息
export const getWeather = async (key, city) => {
  return axios({
    method: "GET",
    url: "https://restapi.amap.com/v3/weather/weatherInfo",
    params: { key, city, extensions: "base" },
  });
};

/**
 * 获取搜索建议
 * @param {String} keyWord - 搜索关键字
 * @param {String} engine - 当前搜索引擎
 */
export const getSearchSuggestions = async (keyWord, engine = "baidu") => {
  try {
    const encodedKeyword = encodeURIComponent(keyWord);
    
    // 谷歌搜索建议 (使用 YouTube client 支持 JSONP)
    if (engine === "google") {
      const response = await fetchJsonp(
        `https://suggestqueries.google.com/complete/search?client=youtube&q=${encodedKeyword}`,
        { jsonpCallback: "jsonp" }
      );
      const data = await response.json();
      return data[1] || [];
    } 
    
    // 必应搜索建议
    else if (engine === "bing") {
      const response = await fetchJsonp(
        `https://api.bing.com/qsonhs.aspx?type=cb&q=${encodedKeyword}`,
        { jsonpCallback: "cb" }
      );
      const data = await response.json();
      // 必应的数据层级较深，需要提取 Txt 字段
      return data.AS?.Results?.[0]?.Suggests?.map(item => item.Txt) || [];
    }
    
    // 默认：百度搜索建议 (包含 baidu 或 custom 自定义引擎)
    else {
      const response = await fetchJsonp(
        `https://suggestion.baidu.com/su?wd=${encodedKeyword}`,
        { jsonpCallback: "cb" }
      );
      const data = await response.json();
      return data.s || [];
    }
  } catch (error) {
    console.error("处理搜索建议发生错误：", error);
    return [];
  }
};
