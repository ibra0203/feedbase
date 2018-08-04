import React, { Component, Fragment} from 'react';
import {FormControl, Panel,Col,Row,Grid,Form, Image, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import $ from 'jquery';
import './style.css';
import axios from 'axios';
function CleanHtml()
{
 // $(".remove-me").each( function(){
   // $(this).contents().unwrap();
//});
}
function HighlightQuery(props)
{
  //whole string
  var strTarget = props.strTarget;
  //string to look for
  var query = props.query;
  //regex object
  var reg = new RegExp(query, 'gi');
  
  var final_str =strTarget.replace(reg, function(str) {return '|['+str+']|'});
  var arr = final_str.split('|');
  var result = arr.map(function(s){
    if(s.startsWith('[')&& s.endsWith(']'))
    {
      s=s.replace(/\||\[|\]/g, '');
      return (<b className='highlight'>{s}</b>)
    }
    else
    {
      return (<Fragment>{s}</Fragment>)
    }
  }); 
  if(result)
  return <div>{result}</div>;
  else
    return <p></p>
}
function SearchResults(props)
{
  if(props.uid !==undefined)
  return(
  <div>
    <Panel>
        <Panel.Heading>
          <Row>
            <Col>
              <Image className="srch-img" src={props.imgurl} href={"/profile/"+props.uid}/> 
            </Col>
            <Col>
            <Link to={"/profile/"+props.uid}><HighlightQuery strTarget={props.username} query={props.searchQuery} /></Link>
            </Col>
          </Row>
       </Panel.Heading>
    </Panel>
  </div>)

  
  return(<p></p>)
}
class SearchUsers extends Component {
  constructor(props, context) {
    super(props, context);
    this.HandleQueryChange = this.HandleQueryChange.bind(this);
    this.SubmitNewQuery = this.SubmitNewQuery.bind(this);
    this.HandleQueryResponse = this.HandleQueryResponse.bind(this);
    this.UpdateResultsHtml = this.UpdateResultsHtml.bind(this);
    this.state= {queryText: '',lastQuery:'', isLoading: false, lastUsername: '', resultList :[], resultsHtml:null};
  }
  componentDidMount()
  {
   
  }


  HandleQueryChange(e)
  {
    this.setState({queryText: e.target.value});
  }
  SubmitNewQuery(e)
  {
    e.preventDefault();
    var qClean = this.state.queryText.replace(/\||\[|\]/g, '');
   
    
    this.setState({isLoading: true});
    let qString = '/_searchusers/'+qClean+'/'+this.state.lastUsername;

    axios.get(qString).then(({data})=>this.HandleQueryResponse(data));
    this.setState({queryText:'', lastQuery: qClean});
  }
  HandleQueryResponse(data)
  {
    this.setState({isLoading: false});
    let size = Object.keys(data).length;
    let _resultList = [];
    for(var i =0; i<size; i++)
    {
      if(i == size-1)
        {
          this.setState({lastUsername: data['n'+i].username});
          if(size>10)
          break;
        }
      _resultList.push(data['n'+i]);
    }
    this.setState({resultList: _resultList});
    this.UpdateResultsHtml();
  }
  UpdateResultsHtml()
  {
    var resultList = this.state.resultList;
    var _searchQuery = this.state.lastQuery;
    var resultsHtml = resultList.map(function(q){
      console.log(q);
        return <SearchResults username={q.username} imgurl ={q.imgurl} uid={q.uid} searchQuery= {_searchQuery} />
    });

    this.setState({resultsHtml: resultsHtml})
    CleanHtml();
  }
  render() {
    return (
      <div>
      <h1>Search Users</h1>
      <Form>
      <FormControl
              type="text"
              value={this.state.queryText}
              onChange ={this.HandleQueryChange}

            />
      <Button disabled ={(this.state.queryText.replace(/\s/g,"")=="" || this.state.isLoading)} onClick={this.SubmitNewQuery}>Search</Button>
     </Form>
        {(this.state.resultsHtml!==null)?(<div>{this.state.resultsHtml}</div>):(<p></p>)}
        </div>
    )
  }
}

export default SearchUsers;