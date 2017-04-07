import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

const DEFAULT_QUERY = 'redux';
const DEFAULT_PAGE = 0;
const DEFAULT_HPP = '100';

const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';

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
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
  }

  setSearchTopstories(result) {
    const { hits, page } = result;

    const oldHits = page !== 0
      ? this.state.result.hits
      : [];

      const updatedHits = [
        ...oldHits,
        ...hits
      ];

    this.setState({
      result: { hits: updatedHits, page }
    });

  }

  fetchSearchTopstories(searchTerm, page) {
      fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
        .then(response => response.json())
        .then(result => this.setSearchTopstories(result));
  }

  componentDidMount() {
    const {searchTerm} = this.state;
    this.fetchSearchTopstories(searchTerm, DEFAULT_PAGE);
}

  onSearchChange(event) {
    this.setState({searchTerm: event.target.value});
  }

  onDismiss(id) {
    const isNotId = item => item.objectID !== id;
    const updatedHits = this.state.result.hits.filter(isNotId);
    this.setState({result: {...this.state.result, hits: updatedHits}});
  }

  onSearchSubmit(event) {
    const { searchTerm } = this.state;
    this.fetchSearchTopstories(searchTerm, DEFAULT_PAGE);
    event.preventDefault();
  }

  render() {
    const [helloWorld, message] = ['Welcome to React!', 'My first App with React!'];
    const {result, searchTerm} = this.state;
    const page = (result && result.page) || 0;

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
            onChange={this.onSearchChange}
            onSubmit={this.onSearchSubmit}>
            Search
          </Search>
          { result &&
            <Table
              list={result.hits}
              onDismiss={this.onDismiss} />
          }
          <Button onClick={() => this.fetchSearchTopstories(searchTerm, page + 1)}>
            More
          </Button>
        </div>
      </div>
    );
  }
}

const Search = ({value, onChange, onSubmit, children}) =>
    <form onSubmit={onSubmit}>
      {children} <input
        type="text"
        value={value}
        onChange={onChange} />
        <button
          type="submit">
          {children}
        </button>
    </form>

const Table = ({list, onDismiss}) =>
    <div className="table">
      {list.map(item => (
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
