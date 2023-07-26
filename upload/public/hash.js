// 引入脚本
self.importScripts('../src/utils/spark-md5.min.js')

// 生成文件hash
self.addEventListener('message', e => {
  console.log('message', e.data)
  const { fileChunkList } = e.data
  // 创建 SparkMD5 对象 指定输入数据类型ArrayBuffer(二进制缓存区，连续的内存区域)
  const spark = new self.SparkMD5.ArrayBuffer()
  let percent = 0
  let count = 0
  const loadNext = index => {
    // FileReader 用于异步读取文件内容，并将文件内容以文本或二进制数据的形式返回
    const reader = new FileReader()
    reader.readAsArrayBuffer(fileChunkList[index].file)
    reader.onload = e => {
      count++
      // spark.append() 添加数据
      // 这里的数据就是每一个二级制切片数据
      spark.append(e.target.result)
      // 如果count和fileChunkList长度相等 表示数据添加完成 直接计算hash返回给主线程
      if (count === fileChunkList.length) {
        self.postMessage({
          percent: 100,
          // spark.end() 计算hash值
          hash: spark.end()
        })
        self.close()
      } else {
        percent += 100 / fileChunkList.length
        self.postMessage({
          percent
        })
        // 递归计算
        loadNext(count)
      }
    }
  }
  loadNext(0)
})