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
    .then(projects => {
      response.status(200).json(projects)
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


app.get('/api/v1/palettes', (request, response) => {
  db('palettes').select()
    .then(palettes => {
      response.status(200).json(palettes)

    })
    .catch(error => {
      response.status(500).json({ error }) 
    })
})

app.post('/api/v1/:id/palettes', (request, response) => {
  const { id } = request.params 
  const { palette, name, projectId } = request.body

  // need to update the fetch with correct params to fix this mess, also should add required params handling
  const colorsWithKeys = palette.reduce( (acc, color, idx) => {
    let key = `color${idx}`
    return {...acc, [key]: color.color}
  },{})

  const newPalette = {...colorsWithKeys, name, project_id: projectId}

  db('palettes').insert(newPalette, 'id')
    .then(dbPalette => {
       response.status(201).json({ palette, name, id: dbPalette[0], projectId }) 
    })
    .catch(error => {
      response.status(500).json({ error })
    })

})

app.delete('/api/v1/palettes/:id', (request, response) => {
  const { id } = request.params

  db('palettes').where('id', id).select()
    .then( selected => console.log(selected))
  //db('palettes').where('id', id).del()
  console.log(parseInt(id))
})


app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} running on port ${app.get('port')}`)
})
