# 介绍

Next.js v14 基于 React Server Component 构建的 App Router。该Demo是介绍React Server Component时介绍的Demo。

## Demo内容

笔记系统，可以增删改查笔记，笔记支持 markdown 格式。

首页界面分为两列，左侧是笔记列表，右侧是笔记内容。
左侧可以新建笔记、搜索笔记；右侧预览时可以删除、编辑笔记。

路由：
- 首页/
- 笔记预览/notes/[id]
- 编辑笔记/notes/edit/[id]
  - 编辑之后保存跳转到预览页面/notes/[id]
- 新建笔记/notes/new
- 搜索笔记/notes?q=[query]

### 文件结构

#### components 组件
  - SidebarNoteItem中可以看到，使用了dayjs，但由于是服务端组件，所以dayjs这个包没有打包到前端，减少了产物体积。如果标识了`'use client'`，就会打包到前端来。具体可以在`Source面板 -> Page -> top目录 -> webpack0internal:// -> (app-pages-browser) -> node_modules/.pnpm`中看到
  - SidebarNoteItem是一个服务端组件 SidebarNoteContent是一个客户端组件。在SidebarNoteItem这个服务端组件中直接使用SidebarNoteContent客户端组件。通过`children props`的形式将服务端组件的一部分传递给了客户端组件。
  > 为什么要通过children props的形式？
  > 客户端组件中是不能直接使用服务端组件的。但是可以通过props的形式使用服务端组件。
  
  > 同时在服务端组件中使用客户端组件需要传参时，参数必须可序列化处理。也就是说，SidebarNoteContent这个组件接受的props(包括children props)都会被JSON.stringify()处理。因为是通过网络传输的，所以必须可序列化处理。

  > 并且通过props传入客户端组件中的服务端组件，其中使用到的外部包也是在服务端中的，不会打包到前端。也就是说，这个服务端组件会先在服务端中进行渲染，然后再发送到客户端组件中。

  > 因为服务端组件的一些好处，所以开发时要尽量使用服务端组件，拆无可拆时再使用客户端组件

  > 关于Suspence的使用，Sidebar中使用`Suspense`包裹了SidebarNoteList组件，如果不使用Suspence包裹，直接通过URL访问的话，会等待组件加载完成之后再跳转过去 会有一段空白；使用了Suspence会直接跳转，在当前页面显示fallback，在后台加载完成之后再显示组件。另外使用Suspence，可以和其他组件交互，不会因为当前组件在加载而有影响。
  >
  > 在本例中，延长的实际是localhost的加载，并且对这个html文件，网络是通过`Transform-Encoding: chunked`流式传输的，数据是分块发送的。先传的是带有fallback的HTML，然后等待加载完成之后再传渲染之后的HTML。

##### SidebarSearchField 左侧的搜索组件

- 使用了 useTransition hook，这也是react 18新增的，主要是用来控制优先级的。适用于频繁非紧急更新的场景
- 通过 next/navigation 提供的useRouter usePathname 来处理路由相关的，所以将该组件改为了客户端组件。

然后左侧展示的时候`SidebarNoteList组件`也需要用到`useSearchParams`，所以只能改为客户端组件，但是该该组件用到了`ioredis`相关的api，直接改会报错，所以需要将数据处理和筛选分开，抽出了一个`SidebarNoteListFilter`组件，这个组件中使用`useSearchParams`进行筛选处理。
但是由于这个组件是客户端组件，所以引用的组件都变成了客户端组件，包括使用了`dayjs`的`SidebarNoteItemHeader`组件。为了减少包体积，在`SidebarNoteList`组件中，通过props的形式将`header`组件传给`SidebarNoteListFilter`组件，在`filter`组件中进行组装。
> 还有一种简单的方式，就是在noteList组件中渲染好，通过children props的形式传给filter组件。filter组件中通过`Children.map`的形式从子组件中获取props进行筛选处理。但是`Children`这种方式react已经要放弃了，所以才用了上面的方式。

> 本质上还是将目标组件在服务端组件中先渲染好，然后通过props传递给客户端组件，在客户端组件中进行组装。

##### SidebarImport 左侧的导入组件

通过form表单上传文件，一般上传文件需要调用api接口来完成，Next中体现为路由处理程序。
但是在Next中，还有第二种方式，即`ServerAction`也能替代API接口完成操作。

但是需要注意，由于Next中有一些默认缓存，可能会出现导入之后页面没有变化。是因为构建时被缓存了，Data Cache以及route cache。
如果是在ServerAction中或者是路由处理程序中：使用`revalidatePath()`重新验证数据，去掉data cache。
还需要在路由页面中使用`route.refresh()`去掉路由缓存。

#### data 数据
#### lib 公共库

#### src 路由部分

##### note/[id]/page.tsx 笔记预览页面
  
  这里使用到的都是服务端组件，并且使用page.tsx页面替代了Suspence的使用。
  另外观察请求Network面板，`
  http://localhost:3000/note/1702459182837?_rsc=1tioe`：

  响应头中有这几个需要注意的：
    - `Cache-Control: no-store,must-revalidate`：缓存配置
    - `Content-Type: text/x-component`：表示响应体是RSC Payload格式的 chrome中看不到response, 可以在fire fox中看到
    - `Transform-Encoding: chunked`：流式传输
    - `Vary: RSC,Next-Router-State-Tree,Next-Router-Prefetch,Accept-Encoding`：经过的中间服务器

  响应体是RSC Payload格式的：
  ```
  1:D{"name":"","env":"Server"}
  2:D{"name":"Page","env":"Server"}
  3:D{"name":"","env":"Server"}
  4:D{"name":"rQ","env":"Server"}
  4:null
  0:["development",[["children","note","children",["id","1702459181837","d"],"children","__PAGE__",["__PAGE__",{}],["__PAGE__",{},[["$L1","$L2",null],null],null],["$L3","$4"]]]]
  3:[["$","meta","0",{"name":"viewport","content":"width=device-width, initial-scale=1"}],["$","meta","1",{"charSet":"utf-8"}],["$","link","2",{"rel":"icon","href":"/favicon.ico","type":"image/x-icon","sizes":"16x16"}]]
  1:null
  6:I["(app-pages-browser)/./node_modules/.pnpm/next@14.2.15_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/client/link.js",["app/note/[id]/page","static/chunks/app/note/%5Bid%5D/page.js"],""]
  2:D{"name":"Note","env":"Server"}
  5:D{"name":"EditButton","env":"Server"}
  5:["$","$L6",null,{"href":"/note/edit/1702459181837","className":"link--unstyled","children":["$","button",null,{"className":"edit-button edit-button--outline","role":"menuitem","children":"Edit"}]}]
  7:D{"name":"NotePreview","env":"Server"}
  7:["$","div",null,{"className":"note-preview","children":["$","div",null,{"className":"text-with-markdown","dangerouslySetInnerHTML":{"__html":"<p>quia et suscipit suscipit recusandae</p>\n"}}]}]
  2:["$","div",null,{"className":"note","children":[["$","div",null,{"className":"note-header","children":[["$","h1",null,{"className":"note-title","children":"sunt aut"}],["$","div",null,{"className":"note-menu","role":"menubar","children":[["$","small",null,{"className":"note-updated-at","role":"status","children":["Last updated on ","2023-12-13 05:19:48"]}],"$5"]}]]}],"$7"]}]
  ```
  包含了这些信息：
    - 服务端组件的渲染结果
    - 客户端组件的占位位置和引用文件
    - 服务端组件传给客户端组件的数据
  这种格式针对流式传输做了优化，数据是一行一行的，就可以逐行的从服务端发送给客户端，客户端在逐行解析RSC Payload，然后渐进式的渲染页面。

  客户端获取到RSC Payload都做了什么？首先是根据这个来重新渲染组件树，修改DOM。好处就在于，之前的状态仍然会被保存。比如这里的左侧组件树的展开收起状态，即使经过新建、删除等操作重新渲染了组件树，但是这个展开收起状态还会保存。

  如果多点击几次左侧的组件树，会发现过一段时间，就会重新请求数据，导致右侧内容重新刷新。
  这是Next的缓存机制导致的，根据Next提供的客户端路由缓存功能，客户端会缓存RSCPayload的数据，所以一定时间内点击左侧的组件树，右侧的内容不会重新刷新；过一段时间后又重新刷新了。
  客户端的路由缓存放在浏览器的临时缓存中，有两个因素决定了路由缓存的持续时间：
  1. Session，缓存在页面导航期间存在，页面刷新后丢失
  2. 自动失效：单个路由段的缓存时间是特定的。静态渲染的路由，5min；动态路由，30s

  我们这里使用的是动态路由，并且是动态渲染(这里数据是no-store未缓存的)，所以缓存时间是30s。

##### note/edit 笔记编辑页面

- note/edit/page.tsx 编辑页面 严格来说是新建页面
- note/edit/[id]/page.tsx 也是编辑页面，但是会走请求获取参数

这两个组件最终都会调用`compontents/NoteEditor`组件，在这个组件中进行了标题、内容的展示，以及保存、删除和预览功能。由于修改笔记，需要旧的数据来展示，所以需要受控，使用了`useState`进行状态管理。所以改为了客户端组件`use client`。

之前也说到过服务端组件和客户端组件混用的一些注意事项：
1. 服务端组件中能使用客户端组件，但客户端组件中不能直接使用服务端组件。
2. 在服务端组件中使用客户端组件时，可以使用`props`的形式将服务端组件的一部分传递给客户端组件。通过网络传输，所以必须可序列化JSON.stringify()处理。

但是我们这里在`NoteEditor`直接引入了`NotePreview`这个服务端组件，还没有报错，这是什么原因？
需要知道`use client`指令声明的是客户端组件和服务端组件之间的边界。在声明了`use client`的组件中，引入的所有组件都会被视为客户端组件，都会被打包到前端。
正是因为这个原因，在客户端组件中如果需要使用服务端组件，要用props的形式传入到客户端中使用。

- app/action.ts serverAction文件
> serverAction？TODO 不知道是啥
> 一句话描述就是在服务器端执行的异步函数，用来处理Next应用的数据变化。

访问构建后的资源，发现一些问题：
初始化时有三条数据，然后加一条数据，然后在新建note/edit时，会发现左侧变回了三条。这是构建时有缓存，路由默认是静态渲染，构建的时候只有三条，所以即使新建了 再进入note/edit路由时还是只有三条数据。
> 也就是`完整路由缓存`?TODO 
> 静态渲染，所以服务端在构建时将RSCPayload以及HTML都缓存了下来，并且数据获取时也有缓存。所以会出现这种情况。

如何禁止Next的这种行为？
重新验证数据和重新部署。
客户端的路由缓存失效？
一种是在ServerAction中使用`revalidatePath\revalidateTag`重新验证数据、或者使用`cookies.set\cookies.delete`让路由缓存失效
还有一种方式是`router.refresh`是路由缓存失效并发起一个重新获取当前路由的请求

新建和删除时发生了什么？
当点击新建按钮时，会将当前页面的数据通过POST请求发送到Next服务端，在服务端执行serverAction对应逻辑。相当于将逻辑放到了服务端执行，执行完了后将数据通过RSC Payload的形式返回到前端。

ServerActions的好处？
可以实现渐进式增强，因为是在服务端执行的代码，所以即使浏览器禁用了JS，也不影响页面的运行。
但由于我们写的是`formAction={() => saveNote(noteId, title, body)}`，在禁用JS后，serverActions根本就不会执行。所以ServerActions需要传参时 一般都是配合隐藏DOM来实现的。

关于React提供的新hook，useFormState和useFormStatus。
useFormState用于根据form action的结果来更新表单状态；useFormStatus用于提交表单时显示处理状态。
> 因为这两个hook还在测试阶段，所以使用时最好以react官方文档为准
这两个hook在 NoteEditor组件以及SaveButton\DeleteButton组件中有用到 注意SaveButton和DeleteButton中都通过useFormStatus拿到pending状态，是因为这两个button都在同一个form之下, 所以这个状态是一起变化的。

## 运行

```bash
pnpm i
pnpm dev
```


