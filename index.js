const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const GoogleSpreadsheet = require('google-spreadsheet')
const credentials = require('./bugtracker.json')

// spreadsheet config
const docId = '1Lv8lsJPv5w1b_HXpwY6ERH47HLfO1NMLXCPY6gzeMjU'

const app = express()
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => {
    res.render('form')
})

app.post('/', (req, res) => {
    const { name, email, howToReproduce, expectedOutput, receivedOutput } = req.body
    const googleDoc = new GoogleSpreadsheet(docId)

    googleDoc.useServiceAccountAuth(credentials, err => {
        if(err) {
            console.log('Unable to open spreadsheet')
        } else {
            googleDoc.getInfo((err, info) => {
                let worksheet = info.worksheets[0]
                worksheet.addRow({
                    name: name,
                    email: email,
                    howToReproduce: howToReproduce,
                    expectedOutput: expectedOutput,
                    receivedOutput: receivedOutput
                }, err => {
                    if(err) res.send('Unable to report this bug!')
                    else res.send('Bug reported!!!')
                })
            })
        }
    })

})

app.listen(3000, err => {
    if(err) console.log('Unable to start node server!')
    else console.log('Server running...')
})

