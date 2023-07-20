<template>
  <div class="scroll-container" :style="{ overflow: 'auto', height: `${viewPortHeight}px` /*列表视口高度（值自定义即可）*/ }"
    ref="scrollContainer" @scroll="handleScroll">
    <div class="content-container" :style="{ height: `${itemHeight * dataSource.length}px`, position: 'relative' }">
      <div class="content-item" v-for="(data, index) in renderDataList" :key="index"
        :style="{ position: 'absolute', left: 0, top: 0, transform: `translateY(${(startIndex + index) * itemHeight}px)`, width: `100%` }">
        {{ data.text }} -- {{ data.id }} -- {{ index }}
      </div>
    </div>
  </div>

  {{ startIndex }}
</template>

<script setup lang="ts">

import { dataSource } from '@/shared/dataConstant';
import { ref, watch } from 'vue';
const viewPortHeight = 500; // 滚动列表的可视高度
const itemHeight = 50; // 一个列表项的高度
const startIndex = ref(0);
const endIndex = ref(0);
const scrollContainer = ref<HTMLElement | null>(null);

function throttle(fn: Function, delay = 30) {
  let lastTime = 0
  return function () {
    let args = arguments
    let context = this
    let nowTime = Date.now()
    if (nowTime - lastTime >= delay) {
      fn.apply(context, args)
      lastTime = nowTime
    }
  }
}

const handleScroll = throttle(() => {
  if (!scrollContainer.value) return
  const scrollTop = scrollContainer.value.scrollTop;
  startIndex.value = Math.floor(scrollTop / itemHeight);
  endIndex.value = Math.ceil((scrollTop + viewPortHeight) / itemHeight) - 1;
  // console.log(startIndex.value, endIndex.value);
})

const renderDataList = ref(dataSource.slice(startIndex.value, endIndex.value + 1))
watch([startIndex, endIndex], () => {
  renderDataList.value = dataSource.slice(startIndex.value, endIndex.value + 1)
  // console.log(renderDataList.value)
})
</script>

<style scoped lang="less">
.scroll-container {
  border: 2px solid red;
  width: 300px;

  .content-container {
    .content-item {
      height: 50px;
      background-image: linear-gradient(0deg, pink, blue);
    }
  }
}
</style>