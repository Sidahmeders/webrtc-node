import path from 'path'
import express from 'express'

const app = express()
const __dirname = path.resolve()

app.use(express.static(path.join(__dirname, '/work')))

app.get('/', (_, res) => res.render('index'))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`app server running on port ${PORT}...`))
