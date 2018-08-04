import React, { Component } from 'react';

import { BrowserRouter, Switch } from 'react-router-dom';
import { Route } from 'react-router';

import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';
import LoginSuccess from './components/LoginSuccess';
import Logout from './components/Logout';
import Profile from './components/Profile';
import Timeline from './components/Timeline';
import SearchUsers from './components/SearchUsers';
import Header from './components/Header';
import Footer from './components/Footer';
import NotFound from './components/NotFound';

import './App.css';

const debugMode = false;
localStorage.setItem('debugMode', debugMode); 


class App extends Component {
  
  render() {
    return (
      <BrowserRouter>
        <div>
          <Header/>
          
          <div className="container">
            <Switch>
              <Route exact path="/" component={Home} />
              <Route exact path="/register" component={Register} />
              <Route exact path="/login" component={Login} />
              <Route exact path="/loginsuccess" component={LoginSuccess} />
              <Route exact path ="/logout" component ={Logout} />
              <Route  path ="/profile/:uid" component ={Profile} />
              <Route  path ="/timeline" component ={Timeline} />
              <Route  path ="/searchusers" component ={SearchUsers} />
              
              
              <Route component={NotFound} />
            </Switch>
          </div>
          
          <Footer/>
        </div>
      </BrowserRouter>
    )
  }
}

export default App;