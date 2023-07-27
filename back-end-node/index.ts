import http from 'http'
import { handleFormData, handleMerge, handleVerfiy } from './controller'

const server = http.createServer()

// 监听客户端请求
server.on("request", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Headers", "*")
  if (req.method === "OPTIONS") {
    // @ts-ignore
    res.status = 200
    res.end()
    return
  }

  if (req.url === "/verify") {
    await handleVerfiy(req, res)
    return
  }

  if (req.url === "/") {
    handleFormData(req, res)
  }

  if (req.url === "/merge") {
    await handleMerge(req, res)
    return
  }

})

server.listen(3000, () => console.log("listening port 3000"))