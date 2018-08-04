import React from 'react';
import { Navbar, Nav, NavItem} from 'react-bootstrap';
import $ from 'jquery';
import './style.css';
import { Link } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import axios from 'axios';
//import '../../clientSession';
import {socket} from '../../Helpers/sockets';
const debugMode = localStorage.getItem('debugMode');

var User;
var UserID;
function NavContent(props)
{
  if(!props.isLoggedIn)
  {
    return (
        <Nav>
            <LinkContainer to='/'>

            <NavItem >
               Home
            </NavItem>

            </LinkContainer>
            <LinkContainer to='/register'>
            <NavItem >
               Register
            </NavItem>
            </LinkContainer>
            <LinkContainer to='/login'>
            <NavItem>
               Login
            </NavItem>
            </LinkContainer>
           </Nav>
    );
  }
  else{
    return( 
      <Nav>
          <LinkContainer to='/timeline'>

          <NavItem>
          Timeline
          </NavItem>

          </LinkContainer>
          <LinkContainer to={'/profile' +UserID}>
          <NavItem  >
            Profile
          </NavItem>
          </LinkContainer>

          
          <LinkContainer to='/searchusers'>
          <NavItem >
            Search Users
          </NavItem>
          </LinkContainer>

          <LinkContainer to='/logout'>
          <NavItem>
           Log Out
          </NavItem>
          </LinkContainer>
           </Nav>
    );
  }
}
var loggedIn=false;

export default class Header extends React.Component {
 
  constructor(props) {
    super(props);
    this.HandleUserLogging = this.HandleUserLogging.bind(this);
    this.HandleUserResponse = this.HandleUserResponse.bind(this);

   
    var rawUser = localStorage.getItem('User');
    var _user = null;
    loggedIn = false;
    if(rawUser)
    {
      loggedIn=true;
    }

    

    this.state = {loggedIn: loggedIn};
    
    var _detail ={logged: loggedIn};
    var e ={detail: _detail };
    this.HandleUserLogging(e);
  }
  componentDidMount()
  {
    if(socket)
    {
    socket.on('login', (usr)=>
    {
      var _detail ={logged: true};
      var e ={detail: _detail };
      localStorage.setItem('User', JSON.stringify(usr));
      this.HandleUserLogging(e);
    });

    socket.on('logout', (usr)=>
    {
      var _detail ={logged: false};
      var e ={detail: _detail };
      localStorage.removeItem('User');
      this.HandleUserLogging(e);
    });

    socket.on('session start', ()=>{
      var _detail ={logged: false};
      var e ={detail: _detail };
      localStorage.removeItem('User');
      this.HandleUserLogging(e);    
      console.log("Session start called");
    });
  }
  }
  componentWillUnmount()
  {
    socket.off('login');
    socket.off('logout');
    socket.off('session start');
  }
   HandleUserResponse(data)
  {
    if(data)
    {
      if(data.Success == true)
      {
       var cUser = data.User;
       if(!this.state.loggedIn)
       {
        if(cUser)
        localStorage.setItem('User', JSON.stringify(cUser))
        var _detail ={logged: true};
        var e ={detail: _detail };
        this.HandleUserLogging(e);
       }
      }
      else
      {
      console.log("No User");
      localStorage.removeItem('User');
      var _detail ={logged: false};
      var e ={detail: _detail };
      this.HandleUserLogging(e);
      }
    }
  }
  componentWillMount()
  {
    var cookie = document.cookie;
    var match = cookie.match(/\buser_id=([a-zA-Z0-9]{32})/); 
    var fCookie =match ? match[1] : null;
   // if(!debugMode)
    axios.get('/_getuser/'+fCookie).then(({data})=>this.HandleUserResponse(data));

   

  }
  componentWillUnmount()
  {
  

    
  }
  HandleUserLogging(e)
  {
   
    loggedIn = e.detail.logged;
    this.setState({loggedIn: loggedIn});
    var rawUser = localStorage.getItem('User');
    if(loggedIn&&rawUser)
    {
      try{
        
      var user = JSON.parse(rawUser);
      
      User = user;
      UserID = User.uid;
      }
      catch(err)
      {
         console.log(err);
      }

    }
    else 
    {
    User = null;
    }
  }
  


  render() {


    if(User)
    {
      UserID = "/"+User.uid;
    }
    else
    {
      UserID='';
    }

    return (
      <div>
<Navbar inverse collapseOnSelect>
  <Navbar.Header>
    <Navbar.Brand>
    <Link to="/">Feedbase</Link>
        </Navbar.Brand>
        <Navbar.Toggle />
      </Navbar.Header>
      <Navbar.Collapse>          
          <NavContent isLoggedIn = {loggedIn} />
      </Navbar.Collapse>
    </Navbar>;
      </div>
    );
  }
}