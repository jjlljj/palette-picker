const express = require('express')
const app = express()
const bodyParser = require('body-parser')

app.set('port', process.env.PORT || 3000)
app.locals.title = 'Palette Picker'
app.use(bodyParser.json())
app.use(express.static('public'))

app.locals.projects = [

]

app.get('/', (request, response) => {
  
})

app.get('/api/v1/projects', (request, response) => {
  const { projects } = app.locals

  if (projects) {
    response.status(200).json(projects)
  } else {
    response.status(404)
  }
})

app.post('/api/v1/projects', (request, response) => {
  const { project } = request.body
  const { projects } = app.locals
  const id = Date.now()

  if (app.locals.projects.every(storedProject => storedProject.name !== project)) {
    const newProject =  { id, name: project, palettes: [] }
    projects.push(newProject)
    response.status(201).json(newProject)
  } else {
    response.status(400)
  }
})

app.post('/api/v1/:id/palettes', (request, response) => {
  const { id } = request.params 
  const { palette, name, projectId } = request.body

  const project = app.locals.projects.find(project => project.id === parseInt(id))
  const newPalette = { palette, id: Date.now(), name, projectId }
  console.log(project)
  project.palettes.push(newPalette)
  response.status(201).json(newPalette)
})

app.delete('/api/v1/palettes/:id', (request, response) => {
  const { id } = request.params

  // delete palette from palettes table 
})


app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} running on port ${app.get('port')}`)
})
