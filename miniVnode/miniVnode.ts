interface Options {
  el: string | HTMLElement
}

interface VueCls {
  options: Options
  init(): void
}

interface Vnode {
  tag: string,
  text?: string,
  children?: Vnode[]
}

// 虚拟dom
class Dom {
  // 创建子节点
  createElement(el: string) {
    return document.createElement(el)
  }
  // 填充文本
  setText(el: HTMLElement, text: string | null) {
    el.textContent = text
  }
  // 渲染函数
  render(data: Vnode) {
    let root = this.createElement(data.tag)
    // 判断子节点
    if (data.children && Array.isArray(data.children)) {
      data.children.forEach(item => {
        let child = this.render(item)
        root.appendChild(child)
      })
    } else {
      this.setText(root, data.text)
    }
    return root
  }
}


class Vue extends Dom implements VueCls {
  options: Options
  constructor(options: Options) {
    super()
    this.options = options
    this.init()
  }
  init(): void {
    let data: Vnode = {
      tag: "div",
      children: [{
        tag: 'span',
        text: '我是子节点'
      }]
    }
    let app = typeof this.options.el === 'string' ? document.querySelector(this.options.el) : this.options.el
    app.appendChild(this.render(data))
  }
}

new Vue({
  el: "#app"
})
