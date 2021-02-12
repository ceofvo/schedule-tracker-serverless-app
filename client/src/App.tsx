import React, { Component } from 'react'
import { Link, Route, Router, Switch } from 'react-router-dom'
import { Grid, Menu, Segment } from 'semantic-ui-react'

import Auth from './auth/Auth'
import { EditTodo } from './components/EditTodo'
import { LogIn } from './components/LogIn'
import { NotFound } from './components/NotFound'
import { Todos } from './components/Todos'
import logo from './logo.png'
import './App.css'

export interface AppProps {}

export interface AppProps {
  auth: Auth
  history: any
}

type AppState = {
    date: any
    time: any
    greeting: any
}

export default class App extends Component<AppProps, AppState> {
  
  
  constructor(props: AppProps) {
    super(props)

    this.handleLogin = this.handleLogin.bind(this)
    this.handleLogout = this.handleLogout.bind(this)  
  }

  handleLogin() {
    this.props.auth.login()
  }

  handleLogout() {
    this.props.auth.logout()
  }
  
  componentWillMount() {
    this.generateClock();
  }

  componentDidMount() { // create the interval once component is mounted
      setInterval(() => this.generateClock(), 1000);
  }

  render() {
    return (
      <div>
        <Segment style={{ padding: '8em 0em' }} vertical>
          <Grid container stackable verticalAlign="middle">
            <Grid.Row>
              <Grid.Column width={16}>
                <Router history={this.props.history}>
                  {this.generateMenu()}
                  <span className="app-time">{this.state.time}</span>
                  <span className="app-date">{this.state.date}</span>
                  <span className="app-greet">{this.state.greeting}</span>
                  {this.generateCurrentPage()}
                </Router>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
      </div>
    )
  }

  generateMenu() {
    return (
      <Menu>
        <Menu.Item name="home">
          <Link to="/"> <img src={logo} alt="Schedule Tracker Logo" width={100} /> </Link>
        </Menu.Item>

        <Menu.Menu position="right"> {this.logInLogOutButton()} </Menu.Menu>
      </Menu>
    )
  }

  logInLogOutButton() {
    if (this.props.auth.isAuthenticated()) {
      return (
        <Menu.Item name="logout" onClick={this.handleLogout}>
          Log Out
        </Menu.Item>
      )
    } else {
      return (
        <Menu.Item name="login" onClick={this.handleLogin}>
          Log In
        </Menu.Item>
      )
    }
  }

  generateClock(){

    const now = new Date();
    const hours = now.getHours();
    let timeOfDay

    //Deterrmine what hour of day and apply appropriate greeting
    if(hours < 12) {
      timeOfDay = "Hey, Good morning to you" ;
    } else if (hours >= 12 && hours < 17) {
      timeOfDay = "Good afternoon. How is your day going" ;
    } else {
      timeOfDay = "Good night. Hope your day was awesome" ;
    }

    const optionsDate = {
      year: 'numeric', month: 'long', weekday: 'long', day: 'numeric'
    };
    const optionsTime = {
      hour: 'numeric', minute: 'numeric',
      hour12: true
    };
    const datePart = new Intl.DateTimeFormat('en-US', optionsDate).format(now);
    const timePart = new Intl.DateTimeFormat('en-US', optionsTime).format(now);

    this.setState({
      date:  datePart, 
      time: timePart, 
      greeting: timeOfDay
    });
  }

  generateCurrentPage() {
    if (!this.props.auth.isAuthenticated()) {
      return <LogIn auth={this.props.auth} />
    }

    return (
      <Switch>
        <Route
          path="/"
          exact
          render={props => {
            return <Todos {...props} auth={this.props.auth} />
          }}
        />

        <Route
          path="/todos/:todoId/edit"
          exact
          render={props => {
            return <EditTodo {...props} auth={this.props.auth} />
          }}
        />

        <Route component={NotFound} />
      </Switch>
    )
  }
}
