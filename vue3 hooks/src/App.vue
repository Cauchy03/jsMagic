<template>
  <button @click="useFullScreen">全屏</button>

  <div ref="qrCode" class="qrcode-img"></div>
  <div style="height: 10000px;"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, nextTick, onBeforeUnmount } from 'vue';
import useQRCode from '../src/hooks/useQRCode'
import useFullScreen from '../src/hooks/useFullScreen'
let qrCode = ref<any>(null)

import useWatermark from "./hooks/useWatermark";
const { setWatermark, clear } = useWatermark();

onMounted(() => {
  nextTick(() => {
    setWatermark('qwe');
  });
});

onBeforeUnmount(() => {
  clear();
});


onMounted(() => {
  useQRCode(qrCode.value)
})
</script>
