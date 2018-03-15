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

})
