import React, { Component, PropTypes } from 'react';
import logo from './logo.svg';
import './App.css';
import {sortBy}from 'lodash';
import classNames from 'classnames';

const DEFAULT_QUERY = 'redux';
const DEFAULT_PAGE = 0;
const DEFAULT_HPP = '100';

const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';

const SORTS = {
    NONE: list => list,
    TITLE: list => sortBy(list, 'title'),
    AUTHOR: list => sortBy(list, 'author'),
    COMMENTS: list => sortBy(list, 'num_comments').reverse(),
    POINTS: list => sortBy(list, 'points').reverse(),
};

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      results: null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY,
      isLoading: false
    };

    this.onSearchChange = this.onSearchChange.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.setSearchTopstories = this.setSearchTopstories.bind(this);
    this.fetchSearchTopstories = this.fetchSearchTopstories.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.needsToSearchTopstories = this.needsToSearchTopstories.bind(this);
    this.updateSearchTopstoriesState = this.updateSearchTopstoriesState.bind(this);
  }

  setSearchTopstories(result) {
    const { hits, page } = result;
    this.setState(this.updateSearchTopstoriesState(hits, page));
  }

  updateSearchTopstoriesState(hits, page) {
    return prevState => {
      const { searchKey, results } = this.state;

      const oldHits =  results && results[searchKey]
        ? results[searchKey].hits
        : [];

      const updatedHits = [
        ...oldHits,
        ...hits
      ];

      return {
        results: {
          ...results,
          [searchKey]: { hits: updatedHits, page }
        },
        isLoading: false
      }
    }
  }

  fetchSearchTopstories(searchTerm, page) {
    this.setState({ isLoading: true });
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
      searchKey,
      isLoading } = this.state;
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
            <div className="interactions">
              <ButtonWithLoading
                isLoading={isLoading}
                onClick={() => this.fetchSearchTopstories(searchKey, page + 1)}
                >
                More
              </ButtonWithLoading>
            </div>
        </div>
      </div>
    );
  }
}

class Search extends Component {

  componentDidMount() {
    this.input.focus();
  }
  render() {
      const {
      value,
      onChange,
      onSubmit,
      children
    } = this.props;

    return (
      <form onSubmit={onSubmit}>
        {children} <input
          type="text"
          value={value}
          onChange={onChange}
          ref={(node) => { this.input = node; }} />
          <button
            type="submit">
            {children}
          </button>
      </form>
    );
  }
}

Search.propTypes = {
  value: PropTypes.string,
  children: PropTypes.node.isRequired,
  onChange: PropTypes.func,
  onSubmit: PropTypes.func
};

class Table extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      sortKey: 'NONE',
      isSortReverse: false,
    };
    this.onSort = this.onSort.bind(this);
  }

  onSort(sortKey) {
    const isSortReverse = this.state.sortKey === sortKey && !this.state.isSortReverse;
    this.setState({ sortKey, isSortReverse });
  }

  render() {
    const {
       list, onDismiss
     } = this.props;

    const {
      sortKey,
      isSortReverse,
    } = this.state;

    const sortedList = SORTS[sortKey](list);
    const reverseSortedList = isSortReverse
      ? sortedList.reverse()
      : sortedList;

      return (<div className="table">
        <div className="table-header">
          <span style={{ width: '40%' }}>
            <Sort
              sortKey={'TITLE'}
              onSort={this.onSort}
              activeSortKey={sortKey}>
              Title
            </Sort>
          </span>
          <span style={{ width: '30%' }}>
            <Sort
              sortKey={'AUTHOR'}
              onSort={this.onSort}
              activeSortKey={sortKey}>
              Author
            </Sort>
          </span>
          <span style={{ width: '10%' }}>
            <Sort
              sortKey={'COMMENTS'}
              onSort={this.onSort}
              activeSortKey={sortKey}>
              Comments
            </Sort>
          </span>
          <span style={{ width: '10%' }}>
            <Sort
              sortKey={'POINTS'}
              onSort={this.onSort}
              activeSortKey={sortKey}>
                Points
            </Sort>
          </span>
          <span style={{ width: '10%' }}>
            Archive
          </span>
        </div>
        {reverseSortedList.map(item => (
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
      </div>);
  }
}


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

const Loading = () =>
  <div>Loading...</div>

const withLoading = (Component) => ({isLoading, ...rest}) =>
    isLoading ? <Loading /> : <Component { ...rest } />

const ButtonWithLoading = withLoading(Button);

const Sort = ({ sortKey, onSort, children, activeSortKey }) => {
  const sortClass = classNames(
    'button-inline',
    { 'button-active': sortKey === activeSortKey }
  );
  return (
    <Button
      onClick={() => onSort(sortKey)}
      className={sortClass}>
      {children}
    </Button>
  );
}


export default App;
