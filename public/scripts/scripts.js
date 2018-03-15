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
  const palettes = await loadPalettesFetch()
  generatePalette()
  
  projects.map(project => {
    renderProject(project)
    addProjectOption(project)
  })
  
  projects && palettes.map(palette => renderProjectPalette(cleanPalette(palette)))
}

const cleanPalette = ({ id, name, project_id, color0, color1, color2, color3, color4 })  => {
  return {
    id,
    name,
    projectId: project_id,
    palette: [ { color: color0 }, { color:  color1 }, { color: color2 }, { color: color3 }, { color: color4 } ]
  }
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

const loadPalettesFetch = async () => {
  try {
    const palettes = await fetch("/api/v1/palettes", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })

    return await palettes.json()
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

  newPalette.innerHTML = `
    <h3>${name}</h3>
    ${colorHTML} 
    <button 
      class="fas fa-trash-alt delete-btn"
      name=${id}
      onclick=deleteProjectPalette(event)
      ></button>
  `

  clearNoProjects(projectId)
  newPalette.addEventListener('click', () => { renderPaletteToMain(id)})
  projectPalettes.appendChild(newPalette)
}

const clearNoProjects = id => {
  const projectPalettes = document.querySelector(`.proj${id.toString()}`)  
  const noProjects = projectPalettes.querySelector('.no-palettes')

  if ( noProjects ) projectPalettes.removeChild(noProjects)
}

const renderPaletteToMain = async id => {
  const { palette } = await fetchPalette(id)
  
  const newPalette = cleanPalette(palette[0]).palette

  clearPalette()
  newPalette.map(color => renderColor(color))
  toSto(newPalette)
}


const fetchPalette = async id => {
  try {
    const palette = await fetch(`/api/v1/palettes/${id}`)

    if (palette.status === 200) {
      return await palette.json() 
    } else {
      throw new Error('could not get palette')
    }
  } catch (error) {
    console.log(error)
  }
}

const deleteProjectPalette = event => {
  const id  = event.target.name
  
  deleteProjectPaletteFetch(id)
  removeProjectPaletteRender(id)
}

const removeProjectPaletteRender = id => {
  const palette = document.querySelector(`.p${id}`)
  const parent = palette.parentNode

  parent.removeChild(palette)
  checkProjectEmpty(parent) 
}

const checkProjectEmpty = node => {
  console.log(node)
  if (!node.children.length) {
    const noProjects = document.createElement('div')
    noProjects.setAttribute("class", "no-palettes")
    noProjects.innerHTML = "No palettes added"

    node.appendChild(noProjects)
  }
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
      <div class="no-palettes">No palettes added</div>

    </ul>
  `
  projectsWrap.appendChild(newProject)
}

const addProjectFetch = async name => {
  try {
    const createProject = await fetch('/api/v1/projects', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({project: { name }})
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
