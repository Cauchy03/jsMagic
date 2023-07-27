import path from 'path'
import fse from 'fs-extra'
import multiparty from 'multiparty' // 使用 multiparty 处理前端传来的 formData
import http from 'http'

// 大文件存储目录
const UPLOAD_DIR = path.resolve(__dirname, "target")
// 提起后缀名
const extractExt = (fileName: string) => fileName.slice(fileName.lastIndexOf('.'), fileName.length)

// 将每一个切片写入文件流  这里的path是每一个切片路径
const pipeStream = (path: fse.PathLike, writeStream: any) => {
  return new Promise<void>(resolve => {
    // 创建一个可读的文件流，用于从指定的文件中读取数据
    // 读取切片数据
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
}

// 合并切片
const mergeFileChunk = async (filePath: fse.PathLike, fileHash: string, size: number) => {
  // 获取chunk 临时文件目录
  const chunkDir = path.resolve(UPLOAD_DIR, 'chunkDir-' + fileHash)
  // 用于读取一个目录中的文件列表，返回一个包含所有文件名的数组
  const chunkPaths = await fse.readdir(chunkDir)
  // 根据切片下标进行排序
  // 否则直接读取目录的获得的顺序会错乱
  chunkPaths.sort((a: any, b: any) => a.split("-")[1] - b.split("-")[1])
  // 将切片并发写入文件
  await Promise.all(
    chunkPaths.map((chunkPath, index) => {
      return pipeStream(
        path.resolve(chunkDir, chunkPath),
        // 根据 size 在指定位置创建可写流 filePath写入文件路径
        fse.createWriteStream(filePath, {
          start: index * size,
        })
      )
    })
  )
  // 合并后删除保存切片的目录
  fse.rmdirSync(chunkDir)
}

// 处理切片，存入服务器
export const handleFormData = (req: http.IncomingMessage, res: { end: (arg0: string) => void }) => {
  const multipart = new multiparty.Form()
  /** multipart.parse 解析详细信息
   * 
   * err 错误
   * fields 包含请求中所有非文件字段的对象
   * files 包含所有上传的文件的对象
   */
  multipart.parse(req, async (err, fields, files) => {
    if (err) {
      // @ts-ignore
      res.status = 500
      res.end("process file chunk failed")
      return;
    }
    // 获取文件需信息
    const [chunk] = files.chunk
    const [hash] = fields.hash
    const [fileName] = fields.fileName
    const [fileHash] = fields.fileHash

    // 获取每个切片索引
    let index = hash.split('-')[2]

    // // 创建临时文件夹用于临时存储 chunk
    // // 添加 chunkDir 前缀与文件名做区分
    const chunkDir = path.resolve(UPLOAD_DIR, 'chunkDir-' + fileHash)

    // fse.existsSync 判断一个文件或目录是否存在
    if (!fse.existsSync(chunkDir)) {
      // 创建指定路径的目录
      await fse.mkdirs(chunkDir)
    }

    // fs-extra 的 rename 方法 windows 平台会有权限问题
    // @see https://github.com/meteor/meteor/issues/7852#issuecomment-255767835
    // 将一个文件或目录移动到另一个位置
    await fse.move(chunk.path, `${chunkDir}/${fileHash + '-' + index}`)
    res.end("received file chunk")
  })
}

// 解析请求体
export const resolvePost = (req: http.IncomingMessage) =>
  new Promise(resolve => {
    let chunk = ""
    req.on("data", data => {
      chunk += data
    })
    req.on("end", () => {
      resolve(JSON.parse(chunk))
    })
  })

// 合并
export const handleMerge = async (req: http.IncomingMessage, res: { end: (arg0: string) => void }) => {
  const data: any = await resolvePost(req)
  const { fileName, size, fileHash } = data
  const ext = extractExt(fileName)
  // 创建目标文件地址
  const filePath = path.resolve(UPLOAD_DIR, `${fileHash}${ext}`)
  await mergeFileChunk(filePath, fileHash, size)
  res.end(
    JSON.stringify({
      code: 0,
      message: "file merged success"
    })
  )
}

// 验证是否已上传
export const handleVerfiy = async (req: http.IncomingMessage, res: { end: (arg0: string) => void }) => {
  const data: any = await resolvePost(req)
  const { fileName, fileHash } = data
  const ext = extractExt(fileName)
  const filePath = path.resolve(UPLOAD_DIR, `${fileHash}${ext}`)
  if (fse.existsSync(filePath)) {
    res.end(JSON.stringify({
      code: 0,
      isUpload: true,
      message: 'File has been uploaded'
    }))
  } else {
    res.end(JSON.stringify({
      code: 0,
      isUpload: false,
      message: 'allow upload'
    }))
  }
} 
