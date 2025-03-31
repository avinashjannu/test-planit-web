import React, { useContext, useState, useEffect, useRef } from "react";
import {
  Link,
  DirectLink,
  Element,
  Events,
  animateScroll as scroll,
  scrollSpy,
  scroller,
} from "react-scroll";
import "./backlog.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Avatar } from "antd";
import { properties } from "../properties";
import { post, put, get } from "../util/restUtil";
import { showSpinner, hideSpinner } from "../common/spinner/Spinner";
import { Colors, CategoryArray } from "./ProjectManagementData";
import IssueDetails from "./Request/issueDetails";
import moment from "moment";
import { AppContext } from "../AppContext";

const BackLogs = (props) => {
  console.log("backlog props", props);
  const [reqDtlModal, setReqDtlModal] = useState(false);
  const history = useNavigate();
  const {
    currProjectData,
    sprintList,
    projectData,
    userList,
    pmStatus,
    projectList,
  } = props?.data;
  const [issueList, setIssueList] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [data, setData] = useState({ projectName: "", projectId: "" });
  const [showImportantInstruction, setShowImportantInstruction] =
    useState(false);
  const contentEl = useRef();
  const currReqData = useRef();
  const [active, setActive] = useState(null);
  const [users, setUsers] = useState(userList);
  const [sprints, setSprints] = useState([]);
  const [backlogArray, setBacklogArray] = useState([]);
  const { auth } = useContext(AppContext);

  useEffect(() => {
    if (props?.data) {
      setSprints(sprintList);
      showSpinner();
      let obj = {
        projectId: currProjectData.projectId,
      };

      post(`${properties.PROJECT_MANAGEMENT_API}/get-request-list`, obj)
        .then((response) => {
          if (response.data) {
            console.log("get-request-list by project", response.data);
            setIssueList(response.data);
            const result = [];
            if (response.data && sprints.length > 0) {
              sprints.map((s) => {
                if (s.value === "BACKLOG") {
                  const backlogIssues = response.data.filter(
                    (f) => !f.sprintId
                  );
                  // if (backlogIssues.length > 0) {
                  result.push({
                    id: "BACKLOG",
                    header: "Backlog",
                    status: s.status,
                    items: backlogIssues,
                  });
                } else {
                  const issues = response.data.filter(
                    (f) => f.sprintId === s.value
                  );
                  result.push({
                    id: s.value,
                    header: s.label,
                    status: s.status,
                    items: issues,
                  });
                }
              });
              console.log("result", result);
              setBacklogArray(result);
            }
          }
        })
        .finally(hideSpinner);
    }
  }, [props?.data, reqDtlModal, sprints, sprintList]);

  const handleToggle = (index) => {
    if (active === index) {
      setActive(null);
    } else {
      setActive(index);
    }
  };
  const handleRequestDetails = (task) => {
    currReqData.current = task;
    setReqDtlModal(true);
  };
  const handleStartSprint = (faq) => {
    console.log("inside start Sprint", faq, sprintList);
    let sprintArray = sprints.filter(
      (f) => f.status === "ACTIVE" || f.status === "AC"
    );
    if (sprintArray.length > 0) {
      toast.error("Please end active sprint");
    } else {
      let obj = {
        mode: "edit",
        sprintId: faq.id,
        status: "ACTIVE",
      };
      console.log("obj", obj);
      showSpinner();
      post(properties.PROJECT_MANAGEMENT_API + "/sprint/create", obj)
        .then((resp) => {
          if (resp.data) {
            toast.success("Sprint activated successfully");
            get(
              properties.PROJECT_MANAGEMENT_API +
                "/sprint-list/" +
                currProjectData.projectId
            ).then((response) => {
              if (response.data) {
                console.log("sprint-list", response.data);
                let sprintArray = [];
                let activeSprint;
                response.data.map((e) => {
                  sprintArray.push({
                    label: e.sprintName,
                    value: e.sprintId,
                    startDate: e.startDate,
                    endDate: e.endDate,
                    status: e.status,
                  });
                });
                sprintArray.push({
                  label: "Backlog",
                  value: "BACKLOG",
                  startDate: currProjectData?.startDate,
                  endDate: currProjectData?.endDate,
                  status: "BACKLOG",
                });
                console.log("sprintArray", sprintArray);
                setSprints(sprintArray);
              }
            });
          }
        })
        .finally(hideSpinner);
    }
  };
  const handleEndSprint = (faq) => {
    console.log("inside End Sprint", faq);
    let pendingTask = [];
    if (faq.items.length > 0) {
      pendingTask = faq?.items.filter(
        (f) => f.currStatus !== "PM_DONE" && f.sprintId === faq.id
      );
    }
    if (pendingTask.length > 0) {
      toast.error("This sprint has pending requests");
    } else {
      let obj = {
        mode: "edit",
        sprintId: faq.id,
        status: "IN",
      };
      showSpinner();
      post(properties.PROJECT_MANAGEMENT_API + "/sprint/create", obj)
        .then((resp) => {
          if (resp.data) {
            toast.success("Sprint Ended Successfully");
            get(
              properties.PROJECT_MANAGEMENT_API +
                "/sprint-list/" +
                currProjectData.projectId
            ).then((response) => {
              if (response.data) {
                console.log("sprint-list", response.data);
                let sprintArray = [];
                let activeSprint;
                response.data.map((e) => {
                  sprintArray.push({
                    label: e.sprintName,
                    value: e.sprintId,
                    startDate: e.startDate,
                    endDate: e.endDate,
                    status: e.status,
                  });
                });
                sprintArray.push({
                  label: "Backlog",
                  value: "BACKLOG",
                  startDate: currProjectData?.startDate,
                  endDate: currProjectData?.endDate,
                  status: "BACKLOG",
                });
                console.log("sprintArray", sprintArray);
                setSprints(sprintArray);
              }
            });
          }
        })
        .finally(hideSpinner);
    }
  };
  return (
    <>
      <div className="row mt-1">
        <div className="col-12 p-0">
          <div className="card-box">
            <Element name="projectDetailsSection" className="element">
              <div className="pt-0 mt-0">
                <div className="row mt-1">
                  <div className="col-lg-12">
                    {backlogArray &&
                      backlogArray.map((faq, index) => {
                        return (
                          <div className="rc-accordion-card">
                            <div className="rc-accordion-header">
                              <span
                                className={`rc-accordion-toggle p-2 ${
                                  active === index ? "active" : ""
                                }`}
                                onClick={() => handleToggle(index)}
                              >
                                <h5 className="rc-accordion-title ">
                                  <i className="fa fa-chevron-down rc-accordion-icon"></i>{" "}
                                  &nbsp;{faq.header}
                                  &nbsp;&nbsp;
                                  <small className="">
                                    {"(" + faq?.items?.length + " issues)"}{" "}
                                  </small>
                                </h5>

                                {faq.status !== "BACKLOG" &&
                                  ["admin", "PROJECT MANAGER"].includes(
                                    auth?.currRole
                                  ) && (
                                    <>
                                      {faq.status === "AC" ||
                                      faq.status === "ACTIVE" ? (
                                        <button
                                          type="button"
                                          className="btn btn-secondary "
                                          onClick={() => {
                                            handleEndSprint(faq);
                                          }}
                                        >
                                          End Sprint
                                        </button>
                                      ) : (
                                        <button
                                          type="button"
                                          className="btn btn-secondary "
                                          onClick={() => {
                                            handleStartSprint(faq);
                                          }}
                                        >
                                          Start Sprint
                                        </button>
                                      )}
                                    </>
                                  )}
                              </span>
                            </div>
                            <div
                              ref={contentEl}
                              className={`rc-collapse ${
                                active === index ? "show" : ""
                              }`}
                            >
                              <div className="rc-accordion-body">
                                <table
                                  className="table table-responsive table-striped dt-responsive nowrap w-100"
                                  style={{
                                    textAlign: "left",
                                    marginLeft: "1px",
                                  }}
                                >
                                  <tbody>
                                    {faq?.items.length > 0 ? (
                                      <>
                                        {faq?.items.map((item, i) => {
                                          let randomColor = "#".concat(
                                            Math.floor(Math.random() * 16777215)
                                              .toString(16)
                                              .toString()
                                          );
                                          return (
                                            <tr className="mb-0">
                                              <td
                                                onClick={(e) => {
                                                  handleRequestDetails(item);
                                                  // setReqDtlModal(true)
                                                }}
                                              >
                                                <span
                                                  className="text-left"
                                                  style={{
                                                    height: 24,
                                                    marginRight: "3px",
                                                  }}
                                                >
                                                  {CategoryArray.map((c) => {
                                                    if (
                                                      c.value === item.category
                                                    ) {
                                                      return (
                                                        <span
                                                          style={{
                                                            alignItems:
                                                              "center",
                                                            cursor: "pointer",
                                                          }}
                                                        >
                                                          {c.icon}
                                                        </span>
                                                      );
                                                    }
                                                  })}
                                                </span>
                                                <span
                                                  className="text-center"
                                                  style={{
                                                    fontWeight: "350",
                                                    backgroundColor:
                                                      "lightgray",
                                                    padding: "1px",
                                                  }}
                                                >
                                                  {item?.requestId}
                                                </span>
                                                &nbsp;&nbsp;
                                                {item?.header}
                                                {/* <span className='text-right' style={{ float: 'right' }}>
                                                                                            {item?.currStatus}
                                                                                        </span> */}
                                                <span
                                                  className="text-right"
                                                  style={{
                                                    float: "right",
                                                    display: "flex",
                                                  }}
                                                >
                                                  {item?.uxRequired ===
                                                    "YES" && (
                                                    <span
                                                      style={{
                                                        marginRight: "4px",
                                                        padding: "2px",
                                                      }}
                                                    >
                                                      <h6
                                                        title="UX Required"
                                                        style={{
                                                          fontWeight: "350",
                                                          backgroundColor:
                                                            "lightgray",
                                                          padding: "1px",
                                                        }}
                                                      >
                                                        UX
                                                      </h6>
                                                    </span>
                                                  )}

                                                  {item?.qaRequired ===
                                                    "YES" && (
                                                    <span
                                                      style={{
                                                        marginRight: "4px",
                                                        padding: "2px",
                                                      }}
                                                    >
                                                      <h6
                                                        title="QA Required"
                                                        style={{
                                                          fontWeight: "350",
                                                          backgroundColor:
                                                            "lightgray",
                                                          padding: "1px",
                                                        }}
                                                      >
                                                        QA
                                                      </h6>
                                                    </span>
                                                  )}
                                                  <span
                                                    style={{
                                                      marginRight: "4px",
                                                      backgroundColor:
                                                        "#ADD8E6",
                                                      padding: "2px",
                                                    }}
                                                  >
                                                    {
                                                      item?.statusDesc
                                                        ?.description
                                                    }
                                                  </span>
                                                  <span
                                                    style={{
                                                      marginRight: "4px",
                                                      padding: "2px",
                                                      fontWeight: "600",
                                                    }}
                                                  >
                                                    {moment(
                                                      item?.dueDate
                                                    ).format("YYYY-MM-DD")}
                                                  </span>

                                                  <Avatar
                                                    title={
                                                      item?.assigneeDetails
                                                        ?.firstName
                                                    }
                                                    key={1}
                                                    size="small"
                                                    round={true}
                                                    style={{
                                                      backgroundColor:
                                                        randomColor,
                                                      verticalAlign: "middle",
                                                      cursor: "pointer",
                                                      fontSize: "0.9rem",
                                                    }}
                                                  >
                                                    <span
                                                      style={{
                                                        padding: "0px",
                                                        color: "white",
                                                      }}
                                                    >
                                                      {" "}
                                                      {item?.assigneeDetails?.firstName
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        item?.assigneeDetails?.lastName
                                                          .charAt(0)
                                                          .toUpperCase()}
                                                    </span>
                                                  </Avatar>
                                                </span>
                                              </td>
                                            </tr>
                                          );
                                        })}{" "}
                                      </>
                                    ) : (
                                      <>
                                        <span className="text-center">
                                          No Requests Found
                                        </span>
                                      </>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    {/* {faqs && faqs.map((faq, index) => {
                                                                return (
                                                                    <div className="rc-accordion-card">
                                                                        <div className="rc-accordion-header">
                                                                            <div className={`rc-accordion-toggle p-3 ${active === faq.id ? 'active' : ''}`} onClick={() => handleToggle(faq.id)}>
                                                                                <h5 className="rc-accordion-title">{faq.header}</h5>
                                                                                <i className="fa fa-chevron-down rc-accordion-icon"></i>
                                                                            </div>
                                                                        </div>
                                                                        <div ref={contentEl} className={`rc-collapse ${active === faq.id ? 'show' : ''}`} style={
                                                                            active === faq.id
                                                                                ? { height: contentEl.current.scrollHeight }
                                                                                : { height: "0px" }
                                                                        }>
                                                                            <div className="rc-accordion-body">
                                                                                <p className='mb-0'>{faq.text}</p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            })
                                                            } */}
                  </div>
                </div>
              </div>
            </Element>
          </div>
        </div>
        {reqDtlModal && (
          <IssueDetails
            isOpen={reqDtlModal}
            setIsOpen={setReqDtlModal}
            data={{
              pmStatus: pmStatus,
              task: currReqData?.current,
              projectData: currProjectData,
              // sprintData: currSprintdata,
              sprintList: sprintList,
              projectList: projectList,
            }}
            handlers={
              {
                // setRefresh: setRefresh
              }
            }
          ></IssueDetails>
        )}
      </div>
    </>
  );
};

export default BackLogs;
