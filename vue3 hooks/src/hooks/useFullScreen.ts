const useFullScreen = () => {
  // DOM对象的一个属性 用来判断当前是否为全屏模式
  let full = document.fullscreenElement
  // 判断浏览器是否支持全屏
  console.log(document.fullscreenEnabled)
  if (!full) {
    // 文档根节点的requestFullscreen方法直接实现全屏
    document.documentElement.requestFullscreen()
  } else {
    // 退出全屏
    document.exitFullscreen()
  }
  return full
}
export default useFullScreen