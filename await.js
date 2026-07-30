//Async/wait
console.log("1");
async function test(){
    console.log("2");
    await console.log("3");
    console.log("4");
}
t1=test();
console.log("5");
//create promises that will print password and username if using resolve and password not found then it will call
//reject statement and print error message.