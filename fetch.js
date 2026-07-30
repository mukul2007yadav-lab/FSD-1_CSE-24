async function test(){
    console.log("message 1");
   const response  = await fetch("./student_data.json");
   console.log(response.status);
  const stdn= await response.json();
  return stdn;
  console.log("message 2");
}
test().then((res)=>{
  console.log(res)
})
console.log("message 3")