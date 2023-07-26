interface Options {
  url: string,
  method: string,
  data: any,
  headers: any,
  requestList: any,
  onProgress: Function
}

interface x extends Partial<Options> { }

export default ({
  url,
  method = "post",
  data,
  headers = {},
  onProgress = e => e
}: x) => new Promise(resolve => {
  const xhr = new XMLHttpRequest()
  xhr.open(method, url)
  Object.keys(headers).forEach(key =>
    xhr.setRequestHeader(key, headers[key])
  )
  xhr.send(data)
  // @ts-ignore
  xhr.addEventListener('progress', onProgress)
  xhr.onload = (e: any) => {
    console.log(e.target.response)
    resolve({
      data: e.target.response
    })
  }
})

