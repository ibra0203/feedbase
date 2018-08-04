import React, { Component } from 'react';
import axios from 'axios';
import {Panel, Grid, Col, Form, Image, ListGroup, ListGroupItem, FormControl, Button, Label } from 'react-bootstrap';
import  { Redirect } from 'react-router-dom';
import './style.css';
import Post from '../Post';
import PostGroup from '../PostGroup';
import $ from 'jquery';

function PostCollection(props)
{
  const postsHtml = props.posts;

  if(!postsHtml)
    return<p></p>
  return <div>{postsHtml}</div>;
}
const debugMode = localStorage.getItem('debugMode');
class Profile extends Component {
  constructor(props, context) {
    super(props, context);
    this.HandleResponse = this.HandleResponse.bind(this);
    this.HandleNewPostText = this.HandleNewPostText.bind(this);
    this.UpdatePostsHtml = this.UpdatePostsHtml.bind(this);
    this.AddNewPost = this.AddNewPost.bind(this);
    this.SubmitNewPost = this.SubmitNewPost.bind(this);
    this.LoadUserPosts = this.LoadUserPosts.bind(this);
    this.FileChangedHandler = this.FileChangedHandler.bind(this);
    var newPostList = [];
    this.state =({ ShouldRedirect: false, RedirectTo: '/login', UserInfo : {}, newPostText: '', postsList: newPostList, postsHtml: undefined, canEditProfile: false,
  canAddPosts: false})
   


  }
  LoadUserPosts(snaps)
  {
    var postsList = this.state.postsList;
    for(var key in snaps)
    {
      if(snaps.hasOwnProperty(key))
      {
        let snap = snaps[key];
        console.log("Snap: "+snap);
        postsList.splice(0,0,snap);
      }
    };
    this.setState({postsList: postsList});
    this.UpdatePostsHtml();
  }
  AddNewPost(data)
  {
    console.log(data);
    var _postsList = this.state.postsList;
    _postsList.splice(0,0,data);
    this.setState({postsList: _postsList, newPostText: ''});  
    console.log(_postsList);
    this.UpdatePostsHtml();
    
  }

  UpdatePostsHtml()
  {
    try{
    var _postsList = this.state.postsList;
    var _usrname = this.state.UserInfo.username;
    var _imgurl =this.state.UserInfo.imgurl;
    var _postsHtml = _postsList.map(function(p)
  {
      return <Post image_url={_imgurl} 
      username ={_usrname}
      date_created = {p.date_created}
      content = {p.content}/>
  });
  this.setState({postsHtml: _postsHtml});
  }
    catch(e)
    {
      console.log(e);
    }

  }
  HandleNewPostText(e)
  {
      this.setState({newPostText: e.target.value});
  }
  SubmitNewPost(e)
  {
    let userPoster = localStorage.getItem('User');
     userPoster = JSON.parse(userPoster);
      var newPostInfo = {userId: userPoster.uid, toId:this.state.UserInfo.uid, content: this.state.newPostText };
     fetch('/post/create', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPostInfo)
      });
      this.setState({newPostText: ''});  

      //.then((resp)=>resp.json()).then(data =>this.AddNewPost(data));

     // axios.post('/post/create', newPostInfo).then(data =>this.AddNewPost(data));
      
  }
  HandleResponse(data)
  {
    if(data)
    {
      if(data.Success === true)
      {
        let usr = localStorage.getItem('User');
        var _canAddPosts =true;
        var _canEditProfile = false;
        if(usr)
        {
          let _usr = JSON.parse(usr);
          console.log("usr.uid: "+_usr.uid);
          console.log("data.uid: "+ data.uid);
          if(_usr.uid == data.uid)
          {
            console.log("New post enabled");
            _canAddPosts =true;
            _canEditProfile = true;
          }
        }
        
       // axios.get('/_getposts'+'/'+data.uid).then(({data})=>this.LoadUserPosts(data));

        this.setState({UserInfo: data, canAddPosts: _canAddPosts, canEditProfile: _canEditProfile});
      }
      else
      {
        this.setState({ShouldRedirect: true, RedirectTo: '/'});
      }
    }
  }
  componentDidMount()
  {
    var _uid = this.props.match.params.uid;
    console.log(_uid);
    if(_uid)
    axios.get('/_profileinfo'+'/'+_uid).then(({data})=>this.HandleResponse(data));
    $('.profile-pic-big').on("mouseover", function () {
      $(this).append('<div class="upload-image-overlay"></div>');
      $(".profile-pic-text").animate({ opacity: 1 });
    })
    $('.profile-pic-big').on("mouseout", function () {
        $('.upload-image-overlay', this).remove();
        $(".profile-pic-text").animate({ opacity: 0 });
    })

    $('.profile-pic-big').click(function () {
        $('.profile-pic-file').trigger('click');

    
    });

  }
  FileChangedHandler(e)
  {
    let formData = new FormData();
    const file = e.target.files[0];
    formData.append('file', file);
    alert("Uploading "+ file.name);
    axios.post('/_profile_image_update/'+this.state.UserInfo.uid, formData).then((url) =>{
      let userInfo = this.state.UserInfo;
      userInfo.imgurl = url.data.url;
      this.setState({UserInfo: userInfo});});

  }

  
  render() {
    if (this.state.ShouldRedirect) {
      return <Redirect to={this.state.RedirectTo}/>;{
    
     
  }
}
return(
  <div>
   <h1>Profile</h1>
   <Grid>
        
          <Col xs={6} md={4}>
              <Panel bsStyle="info">
        <Panel.Heading>

          <Panel.Title componentClass="h3">{this.state.UserInfo.username}</Panel.Title>
        </Panel.Heading>
        <Panel.Body>
        <div class="profile-pic-big">
         <Image className='profile-img' src={this.state.UserInfo.imgurl} responsive/>
         <div class="profile-pic-text">Upload new image</div>

        </div>
        <ListGroup>
          <ListGroupItem>{this.state.UserInfo.age} years old</ListGroupItem>
          <ListGroupItem>{this.state.UserInfo.country}</ListGroupItem>
          <ListGroupItem><Label bsStyle="primary"><strong>User Since:</strong></Label>   {this.state.UserInfo.creation_date}</ListGroupItem>
          <ListGroupItem><Label bsStyle="primary"><strong>Latest Activity:</strong></Label>  {this.state.UserInfo.last_activity}</ListGroupItem>

        </ListGroup>
        </Panel.Body>
        </Panel>
          </Col>
          <Col  xs={4} md={6}>
          {this.state.canAddPosts? (
          <Form horizontal >
          <FormControl
              type="textarea"
              value={this.state.newPostText}
              componentClass="textarea"
              onChange ={this.HandleNewPostText}

            />
            <Col>
            <Button disabled ={(this.state.newPostText.replace(/\s/g,"")=="")} onClick={this.SubmitNewPost.bind(this)}>Post</Button>
            </Col>
          </Form>
          ): (<p></p> )}
       
          <PostGroup PostsLocation={this.props.match.params.uid} />

          </Col>

        
   </Grid>
   {this.state.canEditProfile? (
          <Form className='form-profile-pic' horizontal >
          <input className='profile-pic-file' type="file" onChange={this.FileChangedHandler} />
          </Form>
          ): (<p></p> )}
   </div>
);

}
}
export default Profile;