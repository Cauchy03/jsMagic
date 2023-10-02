import { getCurrentInstance, onBeforeUnmount, Ref, ref, shallowRef, unref } from "vue"

type attr = {
  font?: string;
  fillStyle?: string;
}

const id = 'lkxlkx'
const watermarkEl = shallowRef<HTMLElement>();

export default function useWatermark(appendEl: Ref<HTMLElement | null> = ref(document.body) as Ref<HTMLElement>) {
  // 绘制文字背景图
  function createBase64(str: string, attr?: attr) {
    const canvas = document.createElement("canvas")
    const width = 200
    const height = 140
    Object.assign(canvas, { width, height })

    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.rotate((-20 * Math.PI) / 120);
      ctx.font = attr?.font ?? "20px Reggae One";
      ctx.fillStyle = attr?.fillStyle ?? "rgba(0, 0, 0, 0.12)";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";

      ctx.fillText('qweqwe', width / 20, height);
    }
    return canvas.toDataURL("image/png");
  }

  // 绘制水印层
  const createWatermark = (str: string, attr?: attr) => {
    if (unref(watermarkEl)) {
      updateWatermark({ str, attr })
      return id;
    }
    const div = document.createElement("div")
    watermarkEl.value = div
    div.id = id
    div.style.pointerEvents = "none" //不会响应鼠标和触摸事件
    div.style.top = "0px"
    div.style.left = "0px"
    div.style.position = "absolute"
    div.style.zIndex = "100000"
    const el = unref(appendEl)
    if (!el) return id
    // 解构赋值，取 clientHeight 和 clientWidth 属性，并将它们分别赋值给 height 和 width 常量
    const { clientHeight: height, clientWidth: width } = el
    updateWatermark({ str, width, height, attr })
    el.appendChild(div)
    return id
  }

  // 页面随窗口调整更新水印
  function updateWatermark(options: {
    width?: number
    height?: number
    str?: string
    attr?: attr
  } = {}) {
    const el = unref(watermarkEl)
    if (!el) return
    //@ts-ignore
    if (options.width !== "undefined") {
      el.style.width = `${options.width}px`;
    }
    //@ts-ignore
    if (options.height !== "undefined") {
      el.style.height = `${options.height}px`;
    }
    if (options.str !== "undefined") {
      // repeat 重复图片
      el.style.background = `url(${createBase64(
        //@ts-ignore
        options.str,
        options.attr
      )}) repeat`;
    }
  }


  // 对外提供的设置水印方法
  function setWatermark(str: string, attr?: attr) {
    createWatermark(str, attr);
    const instance = getCurrentInstance();
    if (instance) {
      onBeforeUnmount(() => {
        clear();
      });
    }
  }

  // 清除水印
  const clear = () => {
    const domId = unref(watermarkEl)
    watermarkEl.value = undefined
    const el = unref(appendEl)
    if (!el) return
    domId && el.removeChild(domId)
  }


  return { setWatermark, clear }
}
