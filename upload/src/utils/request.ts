interface Options {
  url: string,
  method: string,
  data: any,
  headers: any,
  requestList: XMLHttpRequest[],
  onProgress: Function
}

interface x extends Partial<Options> { }

export default ({
  url,
  method = "post",
  data,
  headers = {},
  onProgress = e => e,
  requestList
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
    if (requestList) {
      const xhrIndex = requestList.findIndex(item => item === xhr)
      requestList.splice(xhrIndex, 1)
    }
    console.log(e.target.response)
    resolve({
      data: e.target.response
    })
  }
  requestList?.push(xhr)
})

