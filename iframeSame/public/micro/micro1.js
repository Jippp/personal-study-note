let root

root = document.createElement('h1')
root.textContent = '子应用1'
document.body.appendChild(root)

// 会抛出异常，因为跳转的URL和当前URL不同源
window.history.pushState({ key: "hello" }, "", "/test");
