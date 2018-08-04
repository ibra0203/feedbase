import React, { Component } from 'react';
import axios from 'axios';
import  { Redirect } from 'react-router-dom';
var logoutEvent = new CustomEvent('logout',{detail: {logged: false}});
class Logout extends Component {
  constructor(props, context) {
    super(props, context);
    this.handleResponse = this.handleResponse.bind(this);
    axios.get('/_logout').then(data =>this.handleResponse(data));
    this.state = {ShouldRedirect: false, RedirectTo: '/'};
  }
  handleResponse(data)
  {
    localStorage.removeItem('User');
    this.setState({ShouldRedirect: true, RedirectTo: '/'});
    window.dispatchEvent(logoutEvent);

  }
  render() {
    if (this.state.ShouldRedirect) {
        return <Redirect to={this.state.RedirectTo}/>;
      }
    return (
        <h1></h1>
    )
  }
}

export default Logout;