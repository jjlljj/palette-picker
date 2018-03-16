const express = require('express')  // importing the express to use the express server 
const app = express()  // declaring a new intance of the express server 
const bodyParser = require('body-parser')  // importing body-parser middle ware so app has access to post body

const environment = process.env.NODE_ENV || 'development'  // declaring the node environment to work in, in this case dev
const configuration = require('./knexfile')[environment]  // pull in knex config file to configure dev environment
const db = require('knex')(configuration)  // curry instance of db to knex so db can be called with knex methods

app.set('port', process.env.PORT || 3000)  // set the port the server will run on, either set in the node environment, or default 3000
app.locals.title = 'Palette Picker'  // name the app 'palette picker', used in error responses and server logs
app.use(bodyParser.json())  // apply bodyparser as middleware for all endpoints
app.use(express.static('public'))  // specify path for serving of front end js and html client assets

app.get('/', (request, response) => {  // empty get route, used for serve of client assets, as above
})

app.get('/api/v1/projects', (request, response) => {  // endpoint for fetching all projects, expects .get verb at the specified url 
  
  db('projects').select() // select the projects db using the knex method .select
    .then(projects => {  // await the db, then arrow function to do something with db response
      response.status(200).json(projects) // send db response as json as response from endpoint with status 200
    })
    .catch(error => { // await any errors
      response.status(500).json({ error }) // handle any errors, send error as json with status 500
    })
})

app.post('/api/v1/projects', (request, response) => { // endpoint for adding a project, expects .post verb at the specified url 
  const { project } = request.body  // destructure project key from request body
  if (!project['name']) {  // check for required property name from project sent in request body
    return response.status(422).send({ error: "Expected format: { name: <String> }. You're missing a name property"}) // send 522 response, specifying missing property if property is not present in request body 
  }

  db('projects').insert(project, 'id') // query database projects, insert the project recieved in post request to db, expect insert to return the id of the inserted project
    .then(dbProject => {  // await db action, arrow function to do something with db response
      response.status(201).json({ id: dbProject[0], name: project.name }) // send db response as json with project name as response from endpoint with status 201
    })
    .catch(error => {  // await any errors
      response.status(500).json({ error })  // handle any errors, send error as json with status 500
    })
})


app.get('/api/v1/palettes', (request, response) => { // endpoint for fetching all palettes, expects .get verb at the specified url 
  db('palettes').select()  // select the palettes db using the knex method .select
    .then(palettes => {  // await the db, then arrow function to do something with db response
      response.status(200).json(palettes)  // send db response as json as response from endpoint with status 200

    })
    .catch(error => {  // await any errors
      response.status(500).json({ error })  // handle any errors, send error as json with status 500 
    })
})

app.get('/api/v1/palettes/:id', (request, response) => { // endpoint for getting a palette based on the palette id, expects .get verb at the specified url, where id is dynamic within the endpoint 
  const { id } = request.params  // destructure id from request params (url)

  db('palettes').where("id", id).select()  // select row from palettes db where id matches id passed in url,  using the knex method .select
    .then(palette => {  // await the db, then arrow function to do something with db response
      if (!palette[0]) {  // check that palette with requested id was retrieved from db 
        return response.status(404).json({error: 'could not find palette'})  // send error message with status 404 for palette that wasn't found
      }
      response.status(200).json({ palette }) //ends retrieved db data as response with status 200
    })
    .catch(error => {  // await any errors
      response.status(500).json({ error })  // handle any errors, send error as json with status 500 
    })
})

app.delete('/api/v1/palettes/:id', (request, response) => { //endpoint for fetch a palette based on the palette id, expects .delete verb at the specified url, where id is dynamic within the endpoint 
  const { id } = request.params  // destructure id from url
  
  db('palettes').where("id", id).del()  //select row from palettes db where id matches id, and call knex method del() to delete that recrod
    .then( deleted => {  // await successful delete
      if (!deleted) { // check to see that record was deleted
        return response.status(404).json({error: 'no palette to delete'}) // return status 404 with error when no record was found to delete
      }
      response.status(204).json(deleted)  // return status 204 indicating successfuly deletion of requested  palette
    })
    .catch( error => {  // await any errors
      response.status(500).json({ error }) // handle errors, send error as json with status 500
    })
})

app.post('/api/v1/:id/palettes', (request, response) => {  // endpoint for adding a palette, expects .post verb at the specified url with id for project which serves as the foreign key of the created project 
  const { id } = request.params  // destructure id from url param
  const { palette, name, projectId } = request.body // destructure parameters from request body

  for( let requiredParam of ['name', 'projectId', 'palette']) { // declare required params to verify that they were passed in request
   
    if(!request.body[requiredParam]) {  //check to see if param is missing
      return response.status(422) { // send a response status of 422 if one of required params is missing
        .send({ error: `Expected format: { name: <String>, projectId: <Number>, palette: <Array> }. You're missing a "${requiredParam}" property.` })  //with error message indicating which param is missing
    }
  }

    const colorsWithKeys = palette.reduce( (acc, color, idx) => {  // this messy function cleans the passed palette colors and formats them with the expected db keys
      let key = `color${idx}` // declare the expected db key
      return {...acc, [key]: color.color}  // return the mapped colors
  },{})

    const newPalette = {...colorsWithKeys, name, project_id: projectId} // create palette object expected by db

    db('palettes').insert(newPalette, 'id') // insert palette object into palettes table and return id
      .then(dbPalette => {  // await response from db
        response.status(201).json({ palette, name, id: dbPalette[0], projectId }) // send response with status 201 and json palette object for rendering 
    })
    .catch(error => {  // await any errors
      response.status(500).json({ error }) // handle errors, send error as json with status 500
    })

})

app.listen(app.get('port'), () => { // start the server listening on the port specified above
  console.log(`${app.locals.title} running on port ${app.get('port')}`)  // console log successful start of server
})


module.exports = app // export server app
