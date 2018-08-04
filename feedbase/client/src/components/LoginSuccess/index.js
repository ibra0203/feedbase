import React, { Component } from 'react';
import {Jumbotron, Grid, Row, Col, Image } from 'react-bootstrap';
import  { Redirect } from 'react-router-dom';


class LoginSuccess extends Component {
  constructor(props, context) {
    super(props, context);
        var user = JSON.parse(localStorage.getItem("User") );
        this.state = {User: user, ShouldRedirect: false, RedirectTo: '/'}
        this.HandleRedirect = this.HandleRedirect.bind(this);
        setTimeout( this.HandleRedirect , 5000 );


  }
    HandleRedirect(e)
    {
        this.setState({ShouldRedirect: true});

    }


  render() {
    if (this.state.ShouldRedirect) {
        return <Redirect to={this.state.RedirectTo}/>;
      }
    return (
        <Jumbotron>
        <h1>Welcome back,{this.state.User.username}!</h1>
        <p>
          We've missed you!
        </p>
        <Grid>
  <Row>
    <Col xs={6} md={4}>
    </Col>
    <Col xs={6} md={4}>
      <img src="/loading.gif"/>

    </Col>
    <Col xs={6} md={4}>
    </Col>
  </Row>
</Grid>;
     
      </Jumbotron>
    )
  }
}

export default LoginSuccess;