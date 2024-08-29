# 低代码编辑器

详细的demo项目看[github仓库](https://github.com/Jippp/lowcode)

## 依赖

- tailwindcss：方便css样式

  ```bash
  pnpm add tailwindcss postcss autoprefixer -D
  # 生成tailwind和postcss的配置文件
  npx tailwindcss init -p
  ```
  > 注意是autoprefixer，不是autoprefix

  修改`tailwind.config.js`配置文件：

  ```js
    export default {
      content: [
        './index.html',
        './src/**/*.{js,jsx,ts,tsx}'
      ]
      // ...省略其他配置
    }
  ```
  这个配置项是用来指定提取css的路径，会根据该配置路径去提取className

  然后在`index.css`中添加`tailwindcss`的相关基础样式：

  ```css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  ```
  > 如果编辑器有警告提示的话，需要安装`postcss-language-support`插件

- allotment: split-pane component 一个react可拖拽栏目的组件

- zustand：状态管理

- react-dnd：实现拖拽

  ```bash
  pnpm add react-dnd react-dnd-html5-backend
  ```

  安装完成之后在`main.tsx`中添加`Provider`,这是用来跨组件传递数据的:

  ```tsx{2-3,8,10}
  import { createRoot } from 'react-dom/client'
  import { HTML5Backend } from 'react-dnd-html5-backend'
  import { DndProvider } from 'react-dnd'
  import App from './App.tsx'
  import './index.css'
  
  createRoot(document.getElementById('root')!).render(
    <DndProvider backend={HTML5Backend}>
      <App />
    </DndProvider>
  )
  ```

  有两个hooks`useDrag\useDrop`，比如将B组件拖入A组件：

  ```tsx
  // 需要拖拽的组件，如上的B组件
  export default () => {
    const [_, dragRef] = useDrag({
      // 当前drag元素的标识,在drop时通过该值来判断是否接受
      type: 'b',
      item: {},
    })

    return (
      <div ref={dragRef}>bbbbb</div>
    )
  }
  ```
  ```tsx
  // 拖拽进入的父级组件,如上的A组件
  export default () => {
    const [{ canDrop }, dragRef] = useDrop({
      // 用来校验是否接受传入的元素的,如果drag时给的type不在这里,就不会被接受
      accept: ['b'],
      // drop时触发,一般做一些拖拽之后的提示
      drop() {},
      // 收集drop的状态,返回drop之后的状态
      collect(monitor) {
        return { canDrop: monitor.canDrop() }
      }
    })

    return (
      <div ref={dragRef}>aaaaa</div>
    )
  }
  ```
  

## 注意

- vite+ts的alias配置

1. vite.config.ts中添加配置

```js
export default defineConfig({
  resolve: {
    alias: {
      '@/editor': path.resolve(__dirname, './src/editor'),
      '@/editorStore': path.resolve(__dirname, './src/editor/stores'),
    }
  }
})
```

注意这里要用node的`path.resolve`解析路径，否则会报错。另外ts中引入path可能会报错，需要引入`@types/node`依赖

2. tsconfig.json中添加配置

要注意vite创建了三个tsconfig：
- `tsconfig.app.json`
- `tsconfig.node.json`
- `tsconfig.json`

在`tsconfig.json`中通过`references`字段指定不同的ts运行环境。
之所以会有两个不同的配置文件，因为`src`下的代码和`vite`本身运行在不同环境，
`src`下的代码运行在浏览器，`vite`本身运行在node，所以有两个配置文件来区分。

**我们添加的路径别名应该在`tsconfig.app.json`中**。

## 思路

将整个页面分为三个部分:
- material: 物料区,提供可拖拽的组件；大纲，展示区组件的大纲；源码，展示区组件的源码json；
- editarea: 展示区，这里存放的是拖拽之后的组件页面。可以选中进行交互
- setting：选中组件的编辑区域

大概过程：
1. 首先要有一些事先准备好的组件，然后将组件和对应可拖拽的组件名称做个映射
2. 拖拽完成之后，根据这个映射，createElement一个元素出来

是通过zustand存储状态的，并且事先定义好一些工具函数，比如添加组件、删除组件、更新组件等方法。
在做 组件-可拖拽的组件名称映射 时，引入事先准备好的组件，然后做一层映射表。
在展示区域，获取添加到展示区域的组件列表信息，循环渲染，即根据列表信息去createElement

![简易流程图](./lowcode简易流程图.png)

### 鼠标悬浮高亮

想要实现鼠标悬浮到某个已展示的组件上高亮提示，需要获取该组件的位置信息、宽高等信息，并且需要已展示区域(顶级元素)的位置信息。
然后根据这些信息计算出高亮提示的位置。
```js
const position = {
  left: container.left - parentContainer.left + parentContainer.scrollLeft,
  top: container.top - parentContainer.top + parentContainer.scrollTop
}
```
高亮提示的宽高和组件的宽高保持一致即可。

最后根据`createPortal`创建一个高亮元素，挂载到已展示区域(顶级元素)的下面就实现了鼠标悬浮高亮的效果。

> pointer-events: none；不响应鼠标事件
> createPortal创建可指定挂载位置的元素

### 点击选中可编辑

高亮逻辑和上面是一样的，自定义label改成 编辑工具按钮 即可，比如删除按钮。

### setting区域功能

- 属性的展示、修改
  通过一些配置来展示表单，然后修改表单时将这些属性当做props传给组件即可完成修改
- 样式的展示、修改
  使用`@monaco-editor/react`来做css编辑器

### 预览和大纲功能

- 预览
  展示编辑好的页面
  和展示区组件的还不太一样,有些组件的事件只会在预览时才能触发
- 大纲和源码(属于左侧物料区容器的一部分)
  即展示添加到展示区组件的大纲和源码
  大纲是一个树形组件,直接用antd的tree组件即可
  源码是展示json的,用monaco-editor来做的

### 绑定事件

绑定的事件在编辑时不会触发 只在预览时触发 也是通过给组件提前定义好事件的,比如button能click,input能change等
大致实现思路: 
  配置好配置项后,用户通过修改事件的参数来实现自定义。然后等到确定之后将参数更新到props上，传递给组件。
  组件内部通过直接在元素上`onClick=()=>{}`来实现事件的绑定

- 自定义js
  通过`@monaco-editor/react`来实现的代码编写，然后通过`new Function()`的方式来执行。
  通过`new Function()`最后一个参数是函数体，前面的都是参数名称这个特性来抛出内置对象的，然后在执行时传入内置对象：
  ```js
    const run = new Function('a', 'b', 'return a + b')
    run(1, 2)
  ```

###  组件的联动

组件和组件之间的联动，比如Button组件可以触发Modal组件。
实现思路：
  通过`forwardRef+useImmperativeHandle`暴露出组件内部方法，然后提供一个事件配置，最后在预览时获取所有的组件ref，通过配置的事件来触发组件ref上的方法。
这里有个坑：ref的挂载是在更新提交阶段的，但是我们处理事件的方法上是在渲染阶段执行的，会导致处理事件时拿不到ref。这里的处理方式是render两遍，第一遍带上ref目的是拿到ref(为了没有ref时一遍就可以完成render)；第二遍目的是为了处理事件，注意不能带上ref(否则会导致无限render)。

### 渲染后组件的拖拽

这个只需要在物料组件中添加`useDrag`就可以了，注意区分移动和新建就好

### 复杂物料组件的搭建

比如table组件，可以将框架和columnItem组件分开，在table组件的框架中通过`React.Children.map`来将子组件渲染成需要的配置即可。然后在Table主框架组件中定义一些配置项、在ColumnItem组件中也定义一些配置项就好。


