import React from "react";
import { Link } from "react-router-dom";

const MainMenu = () => {
  return (
    <div className="tp-menu clearfix">
      <div id="menu_area" className="menu-area  topnav">
        <div className="container-fluid">
          <div className="row">
            <nav className="navbar navbar-light navbar-expand-lg mainmenu topnav-menu">
              <button
                className="navbar-toggler collapsed"
                type="button"
                data-toggle="collapse"
                data-target="#navbarSupportedContent"
                aria-controls="navbarSupportedContent"
                aria-expanded="false"
                aria-label="Toggle navigation"
              >
                <span className="navbar-toggler-icon"></span>
              </button>
              <div
                className="navbar-collapse collapse"
                id="navbarSupportedContent"
              >
                <ul className="navbar-nav">
                  <li className="nav-item dropdown">
                    <span
                      className="nav-link dropdown-toggle arrow-none active"
                      to="/"
                      id="topnav-apps"
                      role="button"
                      data-toggle="dropdown"
                      aria-haspopup="true"
                      aria-expanded="false"
                    >
                      <i className="fe-airplay mr-1"></i>Dashboard
                      <div className="arrow-down"></div>
                    </span>

                    <ul
                      className="dropdown-menu"
                      aria-labelledby="navbarDropdown"
                    >
                      <li>
                        <Link to="/" className="logo logo-light">
                          <Link to="/" className="dropdown-item">
                            <i className="far fa-chart-bar"></i> Department
                            Dashboard
                          </Link>
                        </Link>
                      </li>
                    </ul>
                  </li>
                  <li className="nav-item dropdown">
                    <Link
                      className="nav-link dropdown-toggle arrow-none active"
                      to={{
                        pathname: `${process.env.REACT_APP_BASE}/interaction-dashboard`,
                      }}
                      id="topnav-apps"
                      role="button"
                      aria-haspopup="true"
                      aria-expanded="false"
                    >
                      <i className="fe-airplay mr-1"></i>Support Dashboard
                    </Link>
                  </li>

                  <li className="dropdown">
                    <span
                      className="nav-link dropdown-toggle arrow-none"
                      id="topnav-apps"
                      role="button"
                      data-toggle="dropdown"
                      aria-haspopup="true"
                      aria-expanded="false"
                    >
                      <i className="fas mdi mdi-lifebuoy mr-1 font-17"></i>{" "}
                      Helpdesk 360 <div className="arrow-down"></div>
                    </span>
                    <ul
                      className="dropdown-menu"
                      aria-labelledby="navbarDropdown"
                    >
                      <li>
                        <span
                          className="dropdown-item dropdown-toggle arrow-none"
                          id="topnav-apps"
                          role="button"
                          data-toggle="dropdown"
                          aria-haspopup="true"
                          aria-expanded="false"
                        >
                          <i className="fe-plus-circle mr-1" /> Helpdesk{" "}
                          <div className="arrow-down"></div>
                        </span>
                        <ul
                          className="dropdown-menu"
                          aria-labelledby="navbarDropdown"
                        >
                          <li>
                            <Link
                              to={`${process.env.REACT_APP_BASE}/helpdesk`}
                              className="dropdown-item"
                            >
                              Helpdesk Board
                            </Link>
                          </li>

                          <li>
                            <Link
                              to={`${process.env.REACT_APP_BASE}/helpdesk-search`}
                              className="dropdown-item"
                            >
                              Search
                            </Link>
                          </li>
                        </ul>
                      </li>

                      <li>
                        <Link
                          to={`${process.env.REACT_APP_BASE}/ticket-search`}
                          className="dropdown-item"
                        >
                          <i className="fe-search mr-1"></i> Search Interaction
                        </Link>
                      </li>

                      <li className="dropdown">
                        <ul
                          className="dropdown-menu"
                          aria-labelledby="navbarDropdown"
                        >
                          <li>
                            <Link
                              className="dropdown-item"
                              to={{
                                pathname: `${process.env.REACT_APP_BASE}/agent-chat`,
                                data: { sourceName: "fromDashboard" },
                              }}
                            >
                              Agent Live Chat
                            </Link>
                          </li>

                          <li>
                            <Link
                              className="dropdown-item"
                              to={{
                                pathname: `${process.env.REACT_APP_BASE}/agentChatListView`,
                                data: { sourceName: "fromDashboard" },
                              }}
                            >
                              Agent Chat View
                            </Link>
                          </li>

                          <li>
                            <Link
                              className="dropdown-item"
                              to={{
                                pathname: `${process.env.REACT_APP_BASE}/chat-monitoring`,
                                data: {},
                              }}
                            >
                              Chat Monitoring
                            </Link>
                          </li>
                        </ul>
                      </li>
                    </ul>
                  </li>
                  <li className="dropdown">
                    <span
                      className="nav-link dropdown-toggle arrow-none"
                      id="topnav-apps"
                      role="button"
                      data-toggle="dropdown"
                      aria-haspopup="true"
                      aria-expanded="false"
                    >
                      <i className="fas mdi mdi-lifebuoy mr-1 font-17"></i>{" "}
                      Project Management Tool <div className="arrow-down"></div>
                    </span>
                    <ul
                      className="dropdown-menu"
                      aria-labelledby="navbarDropdown"
                    >
                      <li>
                        <span
                          className="dropdown-item dropdown-toggle arrow-none"
                          id="topnav-apps"
                          role="button"
                          data-toggle="dropdown"
                          aria-haspopup="true"
                          aria-expanded="false"
                        >
                          <i className="fe-plus-circle mr-1" /> Manage Project
                          <div className="arrow-down"></div>
                        </span>
                        <ul
                          className="dropdown-menu"
                          aria-labelledby="navbarDropdown"
                        >
                          <li>
                            <Link
                              to={`${process.env.REACT_APP_BASE}/create-project`}
                              className="dropdown-item"
                            >
                              Create Project
                            </Link>
                          </li>

                          <li>
                            <Link
                              to={`${process.env.REACT_APP_BASE}/search-project`}
                              className="dropdown-item"
                            >
                              Search Project
                            </Link>
                          </li>
                        </ul>
                      </li>

                      <li>
                        <span
                          className="dropdown-item dropdown-toggle arrow-none"
                          id="topnav-apps"
                          role="button"
                          data-toggle="dropdown"
                          aria-haspopup="true"
                          aria-expanded="false"
                        >
                          <i className="fe-plus-circle mr-1" /> Manage Sprint
                          <div className="arrow-down"></div>
                        </span>
                        <ul
                          className="dropdown-menu"
                          aria-labelledby="navbarDropdown"
                        >
                          <li>
                            <Link
                              to={`${process.env.REACT_APP_BASE}/create-sprint`}
                              className="dropdown-item"
                            >
                              Create Sprint
                            </Link>
                          </li>

                          <li>
                            <Link
                              to={`${process.env.REACT_APP_BASE}/search-sprint`}
                              className="dropdown-item"
                            >
                              Search Sprint
                            </Link>
                          </li>
                        </ul>
                      </li>
                      <li>
                        <Link
                          to={`${process.env.REACT_APP_BASE}/board`}
                          className="dropdown-item"
                        >
                          <i className="fe-search mr-1"></i> Board
                        </Link>
                      </li>
                    </ul>
                  </li>
                </ul>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
