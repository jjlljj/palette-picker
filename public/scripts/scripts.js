const generatePalette = () => {
  const colorPalette = []
  for (let i = 0; i < 5; i++) {
    let color = getRandomColor()
    
    colorPalette.push({color, lock: false})
    renderColor({color})
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

  newPalette.map(color => renderColor(color))
  toSto(newPalette)
}

const renderColor = color => {
  const colorsWrap = document.querySelector(".colors-wrap")
  const colorDiv = document.createElement("div")
  const lockIcon = color.lock ? "fa-lock" : "fa-lock-open"
  colorDiv.setAttribute("class", "color-card")
  colorDiv.setAttribute("style", `background-color: #${color.color}`)

  console.log(color)
  colorDiv.innerHTML = `
    <button
      type="button" 
      onclick="lockColor(event)"
      name="${color.color}"
      class="color-lock-btn fas ${lockIcon}"
    ></button>
    <h3>#${color.color}</h3>
  `
  colorsWrap.appendChild(colorDiv)
}

const lockColor = event => {
  event.preventDefault()
  const id = event.target.name
  const colorPalette = fromSto()
  
  const newPalette = colorPalette.map(color => {
    if (color.color === id) {
      return {...color, lock: !color.lock}
    } else {
      return color
    }
  })

  clearPalette()
  newPalette.map(color => renderColor(color))
  toSto(newPalette)
}

const getRandomColor = () => {
  return Math.random().toString(16).slice(-6) 
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

const addProject = async event => {
  event.preventDefault()
  const projectInput = document.querySelector('.project-input')

  console.log(projectInput.value)

  const proj = await addProjectFetch(projectInput.value)
  console.log(proj)
}

const addProjectFetch = async project => {
  try {
    const createProject = await fetch('/api/v1/projects', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({project})
    })
    if (createProject.status === 201) {
      return await createProject.json() 
    } else {
      throw new Error('could not create project')
    }
  } catch (error) {
    console.log(error)
  }
}

document.onload = generatePalette()
