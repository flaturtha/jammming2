import React from 'react';
import './SearchBar.css';

class SearchBar extends React.Component{

  constructor(props){
    super(props);
    
    this.search = this.search.bind(this);
    this.handleTermChange = this.handleTermChange.bind(this);
  }
  
  // issues here --- task#69
  search(term){
    this.props.onSearch(term);
  }

  handleTermChange(event){
    this.setState({term: event.target.value});
  }
  
  render(){
    return(
      <div className="SearchBar">
        <input placeholder="Enter a Song, Album, or Artist" onChange={this.handleTermChange} />
        <a onClick={this.search}>SEARCH</a>
      </div>
    )
  }
}

export default SearchBar;