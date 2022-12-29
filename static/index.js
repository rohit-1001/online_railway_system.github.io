// function func(){
//     document.getElementById("a").style.color="blue";
// }
// function func(){
//     document.getElementById("ab").style.color="blue";
// }
// function func(){
//     document.getElementById("abc").style.color="blue";
// }
// function func(){
//     document.getElementById("abcd").style.color="blue";
// }
// function func(){
//     document.getElementById("abcde").style.color="blue";
// }
// function func(){
//     document.getElementById("abcdef").style.color="blue";
// }
// function func(){
//     document.getElementById("abcdefg").style.color="blue";
// }
// document.getElementById("a").addEventListener("mouseover", functiona());

// function changeText(id){
//     id.innerHTML="Hello";
//     id.color="green";
// }
// function changeText1(id){
//     id.innerHTML="Bye";
//     id.color="yellow";
// }

// const train_info = function() {
//     var value=this.id;
//     if(fs.existsSync(path)){
//         fs.readFile('./currentUser.json','utf-8',(err,currentUserData)=>{
//             if(err) console.log(err)
//             else{
//                 try {
//                     var data=JSON.parse(currentUserData)
//                     var name=data[0].user_name
//                 } catch (err) {
//                     console.log('error', err);
//                 }
//             }   
//         })
//     }
//     else{
//         var name="Login"
//     }
//     console.log("value="+value)
//     conn.connect(function(err){
//         if(err){
//             console.log(err);
//         }
//         else{
//             var sql1="SELECT * FROM train WHERE train_name = ?"
//             conn.query(sql1, [value], function (err, result, fields) {
//                 if (result.available_seats > 0) {
//                     var sql2="UPDATE train SET available_seats=(available_seats-1) WHERE train_name=?;"
//                     conn.query(sql2, [value], function (err, result, fields){
//                         if(err) console.log(err)
//                         else{
//                             res.render('book2.pug',{name})
//                             alert("Ticket booked successfully.")
//                         }
//                     })
//                 }
//                 else if(err){
//                     alert("Booking failed.")
//                 }
//                 else{
//                     res.render('book2.pug',{name})
//                     alert("No such train found.")
//                 }
//             })
//         }
//     })
// }

// function train_info(sel_train) {
//     var selected_train_no=sel_train;
//     console.log(selected_train_no)
// }