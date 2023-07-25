import http from 'http'
import path from 'path'

import fse from 'fs-extra'
import multiparty from 'multiparty' // 使用 multiparty 处理前端传来的 formData

const server = http.createServer()

// 大文件存储目录
const UPLOAD_DIR = path.resolve(__dirname, "target")

const resolvePost = (req: any) =>
  new Promise(resolve => {
    let chunk = ""
    req.on("data", (data: any) => {
      chunk += data
    })
    req.on("end", () => {
      resolve(JSON.parse(chunk))
    })
  })

// 写入文件流
const pipeStream = (path: fse.PathLike, writeStream: any) =>
  new Promise<void>(resolve => {
    // 创建一个可读的文件流，用于从指定的文件中读取数据
    const readStream = fse.createReadStream(path)
    // 当读取流文件结束时触发
    readStream.on("end", () => {
      // 用于删除指定的文件，需要确保文件已经关闭，否则会报错
      // 可以使用 fs.closeSync 方法来关闭文件，或者在文件读取流的 end 事件中进行文件删除操作
      fse.unlinkSync(path)
      resolve()
    })
    // 将数据流入到另一个可写流中
    readStream.pipe(writeStream)
  })




  

// 监听客户端请求
server.on("request", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Headers", "*")
  if (req.method === "OPTIONS") {
    // @ts-ignore
    res.status = 200
    res.end()
    return
  }

  const multipart = new multiparty.Form()
  /** multipart.parse 解析详细信息
   * 
   * err 错误
   * fields 包含请求中所有非文件字段的对象
   * files 包含所有上传的文件的对象
   */
  multipart.parse(req, async (err, fields, files) => {
    if (err) {
      return;
    }
    // 获取文件需信息
    const [chunk] = files.chunk
    const [hash] = fields.hash
    const [filename] = fields.filename
    // // 创建临时文件夹用于临时存储 chunk
    // // 添加 chunkDir 前缀与文件名做区分
    const chunkDir = path.resolve(UPLOAD_DIR, 'chunkDir-' + filename)

    // fse.existsSync 判断一个文件或目录是否存在
    if (!fse.existsSync(chunkDir)) {
      // 创建指定路径的目录
      await fse.mkdirs(chunkDir)
    }

    // fs-extra 的 rename 方法 windows 平台会有权限问题
    // @see https://github.com/meteor/meteor/issues/7852#issuecomment-255767835
    // 将一个文件或目录移动到另一个位置
    await fse.move(chunk.path, `${chunkDir}/${hash}`)
    res.end("received file chunk")
  })
})

server.listen(3000, () => console.log("listening port 3000"))