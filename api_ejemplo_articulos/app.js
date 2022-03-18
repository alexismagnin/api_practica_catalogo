var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var rolesRouter = require ('./routes/roles_routes')
var politicasRouter = require('./routes/politicas_routes')
var usuariosRouter = require('./routes/usuarios_routes')

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/usuarios', usuariosRouter);
app.use('/roles', rolesRouter);
app.use('/politicas', politicasRouter);

module.exports = app;
