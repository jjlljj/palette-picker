const generatePalette = () => {
  const colorPalette = []
  for (let i = 0; i < 5; i++) {
    let color = getRandomColor()
    
    colorPalette.push({color, lock: false})
    renderColor(color)
  }
  toSto(colorPalette)
}

const updatePalette = () => {
  clearPalette()
  const colorPalette = fromSto()
  
  const newPalette = colorPalette.map(color => {
    if (color.lock) {
      return color
    } else {
      return { color: getRandomColor(), lock: false }
    }
  })

  newPalette.map(color => renderColor(color.color))
}

const renderColor = color => {
  const colorsWrap = document.querySelector(".colors-wrap")
  const colorDiv = document.createElement("div")
  colorDiv.setAttribute("class", "color-card")
  colorDiv.setAttribute("id", color)
  colorDiv.setAttribute("style", `background-color: ${color}`)
  colorDiv.innerHTML = `
    <button>LOCK</button>
    <h3>${color}</h3>
  `
  colorsWrap.appendChild(colorDiv)
}

const getRandomColor = () => {
  return '#'+Math.random().toString(16).slice(-6) 
}

const clearPalette = () => {
  const colorsWrap = document.querySelector(".colors-wrap")
  while(colorsWrap.hasChildNodes()) {
    colorsWrap.removeChild(colorsWrap.lastChild)
  }
}

const toSto = colorPalette => {
  localStorage.setItem("colorPalette", JSON.stringify(colorPalette)) 
}

const fromSto = () => {
  return JSON.parse(localStorage.getItem("colorPalette"))
}

const addPalette = event => {
  event.preventDefault()
  const projectInput = document.querySelector('.project-input')

  console.log('addPalette')
}

const addProject = event => {
  event.preventDefault()
  const projectInput = document.querySelector('.project-input')

  console.log(projectInput.value)
}

document.onload = generatePalette()
