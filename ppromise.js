//promises for asynch is an object
//js single threaded

const promiseOne=new Promise((resolve,reject)=>{
    
    // resolve("Promises passes by using resolve")
    let username="Mukul Yadav"
    let password="abc"
    if (password!=""){
        resolve(`User name is ${username} and password is ${password}`);}
        else{
            reject("error......")
        }
});
promiseOne
.then((result)=>{
console.log("Success",result);
})
.catch((error)=>{
console.log("caught an error",error)
}) 

