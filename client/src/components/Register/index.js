import React, { Component } from 'react';
import { form,FormGroup, FormControl, HelpBlock, ControlLabel, Button, Alert } from 'react-bootstrap';
import { isRegExp } from 'util';
import  { Redirect } from 'react-router-dom'
import {loginEvent} from '../Login'
var countrylist = require('country-list')();
const INPUT_TYPES ={USERNAME:'Username', EMAIL:'Email', PASSWORD:'Password', PASSWORD_CONF:'Password_conf', COUNTRY:'country', AGE:'age' }
const VALIDATION_TYPES ={LENGTH:'Length', MATCHING:'Matching', RIGHT_FORMAT:'Right Format', EMPTY:'Empty', ALREADY_EXISTS:'Exists'}
const USERNAME_MIN_LENGTH = 5;
const PASSWORD_MIN_LENGTH = 6;
var cantSubmit=false;
//Regesteration form
function FieldGroup({ id, label, help, ...props }) {
  return (
    <FormGroup controlId={id}>
      <ControlLabel>{label}</ControlLabel>
      <FormControl {...props} />
      {help && <HelpBlock>{help}</HelpBlock>}
    </FormGroup>
  );
}



function ValidationMessages(props)
{
  var fieldType = props.fieldType;

  var errors = props.errorMsgs[fieldType];


  if(errors != null)
  {
    
  var currentErrors = [];
  Object.keys(VALIDATION_TYPES).forEach(function(val,index)
  {
    if(val)
    {
      var er = errors[VALIDATION_TYPES[val]];
      if(er)
      {
      if(er.length>0)
      {
      currentErrors.push(er);
      }
      }
    }
  });
  if(currentErrors.length>0)
  var result = currentErrors.map( function(er){
    return  <li key = {er}><Alert bsStyle="danger" className='error-message'>{er}</Alert></li>;});
    if(result)
  return <ul>{result}</ul>;};

  


return <p></p>;

}

class Register extends Component {
  componentWillMount(){
    document.addEventListener('mousedown', this.handleClickOutside);
   

  }
  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }
  

  constructor(props, context) {
    super(props, context);

    this.handleChange = this.handleChange.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleResponse = this.handleResponse.bind(this);
    var fieldsValues = [];
    var errorMsgs = [];
  
    this.state = {
      values: fieldsValues,
      errors: errorMsgs,
      lastClickedId: "formControlsUsername",
      userExists: false,
      emailExists: false,
      ShouldRedirect: false
    };

  }


  handleChange(fieldType, e) {
   
   var fieldsValues;


   if(this.state !== undefined)
   if(this.state.values)
   fieldsValues = this.state.values;
   fieldsValues[fieldType] = e.target.value;
   this.setState({values: fieldsValues});
   this.validateForm(fieldType);

  
  }
  handleResponse(data)
  {
    var err = this.state.errors;
      var userExists = data.userExists;
      var emailExists = data.emailExists;
      if(userExists)
        {
         var e =  err[INPUT_TYPES.USERNAME];
         e[VALIDATION_TYPES.ALREADY_EXISTS] = "Username already exists. Please choose another one.";
         err[INPUT_TYPES.USERNAME] = e;
          
        }

      if(emailExists)
      {

        var e2=  err[INPUT_TYPES.EMAIL];
        var val = VALIDATION_TYPES.ALREADY_EXISTS;
         e2[val] = "Email already exists. Please use another one.";
         err[INPUT_TYPES.EMAIL] = e2;

      }
      this.setState({errors: err});

      if(!emailExists &! userExists)
      {
        localStorage.setItem('User', data.User);
        window.dispatchEvent(loginEvent);
        console.log("Recieved back User");
        console.log(data.User);
          this.setState({ShouldRedirect: true});
      }
  }
  
  handleSubmit(e)
  {

    e.preventDefault();
 /*   Object.keys(INPUT_TYPES).forEach(function(t){
      this.validateForm(INPUT_TYPES[t]);
    });*/

    var errCount = document.getElementById('reg-form').querySelectorAll('.alert-danger').length;
    if(errCount == 0)
    {
      var values = this.state.values;

      var j = JSON.stringify({
        Username: values[INPUT_TYPES.USERNAME],
        Email: values[INPUT_TYPES.EMAIL],
        Password: values[INPUT_TYPES.PASSWORD],
        Country: values[INPUT_TYPES.COUNTRY],
        Age: values[INPUT_TYPES.AGE]
      });

      fetch('/user/create', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Username: values[INPUT_TYPES.USERNAME],
          Email: values[INPUT_TYPES.EMAIL],
          Password: values[INPUT_TYPES.PASSWORD],
          Country: values[INPUT_TYPES.COUNTRY],
          Age: values[INPUT_TYPES.AGE]
        })
      }).then((resp)=>resp.json()).then(data =>this.handleResponse(data));
      
    }

  }
  handleClickOutside(event)
  {
  
    var _lastClickedId = this.state.lastClickedId;
    if(event.path)
    if(event.path[0])
    if(event.path[0].id !== _lastClickedId){
      //formControlsUsernameformControlsEmail
      if(_lastClickedId === 'formControlsUsername')
      {
        this.CheckIfAlreadyExists(INPUT_TYPES.USERNAME, this.state.values[INPUT_TYPES.USERNAME], true)
      }
      else if (_lastClickedId === 'formControlsEmail')
      {
        this.CheckIfAlreadyExists(INPUT_TYPES.EMAIL, this.state.values[INPUT_TYPES.EMAIL], true)

      }
      _lastClickedId = event.path[0].id;
      this.setState({lastClickedId: _lastClickedId })

    }
  }

  validateForm(fieldType)
  {  
    var fieldsValues = this.state.values;
      let inp = fieldsValues[fieldType];
      var err = this.state.errors;
      var errorMap = err[fieldType];
      if(errorMap == null)
        errorMap =[];
    if(fieldType == INPUT_TYPES.USERNAME)
    {
      if(inp.length ==0)
      {
        errorMap[VALIDATION_TYPES.EMPTY] ="Username can't be left empty"; 
      }
      else
      {
        errorMap[VALIDATION_TYPES.EMPTY] ="";
      }
      if (inp.length < USERNAME_MIN_LENGTH)
      {
        errorMap[VALIDATION_TYPES.LENGTH] = "Username has to be at least "+USERNAME_MIN_LENGTH+" characters";
      }
      else
      {
        errorMap[VALIDATION_TYPES.LENGTH] ="";
      }
      if(this.CheckIfAlreadyExists(fieldType, inp, false))
      {
        errorMap[VALIDATION_TYPES.ALREADY_EXISTS] ="Username already exists. Please choose another one.";
      }
      else
      {
        errorMap[VALIDATION_TYPES.ALREADY_EXISTS] = "";
      }
    }
    else if(fieldType == INPUT_TYPES.EMAIL)
    {
      //count @s and .s in Email input
      var wrongEmailFormat=true;
      var atCount = inp.split('@').length-1;
      var dotCount = inp.split('.').length-1;
      if(atCount==1 && dotCount ==1)
      {
        //check if @ before .
        var atBeforeDot = (inp.indexOf('@') < inp.indexOf('.'))

        if(atBeforeDot)
        {
          wrongEmailFormat =false;
          errorMap[VALIDATION_TYPES.RIGHT_FORMAT] ="";
        }
      }

      if(wrongEmailFormat)
      {
        errorMap[VALIDATION_TYPES.RIGHT_FORMAT] = "Please enter a correct email";
      }

      if(this.CheckIfAlreadyExists(fieldType, inp, false))
      {
        errorMap[VALIDATION_TYPES.ALREADY_EXISTS] ="Email already exists. Please choose another one.";
      }
      else 
      {
        errorMap[VALIDATION_TYPES.ALREADY_EXISTS] = "";

      }

      if(inp.length ==0)
      {
        errorMap[VALIDATION_TYPES.EMPTY] ="Email can't be left empty"; 
      }
      else
      {
        errorMap[VALIDATION_TYPES.EMPTY] ="";
      }

    }
    else if(fieldType == INPUT_TYPES.PASSWORD)
    {
      if(inp.length ==0)
      {
        errorMap[VALIDATION_TYPES.EMPTY] ="Password can't be left empty"; 
      }
      else
      {
        errorMap[VALIDATION_TYPES.EMPTY] ="";
      }

      if (inp.length < PASSWORD_MIN_LENGTH)
      {
        errorMap[VALIDATION_TYPES.LENGTH] = "Password has to be at least "+PASSWORD_MIN_LENGTH+" characters";
      }
      else
      {
        errorMap[VALIDATION_TYPES.LENGTH] ="";
      }
    }

    else if(fieldType == INPUT_TYPES.PASSWORD_CONF)
    {
      var passVal = fieldsValues[INPUT_TYPES.PASSWORD];

      if(inp != passVal)
      {
        errorMap[VALIDATION_TYPES.MATCHING] = "Password confirmation doesn't match";
      }
      else
      {
        errorMap[VALIDATION_TYPES.MATCHING] = "";
      }
    }

    else if(fieldType == INPUT_TYPES.AGE)
    {
      if(inp.length ==0)
      {
        errorMap[VALIDATION_TYPES.EMPTY] ="Age can't be left empty"; 
      }
      else
      {
        errorMap[VALIDATION_TYPES.EMPTY] ="";
      }
    }

   err[fieldType] = errorMap;
   this.setState({errors: err}); 
   //error-message
   var errCount = document.getElementById('reg-form').querySelectorAll('.alert-danger').length;
   cantSubmit = (errCount>0); 

  }

  CheckIfAlreadyExists(fieldType, value, searchDB)
  {
    if(searchDB)
    {
    }
    return false;
  }

  render() {
    if (this.state.ShouldRedirect) {
      return <Redirect to={'/login'}/>;
    }
    var countries = countrylist.getNames();
    var cMap = countries.map(function(countryName){
    return ( <option key = {countryName} value = {countryName}>{countryName}</option>);
   });
    return (
      <div id="reg-form">
       <h1>Register</h1>
       <form>
        <FieldGroup
      id="formControlsUsername"
      type="text"
      label="Username"
      placeholder="Enter username"
      onChange ={this.handleChange.bind(this, INPUT_TYPES.USERNAME)
      }
    />
    <ValidationMessages errorMsgs={this.state.errors} fieldType ={INPUT_TYPES.USERNAME} />
    <FieldGroup
      id="formControlsEmail"
      type="email"
      label="Email address"
      placeholder="Enter email"
      onChange ={this.handleChange.bind(this, INPUT_TYPES.EMAIL)}
    />
    <ValidationMessages errorMsgs={this.state.errors} fieldType ={INPUT_TYPES.EMAIL } />

    <FieldGroup id="formControlsPassword" label="Password" type="password"  onChange ={this.handleChange.bind(this, INPUT_TYPES.PASSWORD)} />
    <ValidationMessages errorMsgs={this.state.errors} fieldType ={INPUT_TYPES.PASSWORD } />

    <FieldGroup id="formControlsPasswordConfirm" label="Confirm Password" type="password" onChange ={this.handleChange.bind(this, INPUT_TYPES.PASSWORD_CONF)}  />
    <ValidationMessages errorMsgs={this.state.errors} fieldType ={INPUT_TYPES.PASSWORD_CONF } />

    <FormGroup controlId="formSelectCountry">
      <ControlLabel>Country</ControlLabel>
      <FormControl componentClass="select" onChange ={this.handleChange.bind(this, INPUT_TYPES.COUNTRY)}>
      {cMap}
      </FormControl>
    </FormGroup>
    <FieldGroup
      id="formControlsAge"
      type="number"
      label="Age"
      placeholder="Enter age"
      onChange ={this.handleChange.bind(this, INPUT_TYPES.AGE)}
    />
        <ValidationMessages errorMsgs={this.state.errors} fieldType ={INPUT_TYPES.AGE } />
      <Button disabled={cantSubmit} onClick={this.handleSubmit}>Register</Button>
    </form>
      </div>
    )
  }
}

export default Register;