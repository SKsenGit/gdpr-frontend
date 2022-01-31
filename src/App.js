import React, { Component } from "react";
import { Helmet } from "react-helmet";
import { Routes, Route, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import AuthService from "./services/auth.service";

import Login from "./components/login.component";
import Register from "./components/register.component";
import Home from "./components/home.component";
import Profile from "./components/profile.component";
import BoardUser from "./components/board-user.component";
import BoardModerator from "./components/board-moderator.component";
import BoardAdmin from "./components/board-admin.component";
import GdprImage from "./components/gdprimage.component";
import GdprMetadata from "./components/gdprmetadata.component"
import ImageAnalisys from "./components/image-analysis.component"
import ImageText from "./components/text-from-image.component"
import logo from "./logo.svg"

import { Container, Row, Navbar } from "react-bootstrap"

class App extends Component {
  constructor(props) {
    super(props);
    this.logOut = this.logOut.bind(this);

    this.state = {
      showModeratorBoard: false,
      showAdminBoard: false,
      currentUser: undefined,
    };
  }

  componentDidMount() {
    const user = AuthService.getCurrentUser();

    if (user) {
      this.setState({
        currentUser: user,
        showModeratorBoard: user.roles.includes("ROLE_MODERATOR"),
        showAdminBoard: user.roles.includes("ROLE_ADMIN"),
      });
    }
  }

  logOut() {
    AuthService.logout();
  }

  render() {
    const { currentUser, showModeratorBoard, showAdminBoard } = this.state;

    return (
      <div>
        <Container>
          <Row>
        <Helmet>
                <meta charSet="utf-8" />
                <title>GDPR processing</title>
                <meta name="description" content="GDPR data detecting and processing" />
        </Helmet>
        
        <Navbar collapseOnSelect  expand="md" className="ifActiveTextColor navbar ifMenuBackgroundColor">
        <Link to={"/"} className="navbar-brand">
            <Container>
              <Navbar.Brand href="#home">
                <img
                  src={logo}
                  width="60"
                  height="60"
                  className="d-inline-block align-top"
                  alt="React Bootstrap logo"
                />
              </Navbar.Brand>
            </Container>
          </Link>

        
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          

          <div className="navbar-nav mr-auto">
            <li className="nav-item">
              <Link to={"/home"} className="nav-link">
                Home
              </Link>
            </li>
            
            <li className="nav-item">
              <Link to={"/analysis"} className="nav-link">
                Image analysis
              </Link>
            </li>
            <div style={{ display: "none" }}>
              <li className="nav-item">
                <Link to={"/gdprimage"} className="nav-link">
                  GDPR image
                </Link>
              </li>
              <li className="nav-item">
                <Link to={"/gdprmetadata"} className="nav-link">
                  GDPR metadata
                </Link>
              </li>
            </div>
            <li className="nav-item">
                <Link to={"/textfromimage"} className="nav-link">
                  Text recognition
                </Link>
              </li>

            {showModeratorBoard && (
              <li className="nav-item">
                <Link to={"/mod"} className="nav-link">
                  Moderator Board
                </Link>
              </li>
            )}

            {showAdminBoard && (
              <li className="nav-item">
                <Link to={"/admin"} className="nav-link">
                  Admin Board
                </Link>
              </li>
            )}

            {currentUser && (
              <li className="nav-item">
                <Link to={"/user"} className="nav-link">
                  User
                </Link>
              </li>
            )}

          </div>

          {currentUser ? (
            <div className="navbar-nav ms-auto" >
              <li className="nav-item">
                <Link to={"/profile"} className="nav-link">
                  {currentUser.username}
                </Link>
              </li>
              <li className="nav-item">
                <a href="/login" className="nav-link" onClick={this.logOut}>
                  LogOut
                </a>
              </li>
            </div>
          ) : (
            <div className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link to={"/login"} className="nav-link">
                  Login
                </Link>
              </li>

              <li className="nav-item">
                <Link to={"/register"} className="nav-link">
                  Sign Up
                </Link>
              </li>
            </div>
          )}
        </Navbar.Collapse>
        </Navbar>

        <div className="container mt-3">
          <Routes>
            <Route exact path="/home" element={<Home />} />
            <Route exact path="/" element={<Home />} />
            <Route exact path="/login" element={<Login />} />
            <Route exact path="/register" element={<Register />} />
            <Route exact path="/profile" element={<Profile />} />
            <Route path="/user" element={<BoardUser />} />
            <Route path="/mod" element={<BoardModerator />} />
            <Route path="/admin" element={<BoardAdmin />} />
            <Route path="/gdprimage" element={<GdprImage />} />
            <Route path="/gdprmetadata" element={<GdprMetadata />} />
            <Route path="/analysis" element={<ImageAnalisys />} />
            <Route path="/textfromimage" element={<ImageText />} />
          </Routes>

        </div>
        </Row>
        </Container>
      </div>
    );
  }
}

export default App;