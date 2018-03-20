const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const environment = process.env.NODE_ENV || 'development'
const configuration = require('./knexfile')[environment]
const db = require('knex')(configuration)

const httpsRedirect = (request, response, next) => {
  if(request.protocol !== "https://"  ) {
    response.redirect("https://" + request.headers.host + request.path);
  }
  next()
}


app.set('port', process.env.PORT || 3000)
app.locals.title = 'Palette Picker'
app.use(bodyParser.json())
app.use(express.static('public'))
if (environment === production) { app.use(httpsRedirect) }


app.get('/', (request, response) => {
})

app.get('/api/v1/projects', (request, response) => {
  
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
    return response.status(422).send({ error: "Expected format: { name: <String> }. You're missing a name property"})
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

app.get('/api/v1/palettes/:id', (request, response) => {
  const { id } = request.params

  db('palettes').where("id", id).select()
    .then(palette => {
      if (!palette[0]) {
        return response.status(404).json({error: 'could not find palette'})
      }
      response.status(200).json({ palette })
    })
    .catch(error => {
      response.status(500).json({ error })
    })
})

app.delete('/api/v1/palettes/:id', (request, response) => {
  const { id } = request.params
  
  db('palettes').where("id", id).del()
    .then( deleted => {
      if (!deleted) {
        return response.status(404).json({error: 'no palette to delete'})
      }
      response.status(204).json(deleted)
    })
    .catch( error => { 
      response.status(500).json({ error })
    })
})

app.post('/api/v1/:id/palettes', (request, response) => {
  const { id } = request.params 
  const { palette, name, projectId } = request.body

  for( let requiredParam of ['name', 'projectId', 'palette']) {
   
    if(!request.body[requiredParam]) {
      return response.status(422)
        .send({ error: `Expected format: { name: <String>, projectId: <Number>, palette: <Array> }. You're missing a "${requiredParam}" property.` })
    }
  }

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

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} running on port ${app.get('port')}`)
})


module.exports = app
