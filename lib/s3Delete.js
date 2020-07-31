require('dotenv').config()
// Load the SDK and UUID
const AWS = require('aws-sdk')

AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY
})

const s3Delete = function (file) {
  const deleteObjectPromise = new AWS.S3({
    apiVersion: '2006-03-01'
  }).deleteObject(file).promise()
  return deleteObjectPromise.then(
    function (data) {
      console.log('Deleted')
      return data
    })
}

module.exports = s3Delete
