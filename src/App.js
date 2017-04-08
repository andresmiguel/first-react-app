import React, { Component, PropTypes } from 'react';
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
      results: null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY
    };

    this.onSearchChange = this.onSearchChange.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.setSearchTopstories = this.setSearchTopstories.bind(this);
    this.fetchSearchTopstories = this.fetchSearchTopstories.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.needsToSearchTopstories = this.needsToSearchTopstories.bind(this);
  }

  setSearchTopstories(result) {
    const { hits, page } = result;
    const { searchKey, results } = this.state;

    const oldHits =  results && results[searchKey]
      ? results[searchKey].hits
      : [];

      const updatedHits = [
        ...oldHits,
        ...hits
      ];

    this.setState({
      results: {
        ...results,
        [searchKey]: { hits: updatedHits, page }
      }
    });

  }

  fetchSearchTopstories(searchTerm, page) {
      fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
        .then(response => response.json())
        .then(result => this.setSearchTopstories(result));
  }

  componentDidMount() {
    const {searchTerm} = this.state;
    this.setState({ searchKey: searchTerm });
    this.fetchSearchTopstories(searchTerm, DEFAULT_PAGE);
}

  onSearchChange(event) {
    this.setState({searchTerm: event.target.value});
  }

  onDismiss(id) {
    const { searchKey, results } = this.state;
    const { hits, page } = results[searchKey];

    const isNotId = item => item.objectID !== id;
    const updatedHits = hits.filter(isNotId);
    this.setState({
      results: {
        ...results,
        [searchKey]: { hits: updatedHits, page }
        }
    });
  }

  onSearchSubmit(event) {
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });
    if (this.needsToSearchTopstories(searchTerm)) {
      this.fetchSearchTopstories(searchTerm, DEFAULT_PAGE);
    }
    event.preventDefault();
  }

  needsToSearchTopstories(searchTerm) {
    return !this.state.results[searchTerm];
  }

  render() {
    const [helloWorld, message] = ['Welcome to React!', 'My first App with React!'];
    const {
      searchTerm,
      results,
      searchKey } = this.state;
    const page = (
      results &&
      results[searchKey] &&
      results[searchKey].page
    ) || 0;

    const list = (
      results &&
      results[searchKey] &&
      results[searchKey].hits
    ) || [];
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
          <Table
            list={list}
            onDismiss={this.onDismiss} />
          <Button onClick={() => this.fetchSearchTopstories(searchKey, page + 1)}>
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

Search.propTypes = {
  value: PropTypes.string,
  children: PropTypes.node.isRequired,
  onChange: PropTypes.func,
  onSubmit: PropTypes.func
};

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

Table.propTypes = {
  list: PropTypes.arrayOf(
    PropTypes.shape({
        objectID: PropTypes.string.isRequired,
        author: PropTypes.string,
        url: PropTypes.string,
        num_comments: PropTypes.number,
        points: PropTypes.number,
      })
    ).isRequired,
  onDismiss: PropTypes.func.isRequired,
};

const Button = ({onClick, className, children}) =>
    <button
      onClick={onClick}
      className={className}
      type="button">
      {children}
    </button>

Button.defaultProps = {
  className: ''
};

Button.propTypes = {
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
  children: PropTypes.node.isRequired
};

export default App;
