// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

const multer = require('multer')

const upload = multer({ dest: 'pictures/' })
// pull in Mongoose model for examples
const Company = require('../models/company')
const Founder = require('../models/founders')
// const Founder = require('../models/founders')

const s3Upload = require('./../../lib/s3Upload')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { example: { title: '', text: 'foo' } } -> { example: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// INDEX SIGNED IN, OWNED
// GET /events/owned
router.get('/companies-owned', requireToken, (req, res, next) => {
  Company.find({ owner: req.user._id })
    .then(companies => {
      // `events` will be an array of Mongoose documents
      // we want to convert each one to a POJO, so we use `.map` to
      // apply `.toObject` to each one
      return companies.map(company => company.toObject())
    })
    // respond with status 200 and JSON of the events
    .then(companies => res.status(200).json({ companies: companies }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// INDEX SIGNED OUT
// GET /events/
// router.get('/profiles/openall', (req, res, next) => {
//   Profile.find()
//     .then(profiles => {
//       // `events` will be an array of Mongoose documents
//       // we want to convert each one to a POJO, so we use `.map` to
//       // apply `.toObject` to each one
//       return profiles.map(profile => profile.toObject())
//     })
//     // respond with status 200 and JSON of the events
//     .then(profiles => res.status(200).json({ profiles: profiles }))
//     // if an error occurs, pass it to the handler
//     .catch(next)
// })

// INDEX SIGNED IN
// GET /events
router.get('/companies', requireToken, (req, res, next) => {
  Company.find()
    .then(companies => {
      // `events` will be an array of Mongoose documents
      // we want to convert each one to a POJO, so we use `.map` to
      // apply `.toObject` to each one
      return companies.map(company => company.toObject())
    })
    // respond with status 200 and JSON of the events
    .then(companies => res.status(200).json({ companies: companies }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// SHOW
// GET /examples/5a7db6c74d55bc51bdf39793
router.get('/companies/:id', requireToken, (req, res, next) => {
  // req.params.id will be set based on the `:id` in the route
  Company.findById(req.params.id)
    .then(handle404)
    // if `findById` is succesful, respond with 200 and "example" JSON
    .then(company => res.status(200).json({ company: company.toObject() }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

router.get('/companies-owned/:id', requireToken, (req, res, next) => {
  // req.params.id will be set based on the `:id` in the route
  Company.findById(req.params.id)
    .then(handle404)
    // if `findById` is succesful, respond with 200 and "example" JSON
    .then(company => res.status(200).json({ company: company.toObject() }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// CREATE
// POST /examples
router.post('/companies', [upload.single('file'), requireToken], (req, res, next) => {
  // set owner of new example to be current user
  // req.body.profile.owner = req.user.id
  console.log(req.file)
  const path = req.file.path
  const mimetype = req.file.mimetype
  console.log(path)
  // req.body.profile
  s3Upload(path, mimetype)
    .then((data) => {
      const companyUrl = data.Location

      // respond to succesful `create` with status 201 and JSON of new "example"
      return Company.create({
        companyUrl: companyUrl,
        name: req.body.name,
        city: req.body.city,
        state: req.body.state,
        description: req.body.description,
        founded: req.body.founded,
        rating: req.body.rating,
        owner: req.user.id
      })
    })
    .then(company => {
      res.status(201).json({ company: company.toObject() })
    })
    // if an error occurs, pass it off to our error handler
    // the error handler needs the error message and the `res` object so that it
    // can send an error message back to the client
    .catch(next)
})

router.post('/founders', [upload.single('file'), requireToken], (req, res, next) => {
  // set owner of new example to be current user
  // req.body.profile.owner = req.user.id
  console.log(req.file)
  const path = req.file.path
  const mimetype = req.file.mimetype
  console.log(path)
  // req.body.profile
  s3Upload(path, mimetype)
    .then((data) => {
      const founderUrl = data.Location

      // respond to succesful `create` with status 201 and JSON of new "example"
      return Founder.create({
        founderUrl: founderUrl,
        name: req.body.name,
        title: req.body.title,
        owner: req.user.id
      })
    })
    .then(founder => {
      res.status(201).json({ founder: founder.toObject() })
    })
    // if an error occurs, pass it off to our error handler
    // the error handler needs the error message and the `res` object so that it
    // can send an error message back to the client
    .catch(next)
})

// UPDATE
// PATCH /examples/5a7db6c74d55bc51bdf39793
router.patch('/companies/:id', [upload.single('file'), requireToken], removeBlanks, (req, res, next) => {
  // if the client attempts to change the `owner` property by including a new
  // owner, prevent that by deleting that key/value pair
  // delete req.body.profile.owner
  delete req.body.user

  let path = req.file.path
  const mimetype = req.file.mimetype

  s3Upload(path, mimetype)
    .then(aws => {
      Company.findById(req.params.id)
        .then(handle404)
        .then(company => {
          requireOwnership(req, company)

          // if (profile.Location) {
          //   s3Delete({
          //     Bucket: process.env.BUCKET_NAME,
          //     Key: profile.Location.split('/').pop()
          //   })
          // }
          return company.set({
            companyUrl: aws.Location,
            name: req.body.name,
            city: req.body.city,
            state: req.body.state,
            description: req.body.description,
            founded: req.body.founded,
            rating: req.body.rating,
            owner: req.user.id
          }).save()
        })
        .then((company) => res.status(200).json({ company: company.toObject() }))
        .catch(next)
    })
})

router.patch('/founders/:id', [upload.single('file'), requireToken], removeBlanks, (req, res, next) => {
  // if the client attempts to change the `owner` property by including a new
  // owner, prevent that by deleting that key/value pair
  // delete req.body.profile.owner
  delete req.body.user

  let path = req.file.path
  const mimetype = req.file.mimetype

  s3Upload(path, mimetype)
    .then(aws => {
      Founder.findById(req.params.id)
        .then(handle404)
        .then(founder => {
          requireOwnership(req, founder)

          // if (profile.Location) {
          //   s3Delete({
          //     Bucket: process.env.BUCKET_NAME,
          //     Key: profile.Location.split('/').pop()
          //   })
          // }
          return founder.set({
            founderUrl: aws.Location,
            name: req.body.name,
            title: req.body.title,
            owner: req.user.id
          }).save()
        })
        .then((founder) => res.status(200).json({ founder: founder.toObject() }))
        .catch(next)
    })
})

// DESTROY
// DELETE /examples/5a7db6c74d55bc51bdf39793
router.delete('/companies/:id', requireToken, (req, res, next) => {
  Company.findById(req.params.id)
    .then(handle404)
    .then(company => {
      // throw an error if current user doesn't own `example`
      requireOwnership(req, company)
      // delete the example ONLY IF the above didn't throw
      company.deleteOne()
    })
    // send back 204 and no content if the deletion succeeded
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// DESTROY
// DELETE /examples/5a7db6c74d55bc51bdf39793
router.delete('/founders/:id', requireToken, (req, res, next) => {
  Founder.findById(req.params.id)
    .then(handle404)
    .then(founder => {
      // throw an error if current user doesn't own `example`
      requireOwnership(req, founder)
      // delete the example ONLY IF the above didn't throw
      founder.deleteOne()
    })
    // send back 204 and no content if the deletion succeeded
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

module.exports = router
