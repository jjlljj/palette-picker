const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const environment = process.env.NODE_ENV || 'development'
const configuration = require('./knexfile')[environment]
const db = require('knex')(configuration)

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
  
  db('projects').select()
    .then(papers => {
      response.status(200).json(papers)
    })
    .catch(error => {
      response.status(500).json({ error })
    })

})

app.post('/api/v1/projects', (request, response) => {
  const { project } = request.body

  if (!project['name']) {
    return response.status(422).send({ error: "Expected format: { name: <String>. You're missing a name property"})
  }

  db('projects').insert(project, 'id')
    .then(dbProject => {
      response.status(201).json({ id: dbProject[0], name: project.name })
    })
    .catch(error => {
      response.status(500).json({ error })
    })

})

app.post('/api/v1/:id/palettes', (request, response) => {
  const { id } = request.params 
  const { palette, name, projectId } = request.body

  const project = app.locals.projects.find(project => project.id === parseInt(id))
  const newPalette = { palette, id: Date.now(), name, projectId }

  project.palettes.push(newPalette)
  response.status(201).json(newPalette)
})

app.delete('/api/v1/palettes/:id', (request, response) => {
  const { id } = request.params

  console.log(id)
  app.locals.projects.map(project => {
    project.palettes = project.palettes.filter(palette => palette.id != id)
  })
  // delete palette from palettes table 
})


app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} running on port ${app.get('port')}`)
})
