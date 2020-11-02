const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const mongoose = require('mongoose')

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


if (process.argv.length < 3) {
    console.log('Please provide all the required entries')
    process.exit(1)
}

const password = process.argv[2]

// build connection to mongo database
const url =
    `mongodb+srv://swanchoi:${password}@cluster0.9t5nt.mongodb.net/person_app?retryWrites=true&w=majority`

mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true})

// create a schema for the collection and a model that goes into the collection(people)
const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', personSchema)


app.get('/api/persons', (req, res) => {
    Person
        .find({})
        .then(persons => {
            res.json(persons)
        })
})

app.get('/info', (req, res) => {
    res.write(`Phonebook has info for ${persons.length} people\n\n`)
    res.write(JSON.stringify(new Date()))
    res.end()
})

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = persons.find(person => person.id === id)

    if (!person) {
        res.status(404).end()
    } else {
        res.json(person)
    }
})

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    persons = persons.filter(person => person.id !== id)
    res.status(204).end()

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
    const duplicate = persons.find(person => person.name === body.name)
    if (duplicate) {
        return res.status(400).json({
            error: 'name must be unique'
        })
    }
    const person = {
        id: generateId(),
        name: body.name,
        number: body.number
    }
    persons = persons.concat(person)
    res.json(persons)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`server running on ${PORT}`)
})
