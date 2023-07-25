interface Options {
  url: string,
  method: string,
  data: any,
  headers: any,
  requestList: any
}

interface x extends Partial<Options>{}

export default ({
  url,
  method = "post",
  data,
  headers = {},
}: x) => {
  return new Promise(resolve => {
    const xhr = new XMLHttpRequest()
    xhr.open(method, url)
    Object.keys(headers).forEach(key =>
      xhr.setRequestHeader(key, headers[key])
    )
    xhr.send(data)
    xhr.onload = (e: any) => {
      console.log(e.target.response)
      resolve({
        data: e.target.response
      })
    }
  })
}
