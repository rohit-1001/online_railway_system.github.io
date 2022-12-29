const express= require("express")
const path= require("path")
const app=express();
const ejs= require ('ejs')
const bodyparser=require("body-parser")
const fs=require('fs')
const mysql=require('mysql');
// const {createPool} = require("mysql")
const alert = require('alert');
const { createConnection } = require("net");
const { resourceLimits } = require("worker_threads");
const { fstat } = require("fs");
const { finished } = require("stream");
const port=80;
const readline = require("readline");

const interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

var urlencodedParser=bodyparser.urlencoded({extended:true})

// For serving static files
app.use('/static', express.static('static'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// const pool=mysql.createPool({
//     host:'localhost',
//     user:'root',
//     password:'root',
//     database: 'railway'
// });

// pool.query('SELECT * FROM railway.register', (err, res)=>{
//     return console.log(res)
// })

// Connection
const conn=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'root',
    database: 'railway'
});

// Connect
conn.connect((err)=>{
    if(err){
        throw err;
    }
    console.log("Mysql connected")
});

app.post("/register",(req,res)=>{
    var str='[{"user_name":"'+req.body.name+'","user_id":"'+req.body.id+'","email":"'+req.body.email+'","contact":"'+req.body.contact+'","dob":"'+req.body.dob+'","gender":"'+req.body.gender+'","pass":"'+req.body.password+'"}]'
    var sql="INSERT INTO register VALUES ('"+ req.body.name+"','"+ req.body.id+"', '"+ req.body.email+"', "+ req.body.contact+" , '"+ req.body.dob+"','"+ req.body.gender +"','"+ req.body.password+"')"
    conn.query(sql, function(err, result){
        if(err){
            var name="Login"
            res.render('register.pug',{name})
            console.log(err)
            alert('User Id already exists.')
        }else{
            fs.writeFile('./currentUser.json',str,err=>{
                if(err) console.log(err)
                else{
                    fs.readFile('./currentUser.json','utf-8',(err,currentUserData)=>{
                        if(err) console.log(err)
                        else{
                            try {
                                var data=JSON.parse(currentUserData)
                            } catch (err) {
                                console.log('error', err);
                            }
                            res.render('account.pug',{value:data[0],name:data[0].user_name})
                        }
                    })
                }
            })
        }
    })
})

app.post("/submit_contact",(req,res)=>{
    var name
    var path = __dirname+'/currentUser.json'
    if(fs.existsSync(path)){
        fs.readFile('./currentUser.json','utf-8',(err,currentUserData)=>{
            if(err) console.log(err)
            else{
                try {
                    var data=JSON.parse(currentUserData)
                } catch (err) {
                    console.log('error', err);
                }
                name=data[0].user_name
            }
        })
    }
    else{
        name="Login"
    }
    var sql="INSERT INTO contact VALUES ('"+ req.body.name+"','"+ req.body.email+"',"+ req.body.contact+",'"+ req.body.address+"','"+ req.body.description+"')"
    conn.query(sql, function(err){
        if(err){
            res.render('contact.pug',{name})
            alert('Some error occured.')
        } else{
            res.render('index.pug',{name})
            alert('Contact request accepted. We will reach out to you soon.')
        }    
    })
})

//Create DB
// app.get('/createdb', (req,res)=>{
//     let sql='CREATE DATABASE railway';
//     conn.query(sql, (err, result)=>{
//         if(err){
//             throw err;
//         }
//         console.log('Database created')
//     });
// });

// Set the template engine as pug
app.set('view engine', 'pug')
// set the view directory
app.set('views', path.join(__dirname, 'views'))

app.use('/Images', express.static('static'))

// Pug endpoint
app.get("/",(req,res)=>{
    var path = __dirname+'/currentUser.json'
    if(fs.existsSync(path)){
        fs.readFile('./currentUser.json','utf-8',(err,currentUserData)=>{
            if(err) console.log(err)
            else{
                try {
                    var data=JSON.parse(currentUserData)
                } catch (err) {
                    console.log('error', err);
                }
                res.render('index.pug',{name:data[0].user_name})
            }
        })
    }
    else{
        var name="Login"
        res.render('index.pug',{name})
    }
})

app.get("/index",(req,res)=>{
    var path = __dirname+'/currentUser.json'
    if(fs.existsSync(path)){
        fs.readFile('./currentUser.json','utf-8',(err,currentUserData)=>{
            if(err) console.log(err)
            else{
                try {
                    var data=JSON.parse(currentUserData)
                } catch (err) {
                    console.log('error', err);
                }
                res.render('index.pug',{name:data[0].user_name})
            }
        })
    }
    else{
        var name="Login"
        res.render('index.pug',{name})
    }
})

app.get("/contact",(req,res)=>{ 
    var path = __dirname+'/currentUser.json'
    if(fs.existsSync(path)){
        fs.readFile('./currentUser.json','utf-8',(err,currentUserData)=>{
            if(err) console.log(err)
            else{
                try {
                    var data=JSON.parse(currentUserData)
                } catch (err) {
                    console.log('error', err);
                }
                res.render('contact.pug',{name:data[0].user_name})
            }
        })
    }
    else{
        var name="Login"
        res.render('contact.pug',{name})
    }
})

app.get("/login",(req,res)=>{
    var path = __dirname+'/currentUser.json'
    if(fs.existsSync(path)){
        fs.readFile('./currentUser.json','utf-8',(err,currentUserData)=>{
            if(err) console.log(err)
            else{
                try {
                    var data=JSON.parse(currentUserData)
                } catch (err) {
                    console.log('error', err);
                }
                var user_id=data[0].user_id
                var sql="SELECT train.train_no, train.train_name, train.source_station, train.destination_station, train.train_date, train.train_time, ticket.pnr, ticket.user_name, ticket.user_id, ticket.seat_no, ticket.passengers FROM train INNER JOIN ticket ON train.train_no=ticket.train_no AND ticket.user_id=?;"
                conn.query(sql, [user_id], function(err, result, fields){
                    if(result.length>0){
                        var items=result;
                        res.render('account2.pug',{value:data[0], items, name:data[0].user_name})
                    }  
                    else{
                        res.render('account.pug',{value:data[0], name:data[0].user_name})
                    }
                })
            }
        })
    }
    else{
        res.render('login.pug')
    }
})

app.get("/account",(req,res)=>{
    fs.readFile('./currentUser.json','utf-8',(err,currentUserData)=>{
        if(err) console.log(err)
        else{
            try {
                var data=JSON.parse(currentUserData)
            } catch (err) {
                console.log('error', err);
            }
            var user_id=data[0].user_id
            var sql="SELECT train.train_no, train.train_name, train.source_station, train.destination_station, train.train_date, train.train_time, ticket.pnr, ticket.user_name, ticket.user_id, ticket.seat_no, ticket.passengers FROM train INNER JOIN ticket ON train.train_no=ticket.train_no AND ticket.user_id=?;"
            conn.query(sql, [user_id], function(err, result, fields){
                if(result.length>0){
                    var items=result;
                    res.render('account2.pug',{value:data[0], items, name:data[0].user_name})
                }  
                else{
                    res.render('account.pug',{value:data[0], name:data[0].user_name})
                }
            })
        }
    })
})

app.get("/userlogin",(req, res)=>{
    var path = __dirname+'/currentUser.json'
    if(fs.existsSync(path)){
        fs.readFile('./currentUser.json','utf-8',(err,currentUserData)=>{
            if(err) console.log(err)
            else{
                try {
                    var data=JSON.parse(currentUserData)
                } catch (err) {
                    console.log('error', err);
                }
                var user_id=data[0].user_id
                var sql="SELECT train.train_no, train.train_name, train.source_station, train.destination_station, train.train_date, train.train_time, ticket.pnr, ticket.user_name, ticket.user_id, ticket.seat_no, ticket.passengers FROM train INNER JOIN ticket ON train.train_no=ticket.train_no AND ticket.user_id=?;"
                var items=result;
                conn.query(sql, [user_id], function(err, result, fields){
                    if(result.length>0){
                        res.render('account2.pug',{value:data[0], items, name:data[0].user_name})
                    }  
                    else{
                        res.render('account.pug',{value:data[0], name:data[0].user_name})
                    }
                })
            }
        })
    }
})

app.get("/edit",urlencodedParser,(req,res)=>{
    var path = __dirname+'/currentUser.json'
    if(fs.existsSync(path)){
        fs.readFile('./currentUser.json','utf-8',(err,currentUserData)=>{
            if(err) console.log(err)
            else{
                try {
                    var data=JSON.parse(currentUserData)
                } catch (err) {
                    console.log('error', err);
                }
                var user_id=data[0].user_id
                res.render('edit.pug',{item:data[0], name:data[0].user_name})
            }
        })
    }
})

app.get("/rules",urlencodedParser,(req,res)=>{
    var path = __dirname+'/currentUser.json'
    var data
    if(fs.existsSync(path)){
        fs.readFile('./currentUser.json','utf-8',(err,currentUserData)=>{
            if(err) console.log(err)
            else{
                try {
                    data=JSON.parse(currentUserData)
                } catch (err) {
                    console.log('error', err);
                }
                res.render('rules.pug',{value:data[0], name:data[0].user_name})
            }
        })
    }
    else{
        var name="Login"
        res.render('rules.pug',{name})
    }
})

app.get("/other",urlencodedParser,(req,res)=>{
    var path = __dirname+'/currentUser.json'
    var data
    if(fs.existsSync(path)){
        fs.readFile('./currentUser.json','utf-8',(err,currentUserData)=>{
            if(err) console.log(err)
            else{
                try {
                    data=JSON.parse(currentUserData)
                } catch (err) {
                    console.log('error', err);
                }
                res.render('other.pug',{value:data[0], name:data[0].user_name})
            }
        })
    }
    else{
        var name="Login"
        res.render('other.pug',{name})
    }
})

app.post("/update_train_admin",urlencodedParser,(req,res)=>{
    var id
    var data
    var path = __dirname+'/currentUser.json'
    if(fs.existsSync(path)){
        fs.readFile('./currentUser.json','utf-8',(err,currentUserData)=>{
            if(err) console.log(err)
            else{
                try {
                    data=JSON.parse(currentUserData)
                } catch (err) {
                    console.log('error', err);
                }
            }
        })
    }
    var sql="UPDATE train SET train_name=?, total_seats=?, available_seats=?, source_station=?, destination_station=?, train_date= ? , train_time=? WHERE train_no=?"
    conn.query(sql,[req.body.train_name, req.body.total_seats, req.body.available_seats, req.body.source_station, req.body.destination_station, req.body.train_date, req.body.train_time, req.body.train_no],function(err, result, fields){
        if(err) console.log(err)
        else{
            res.render('admin.pug')
            alert("Train data updated")
        }
    })
})

// app.post("/delete_train_admin",urlencodedParser,(req,res)=>{
//     var id
//     var data
//     var path = __dirname+'/currentUser.json'
//     if(fs.existsSync(path)){
//         fs.readFile('./currentUser.json','utf-8',(err,currentUserData)=>{
//             if(err) console.log(err)
//             else{
//                 try {
//                     data=JSON.parse(currentUserData)
//                 } catch (err) {
//                     console.log('error', err);
//                 }
//             }
//         })
//     }
//     var sql="DELETE FROM train WHERE train_no=?"
//     conn.query(sql,[req.body.train_no],function(err, result, fields){
//         if(err) console.log(err)
//         else{
//             res.render('admin.pug')
//             alert("Train deleted")
//         }
//     })
// })

app.post("/update",urlencodedParser,(req,res)=>{
    var newid
    var id1
    var data
    var path = __dirname+'/currentUser.json'
    if(fs.existsSync(path)){
        fs.readFile('./currentUser.json','utf-8',(err,currentUserData)=>{
            if(err) console.log(err)
            else{
                try {
                    data=JSON.parse(currentUserData)
                    newid=data[0].user_id;
                } catch (err) {
                    console.log('error', err);
                }
                var sql="UPDATE register SET user_name=?, user_id=?, email=?, contact=?, dob=?, gender=?, pass=? WHERE user_id=?"
                conn.query(sql,[req.body.name, req.body.id, req.body.email, req.body.contact, req.body.dob, req.body.gender, req.body.password, newid], function(err, result, fields){
                    if(err) console.log(err)
                    else{
                        var str='[{"user_name":"'+req.body.name+'","user_id":"'+req.body.id+'","email":"'+req.body.email+'","contact":"'+req.body.contact+'","dob":"'+req.body.dob+'","gender":"'+req.body.gender+'","pass":"'+req.body.password+'"}]'
                        fs.writeFile('./currentUser.json',str,err=>{
                            if(err) console.log(err)
                            else{
                                var sql1="UPDATE ticket SET user_name=?, user_id=?  WHERE user_id=?"
                                conn.query(sql1, [req.body.name, req.body.id, newid], function(err, result, fields){
                                    fs.readFile('./currentUser.json','utf-8',(err,currentUserData)=>{
                                        if(err) console.log(err)
                                        else{
                                            try {
                                                data=JSON.parse(currentUserData)
                                            } catch (err) {
                                                console.log('error', err);
                                            }
                                            var sql2="SELECT train.train_no, train.train_name, train.source_station, train.destination_station, train.train_date, train.train_time, ticket.pnr, ticket.user_name, ticket.user_id, ticket.seat_no, ticket.passengers FROM train INNER JOIN ticket ON train.train_no=ticket.train_no AND ticket.user_id=?;"
                                            conn.query(sql2, [req.body.id], function(err, result, fields){
                                                if(result.length>0){
                                                    var items=result;
                                                    res.render('account2.pug',{value:data[0], items, name:data[0].user_name})
                                                }  
                                                else{
                                                    res.render('account.pug',{value:data[0], name:data[0].user_name})
                                                }
                                            })
                                        }
                                    })
                                })
                            }
                        })
                    }
                })
            }

        })
    }
})
// app.post("/update",urlencodedParser,(req,res)=>{
//     var name
//     var data
//     console.log(req.body.name)
//     console.log(req.body.id)
//     console.log(req.body.email)
//     console.log(req.body.contact)
//     console.log(req.body.dob)
//     console.log(req.body.gender)
//     console.log(req.body.password)
//     var sql="UPDATE register SET user_name=?, user_id=?, email=?, contact=?, dob=?, gender=?, pass=? WHERE user_id=?"
//     conn.query(sql,[req.body.name, req.body.id, req.body.email, req.body.contact, req.body.dob, req.body.gender, req.body.password, ], function(err, result, fields){
//         if(err) alert("User id already exists.")
//         else{
//             var str='[{"user_name":"'+req.body.name+'","user_id":"'+req.body.id+'","email":"'+req.body.email+'","contact":"'+req.body.contact+'","dob":"'+req.body.dob+'","gender":"'+req.body.gender+'","pass":"'+req.body.password+'"}]'
//             fs.writeFile('./currentUser.json',str,err=>{
//                 if(err) console.log(err)
//                 else{
//                     fs.readFile('./currentUser.json','utf-8',(err,currentUserData)=>{
//                         if(err) console.log(err)
//                         else{
//                             try {
//                                 data=JSON.parse(currentUserData)
//                             } catch (err) {
//                                 console.log('error', err);
//                             }
//                             var user_id=data[0].user_id
//                             var sql="SELECT train.train_no, train.train_name, train.source_station, train.destination_station, train.train_date, train.train_time, ticket.pnr, ticket.user_name, ticket.user_id, ticket.seat_no, ticket.passengers FROM train INNER JOIN ticket ON train.train_no=ticket.train_no AND ticket.user_id=?;"
//                             conn.query(sql, [user_id], function(err, result, fields){
//                                 res.render('account2.pug',{value:data[0],name:data[0].user_name})
//                             })
//                         }
//                     })
//                 }
//             })
//             if(result.length>0){
//                 var items=result[0];
//                 res.render('account2.pug',{value:data[0], items, name:data[0].user_name})
//             }  
//             else{
//                 res.render('account.pug',{value:data[0], name:data[0].user_name})
//             }
//         }
//     })
// })

app.post("/userlogin",urlencodedParser,(req,res)=>{
    var id=req.body.id
    var password=req.body.password
    var sql="SELECT * FROM register WHERE user_id = ? and pass= ?"
    var sql1="SELECT * FROM admin_data WHERE admin_id = ? and admin_pass= ?"
    conn.query(sql1,[id, password], function(err, result, fields){
        if(result.length > 0){
            fs.writeFile('./currentUser.json',JSON.stringify(result),err=>{
                if(err) console.log(err)
                else{
                    res.render('admin.pug')
                }
            })
        }else{
            conn.query(sql,[id, password], function(err, result, fields){
                if(result.length > 0){
                    fs.writeFile('./currentUser.json',JSON.stringify(result),err=>{
                        if(err) console.log(err)
                        else{
                            fs.readFile('./currentUser.json','utf-8',(err,currentUserData)=>{
                                if(err) console.log(err)
                                else{
                                    try {
                                        var data=JSON.parse(currentUserData)
                                        var user_id=data[0].user_id
                                        var sql="SELECT train.train_no, train.train_name, train.source_station, train.destination_station, train.train_date, train.train_time, ticket.pnr, ticket.user_name, ticket.user_id, ticket.seat_no, ticket.passengers FROM train INNER JOIN ticket ON train.train_no=ticket.train_no AND ticket.user_id=?;"
                                        conn.query(sql, [user_id], function(err, result, fields){
                                            if(result.length>0){
                                                var items=result;
                                                res.render('account2.pug',{value:data[0], items, name:data[0].user_name})
                                            }  
                                            else{
                                                res.render('account.pug',{value:data[0], name:data[0].user_name})
                                            }
                                        })
                                    } catch (err) {
                                        console.log('error', err);
                                    }
                                }
                            })
                        }
                    })
                }else{
                    res.render('login.pug')
                    alert('User Id or password incorrect.')
                }
            })
        }
    })
})

app.get("/notregister",(req,res)=>{
        res.render('register.pug')
})

app.get("/register",(req,res)=>{
    fs.readFile('./currentUser.json','utf-8',(err,currentUserData)=>{
        if(err) console.log(err)
        else{
            try {
                var data=JSON.parse(currentUserData)
            } catch (err) {
                console.log('error', err);
            }
        }
    })
})

// app.post('/search', function(req, res){

//     conn.connect(function(err){
//         if(err){
//             console.log(err);
//         }
//         else{
//             var sql="SELECT * FROM train"
//             conn.query(sql, function(err, rows, fields){
//                 if(err) throw err
//                 console.log(rows)
//                 res.render('search_view.pug', {items: rows})
//             })
//         }
//     })
// })

app.post('/logout',function(req, res){
    var path = __dirname+'/currentUser.json'
    fs.unlink(path,function(err){
        if(err) console.log(err)
        else{
            var name="Login"
            res.render('index.pug',{name})
        }
    })
})

// app.post("/search_train", (req, res) => {
//     var path = __dirname+'/currentUser.json'
//         if(fs.existsSync(path)){
//             fs.readFile('./currentUser.json','utf-8',(err,currentUserData)=>{
//                 if(err) console.log(err)
//                 else{
//                     try {
//                         var data=JSON.parse(currentUserData)
//                         var name=data[0].user_name
//                     } catch (err) {
//                         console.log('error', err);
//                     }
//                 }   
//             })
//         }
//         else{
//             var name="Login"
//         }
//     conn.connect(function(err){
//         if(err){
//             console.log(err);
//         }
//         var sql="SELECT * FROM train WHERE train_no = ?"
//         value=req.body.train_no_search
//         conn.query(sql, [value], function (err, result) {
//             if (result.length > 0) {
//                 res.render('search_data.pug',{items:result,name})
//             }
//             else{
//                 res.render('search_ticket.pug',{name})
//                 alert("No such train found.")
//             }
//         })
//     })
// })

app.post("/book",(req,res)=>{
    var path = __dirname+'/currentUser.json'
    var name
    if(fs.existsSync(path)){
        fs.readFile('./currentUser.json','utf-8',(err,currentUserData)=>{
            if(err) console.log(err)
            else{
                try {
                    var data=JSON.parse(currentUserData)
                    name=data[0].user_name
                } catch (err) {
                    console.log('error', err);
                }
            }   
        })
    }
    else{
        name="Login"
    }
    var sql="SELECT * FROM train WHERE source_station = ? and destination_station=?"
    source=req.body.book_s
    destination=req.body.book_d
    conn.query(sql, [source, destination], function (err, result, fields) {
        if (result.length > 0) {
            res.render('book2.pug',{name, items:result})
        }
        else{
            res.render('book.pug',{name})
            alert("No such train found.")
        }
    })
})

app.post("/cancel",(req,res)=>{
    var path = __dirname+'/currentUser.json'
    var name
        if(fs.existsSync(path)){
            fs.readFile('./currentUser.json','utf-8',(err,currentUserData)=>{
                if(err) console.log(err)
                else{
                    try {
                        var data=JSON.parse(currentUserData)
                        name=data[0].user_name
                    } catch (err) {
                        console.log('error', err);
                    }
                }   
            })
        }
        else{
            name="Login"
        }
        value=req.body.cancel
        var sql="SELECT train.train_no, train.train_name, train.source_station, train.destination_station, train.train_date, train.train_time, ticket.pnr, ticket.user_name, ticket.user_id, ticket.seat_no, ticket.passengers FROM train INNER JOIN ticket ON train.train_no=ticket.train_no AND ticket.pnr=?;"
        conn.query(sql, [value], function(err, result, fields){        
            if (result.length > 0) {
                res.render('cancel2.pug',{items:result,name})
            }
            else{
                res.render('cancel.pug',{name})
                alert("No such ticket found.")
            }
        })
    })

app.post("/pnr_status",(req,res)=>{
    var path = __dirname+'/currentUser.json'
    var name
        if(fs.existsSync(path)){
            fs.readFile('./currentUser.json','utf-8',(err,currentUserData)=>{
                if(err) console.log(err)
                else{
                    try {
                        var data=JSON.parse(currentUserData)
                        name=data[0].user_name
                    } catch (err) {
                        console.log('error', err);
                    }
                }   
            })
        }
        else{
            name="Login"
        }
        value=req.body.pnr_status
        var sql="SELECT train.train_no, train.train_name, train.source_station, train.destination_station, train.train_date, train.train_time, ticket.pnr, ticket.user_name, ticket.user_id, ticket.seat_no, ticket.passengers FROM train INNER JOIN ticket ON train.train_no=ticket.train_no AND ticket.pnr=?;"
        conn.query(sql, [value], function(err, result, fields){        
            if (result.length > 0) {
                res.render('pnr_status2.pug',{items:result,name})
            }
            else{
                res.render('pnr_status.pug',{name})
                alert("No such ticket found.")
            }
        })
    })

app.post("/admin_search", (req, res)=>{
    var sql="SELECT * FROM train WHERE train_no=?"
    value=req.body.train_no
    conn.query(sql, [value], function (err, result, fields) {
        if (result.length > 0) {
            res.render('admin2.pug',{items:result})
        }
        else{
            res.render('admin.pug')
            alert("No such train found.")
        }
    })
})

app.post("/search_station",(req,res)=>{
    var path = __dirname+'/currentUser.json'
    var name
    if(fs.existsSync(path)){
        fs.readFile('./currentUser.json','utf-8',(err,currentUserData)=>{
            if(err) console.log(err)
            else{
                try {
                    var data=JSON.parse(currentUserData)
                    name=data[0].user_name
                } catch (err) {
                    console.log('error', err);
                }
            }   
        })
    }
    else{
        name="Login"
    }
    var sql="SELECT * FROM train WHERE source_station = ? or destination_station=?"
    value=req.body.search_station
    conn.query(sql, [value,value], function (err, result, fields) {
        if (result.length > 0) {
            res.render('search_station2.pug',{items:result,name})
        }
        else{
            res.render('search_station.pug',{name})
            alert("No such train found.")
        }
    })
})

app.post("/search_train_nameno",(req,res)=>{
    var path = __dirname+'/currentUser.json'
    var name
        if(fs.existsSync(path)){
            fs.readFile('./currentUser.json','utf-8',(err,currentUserData)=>{
                if(err) console.log(err)
                else{
                    try {
                        var data=JSON.parse(currentUserData)
                        name=data[0].user_name
                    } catch (err) {
                        console.log('error', err);
                    }
                }   
            })
        }
        else{
            name="Login"
        }
    conn.connect(function(err){
        if(err){
            console.log(err);
        }
        var sql="SELECT * FROM train WHERE train_no = ? or train_name=?"
        value=req.body.search_train_nameno
        conn.query(sql, [value,value], function (err, result, fields) {
            if (result.length > 0) {
                res.render('search_train_nameno2.pug',{items:result,name})
            }
            else{
                res.render('search_train_nameno.pug',{name})
                alert("No such train found.")
            }
        })
    })
})

app.get("/pnr_status",(req,res)=>{
    var path = __dirname+'/currentUser.json'
    var name
    if(fs.existsSync(path)){
        fs.readFile('./currentUser.json','utf-8',(err,currentUserData)=>{
            if(err) console.log(err)
            else{
                try {
                    var data=JSON.parse(currentUserData)
                    name=data[0].user_name
                } catch (err) {
                    console.log('error', err);
                }
                res.render('pnr_status.pug',{value:data[0], name})
            }
        })
    }
    else{
        name="Login"
        res.render('pnr_status.pug',{name})
    }
})

app.get("/book",(req,res)=>{
    var path = __dirname+'/currentUser.json'
    var name
    if(fs.existsSync(path)){
        fs.readFile('./currentUser.json','utf-8',(err,currentUserData)=>{
            if(err) console.log(err)
            else{
                try {
                    var data=JSON.parse(currentUserData)
                    name=data[0].user_name
                } catch (err) {
                    console.log('error', err);
                }
                res.render('book.pug',{value:data[0], name})
            }
        })
    }
    else{
        name="Login"
        res.render('book.pug',{name})
    }
})

app.get("/cancel",(req,res)=>{
    var path = __dirname+'/currentUser.json'
    var name
    if(fs.existsSync(path)){
        fs.readFile('./currentUser.json','utf-8',(err,currentUserData)=>{
            if(err) console.log(err)
            else{
                try {
                    var data=JSON.parse(currentUserData)
                    name=data[0].user_name
                } catch (err) {
                    console.log('error', err);
                }
                res.render('cancel.pug',{value:data[0], name})
            }
        })
    }
    else{
        name="Login"
        res.render('cancel.pug',{name})
    }
})

app.get("/search_train_nameno",(req,res)=>{
    var path = __dirname+'/currentUser.json'
    var name
    if(fs.existsSync(path)){
        fs.readFile('./currentUser.json','utf-8',(err,currentUserData)=>{
            if(err) console.log(err)
            else{
                try {
                    var data=JSON.parse(currentUserData)
                    name=data[0].user_name
                } catch (err) {
                    console.log('error', err);
                }
                res.render('search_train_nameno.pug',{value:data[0], name})
            }
        })
    }
    else{
        name="Login"
        res.render('search_train_nameno.pug',{name})
    }
})

app.get("/search_station",(req,res)=>{
    var path = __dirname+'/currentUser.json'
    var name
    if(fs.existsSync(path)){
        fs.readFile('./currentUser.json','utf-8',(err,currentUserData)=>{
            if(err) console.log(err)
            else{
                try {
                    var data=JSON.parse(currentUserData)
                    name=data[0].user_name
                } catch (err) {
                    console.log('error', err);
                }
                res.render('search_station.pug',{value:data[0], name})
            }
        })
    }
    else{
        name="Login"
        res.render('search_station.pug',{name})
    }
})

// app.get("/paymentf",(req,res)=>{
//     var path = __dirname+'/currentUser.json'
//     if(fs.existsSync(path)){
//         fs.readFile('./currentUser.json','utf-8',(err,currentUserData)=>{
//             if(err) console.log(err)
//             else{
//                 try {
//                     var data=JSON.parse(currentUserData)
//                 } catch (err) {
//                     console.log('error', err);
//                 }
//                 res.render('paymentf.pug',{value:data[0], name:data[0].user_name})
//             }
//         })
//     }
//     else{
//         var name="Login"
//         res.render('paymentf.pug',{name})
//     }
// })

app.post('/payment', (req,res)=>{
    var path = __dirname+'/currentUser.json';
    var name;
    var value=req.body.train_no;
    var value1=req.body.qty;
    if(fs.existsSync(path)){
        fs.readFile('./currentUser.json','utf-8',(err,currentUserData)=>{
            if(err){
                console.log(err)
            }    
            else{
                try {
                    var data=JSON.parse(currentUserData)
                    name=data[0].user_name
                } catch (err) {
                    console.log('error', err);
                }
            }
            res.render('paymentf.pug',{train_no:value, name, qty:value1})
        })
    }
    else{
        name="Login"
        res.render('login.pug',{value, name, qty:value1})
    }
})

app.post('/paymentf',(req, res)=>{
    var path = __dirname+'/currentUser.json'
    var name
    var data
    if(fs.existsSync(path)){
        fs.readFile('./currentUser.json','utf-8',(err,currentUserData)=>{
            if(err){
                console.log(err)
            }    
            else{
                try {
                    data=JSON.parse(currentUserData)
                    name=data[0].user_name
                } catch (err) {
                    console.log('error', err);
                }
            }   
        })
    }
    else{
        name="Login"
    }
    var value=req.body.train_no
    var value1=req.body.qty
    var sql1="SELECT * FROM train WHERE available_seats > ? AND train_no=?;"
    conn.query(sql1, [value1-1, value], function (err, result1, fields) {
        if (result1.length>0) {
            var sql2="UPDATE train SET available_seats=(available_seats-?) WHERE train_no=?;"
            conn.query(sql2, [value1,value], function (err, result2, fields){
                if(err){
                    console.log(err)
                    res.render('book.pug',{name})
                    alert("Booking failed.")
                } 
                else{
                    var sql3="INSERT INTO ticket VALUES (?, ?,?,?,?,?);"
                    var pnr='2022'+result1[0].train_no+(result1[0].total_seats-result1[0].available_seats)
                    conn.query(sql3, ['2022'+result1[0].train_no+(result1[0].total_seats-result1[0].available_seats),result1[0].train_no,name,data[0].user_id,(result1[0].total_seats-result1[0].available_seats),value1], function (err, result, fields){
                        if(err){
                            console.log(err)
                        }
                        else{
                            var sql4="SELECT train.train_no, train.train_name, train.source_station, train.destination_station, train.train_date, train.train_time, ticket.pnr, ticket.user_name, ticket.user_id, ticket.seat_no, ticket.passengers FROM train INNER JOIN ticket ON train.train_no=ticket.train_no AND ticket.pnr=?;"
                            conn.query(sql4, [pnr], function(err, result3, fields){
                                if(err){
                                    console.log(err)
                                }
                                else{
                                    var items=result3[0];
                                    res.render('ticket.pug',{items, name})
                                    alert("Ticket booked successfully.")
                                }
                            })
                        }
                    })
                }
            })
        }
        else if(err){
            res.render('book.pug',{name})
            alert("Booking failed.")
        }
    })
})

app.post('/paymentr',(req, res)=>{
    var path = __dirname+'/currentUser.json'
    var name
    var data
    if(fs.existsSync(path)){
        fs.readFile('./currentUser.json','utf-8',(err,currentUserData)=>{
            if(err){
                console.log(err)
            }    
            else{
                try {
                    data=JSON.parse(currentUserData)
                    name=data[0].user_name
                } catch (err) {
                    console.log('error', err);
                }
            }   
        })
    }
    else{
        name="Login"
    }
    var value=req.body.pnr
    var sql3="SELECT passengers FROM ticket WHERE pnr=?"
    conn.query(sql3, [value], function (err, result2, fields) {
        var passengers=result2[0].passengers
        var sql1="UPDATE train SET available_seats=(available_seats + ?) WHERE train_no IN (SELECT train_no FROM ticket WHERE pnr=?);"
        conn.query(sql1, [passengers,value], function (err, result1, fields) {
            var sql2="DELETE FROM ticket WHERE pnr=?;"
            conn.query(sql2, [value], function (err, result, fields){
                if(err){
                    console.log(err)
                }
                else{
                    res.render('cancel.pug',{name})
                    alert("Ticket cancelled")
                    alert("Money will be reflected to your account within 24 working hours")
                }
            })
        })
    })
})
app.listen(port, ()=>{
    console.log(`The application started on port ${port}`)
})