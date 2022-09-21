const express = require('express')
const router = express.Router()

const {
  getCarStatus,
  getEstimatedRent,
  bookCar,
  getCarBookReport
} = require('../controllers/cars')

router.route('/available').get(getCarStatus)
router.route('/estimate-rent').get(getEstimatedRent)
router.route('/book').post(bookCar)
router.route('/report').get(getCarBookReport)

module.exports = router
