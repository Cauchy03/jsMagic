import SparkMD5 from 'spark-md5'
import { ref } from 'vue'

interface Dealine {
  didTimeout: boolean // 表示任务执行是否超过约定时间
  timeRemaining(): DOMHighResTimeStamp // 任务可供执行的剩余时间
}

const hashPercentage = ref<number>()

// Two 生成文件hash (requestIdleCallback)
export const calculateHashIdle = async (fileChunkList) => {
  return new Promise(resolve => {
    const spark = new SparkMD5.ArrayBuffer()
    let count = 0
    // 根据文件内容追加计算
    const appendToSpark = async file => {
      return new Promise<void>(resolve => {
        const reader = new FileReader()
        reader.readAsArrayBuffer(file)
        reader.onload = e => {
          spark.append(e.target.result)
          resolve()
        }
      })
    }
    const workLoop = async (deadline: Dealine) => {
      // 有任务，并且当前帧还没结束
      while (count < fileChunkList.length && deadline.timeRemaining() > 1) {
        await appendToSpark(fileChunkList[count].file)
        count++
        // 没有了 计算完毕
        if (count < fileChunkList.length) {
          // 计算中
          hashPercentage.value = Number(
            ((100 * count) / fileChunkList.length).toFixed(2)
          )
          console.log(hashPercentage.value)
        } else {
          // 计算完毕
          hashPercentage.value = 100
          resolve(spark.end())
        }
      }
      window.requestIdleCallback(workLoop)
    }
    window.requestIdleCallback(workLoop)
  })
}