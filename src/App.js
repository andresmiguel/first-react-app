import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

const DEFAULT_QUERY = 'redux';
const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';

const url = `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${DEFAULT_QUERY}`;

const isSearched = searchTerm => {
    return item => !searchTerm || item.title.toLowerCase().includes(searchTerm.toLowerCase())
}

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      result: null,
      searchTerm: DEFAULT_QUERY
    };

    this.onSearchChange = this.onSearchChange.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.setSearchTopstories = this.setSearchTopstories.bind(this);
    this.fetchSearchTopstories = this.fetchSearchTopstories.bind(this);
  }

  setSearchTopstories(result) {
    this.setState({result});
  }

  fetchSearchTopstories(searchTerm) {
      fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}`).
        then(response => response.json()).
        then(result => this.setSearchTopstories(result));
  }

  componentDidMount() {
    const {searchTerm} = this.state;
    this.fetchSearchTopstories(searchTerm);
}

  onSearchChange(event) {
    this.setState({searchTerm: event.target.value});
  }

  onDismiss(id) {
    const isNotId = item => item.objectID !== id;
    const updatedHits = this.state.result.hits.filter(isNotId);
    this.setState({result: {...this.state.result, hits: updatedHits}});
  }

  render() {
    const [helloWorld, message] = ['Welcome to React!', 'My first App with React!'];
    const {result, searchTerm} = this.state;

    return (
      <div className="page">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>{helloWorld}</h2>
          <h3>{message}</h3>
        </div>
        <div className="interactions">
          <Search
            value={searchTerm}
            onChange={this.onSearchChange}>
            Search
          </Search>
          { result &&
            <Table
              list={result.hits}
              onDismiss={this.onDismiss}
              pattern={searchTerm}
              />
          }
        </div>
      </div>
    );
  }
}

const Search = ({value, onChange, children}) =>
    <form>
      {children} <input
        type="text"
        value={value}
        onChange={onChange} />
    </form>

const Table = ({list, onDismiss, pattern}) =>
    <div className="table">
      {list.filter(isSearched(pattern)).map(item => (
        <div key={item.objectID} className="table-row">
          <span style={{ width: '40%' }}>
            <a href={item.url}>{item.title}</a>
          </span>
          <span style={{ width: '30%' }}>{item.author}</span>
          <span style={{ width: '10%' }}>{item.num_comments}</span>
          <span style={{ width: '10%' }}>{item.points}</span>
          <span style={{ width: '10%' }}>
            <Button
              onClick={() => onDismiss(item.objectID)}
              className="button-inline">
              Dismiss
            </Button>
          </span>
        </div>
        ))}
    </div>

const Button = ({onClick, className = '', children}) =>
    <button
      onClick={onClick}
      className={className}
      type="button">
      {children}
    </button>

export default App;
