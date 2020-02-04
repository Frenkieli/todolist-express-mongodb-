var express = require('express');
var mongoose = require('mongoose');
var Todo     = mongoose.model('Todo');

var uid = require('uid-safe');

// ** 注意!! express 會將 cookie key 轉成小寫 **
exports.current_user = function(req, res, next) {
  console.log('誰是當前使用者');
  var user_id = req.cookies ?
      req.cookies.user_id : undefined;
  if ( ! user_id ) {
    uid(32).then(function(uid) {
      res.cookie('user_id', uid);
    });
  }
  next();
};

// exports.index = function(req, res) {
//   console.log('進首頁');
//   Todo
//   .find()
//   .sort('-updated_at')
//   .exec( function(err, todos, count) {
//     res.render('index', {
//       title : 'Express Todo Example',
//       todos : todos
//     });
//   });
// };

exports.index = function ( req, res, next ){
  var user_id = req.cookies ?
    req.cookies.user_id : undefined;
 
  Todo.
    find({ user_id : user_id }).
    sort( '-updated_at' ).
    exec( function ( err, todos ){
      if( err ) return next( err );
 
      res.render( 'index', {
          title : 'Express Todo Example',
          todos : todos
      });
    });
};

// 新增成功導回 '/'
exports.create = function ( req, res, next ){
  new Todo({
      user_id    : req.cookies.user_id,
      content    : req.body.content,
      updated_at : Date.now()
  }).save( function ( err, todo, count ){
    if( err ) return next( err );
 
    res.redirect( '/' );
  });
};

//找尋對應id後刪除該項目後重新導向 '/'
exports.destroy = function ( req, res, next ){
  Todo.findById( req.params.id, function ( err, todo ){
    var user_id = req.cookies ?
      req.cookies.user_id : undefined;
 
    if( todo.user_id !== req.cookies.user_id ){
      return utils.forbidden( res );
    }
 
    todo.remove( function ( err, todo ){
      if( err ) return next( err );
 
      res.redirect( '/' );
    });
  });
};

// 這是給網頁重新導向編輯網頁用的(這個功能可以寫在前端)
exports.edit = function( req, res, next ){
  var user_id = req.cookies ?
      req.cookies.user_id : undefined;
 
  Todo.
    find({ user_id : user_id }).
    sort( '-updated_at' ).
    exec( function ( err, todos ){
      if( err ) return next( err );
 
      res.render( 'edit', {
        title   : 'Express Todo Example',
        todos   : todos,
        current : req.params.id
      });
    });
};

// 先找到對應的todo再重存一次
exports.update = function( req, res, next ){
  console.log('更改todo');
  Todo.findById( req.params.id, function ( err, todo ){
    var user_id = req.cookies ?
      req.cookies.user_id : undefined;
 
    if( todo.user_id !== user_id ){
      return utils.forbidden( res );
    }
 
    todo.content    = req.body.content;
    todo.updated_at = Date.now();
    todo.save( function ( err, todo, count ){
      if( err ) return next( err );
 
      res.redirect( '/' );
    });
  });
};