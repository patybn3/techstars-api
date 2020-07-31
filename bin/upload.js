// load s3Upload function
const s3Upload = require('./../lib/s3Upload')
const file = process.argv[2]

s3Upload(file)
  .then(response => console.log(response))
  .catch(console.error)
