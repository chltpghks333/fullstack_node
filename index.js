require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()
app.use(express.json())
app.use(cors())
app.use(express.static('build'))

morgan.token('req-content', function (req, res) {return JSON.stringify(req.body)})
const postLogger = morgan(':method :url :status :res[content-length] - ' +
    ':response-time ms :req-content'
    , {skip: function (req, res) {return req.method !== 'POST'}}
)
const generalLogger = morgan('tiny',
    {skip: function (req, res) {return req.method === 'POST'}}
)

app.use(postLogger)
app.use(generalLogger)


app.get('/api/persons', (req, res) => {
    Person
        .find({})
        .then(persons => {
            res.json(persons)
        })
        .catch(error => next(error))
})

app.get('/info', (req, res) => {
    Person
        .find({})
        .then(persons => {
            res.write(`Phonebook has info for ${persons.length} people\n\n`)
            res.write(JSON.stringify(new Date()))
            res.end()
        })
})

app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id).then(person => {
        if (person) {
            res.json(person)
        } else {
            response.status(404).end()
        }
    })
        .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({error: 'unknown endpoint'})
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({error: 'malformatted id'})
    }

    next(error)
}
// handler of requests with result to errors
app.use(errorHandler)

app.delete('/api/persons/:id', (req, res) => {
    const id = req.params.id
    Person.findByIdAndRemove(id)
        .then(result => {
            res.status(204).end()
        })
    //.catch(error => next(error))
})

const generateId = () => {
    const id = Math.floor(Math.random() * 100)
    return id
}
app.post('/api/persons', (req, res) => {
    const body = req.body

    if (!body.name) {
        return res.status(400).json({
            error: 'name field is missing'
        })
    }
    if (!body.number) {
        return res.status(400).json({
            error: 'number field is missing'
        })
    }
    const person = new Person({
        id: generateId(),
        name: body.name,
        number: body.number
    })
    person.save().then(savedPerson => {
        res.json(savedPerson)
    })
})

app.put('/api/persons/:id', (req, res, next) => {
    const id = req.params.id
    const body = req.body
    const person = {
        name: body.name,
        number: body.number
    }

    Person.findByIdAndUpdate(id, person, {new: true})
        .then(updatedPerson => {
            res.json(updatedPerson)
        })
        .catch(error => next(error))
})

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`server running on ${PORT}`)
})
