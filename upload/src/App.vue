<template>
  <div>
    <input type="file" @change="handleFileChange">
    <button @click="handleUpload">上传</button>
    <button @click="stopUpload">暂停</button>
    <button @click="resumeUpload">恢复上传</button>
    <span style="margin-left: 5px;">上传总进度
      <a-progress type="circle" :stroke-color="{
        '0%': '#108ee9',
        '100%': '#87d068',
      }" :percent="totalProgress" />
    </span>

    <span style="margin-left: 5px;">生成hash进度
      <a-progress type="dashboard" :percent="hashPercentage" />
    </span>
    <div style="width: 500px; margin-top: 20px;">
      <a-progress size="small" v-for="(item, index) in data " :key="index" :percent="item.percent" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import request from './utils/request'
import { message } from 'ant-design-vue';

// 切片大小
// the chunk size 10MB
// const SIZE = 10 * 1024 * 1024;  // 1kb = 1024 字节
const SIZE = 30 * 1024 * 1024

interface Container {
  file: any,
  hash: any,
  worker: any
}

const container: Container = reactive({
  file: null,
  hash: "",
  worker: null
})
// 用于保存处理好的chunk切片数组
const data = ref([])
const requestList = ref<XMLHttpRequest[]>([])

const hashPercentage = ref<number>()

// 计算总的进度
let totalProgress = computed(() => {
  if (!container.file || !data.value.length) return 0
  let loaded = data.value.map(item => item.size * item.percent * 0.01).reduce((pre, cur) => pre + cur, 0)
  return Number((loaded / container.file.size).toFixed(2)) * 100
})

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
    })
    cur += size
  }
  return fileChunkList;
}

// 生成文件 hash（web-worker) 用于文件续传 
const calculateHash = (fileChunkList) => {
  return new Promise(resolve => {
    // 添加worker
    container.worker = new Worker('hash.js')
    container.worker.postMessage({ fileChunkList })
    container.worker.addEventListener('message', e => {
      console.log('message', e.data)
      const { percent, hash } = e.data
      hashPercentage.value = percent
      if (hash) {
        resolve(hash)
      }
    })
  })
}

// 上传切片,同时过滤服务器已有切片
async function uploadChunks(uploadedList = []) {
  const chunkRequestList = data.value
    .filter(({ hash }) => !uploadedList.includes(hash)) // 过滤已上传的切片文件
    .map(({ chunk, hash, index, fileHash, fileName }) => {
      const formData = new FormData()
      formData.append("chunk", chunk)
      formData.append("hash", hash)
      formData.append("fileName", fileName)
      formData.append("fileHash", fileHash)
      // FormData对象有一个特点，将文件信息添加进去后，直接打印不能看到文件信息，需要使用for of遍历才能看到
      return {
        formData,
        index
      }
    })
    .map(({ formData, index }) =>
      request({
        url: "http://localhost:3000",
        data: formData,
        requestList: requestList.value,
        onProgress: e => {
          data.value[index].percent = Number((e.loaded / e.total * 100).toFixed(2))
        }
      })
    )
  // 并发请求
  await Promise.all(chunkRequestList)
  // 之前上传的切片数量 + 本次上传的切片数量 = 所有切片数量时合并切片
  if (uploadedList.length + chunkRequestList.length === data.value.length) {
    // 合并切片
    await mergeRequest()
  }
}

// 合并切片
const mergeRequest = async () => {
  await request({
    url: "http://localhost:3000/merge",
    headers: {
      "content-type": "application/json"
    },
    data: JSON.stringify({
      size: SIZE,
      fileName: container.file.name,
      fileHash: container.hash
    })
  })
}

const verifyUpload = async (fileName, fileHash) => {
  const { data }: any = await request({
    url: "http://localhost:3000/verify",
    headers: {
      "content-type": "application/json"
    },
    data: JSON.stringify({
      fileName,
      fileHash
    })
  })
  return JSON.parse(data)
}

// 上传
const handleUpload = async () => {
  if (!container.file) return
  const fileChunkList = createFileChunk(container.file)
  container.hash = await calculateHash(fileChunkList)
  console.log(container.hash)
  let { isUpload, uploadedList } = await verifyUpload(container.file.name, container.hash)
  if (isUpload) {
    message.info('文件已上传')
    return
  }
  data.value = fileChunkList.map(({ file }, index) => ({
    fileHash: container.hash, // 文件hash
    hash: container.hash + "-" + index, // hash + 数组下标
    fileName: container.file.name, // 文件名
    index, // 索引 
    chunk: file,
    size: file.size, // 每个切片文件大小
    percent: uploadedList.includes(container.hash + "-" + index) ? 100 : 0   // 记录每个切片上传进度, 如果已经上传过直接100
  }))
  await uploadChunks(uploadedList)
}

// 暂停上传
const stopUpload = () => {
  requestList.value.forEach(item => {
    item.abort()
  })
  requestList.value = []
}

// 恢复上传
const resumeUpload = async () => {
  const { uploadedList } = await verifyUpload(container.file.name, container.hash)
  data.value.forEach(item => {
    item.percent = uploadedList.includes(item.hash) ? 100 : 0
  })
  await uploadChunks(uploadedList)
}
</script>

<style scoped></style>