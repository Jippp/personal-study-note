let root = document.createElement('h1')

root.textContent = '子应用1'
root.onclick = () => {
  console.log('%c子应用1的window.a', 'color: red; font-size: 20px', window.a);
}

window.microRootElm?.appendChild(root)

window.a = '子应用1'
