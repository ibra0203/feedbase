import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './style.css';

class Footer extends Component {
  render() {
    return (
      <div className="footer">
        <div className="container">
          <div className="footer">
            <hr style={ { margin: "30px 0 10px 0" } } />
            <p>&copy;&nbsp;<Link to='/'>M.Ibrahim</Link> 2018</p>
          </div>
        </div>
      </div>
    )
  }
}

export default Footer;