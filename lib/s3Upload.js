require('dotenv').config()
// Load the SDK and UUID
const AWS = require('aws-sdk')
const mime = require('mime-types')
const fs = require('fs')
const path = require('path')

AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY
})
// Create S3 service object
const s3 = new AWS.S3({apiVersion: '2006-03-01'})
const s3Upload = function (file, mimetype) {
  // call S3 to retrieve upload file to specified bucket
  const uploadParams = {
    Bucket: process.env.AWS_S3_BUCKET_NAME, // bucket the file wil be saved to
    Key: '', // the name of the file when we upload it
    Body: '', // the file itself
    ACL: 'public-read', // makes the file readable
    ContentType: '' // allow file to be viewable instead of download by default
  }
  // Configure the file stream and obtain the upload parameters
  const fileStream = fs.readFileSync(file, null)
  // fileStream.on('error', function (err) {
  //   console.log('File Error', err)
  // })

  // the file we want to upload in a stream format
  uploadParams.Body = fileStream
  // name of the file
  uploadParams.Key = path.basename(file)
  // get the mimetype from the file
  uploadParams.ContentType = mimetype || mime.lookup(file)

  // call S3 to retrieve upload file to specified bucket
  return s3.upload(uploadParams).promise()
}

//
// const s3Delete = function (file) {
//   let params = {
//     Bucket: process.env.AWS_S3_BUCKET_NAME, // bucket the file wil be saved to
//     Key: file
//   }
//   const deleteObjectPromise = new AWS.S3({
//     apiVersion: '2006-03-01'
//   }).deleteObject(params).promise()
//   return deleteObjectPromise.then(
//     function (data) {
//       console.log('Deleted')
//       return data
//     })
// }

module.exports = s3Upload
