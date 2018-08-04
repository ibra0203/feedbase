import React, { Component } from 'react';
import {Panel, Image, Label, Grid, Row, Col} from 'react-bootstrap';
import axios from 'axios';
import $ from 'jquery';
import './style.css';

class Post extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {classes: '', isLoading: false};
    this.onDelete = this.onDelete.bind(this);

  }
  componentDidMount()
  {
      
     var fixSize = function(){ let panelHeight = $('.post-content').closest('.panel-heading').height();
      let marg = panelHeight/8;
      let finalHeight = panelHeight -( marg*2);
      //  $('.post-content').height(finalHeight);
        $('.post-content').css('margin-top', marg);
        $('.post-content').css('margin-bottom', marg);
    }
            
        fixSize();
      //  $(window).resize(fixSize);
  }
  onDelete()
  {
        this.setState({classes: 'deleting', isLoading: true});
        let self = this;
        axios.get('/_deletepost/'+this.props.userId+'/'+this.props.postId).then(()=>{this.props.onPostDelete(self.props.postId); self.setState({classes:'', isLoading: false});});
  }
  render() {
    return (
     <Panel bsStyle="info" className={this.state.classes} >
         {this.state.isLoading? (<Image className='loading' src='/loading2.gif' />):(<p></p>)}
        <Panel.Heading className='panel-head'>
            <Row>
            <Col md={2}>
                <Row className='center'>
                    <Image className='post-img center' src={this.props.image_url } circle/>
                </Row>
                <Row>
                    <Label className='center'><strong>{this.props.username}</strong></Label>
                </Row>
                <Row>
                    <p className='post-date center'>{this.props.date_created}</p>
                </Row>
            </Col>
            <Col className="Aligner" md={10}>
               
                <div className= "post-content">
                 <div className="post-text">{this.props.content}</div>
                </div>
                
               
            </Col>
            </Row>
        </Panel.Heading>
        
            <Panel.Footer>
            {this.props.canEdit?(<Image src="/delete.png" onClick={ ()=>{if(window.confirm("Are you sure you want to delete this post?")) this.onDelete()}} />):(<p></p>)}
            </Panel.Footer>
        </Panel>
    )
  }
}

export default Post;