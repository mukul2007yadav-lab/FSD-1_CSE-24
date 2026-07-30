//Synchronus:blocking js and asynchronus function:non-blocking js
console.log("Task 3");

function hello(){
    console.log("Task1");
}
hello();
console.log("Task 2");
setTimeout(function(){
    console.log("timeout task.");
},2000);

// callback process:passes as an arguement to another function and cal

function hii(n1,n2){

    return n1+n2;
}
let a=5;
let b=6;
console.log(hii(a,b));
//arrow function->
// function hello(){}