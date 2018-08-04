import React, { Component } from 'react';
import { form,FormGroup, FormControl, HelpBlock, ControlLabel, Button, Alert } from 'react-bootstrap';
import $ from 'jquery';
import  { Redirect } from 'react-router-dom'

 const loginEvent = new CustomEvent('login', {detail: {logged: true}});

const INPUT_TYPES={EMAIL: 'Email', PASSWORD: 'Password'};

function FieldGroup({ id, label, help, ...props }) {
    return (
      <FormGroup controlId={id}>
        <ControlLabel>{label}</ControlLabel>
        <FormControl {...props} />
        {help && <HelpBlock>{help}</HelpBlock>}
      </FormGroup>
    );
  }

class Login extends Component {
  constructor(props, context) {
    super(props, context);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
   
   
    this.handleResponse = this.handleResponse.bind(this);
    var  val = [];
   val[INPUT_TYPES.EMAIL] ="";
   val[INPUT_TYPES.PASSWORD] ="";
    this.state ={values: val, ShouldRedirect: false, RedirectTo: '/loginsuccess'};
    $('.alert-danger').addClass('collapse');


  }
  handleResponse(data)
  {
      if(!data.Success)
      {
        $('.alert-danger').removeClass('collapse');
      }
      else
      {
        localStorage.setItem('User', JSON.stringify(data.User));
          console.log(data.User);
          window.dispatchEvent(loginEvent);
          this.setState({ShouldRedirect: true});
      }
  }

  handleSubmit(e)
  {

    var values = this.state.values;
    var cookie = document.cookie;
    var match = cookie.match(/\buser_id=([a-zA-Z0-9]{32})/); 
    var fCookie =match ? match[1] : null;

    fetch('/user/login', {
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        Email: values[INPUT_TYPES.EMAIL],
        Password: values[INPUT_TYPES.PASSWORD],
        Cookie: fCookie
    })
    }).then((resp)=>resp.json()).then(data =>this.handleResponse(data));
    


  }
  handleChange(fieldType, e) {
 
    var fieldsValues = this.state.values;
    fieldsValues[fieldType] = e.target.value;
    this.setState({values: fieldsValues}); 
   
   }
  render() {

    if (this.state.ShouldRedirect) {
      return <Redirect to={this.state.RedirectTo}/>;
    }
    return (
        <div id="login-form">
      <h1>Login</h1>
      <form>
       <FieldGroup
      id="formControlsEmail"
      type="email"
      label="Email address"
      placeholder="Enter email"
      onChange ={this.handleChange.bind(this, INPUT_TYPES.EMAIL)}
    />

        <FieldGroup id="formControlsPassword" label="Password" type="password"  onChange ={this.handleChange.bind(this, INPUT_TYPES.PASSWORD)} />

              <Button onClick={this.handleSubmit.bind(this)}>Log In</Button>
              <Alert bsStyle="danger" className ="collapse" id ="error-message">Can't log in. Incorrect Email or Password.</Alert>
   
   
    </form>
    </div>
    )
  }
}

export default Login;
export {loginEvent};