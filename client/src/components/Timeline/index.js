import React, { Component } from 'react';
import './style.css';
import PostGroup from '../PostGroup';

class Timeline extends Component {
  constructor(props, context) {
    super(props, context);


  }

  render() {
    return (
      <div>
      <h1>Timeline</h1>
      
      <PostGroup PostsLocation="LatestPosts" />;
      </div>
    )
  }
}

export default Timeline;