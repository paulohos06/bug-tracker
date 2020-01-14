const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const port = process.env.PORT || 3000
const GoogleSpreadsheet = require('google-spreadsheet')
const credentials = require('./bugtracker.json')
const { promisify } = require('util')

const app = express()
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => {
    res.render('form', { successMsg: false })
})

app.post('/', async (req, res) => {
    try {
        const { name, email, howToReproduce, expectedOutput, receivedOutput, userAgent, userDate, issueType } = req.body
        const googleDoc = new GoogleSpreadsheet('1Lv8lsJPv5w1b_HXpwY6ERH47HLfO1NMLXCPY6gzeMjU')
        await promisify(googleDoc.useServiceAccountAuth)(credentials)
        const info = await promisify(googleDoc.getInfo)()
        const worksheet = info.worksheets[0]
        await promisify(worksheet.addRow)({
            name,
            email,
            howToReproduce,
            expectedOutput,
            receivedOutput,
            userAgent,
            userDate,
            issueType,
            source: req.query.source || 'direct'
        })
        res.render('form', { successMsg: 'Solicitação feita com sucesso!' })
    } catch(err) {
        res.send('Erro ao enviar o formulário.')
        console.log(err)
    }
})

app.listen(port, err => {
    if(err) console.log('Unable to start node server!')
    else console.log('Server running...')
})

