import React, { useContext, useState } from "react";
import { AppContext } from "../AppContext";
import ToDo from "./header/Todo";
import ProfileNav from "./header/ProfileNav";
import planitLogo from "../assets/images/plan-it-transparent.svg";
import { Link } from "react-router-dom";

const Header = (props) => {
  const [display, setDisplay] = useState(false);
  return (
    <div>
      <div className="navbar-custom">
        <div className="container-fluid">
          <ul className="list-unstyled topnav-menu float-right mb-0">
            <ProfileNav></ProfileNav>
            <ToDo></ToDo>
          </ul>
          <div className="logo-box">
            <Link to="/" className="logo logo-light text-center">
              <span className="logo-lg">
                <img src={planitLogo} alt="" height="80" />
              </span>
            </Link>
          </div>
          <div className="clearfix"></div>
        </div>
      </div>
    </div>
  );
};

export default Header;
