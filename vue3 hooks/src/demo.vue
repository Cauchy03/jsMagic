<template>
  <div>
    {{ value }}
    <button @click="change">点击</button>
  </div>
</template>

<script setup lang="ts">
defineProps(['value'])
let emit = defineEmits(['input'])
const change = () => {
  emit('input',123)
}
</script>

<style scoped></style>