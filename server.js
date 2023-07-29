#!/usr/bin/env node
'use strict'
const app = require('express')()
const params = require('./src/params')
//import app from 'express';
//import authenticate from '../src/authenticate.js';
//import params from '../src/param.js';
//import proxy from '../src/proxy.js';

const PORT = process.env.PORT || 8080

app.get('/params')
app.get('/favicon.ico', (req, res) => res.status(204).end())
app.listen(PORT, () => console.log(`Listening on ${PORT}`))
