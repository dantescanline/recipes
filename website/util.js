function swap() {
  const container = document.getElementById('page-header-container')

  const childNodes = container.childNodes

  for (let i = 0; i < 3 * childNodes.length; i++) {
    let a = Math.floor(Math.random() * childNodes.length)
    let b = Math.floor(Math.random() * childNodes.length)
    childNodes[a].parentNode.insertBefore(childNodes[a], childNodes[b]);
  }
}

swap()