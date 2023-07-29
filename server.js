#!/usr/bin/env node
'use strict'
const app = require('express')()
const authenticate = require('./src/authenticate')
const params = require('./src/params')
const proxy = require('./src/proxy')
//import app from 'express';
//import authenticate from '../src/authenticate.js';
//import params from '../src/param.js';
//import proxy from '../src/proxy.js';

const PORT = process.env.PORT || 8080

app.enable('trust proxy')
app.get('/', authenticate, params, proxy)
app.get('/favicon.ico', (req, res) => res.status(204).end())
app.listen(PORT, () => console.log(`Listening on ${PORT}`))
