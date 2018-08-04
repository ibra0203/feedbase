import React, { Component } from 'react';
import {Carousel} from 'react-bootstrap';
import './style.css';

class Home extends Component {
  constructor(props, context) {
    super(props, context);


  }

  render() {
    return (
      <div>
      <h1>Home</h1>
      <p>Feedbase is a small social network demo made with React, Firebase and Node.js</p>
      <Carousel>
  <Carousel.Item>
    <img width={600} src="/h1.png" />
    <Carousel.Caption bsClass="text-black">
      <h3>Profile</h3>
      <p>Post on your profile, edit posts and update your profile image</p>
    </Carousel.Caption>
  </Carousel.Item>
  <Carousel.Item>
    <img width={600} src="/h2.png" />
    <Carousel.Caption bsClass="text-black">>
      <h3>Timeline</h3>
      <p>Check out the latest posts by other users</p>
    </Carousel.Caption>
  </Carousel.Item>
  <Carousel.Item>
    <img width={600} src="/h3.png" />
    <Carousel.Caption bsClass="text-black">>
      <h3>Search Users</h3>
      <p>Search users by name</p>
    </Carousel.Caption>
  </Carousel.Item>
</Carousel>
      </div>
    )
  }
}

export default Home;