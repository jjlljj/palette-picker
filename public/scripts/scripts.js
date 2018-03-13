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
  const projectSelect = document.querySelector(".project-select" )
  const paletteNameInput = document.querySelector(".palette-name-input") 
  console.log('addPalette', projectSelect.value)
}

const addProject = async event => {
  event.preventDefault()
  const projectInput = document.querySelector('.project-input')

  const project = await addProjectFetch(projectInput.value)
  renderProject(project)
  addProjectOption(project)
}

const renderProject = project => {
  const projectsWrap = document.querySelector(".projects-wrap")
  const newProject = document.createElement("article")
  newProject.setAttribute("class", "project-card")
  
  newProject.innerHTML = `
    <div>${project.name}</div>
    <ul class="${project.id} project-palettes" >

    </ul>
  `
  projectsWrap.appendChild(newProject)
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

const addProjectOption = project => {
  const projectSelect = document.querySelector(".project-select")
  const newOption = document.createElement("option")
  newOption.setAttribute("value", project.id)

  newOption.innerHTML = `
    ${project.name}
  `
  projectSelect.appendChild(newOption)
}

document.onload = generatePalette()
