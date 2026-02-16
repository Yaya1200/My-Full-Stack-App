import "./account.css";
import React,{useEffect, useState} from "react";
import Subject from "./subject";
import axios from "axios";
import { useSearchParams } from "react-router-dom";


function Access() {
  const [value, setvalue] = useState({username:"", password:""})
  const [newpage, setnewpage] = useState(false);
  const [createaccount, setcreateaccount] = useState(false);
  const [searchparams] = useSearchParams();
  function inputs(event){
     let inputname = event.target.name;
     let inputvalue = event.target.value;
     setvalue(prevalue=>({
      ...prevalue, 
      [inputname]: inputvalue
     }))
  }
  useEffect(() => {
  axios.get(`${import.meta.env.VITE_API_URL}/auth/user`, { withCredentials: true })
    .then(res => {
      if (res.data.loggedIn) {
        setnewpage(true);
      }
    });
}, []);


 
  async function inputaccount(k) {
    k.preventDefault();
    try{
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/input/account`, value);
       setcreateaccount(false);
       setvalue({
        username: "",
        password: ""
       })
       alert(response.data);
    }
    catch(error){
      console.error("error", error);
    }
    
  }
  async function checkaccount(k) {
    k.preventDefault();
    try{
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/create/account`, value);
      response.data ? setnewpage(true): alert("incorrect password or username");
      setvalue({
        username: "",
        password: ""
       })
    }
    catch(error){
      console.error("error", error);
    }
    
  }
 async  function GoogleAutentication(){
  window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  

  }

  if(newpage){
    return <Subject/>
  }
  function createaccount1(){
    setcreateaccount(true);
  }

 return createaccount ? (
    <div>
    <h1 style={{textAlign:"center", position: "relative"}}>smart study</h1>
   <form className="form-container" onSubmit={inputaccount}>
    <h1>Create Account</h1>
    <input type="text" name="username" onChange={inputs} placeholder="username" value = {value.username}/>
    <br />
    <input type="password" name="password" onChange={inputs} placeholder="password" value = {value.password}/>
    <br />
  
    <button className="login-using-password" type="submit" onClick={inputaccount}>
  Sign Up
</button>

</form>
  </div>
  ): (
    

    <div>
    <h1 style={{textAlign:"center", position: "relative"}}>smart study</h1>
   <form className="form-container" onSubmit={checkaccount}>
    <h1>Login Now </h1>
    <input type="text" name="username" onChange={inputs} placeholder="username" value = {value.username}/>
    <br />
    <input type="password" name="password" onChange={inputs} placeholder="password" value = {value.password}/>
    <br />
  
    <button className="login-using-password" type="submit" onClick={checkaccount}>
  Login
</button>

<button className="login-using-google" type="button" onClick={GoogleAutentication}>
  <img 
    src="/images/googlesvg.svg" 
    alt="Google logo" 
    style={{ width: "20px", marginRight: "8px", verticalAlign: "middle" }} 
  />
  Login 
</button>


  <button className="create-account" onClick={createaccount1}>Create Account</button>

   
  
  </form>
  </div>)};

export default Access;
