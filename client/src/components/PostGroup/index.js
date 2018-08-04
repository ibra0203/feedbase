import socketIOClient from 'socket.io-client';
import axios from 'axios';
import React, { Component } from 'react';
import Post from '../Post';
import { read } from 'fs';
import {socket} from '../../Helpers/sockets';

class PostGroup extends Component {
    
  constructor(props, context) {
    super(props, context);
    var _UserMap = new Map();
    let _UserInfo = localStorage.getItem('User');
    if(_UserInfo)
    {
      _UserInfo = JSON.parse(_UserInfo);
    }
    this.UpdateUserMap = this.UpdateUserMap.bind(this);
   this.AddPost = this.AddPost.bind(this);
   this.AddPostSnaps = this.AddPostSnaps.bind(this);
   this.UpdatePostsHtml = this.UpdatePostsHtml.bind(this);
   this.SetUserData = this.SetUserData.bind(this);
   this.RequestUserInfo = this.RequestUserInfo.bind(this);
    var newPostList = [];
    this.state =({  postsList: newPostList, postsHtml: null, UserMap: _UserMap, UserInfo:_UserInfo})
    

     
  }
  componentDidMount()
  {

    socket.on('new post', (pst)=>
    {
        this.AddPost(pst);
    });

    socket.on('initial posts', (snaps)=>
    {
        
        console.log("Getting initial posts+\n"+snaps);
        this.AddPostSnaps(snaps);
    });

    if(this.props.PostsLocation)
    socket.emit('PostGroup', this.props.PostsLocation);
  }
  componentWillUnmount()
  {
    socket.off('new post');
    socket.off('initial posts');
    socket.emit('PostGroup off');
  }
   onPostDelete = (_id) =>{
    let _postList = this.state.postsList;
    for(let i=0; i<_postList.length;i++)
  {
    let post = _postList[i];
      if(post.postId == _id)
      {
        let _index = i;
        console.log("Splicing at index "+_index);
        if(_index>-1)
        {
          _postList.splice(_index, 1);
        }
        break;
      }
      
  };
  this.setState({postsList: _postList});
      this.UpdatePostsHtml(true);
  }


  AddPost(post)
  {
    
      
        var _postsList = this.state.postsList;
        _postsList.splice(0,0,post);
        this.setState({postsList: _postsList});
        console.log(post);
        this.UpdatePostsHtml();
  }
  AddPostSnaps(snaps)
  {
    var _postsList = this.state.postsList;
    for(var key in snaps)
    {
      if(snaps.hasOwnProperty(key))
      {
        let snap = snaps[key];
        console.log("Snap: "+snap);
        _postsList.splice(0,0,snap);
      }
    };
    this.setState({postsList: _postsList});
    this.UpdatePostsHtml();
  }
  SetUserData(data)
  {
    var UserMap = this.state.UserMap;
    if(data)
    {
        if(data.Success)
        {
          UserMap.set(data.uid, data);
          this.setState({UserMap: UserMap});
          var doneLoading = true;
          UserMap.forEach(function(value, key, map){
            
            if(Object.keys(value).length == 0)
              doneLoading = false;
          });
          
          if(doneLoading)
          this.UpdatePostsHtml(true);

          
        }
    }
  }
  UpdateUserMap()
  {
    var postsList = this.state.postsList;
    var UserMap = this.state.UserMap;
    var readyToRender = true;
    var self = this;
    for(var i =0; i<postsList.length;i++)
    {
        var post = postsList[i];
        if(!UserMap.get(post.userId))
        {
            UserMap.set(post.userId, {});
            self.RequestUserInfo(post.userId);
            readyToRender=false;
        }
    }
        this.setState({UserMap: UserMap});
        if(readyToRender)

        this.UpdatePostsHtml(true);

    
   
  }
  RequestUserInfo(userId)
  {
   axios.get('/_profileinfo/'+userId).then(({data})=>this.SetUserData(data));
  }
  UpdatePostsHtml(updatedMap = false)
  {

      if(!updatedMap)
      {
          this.UpdateUserMap();
          return;
      }
      var UserMap = this.state.UserMap;
      let user = this.state.UserInfo;
      let userId=''; 
      if(user)
      {
        userId = user.uid;
      }
    try{
       
        var _postsList = this.state.postsList;
        var _onPostDelete = this.onPostDelete;
        var _postsHtml = _postsList.map(function(p)
      {
          var _usr = UserMap.get(p.userId);
          var _imgurl = _usr.imgurl;
          var _usrname = _usr.username;
          let _canEdit = false;
          if(userId == p.userId)
            _canEdit=true;
          return( <Post image_url={_imgurl} 
          username ={_usrname}
          date_created = {p.date_created}
          canEdit = {_canEdit}
          content = {p.content}
          userId= {p.userId}
          postId ={p.postId}
          onPostDelete = {_onPostDelete}/>);
      });
      this.setState({postsHtml: _postsHtml});
      }
        catch(e)
        {
          console.log(e);
        }
    
  }
  render() {
   


    if(this.state.postsHtml)
    {
    return (
        <div>{this.state.postsHtml}</div>
    )
    }
    else
    {
        return(<div> </div>)
    }
  }
}

export default PostGroup;