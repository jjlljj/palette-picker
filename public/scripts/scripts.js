const generatePalette = () => {
  const colorPalette = []
  for (let i = 0; i < 5; i++) {
    let color = getRandomColor()
    
    colorPalette.push({color, lock: false})
    renderColor({color})
  }
  toSto(colorPalette)
}

const loadProjects = async () => {
  const projects = await loadProjectsFetch()
  generatePalette()
  
  projects.map(project => {
    renderProject(project)
    addProjectOption(project)
    project.palettes.map(palette => renderProjectPalette(palette))
  })
}

const loadProjectsFetch = async() => {
  try {
    const projects = await fetch("/api/v1/projects", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })

      return await projects.json()
  } catch (error) {
    console.log(error)
  }
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
  const lockIcon = color.lock ? "fa-lock" : "fa-unlock-alt"
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

const addPalette = async event => {
  event.preventDefault()
  const projectSelect = document.querySelector(".project-select" )
  const paletteNameInput = document.querySelector(".palette-name-input") 

  const palette = fromSto().map(colorObj => ({...colorObj, lock: false})) 
  const projectId = projectSelect.value
  const newPalette = { palette, name: paletteNameInput.value, projectId }

  const added = await addPaletteFetch(newPalette, projectId)

  renderProjectPalette(added)
}

const addPaletteFetch = async (newPalette, id) => {
  try {
    const createPalette = await fetch(`/api/v1/${id}/palettes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPalette)
    })
    if (createPalette.status === 201) {
      return await createPalette.json() 
    } else {
      throw new Error('could not create palette')
    }
  } catch (error) {
    console.log(error)
  }
}

const renderProjectPalette = ({ id, name , palette, projectId }) => {
  const projectPalettes = document.querySelector(`.proj${projectId.toString()}`)  
  const newPalette = document.createElement('li')
  const colorHTML = palette.map(color =>  `<div class="small-palette-tile" style="background-color: #${color.color}"></div>`).join("")  
  newPalette.setAttribute('class',`p${id}`)

  // for clickable palette display, need header to be a button with onclick, fires function passed to palette id, gets the palette based on id from be && renders in top palette 
  newPalette.innerHTML = `
    <h3>${name}</h3>
    ${colorHTML} 
    <button 
      class="fas fa-trash-alt delete-btn"
      name=${id}
      onclick=deleteProjectPalette(event)
      ></button>
  `
  projectPalettes.appendChild(newPalette)
}

const deleteProjectPalette = event => {
  const id  = event.target.name
  console.log('delete ' + id)
  // delete palette from db based on palette id --> don't even need the project id!!
  
  deleteProjectPaletteFetch(id)
  removeProjectPaletteRender(id)
}

const removeProjectPaletteRender = id => {
  const palette = document.querySelector(`.p${id}`)
  palette.parentNode.removeChild(palette)
}

const deleteProjectPaletteFetch = async id => {
  fetch(`/api/v1/palettes/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" }
  })
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
    <div class="project-title">${project.name}</div>
    <ul class="proj${project.id} project-palettes" >

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

document.onload = loadProjects()
