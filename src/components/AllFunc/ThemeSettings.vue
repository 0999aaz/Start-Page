<template>
  <div class="theme-settings-panel">
    <div class="setting-item">
      <div class="setting-label">主题模式</div>
      <div class="setting-controls-radio">
        <label :class="{ active: set.themeType === 'light' }">
          <input type="radio" name="theme" value="light" :checked="set.themeType === 'light'" @change="set.setThemeType('light')" />
          浅色模式
        </label>
        <label :class="{ active: set.themeType === 'dark' }">
          <input type="radio" name="theme" value="dark" :checked="set.themeType === 'dark'" @change="set.setThemeType('dark')" />
          深色模式
        </label>
        <label :class="{ active: set.themeType === 'custom' }">
          <input type="radio" name="theme" value="custom" :checked="set.themeType === 'custom'" @change="set.setThemeType('custom')" />
          高级自定义
        </label>
      </div>
    </div>

    <Transition name="fade-slide">
      <div v-if="set.themeType === 'custom'" class="custom-color-picker-zone">
        
        <div class="picker-item">
          <span class="picker-label">常规文本颜色</span>
          <div class="picker-wrapper">
            <input type="color" :value="set.customThemeColors.textColor" @input="(e) => updateColor('textColor', e.target.value)" />
            <span class="value-text">{{ set.customThemeColors.textColor }}</span>
          </div>
        </div>

        <div class="picker-item">
          <span class="picker-label">高亮/悬浮文本颜色</span>
          <div class="picker-wrapper">
            <input type="color" :value="set.customThemeColors.textHoverColor" @input="(e) => updateColor('textHoverColor', e.target.value)" />
            <span class="value-text">{{ set.customThemeColors.textHoverColor }}</span>
          </div>
        </div>

        <div class="picker-item block">
          <div class="picker-label-group">
            <span>主体卡片背景与不透明度</span>
            <span class="value-text">{{ Math.round(set.customThemeColors.bgOpacity * 100) }}%</span>
          </div>
          <div class="slider-row">
            <input type="color" :value="set.customThemeColors.bgHex" @input="(e) => updateColor('bgHex', e.target.value)" />
            <input type="range" min="0" max="1" step="0.05" :value="set.customThemeColors.bgOpacity" @input="(e) => updateColor('bgOpacity', parseFloat(e.target.value))" />
          </div>
        </div>

        <div class="picker-item block">
          <div class="picker-label-group">
            <span>建议面板背景与不透明度</span>
            <span class="value-text">{{ Math.round(set.customThemeColors.bgLightOpacity * 100) }}%</span>
          </div>
          <div class="slider-row">
            <input type="color" :value="set.customThemeColors.bgLightHex" @input="(e) => updateColor('bgLightHex', e.target.value)" />
            <input type="range" min="0" max="1" step="0.05" :value="set.customThemeColors.bgLightOpacity" @input="(e) => updateColor('bgLightOpacity', parseFloat(e.target.value))" />
          </div>
        </div>

        <div class="picker-item block">
          <div class="picker-label-group">
            <span>输入框激活背景与不透明度</span>
            <span class="value-text">{{ Math.round(set.customThemeColors.inputHoverOpacity * 100) }}%</span>
          </div>
          <div class="slider-row">
            <input type="color" :value="set.customThemeColors.inputHoverHex" @input="(e) => updateColor('inputHoverHex', e.target.value)" />
            <input type="range" min="0" max="1" step="0.05" :value="set.customThemeColors.inputHoverOpacity" @input="(e) => updateColor('inputHoverOpacity', parseFloat(e.target.value))" />
          </div>
        </div>

      </div>
    </Transition>
  </div>
</template>

<script setup>
import { setStore } from "@/stores";

const set = setStore();

// 统一的分发修改方法
const updateColor = (key, value) => {
  set.updateCustomColors({ [key]: value });
};
</script>

<style lang="scss" scoped>
.theme-settings-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  color: var(--main-text-color);
  padding: 10px;

  .setting-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
    
    .setting-label {
      font-size: 14px;
      font-weight: bold;
      opacity: 0.8;
    }

    .setting-controls-radio {
      display: flex;
      gap: 12px;

      label {
        cursor: pointer;
        padding: 6px 14px;
        border-radius: 20px;
        font-size: 13px;
        border: 1px solid rgba(128, 128, 128, 0.2);
        background: rgba(255, 255, 255, 0.05);
        transition: all 0.25s ease;
        display: flex;
        align-items: center;

        input {
          display: none;
        }

        &:hover {
          border-color: var(--main-text-hover-color);
        }

        &.active {
          background: var(--main-text-hover-color);
          color: #fff !important; // 激活时文字高亮为纯白
          border-color: var(--main-text-hover-color);
        }
      }
    }
  }

  .custom-color-picker-zone {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 14px;
    border-radius: 12px;
    background: rgba(128, 128, 128, 0.05);
    border: 1px solid rgba(128, 128, 128, 0.1);

    .picker-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;

      .picker-label {
        opacity: 0.8;
      }

      .picker-wrapper {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      input[type="color"] {
        cursor: pointer;
        border: none;
        width: 32px;
        height: 24px;
        padding: 0;
        background: none;
        border-radius: 4px;
        outline: none;
        &::-webkit-color-swatch-wrapper { padding: 0; }
        &::-webkit-color-swatch { border: 1px solid rgba(128,128,128,0.3); border-radius: 4px; }
      }

      input[type="range"] {
        cursor: pointer;
        flex: 1;
        height: 6px;
        border-radius: 3px;
        outline: none;
        accent-color: var(--main-text-hover-color);
      }

      .value-text {
        font-family: monospace;
        font-size: 12px;
        opacity: 0.6;
      }

      // 块级样式（带滑块的行）
      &.block {
        flex-direction: column;
        align-items: stretch;
        gap: 6px;

        .picker-label-group {
          display: flex;
          justify-content: space-between;
          opacity: 0.8;
        }

        .slider-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
      }
    }
  }
}

// 展开/收起过渡动画
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
  max-height: 400px;
  opacity: 1;
  overflow: hidden;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  margin-top: 0 !important;
  border-width: 0 !important;
}
</style>
