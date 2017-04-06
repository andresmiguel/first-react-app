import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

const list = [{
        title: 'React',
        url: 'https://facebook.github.io/react/',
        author: 'Jordan Walke',
        num_comments: 3,
        points: 4,
        objectID: 0,
    },
    {
        title: 'Redux',
        url: 'https://github.com/reactjs/redux',
        author: 'Dan Abramov, Andrew Clark',
        num_comments: 2,
        points: 5,
        objectID: 1,
    },
];

const isSearched = searchTerm => {
    return item => !searchTerm || item.title.toLowerCase().includes(searchTerm.toLowerCase())
}

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      list,
      searchTerm: ''
    };

    this.onSearchChange = this.onSearchChange.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
  }

  onSearchChange(event) {
    this.setState({searchTerm: event.target.value});
  }

  onDismiss(objectID) {
    this.setState({
      list: this.state.list.filter(obj => obj.objectID !== objectID)
    });
  }

  render() {
    const [helloWorld, message] = ['Welcome to React!', 'My first App with React!'];
    const {list, searchTerm} = this.state;
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>{helloWorld}</h2>
          <h3>{message}</h3>
        </div>
        <Search
          value={searchTerm}
          onChange={this.onSearchChange}>
          Search
        </Search>
        <Table
          list={list}
          onDismiss={this.onDismiss}
          pattern={searchTerm}
          />
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
    <div>
      {list.filter(isSearched(pattern)).map(item => (
        <div key={item.objectID}>
          <span>
            <a href={item.url}>{item.title}</a>
          </span>
          <span>{item.author}</span>
          <span>{item.num_comments}</span>
          <span>{item.points}</span>
          <span>
            <Button
              onClick={() => onDismiss(item.objectID)}>
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
