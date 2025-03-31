import React, { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { properties } from "../properties";
import { post } from "../util/restUtil";
import { showSpinner, hideSpinner } from "../common/spinner/Spinner";
import { AppContext } from "../AppContext";
import { string, object } from "yup";
import { useTranslation } from "react-i18next";
import login1 from "../assets/images/login1.jpg";
import login2 from "../assets/images/login2.jpg";
import login3 from "../assets/images/login3.jpg";
import Captcha from "react-google-recaptcha";
import { toast } from "react-toastify";
import moment from "moment";
import Slider from "react-slick";
import Footer from "../common/Footer";
import bct from "../assets/images/bct.jpg";
import planitLogo from "../assets/images/plan-it-transparent.svg";

const validationSchema = object().shape({
  email: string().required("Please enter Email ID/User ID"), //.email("Please enter a valid email"),
  password: string().required("Please enter password"),
});

const Login = () => {
  console.log("test");
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [userCred, setUserCred] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState({});
  const [apiMessage, setApiMessage] = useState();

  const [validCaptcha, setValidCaptcha] = useState(false);

  const images = [{ src: login1 }, { src: login2 }, { src: login3 }];
  let { auth, setAuth } = useContext(AppContext);
  console.log("auth inside login", auth);
  var settings = {
    dots: true,
    infinite: false,
    arrows: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    initialSlide: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: true,
          dots: false,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          initialSlide: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };
  useEffect(() => {
    const remember = localStorage.getItem("rememberMe") === "true";
    const user = remember ? localStorage.getItem("user") : "";
    const password = remember ? localStorage.getItem("password") : "";
    setUserCred({ ...userCred, email: user, password: password });
    setRememberMe(remember);
    if (auth && auth.accessToken && auth.user && auth.accessToken !== "") {
      navigate(`${process.env.REACT_APP_BASE}/board`);
    }
  }, [auth]);

  const validate = () => {
    try {
      validationSchema.validateSync(userCred, { abortEarly: false });
    } catch (e) {
      e.inner.forEach((err) => {
        setError((prevState) => {
          return { ...prevState, [err.params.path]: err.message };
        });
      });
      return e;
    }
  };
  const verifyCaptcha = (res) => {
    if (res) {
      setValidCaptcha(true);
    }
  };
  const login = () => {
    let dashboardData = {
      refresh: false,
      autoRefresh: false,
      timer: 5,
      selfDept: "self",
      startDate: moment().startOf("year").format("DD-MM-YYYY"),
      endDate: moment().format("DD-MM-YYYY"),
    };
    let helpDeskSettings = {
      refresh: false,
      autoRefresh: false,
      timer: 1,
      startDate: moment().startOf("year").format("DD-MM-YYYY"),
      endDate: moment().format("DD-MM-YYYY"),
    };
    setApiMessage("");
    const error = validate(validationSchema, userCred);
    if (error) return;

    if (validCaptcha === true) {
      showSpinner();
      post(properties.USER_API + "/login", userCred)
        .then((resp) => {
          if (resp.data) {
            if (resp.data.status === "TEMP") {
              navigate(
                `${process.env.REACT_APP_BASE}/user/change-password/` +
                  resp.data.inviteToken,
                { data: resp.data }
              );
              toast.error("Please reset your password");
            }
            if (
              resp.data &&
              resp.data.challengeName === "NEW_PASSWORD_REQUIRED"
            ) {
              navigate(
                "/user/forceChangePassword/" +
                  resp.data.email +
                  "/" +
                  resp.data.session
              );
            } else {
              let loginData = resp.data;
              loginData["dashboardData"] = dashboardData;
              loginData["helpDeskData"] = helpDeskSettings;
              loginData["helpDeskInteractionData"] = helpDeskSettings;
              setAuth(loginData);
              sessionStorage.setItem("auth", JSON.stringify(loginData));
              localStorage.setItem("accessToken", resp.data.accessToken);
              localStorage.setItem("rememberMe", rememberMe);
              localStorage.setItem("user", rememberMe ? userCred.email : "");
              localStorage.setItem(
                "password",
                rememberMe ? userCred.password : ""
              );
            }
          } else {
            setApiMessage(resp.message);
          }
        })
        .catch((error) => {})

        .finally(hideSpinner);
    } else {
      toast.error("Please enter valid captcha");
      return;
    }
  };

  return (
    <div className="authentication-bg authentication-bg-pattern">
      <div className="account-pages mt-2 mt-3 p-0">
        <div className="container loginboxshadow">
          <div className="row">
            <div className="col-md-7 p-0 log-screen">
              <div className="carousel slide">
                <Slider {...settings} className="px-4">
                  {images.map((image, idx) => (
                    <img
                      src={idx === 0 ? login1 : idx === 1 ? login2 : login3}
                      key={idx}
                      height="600"
                    />
                  ))}
                </Slider>
              </div>
            </div>

            <div className="col-md-5 login-form p-0">
              <div className="card">
                <div className="card-body p-3">
                  <div className="text-center m-auto">
                    <div className="auth-logo">
                      <Link to="#" className="logo text-center">
                        <span className="logo-lg">
                          {/* <img src={logoLight} alt="" height="60" /> */}
                          <img src={planitLogo} alt="" height="60" />
                        </span>
                      </Link>
                    </div>
                    <h3 className="text-muted mb-4">{t("Login")}</h3>
                  </div>
                  <div class="col-12 mt-3 p-2 border ">
                    <div action="#">
                      <div className="form-group mb-3">
                        <label htmlFor="emailaddress">
                          {t("emailId_userId")}
                        </label>
                        <input
                          //className="form-control"
                          className={`form-control ${
                            error.email ? "input-error" : ""
                          }`}
                          type="email"
                          placeholder={t("Enter your Email or User ID")}
                          data-test="email"
                          value={userCred.email}
                          onChange={(e) => {
                            setUserCred({ ...userCred, email: e.target.value });
                            setError({ ...error, email: "" });
                          }}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") login();
                          }}
                        />
                        {error.email ? (
                          <span className="errormsg">{error.email}</span>
                        ) : (
                          ""
                        )}
                      </div>

                      <div className="form-group mb-3">
                        <label htmlFor="password">{t("Password")}</label>
                        <div className="input-group input-group-merge">
                          {/* <input type="password" id="password" className="form-control" placeholder="Enter your password" /> */}
                          <input
                            className={`form-control ${
                              error.password ? "input-error" : ""
                            }`}
                            type={showPassword === false ? "password" : "text"}
                            placeholder="Enter your password"
                            data-test="password"
                            value={userCred.password}
                            onChange={(e) => {
                              setUserCred({
                                ...userCred,
                                password: e.target.value,
                              });
                              setError({ ...error, password: "" });
                            }}
                            onKeyPress={(e) => {
                              if (e.key === "Enter") login();
                            }}
                          />

                          <div
                            className={`input-group-append ${
                              showPassword === false ? "" : "show-password"
                            }`}
                            data-password="false"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            <div
                              className="input-group-text"
                              style={
                                showPassword === false
                                  ? { cursor: "pointer" }
                                  : { backgroundColor: "", cursor: "pointer" }
                              }
                            >
                              <span className="password-eye font-12"></span>
                            </div>
                          </div>
                          {error.password ? (
                            <span className="errormsg">{error.password}</span>
                          ) : (
                            ""
                          )}
                        </div>
                      </div>

                      <div
                        className="form-group mb-3 captcha"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") login();
                        }}
                      >
                        <Captcha
                          sitekey={"6LdzapwdAAAAAAyO0js4SHNxfL0hogzYzr47tkjE"}
                          onChange={verifyCaptcha}
                        />
                      </div>

                      <div className="form-group mb-3">
                        <div className="custom-control custom-checkbox">
                          <input
                            type="checkbox"
                            value={rememberMe}
                            checked={rememberMe}
                            onChange={(e) => {
                              setRememberMe(e.target.checked);
                            }}
                            className="custom-control-input"
                            id="checkbox-signin"
                          />
                          <label
                            className="custom-control-label"
                            htmlFor="checkbox-signin"
                          >
                            {t("remember_me")}
                          </label>
                          <span className="float-right">
                            <label>
                              <Link
                                to={`${process.env.REACT_APP_BASE}/user/forgotpassword`}
                                data-test="forgotPass"
                              >
                                {t("Forgot Password")}?
                              </Link>
                            </label>
                          </span>
                        </div>
                      </div>
                      <div className="form-group mb-0 text-center">
                        <button
                          className="col-md-12 btn btn-primary"
                          type="button"
                          data-test="login"
                          onClick={login}
                        >
                          {t("Login")}
                        </button>
                        {/* <button className="btn btn-primary btn-block" type="button">Log In </button> */}
                      </div>
                      {apiMessage !== "" ? (
                        <p className="error-msg">{apiMessage}</p>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                  <br />
                  <div className="form-group mb-0 text-center">
                    <Link
                      to={`${process.env.REACT_APP_BASE}/user/register`}
                      className="col-md-12 btn btn-secondary waves-effect waves-light btn-block"
                      data-test="register"
                    >
                      {t("Register New User")}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer></Footer>
    </div>
  );
};

export default Login;
