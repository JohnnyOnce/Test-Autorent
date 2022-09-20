const cars = require('./routes/cars')

const express = require('express')
const app = express()
const port = 3000

app.use('/api/v1/cars', cars)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})