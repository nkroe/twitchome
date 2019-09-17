/* eslint-disable no-useless-escape */
import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Header from './components/Header/Header';
import Main from './containers/Main/Main';
import Start from './containers/Start/Start';
import NotFound from './containers/NotFound/NotFound'
import axios from 'axios';
import {connect} from 'react-redux';

class App extends Component {
  constructor(props){
    super(props);
    this.state={
      userInfo: ''
    }
  }

  componentWillMount(){
    const {setStreamers} = this.props;
    function getCookie(name) {
      var matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
      ));
      return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    axios.get(`${process.env.BACK}/a/${getCookie('accessToken')}`).then(data => {
      if (data.data[0]){
        this.setState({
          userInfo: data.data[0]
        })
        setStreamers(data.data[0].Streamers);
      }
    });
  }

  render() {
    return (
      <Router>
        <div>
          <div className="loading">
            <span>
              <li className="loading__l1">
              </li>
              <li className="loading__l2">
              </li>
              <li className="loading__l3">
              </li>
              <li className="loading__l4">
              </li>
              <li className="loading__l5">
              </li>
            </span>
          </div>
          <Header username={this.state.userInfo} />
          <Switch>
            <Route path="/myclips" exact component={Main} />
            <Route path="/" exact component={Start} />
            <Route exact component={NotFound} />
          </Switch>
        </div>
      </Router>
    );
  }
}

const state = props => {
  return {
     ...props,
  };
}

const actions = dispatch => ({
  setStreamers: data => 
     dispatch({
        type: 'SET_STREAMERS',
        payload: data,
     })
})

export default connect(state, actions)(App);