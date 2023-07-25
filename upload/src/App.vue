<template>
  <div>
    <input type="file" @change="handleFileChange">
    <button @click="handleUpload">上传</button>
  </div>
</template>

<script setup lang="ts">
// 切片大小
// the chunk size 10MB
// const SIZE = 10 * 1024 * 1024;  // 1kb = 1024 字节

const SIZE = 100 * 1024
import { reactive, ref } from 'vue';
import request from './utils/request'

const container = reactive({
  file: null
})
// 用于保存处理好的chunk切片数组
const data = ref([])

// 文件变更
const handleFileChange = (e: any) => {
  // e.target.files[0]
  const [file] = e.target.files
  if (!file) return;
  container.file = file
}

// 生成文件切片
function createFileChunk(file: any, size = SIZE) {
  const fileChunkList = [];
  let cur = 0;
  // file.size 是字节数
  while (cur < file.size) {
    fileChunkList.push({
      file: file.slice(cur, cur + size)
    });
    cur += size;
  }
  return fileChunkList;
}

// 上传切片
async function uploadChunks() {
  const requestList = data.value
    .map(({ chunk, hash }) => {
      const formData = new FormData();
      formData.append("chunk", chunk);
      formData.append("hash", hash);
      formData.append("filename", container.file.name);
      // FormData对象有一个特点，将文件信息添加进去后，直接打印不能看到文件信息，需要使用for of遍历才能看到
      return {
        formData
      }
    })
    .map(({ formData }) =>
      request({
        url: "http://localhost:3000",
        data: formData
      })
    )
  // 并发请求
  await Promise.all(requestList)
  // 合并切片
  // await mergeRequest();
}

// 合并切片
// const mergeRequest = async () => {
//   await request({
//     url: "http://localhost:3000/merge",
//     headers: {
//       "content-type": "application/json"
//     },
//     data: JSON.stringify({
//       filename: container.file.name
//     })
//   })
// }

// 上传


const handleUpload = async () => {
  if (!container.file) return;
  const fileChunkList = createFileChunk(container.file);
  data.value = fileChunkList.map(({ file }, index) => ({
    chunk: file,
    // 文件名 + 数组下标
    hash: container.file.name + "-" + index
  }));
  await uploadChunks();
}

</script>

<style scoped></style>