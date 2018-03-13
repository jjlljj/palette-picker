const express = require('express')
const app = express()
const bodyParser = require('body-parser')

app.set('port', process.env.PORT || 3000)
app.locals.title = 'Palette Picker'
app.use(bodyParser.json())
app.use(express.static('public'))

app.locals.projects = {

}

app.get('/', (request, response) => {
  
})

app.get('/api/v1/projects', (request, response) => {
  const { projects } = app.locals

  if (projects) {
    response.json(projects)
  } else {
    response.status(404)
  }
})

app.post('/api/v1/projects', (request, response) => {
  const { project } = request.body
  const { projects } = app.locals

  if (!app.locals.projects[project]) {
    projects[project] = { palettes: [] }
    response.status(201).json(project)
  } else {
    response.status(400)
  }
})

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} running on port ${app.get('port')}`)
})
