const msInADay = 1000 * 60 * 60 * 24
const bookBreakDays = 3

const { createCustomError } = require('./errors/custom-error')
const { Client } = require('pg')

const connection = {
  user: 'postgres',
  host: 'localhost',
  database: 'test-autorent',
  password: 'postgres',
  port: 5432,
}

const client = new Client(connection)

const express = require('express')
const app = express()
const port = 3000

app.get('/api/v1/cars/available', async (req, res) => {
  var result
  try {
    result = await IsCarAvailable(req)
  } catch (error) {
    return res.status(error.statusCode).send(error.message)
  }
  if (result) {
    res.send('free car')
  } else {
    res.send('booked car')
  }
})

app.get('/api/v1/cars/estimate-rent', async (req, res) => {
  const from = new Date(req.query.from)
  const to = new Date(req.query.to)
  try {
    validateDates(from, to)
  } catch (error) {
    return res.status(error.statusCode).send(error.message)
  }
  const days = Math.floor((to - from) / msInADay)
  res.send(`${estimateRent(days)}`)
})

app.get('/api/v1/cars/book', async (req, res) => {
  try {
    result = await IsCarAvailable(req)
  } catch (error) {
    return res.status(error.statusCode).send(error.message)
  }
  if (result) {
    try {
      let client = new Client(connection)
      await client.connect()
      await client.query('insert into book_history("car_id", "from_date", "to_date") values ($1, $2, $3)', [req.query.car_id, req.query.from, req.query.to])
      res.sendStatus(200)
    } catch (error) {
      console.log(error)
      res.sendStatus(500)
    } finally {
      client.end()
    }
  } else {
    res.send('booked car')
  }
})

app.get('/api/v1/cars/report', async (req, res) => {
  const from = new Date(req.query.from)
  const to = new Date(req.query.to)
  const carId = req.query.car_id
  try {
    var sumOfDaysBooked = 0
    var daysInMonthDb = 31
    let client = new Client(connection)
    await client.connect()
    const result = await client.query('select * from book_history where from_date > $1 and from_date < $2 and car_id = $3', [from, to, carId])
    result.rows.forEach(element => {
      const db_to_date = new Date(element.to_date)
      const db_from_date = new Date(element.from_date)
      daysInMonthDb = daysInMonth(db_from_date.getFullYear(), db_from_date.getMonth())
      if (db_from_date.getMonth() != db_to_date.getMonth()) {
        sumOfDaysBooked += daysInMonthDb - db_from_date.getDay()
      } else {
        sumOfDaysBooked += getDays(db_from_date, db_to_date)
      }
    })
    console.log('sum of days', sumOfDaysBooked)
    console.log('days in month', daysInMonthDb)
    const percent = sumOfDaysBooked / daysInMonthDb * 100
    console.log(percent)
    return res.send(`This car is booked ${percent}% of time in this month`)
  } catch (error) {
    res.sendStatus(500)
  } finally {
    client.end()
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

const estimateRent = (days) => {
  var result
  if (days <= 4) {
    result = days * 1000
  } else if (days <= 9) {
    result = (4 + (days - 4) * 0.95) * 1000
  } else if (days <= 17) {
    result = (4 + 5 * 0.95 + (days - 9) * 0.9) * 1000
  } else if (days <= 29) {
    result = (4 + 5 * 0.95 + 8 * 0.9 + (days - 17) * 0.85) * 1000
  }
  return Math.ceil(result)
}

const checkIfSatOrSun = (from, to) => {
  if (from.getDay() == 6 || from.getDay() == 7 || to.getDay() == 6 || to.getDay() == 7) {
    return true
  } else return false
}

async function IsCarAvailable(req) {
  const from = new Date(req.query.from)
  const to = new Date(req.query.to)
  const carId = req.query.car_id
  try {
    validateDates(from, to)
  } catch (error) {
    throw error
  }
  try {
    let client = new Client(connection)
    client.connect()
    const result = await client.query('select to_date, from_date from book_history where car_id = $1 order by from_date desc limit 1', [carId])
    const lastBookedToDate = new Date(result.rows[0].to_date)
    const lastBookedFromDate = new Date(result.rows[0].from_date)
    lastBookedToDate.setDate(lastBookedToDate.getDate() + bookBreakDays)
    if (lastBookedToDate < from || lastBookedFromDate > to) {
      return true
    } else {
      return false
    }
  } catch (error) {
    console.log(error)
  } finally {
    client.end()
  }
}

function validateDates(from, to) {
  const days = getDays(from, to)
  if (days > 30) {
    throw createCustomError('Cant book for more than 30 days', 400)
  }
  if (checkIfSatOrSun(from, to)) {
    throw createCustomError('Cant book on Saturday or Sunday', 400)
  }
}

function getDays(from, to) {
  return Math.floor((to - from) / msInADay)
}

function daysInMonth(month, year) {
  return new Date(year, month + 1, 0).getDate();
}