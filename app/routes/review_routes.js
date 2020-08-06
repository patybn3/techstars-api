// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for examples
const Review = require('../models/review')
const Company = require('../models/company')
// const Founder = require('../models/founders')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
// this is middleware that will remove blank fields from `req.body`, e.g.
// { example: { title: '', text: 'foo' } } -> { example: { text: 'foo' } }
// const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// INDEX SIGNED IN
// GET /events
router.get('/reviews', requireToken, (req, res, next) => {
  Review.find()
    .then(reviews => {
    // `events` will be an array of Mongoose documents
    // we want to convert each one to a POJO, so we use `.map` to
    // apply `.toObject` to each one
      return reviews.map(review => review.toObject())
    })
  // respond with status 200 and JSON of the events
    .then(reviews => res.status(200).json({ reviews: reviews }))
  // if an error occurs, pass it to the handler
    .catch(next)
})

// SHOW
// GET /examples/5a7db6c74d55bc51bdf39793
router.get('/reviews/:id', requireToken, (req, res, next) => {
  // req.params.id will be set based on the `:id` in the route
  Review.findById(req.params.id)
    .then(handle404)
    // if `findById` is succesful, respond with 200 and "example" JSON
    .then(review => res.status(200).json({ review: review.toObject() }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// CREATE
// POST /examples
router.post('/companies/:id', requireToken, function (req, res) {
  // Create a new note and pass the req.body to the entry
  Review.create(req.body)
    .then(review => {
      // If a Review was created successfully, find one Product with an `_id` equal to `req.params.id`. Update the Product to be associated with the new Review
      // { new: true } tells the query that we want it to return the updated Product -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return Company.findOneAndUpdate({ _id: req.params.id }, { review: review._id }, { new: true })
    })
    .then(function (company) {
      // If we were able to successfully update a Product, send it back to the client
      res.json(company)
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err)
    })
})
// UPDATE
// PATCH /examples/5a7db6c74d55bc51bdf39793
// router.patch('/founders/:id', requireToken, removeBlanks, (req, res, next) => {
//   // if the client attempts to change the `owner` property by including a new
//   // owner, prevent that by deleting that key/value pair
//   // delete req.body.profile.owner
//   delete req.body.user
//
//   let path = req.file.path
//   const mimetype = req.file.mimetype
//
//   s3Upload(path, mimetype)
//     .then(aws => {
//       Founder.findById(req.params.id)
//         .then(handle404)
//         .then(founder => {
//           requireOwnership(req, founder)
//
//           return founder.set({
//             founderUrl: aws.Location,
//             name: req.body.name,
//             title: req.body.city,
//             owner: req.user.id
//           }).save()
//         })
//         .then((founder) => res.status(200).json({ founder: founder.toObject() }))
//         .catch(next)
//     })
// })

// DESTROY
// DELETE /examples/5a7db6c74d55bc51bdf39793
router.delete('/reviews/:id', requireToken, (req, res, next) => {
  Review.findById(req.params.id)
    .then(handle404)
    .then(review => {
      // throw an error if current user doesn't own `example`
      // delete the example ONLY IF the above didn't throw
      review.deleteOne()
    })
    // send back 204 and no content if the deletion succeeded
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

module.exports = router
