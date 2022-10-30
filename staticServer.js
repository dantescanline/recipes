import express from 'express'

var app = express();
app.use('/', express.static('./dist'));
app.listen(8000, () => { console.log('static server listening on 8000') });