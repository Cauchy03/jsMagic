import express from 'express'
import cors from 'cors'
import fs from 'fs'

const app = express()
app.use(express.urlencoded({ extended: false }))
app.use(cors())

// fetch
app.get('/api/fetch', (req, res) => {
  res.json({ name: 'tom' })
})

// sse
app.get('/api/sse', (req,res) => {
  // 核心代码设置请求头
  res.writeHead(200, {
    'Content-Type': 'text/event-stream'
  })
  const txt = fs.readFileSync('./sse.txt','utf8')
  const arr = txt.split('')
  let current = 0
  let timer =  setInterval(() => {
    if(current < arr.length) {
      // res.write返回给前端
      res.write(`data:${arr[current]}\n\n`)
      current ++ 
    }else {
      clearInterval(timer)
    }
  },300)
})

app.listen(3000, () => {
  console.log('success')
})