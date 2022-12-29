const express =require('express')
const mysql = require("mysql");
  
let conn  = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: 'root',
    database: 'railway'
});
  
conn.connect(function(err){
    if (err)
      throw err;
    console.log("connection successful");
});
  
const app=express();

app.get('/createdb', (req,res)=>{
  let sql='CREATE DATABASE railway'
  conn.query(sql, (err, result)=>{
    if(err) throw err
    res.send('Database created')
  })
})

// Create table
app.get('/createpoststable', (req, res)=>{
  let sql='CREATE TABLE user(id int AUTO_INCREMENT, title VARCHAR(255), body VARCHAR(255), PRIMARY KEY (id))'
  conn.query(sql, (err, result)=>{
    if(err) throw err;
    console.log(result)
    res.send('User table created')
  })
})

app.get('/add1', (req, res)=>{
  let user={title: {User: 'User 1', body: 'This sis body 1'}}
  let sql='INSERT INTO user SET ?'
  let query= conn.query(sql, user, (err, result)=>{
    if(err) throw err
    console.log(result)
    res.send('User 1 created')
  })
})

app.get('/display', (req, res)=>{
  // let user={title: {User: 'User 1', body: 'This sis body 1'}}
  let sql='SELECT * FROM user'
  let query= conn.query(sql, (err, result)=>{
    if(err) throw err
    console.log(result)
    res.send('table printed')
  })
})

app.listen('3000',()=>{
  console.log('Server stared on port 3000')
})