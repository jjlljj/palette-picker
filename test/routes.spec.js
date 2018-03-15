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
  describe('GET /api/v1/projects', () => {
    
  })

  describe('POST /api/v1/projects', () => {

  })
  

  describe('GET /api/v1/palettes', () => {

  })


  describe('GET /api/v1/palettes/:id', () => {

  })

  describe('DELETE /api/v1/palettes/:id', () => {

  })

  describe('POST /api/v1/:id/palettes', () => {

  })

})
