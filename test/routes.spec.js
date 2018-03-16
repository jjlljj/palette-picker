const chai = require('chai')
const should = chai.should()
const chaiHttp = require('chai-http')
const server = require('../server')

chai.use(chaiHttp)

const environment = process.env.NODE_ENV || 'test'
const configuration = require('../knexfile')[environment]
const db = require('knex')(configuration)

describe('Client Routes', () => {
  before( done => {
    db.migrate.rollback()
      .then( () => {
        db.migrate.latest()
      })
      .then( () => {
        done()
      })
  })

  beforeEach( done => {
    db.seed.run()
      .then( () => {
        done()
    })
  })

  it('should return the homepage', () => {

    return chai.request(server)
      .get('/')
      .then(response => {
        response.should.have.status(200)
        response.should.be.html
      })
      .catch( error => {
        throw error
      })
  })

  it('should return 404 for page that does exist', () => {
    return chai.request(server)
      .get('/sad')
      .then(response => {
        response.should.have.status(404)
      })
      .catch(error => {
        throw error
      })
  })

})

describe('API Routes', () => {
  beforeEach( done => {
    db.migrate.rollback()
      .then( () => {
        db.migrate.latest()
      .then( () => {
         return db.seed.run()
        .then( () => {
          done()
        })
      })
   })
  })


  describe('GET /api/v1/projects', () => {
    it('should return all of the projects', () => {
      return chai.request(server)
        .get('/api/v1/projects')
        .then(response => {
          response.should.have.status(200)
          response.should.be.json
          response.body.should.be.a('array')
          response.body.length.should.equal(1)

          response.body[0].should.have.property('name')
          response.body[0].name.should.equal('Foo')
        })
        .catch( error => {
          throw error
        })
    })
  })

  describe('POST /api/v1/projects', () => {
    it('should create a new project', () => {
      return chai.request(server)
        .post('/api/v1/projects')
        .send({ project: { name: 'boo!' }})
        .then(response => {
          response.should.have.status(201)
          response.should.be.json
          response.should.be.a('object')
          response.body.should.have.property('id')
          response.body.id.should.equal(2)
          response.body.should.have.property('name')
          response.body.name.should.equal('boo!')
        })
        .catch( error => {
          throw error
        })
    })

    it('should return 422 if missing information in the body', () => {
      return chai.request(server)
        .post('/api/v1/projects')
        .send({ project: {} })
        .then(response => {
          response.should.have.status(422)
          response.body.error.should.equal("Expected format: { name: <String> }. You\'re missing a name property")
        })
        .catch( error => {
          throw error
        })
    })
  })
  

  describe('GET /api/v1/palettes', () => {
    it('should return all of the palettes', () => {

      return chai.request(server)
        .get('/api/v1/palettes')
        .then(response => {
          response.should.have.status(200)
          response.should.be.json
          response.should.be.a('object')
          response.body.should.be.a('array')
          response.body[0].should.have.property('id')
          response.body[0].id.should.equal(1)
          response.body[0].should.have.property('name')
          response.body[0].name.should.equal('Palette 1')
          response.body[0].should.have.property('color0')
          response.body[0].should.have.property('color1')
          response.body[0].should.have.property('color2')
          response.body[0].should.have.property('color3')
          response.body[0].should.have.property('color4')
        })
        .catch( error => {
          throw error
        })
    })
  })


  describe('GET /api/v1/palettes/:id', () => {
    it('should return the expected palette', () => {

      return chai.request(server)
        .get('/api/v1/palettes/1')
        .then(response => {
          response.should.have.status(200)
          response.should.be.json
          response.should.be.a('object')
          response.body.palette.should.be.a('array')
          response.body.palette[0].should.have.property('id')
          response.body.palette[0].id.should.equal(1)
          response.body.palette[0].should.have.property('name')
          response.body.palette[0].name.should.equal('Palette 1')
          response.body.palette[0].should.have.property('color0')
          response.body.palette[0].should.have.property('color1')
          response.body.palette[0].should.have.property('color2')
          response.body.palette[0].should.have.property('color3')
          response.body.palette[0].should.have.property('color4')
        })
        .catch( error => {
          throw error
        })
    })

  })


  describe('DELETE /api/v1/palettes/:id', () => {
    it('should delete the palette as expected', () => {
      return chai.request(server)
        .delete('/api/v1/palettes/1')
        .then(response => {
          response.should.have.status(200)
        })
    })

  })

  describe('POST /api/v1/:id/palettes', () => {

  })

})
