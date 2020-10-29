const express = require('express')
const app = express()
app.use(express.json())

let persons = [
    {
        id: 1,
        name: "Arto Hellas",
        number: "040-123456"
    },
    {
        id: 2,
        name: "Ada Lovelace",
        number: "39-44-5323523"
    },
    {
        id: 3,
        name: "Dan Abramov",
        number: "12-43-234345"
    },
    {
        id: 4,
        name: "Mary Poppendick",
        number: "39-23-6423122"
    }
] 

app.get('/api/persons', (req, res) => {
    res.json(persons)
})

app.get('/info', (req, res) => {
    res.write(`Phonebook has info for ${persons.length} people\n\n`)
    res.write(JSON.stringify(new Date()))
    res.end()
})

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = persons.find(person => person.id === id)

    if(!person) {
        res.status(404).end()
    }else {
        res.json(person)
    }
})

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    persons = persons.filter(person => person.id!==id)
    res.status(204).end()

})

const generateId = () => {
    const id = Math.floor(Math.random()*100)
    return id
}
app.post('/api/persons', (req, res) => {
    const body = req.body

    if(!body.name) {
        return res.status(400).json({
            error: 'name field is missing'
        })
    }
    if(!body.number) {
        return res.status(400).json({
            error: 'number field is missing'
        })
    }
    const duplicate = persons.find(person => person.name === body.name)
    if(duplicate) {
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

const PORT = 3001
app.listen(PORT, () => {
    console.log(`server running on ${PORT}`)
})
