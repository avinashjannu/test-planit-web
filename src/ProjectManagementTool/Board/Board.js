import React, { useState, useEffect, useRef, useContext } from "react";
import {
  Link,
  DirectLink,
  Element,
  Events,
  animateScroll as scroll,
  scrollSpy,
  scroller,
} from "react-scroll";
import CreateIssue from "../Request/createIssue";
import "./board.css";
import "../jira.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Avatar } from "antd";
import { properties } from "../../properties";
import { post, put, get } from "../../util/restUtil";
import { showSpinner, hideSpinner } from "../../common/spinner/Spinner";
import Select from "react-select";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import moment from "moment";
import { Colors, CategoryArray } from "../ProjectManagementData";
import IssueDetails from "../Request/issueDetails";
import BackLogs from "../backlogs";
import { AppContext } from "../../AppContext";

const Board = (props) => {
  //   const { auth } = useContext(AppContext);
  //   console.log("auth", auth);
  const history = useNavigate();
  const lookupData = useRef({});
  const projectData = useRef({});
  const currTaskData = useRef({});
  const currSprint = useRef({});
  const [isOpen, setIsOpen] = useState(false);
  const [projectList, setProjectList] = useState([]);
  const [sprintList, setSprintList] = useState([]);
  const [parameter, setParameter] = useState("");
  const [currReqDtl, setCurrReqDtl] = useState({});
  const [currProjectData, setCurrProjectData] = useState({});
  const [currSprintdata, setCurrSprintdata] = useState({});
  const [showBoard, setShowBoard] = useState(false);
  const [requestList, setRequestList] = useState([]);
  const [data, setData] = useState({ projectName: "", projectId: "" });
  const [pmStatus, setPmStatus] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [userList, setUserList] = useState([]);
  const [showClear, setShowClear] = useState(false);
  const [reqDtlModal, setReqDtlModal] = useState(false);
  const [issueList, setIssueList] = useState([]);
  const [backlogOpen, setBacklogOpen] = useState(false);
  function groupBy(objectArray, property) {
    return objectArray.reduce((acc, obj) => {
      const key = obj[property];
      const curGroup = acc[key] ?? [];

      return { ...acc, [key]: [...curGroup, obj] };
    }, {});
  }
  let styles = {
    verticalAlign: "middle",
    cursor: "pointer",
    borderStyle: "solid",
    borderColor: "black",
  };

  useEffect(() => {
    //showSpinner();
    // post(properties.BUSINESS_ENTITY_API, ["PM_STATUS"]).then((response) => {
    //   if (response.data) {
    //     lookupData.current = response.data;
    //     setPmStatus(lookupData.current["PM_STATUS"]);
    //   }
    // });
    // post(`${properties.PROJECT_MANAGEMENT_API}/project-list?`, {})
    //   .then((resp) => {
    //     if (resp.data) {
    //       let projectArray = [];
    //       resp.data.map((e) => {
    //         if (
    //           e.hasOwnProperty("mappingPayload") &&
    //           e.mappingPayload.hasOwnProperty("users")
    //         ) {
    //           console.log("e", e);
    //           projectArray.push({
    //             label: e.projectName,
    //             value: e.projectId,
    //             startDate: e.startDate,
    //             endDate: e.endDate,
    //           });
    //         }
    //       });
    //       if (projectArray.length > 0) {
    //         projectData.current = projectArray[0];
    //         handleProjectChange(projectArray[0]);
    //         setData({
    //           ...data,
    //           projectId: projectArray[0].projectId,
    //           projectName: projectArray[0].projectName,
    //         });
    //         setProjectList(projectArray);
    //         get(
    //           properties.PROJECT_MANAGEMENT_API +
    //             "/sprint-list/" +
    //             projectArray[0].value
    //         ).then((resp) => {
    //           if (resp.data) {
    //             let sprintArray = [];
    //             resp.data.map((e) => {
    //               if (e.status === "AC" || e.status === "ACTIVE") {
    //                 setCurrSprintdata(e);
    //                 currSprint.current = e;
    //               } else {
    //                 setCurrSprintdata({});
    //                 currSprint.current = {};
    //               }
    //               sprintArray.push({
    //                 label: e.sprintName,
    //                 value: e.sprintId,
    //                 startDate: e.startDate,
    //                 endDate: e.endDate,
    //                 status: e.status,
    //               });
    //             });
    //             sprintArray.push({
    //               label: "Backlog",
    //               value: "BACKLOG",
    //               startDate: projectData.current?.startDate,
    //               endDate: projectData.current?.endDate,
    //               status: "BACKLOG",
    //             });
    //             setSprintList(sprintArray);
    //           }
    //         });
    //       }
    //     }
    //   })
    //   .finally(hideSpinner);
  }, []);

  useEffect(() => {
    if (projectData?.current?.value) {
      handleProjectChange(projectData.current);
    }
  }, [reqDtlModal, isOpen, backlogOpen]);

  const getTaskList = (obj) => {
    showSpinner();
    post(`${properties.PROJECT_MANAGEMENT_API}/get-request-list`, obj)
      .then((response) => {
        if (response.data) {
          setIssueList(response.data);
          let result = [];
          result.push(groupBy(response.data, "currStatus"));

          let taskArray = [];
          result.map((e) => {
            lookupData.current["PM_STATUS"].map((p) => {
              let found = false;
              Object.keys(e).map((k) => {
                if (k === p.code) {
                  found = true;
                  taskArray.push({
                    status: p.description,
                    items: Object.values(e[p.code]),
                    orderId: p.mapping.orderId,
                  });
                }
              });
              if (found === false) {
                taskArray.push({
                  status: p.description,
                  items: [],
                  orderId: p.mapping.orderId,
                  usersAssign: {},
                });
              }
            });
          });

          taskArray.sort((a, b) => a.orderId - b.orderId);
          setRequestList(taskArray);
        }
      })
      .finally(hideSpinner);
  };

  const handleDragEnd = (result) => {
    let { source, destination, draggableId } = result;

    if (!result.destination) {
      return;
    }
    if (
      source.index === destination.index &&
      source.droppableId === destination.droppableId
    ) {
      return;
    }

    // let taskIdUpdate = draggableId;
    // let statusUpdate = destination.droppableId;
    let taskUpdate = {};
    pmStatus.map((e) => {
      if (e.description === destination.droppableId) {
        taskUpdate = {
          id: Number(draggableId),
          currStatus: e.code,
          sprintId: currSprint.current.sprintId,
        };
      }
    });
    showSpinner();
    put(
      properties.PROJECT_MANAGEMENT_API + "/request/update/" + taskUpdate.id,
      taskUpdate
    )
      .then((resp) => {
        if (resp.status === 200) {
          setRefresh(!refresh);
          getTaskList({ projectId: currProjectData.projectId });
        }
      })
      .finally(hideSpinner);

    // dispatch({
    //     type: UPDATE_TASK_STATUS_SAGA,
    //     taskUpdate,
    // })
  };
  const handleProjectChange = (e) => {
    if (e) {
      console.log("handle project change ", e);
      projectData.current = e;
      setData({ ...data, projectName: e?.label, projectId: e?.value });
      showSpinner();
      get(properties.PROJECT_MANAGEMENT_API + "/project-details/" + e.value)
        .then((resp) => {
          if (resp.data) {
            setCurrProjectData(resp.data);
            setShowBoard(true);
            get(
              properties.PROJECT_MANAGEMENT_API +
                "/sprint-list/" +
                resp?.data?.projectId
            ).then((response) => {
              if (response.data) {
                let sprintArray = [];
                let activeSprint;
                response.data.map((e) => {
                  if (e.status === "AC" || e.status === "ACTIVE") {
                    activeSprint = e;
                    setCurrSprintdata(activeSprint);
                    currSprint.current = activeSprint;
                    let searchParams = {
                      projectId: resp?.data?.projectId,
                      sprintId: activeSprint.sprintId,
                    };
                    post(
                      `${properties.PROJECT_MANAGEMENT_API}/get-request-list`,
                      searchParams
                    ).then((response) => {
                      if (response.data) {
                        setIssueList(response.data);
                        let result = [];
                        result.push(groupBy(response.data, "currStatus"));
                        let taskArray = [];
                        result.map((e) => {
                          lookupData.current["PM_STATUS"].map((p) => {
                            let found = false;
                            Object.keys(e).map((k) => {
                              if (k === p.code) {
                                found = true;
                                taskArray.push({
                                  status: p.description,
                                  items: Object.values(e[p.code]),
                                  orderId: p.mapping.orderId,
                                });
                              }
                            });
                            if (found === false) {
                              taskArray.push({
                                status: p.description,
                                items: [],
                                orderId: p.mapping.orderId,
                                usersAssign: {},
                              });
                            }
                          });
                        });

                        taskArray.sort((a, b) => a.orderId - b.orderId);
                        setRequestList(taskArray);
                      }
                    });
                  } else {
                    setRequestList([]);
                    setIssueList([]);
                    setCurrSprintdata({});
                    currSprint.current = {};
                  }
                  sprintArray.push({
                    label: e.sprintName,
                    value: e.sprintId,
                    startDate: e.startDate,
                    endDate: e.endDate,
                    status: e.status,
                  });
                });

                if (!activeSprint?.sprintId) {
                  toast.error("No active sprint");
                }
                sprintArray.push({
                  label: "Backlog",
                  value: "BACKLOG",
                  startDate: currProjectData?.startDate,
                  endDate: currProjectData?.endDate,
                  status: "BACKLOG",
                });

                setSprintList(sprintArray);
              }
            });

            if (resp?.data?.mappingPayload?.users) {
              post(
                properties.USER_API + "/get-users-by-ids",
                resp?.data?.mappingPayload?.users
              ).then((response) => {
                if (response.data) {
                  setUserList(response.data);
                }
              });
            }
          }
        })
        .finally(hideSpinner);
      // get(properties.PROJECT_MANAGEMENT_API + "/sprint-list/" + projectData.current.value)
      //     .then((resp) => {
      //         if (resp.data) {
      //             let sprintArray = []
      //             resp.data.map((e) => {
      //                 if (e.status === "AC" || e.status === "ACTIVE") {
      //                     console.log("inisde sprint if", e)
      //                     setCurrSprintdata(e)
      //                     currSprint.current = e
      //                 }
      //                 sprintArray.push({ label: e.sprintName, value: e.sprintId, startDate: e.startDate, endDate: e.endDate, status: e.status })
      //             })
      //             sprintArray.push({ label: 'Backlog', value: 'BACKLOG', startDate: currProjectData?.startDate, endDate: currProjectData?.endDate, status: "BACKLOG" })
      //             setSprintList(sprintArray)
      //         }

      //     }).finally(hideSpinner);
    }
  };
  // const renderCardTaskList = () => {
  //     return <DragDropContext onDragEnd={handleDragEnd}>
  //         <div style={{ display: "flex" }}>
  //             <div style={{
  //                 margin: "8px",
  //                 display: "flex",
  //                 width: "100%",
  //                 minHeight: "80vh",
  //             }}>
  //                 {
  //                     taksList?.map((taskListDetail, index) => {

  //                         return <Droppable droppableId={taskListDetail.status} key={index}>
  //                             {(provided) => {
  //                                 return (
  //                                     <div
  //                                         ref={provided.innerRef}
  //                                         {...provided.droppableProps}
  //                                         key={index}
  //                                         className="card"
  //                                         style={{ width: '17rem', height: 'auto', paddingBottom: 10, margin: '2px' }}>
  //                                         <div className="card-header">
  //                                             {taskListDetail.status} <span>{taskListDetail?.items?.length}</span>
  //                                         </div>
  //                                         <ul
  //                                             ref={provided.innerRef}
  //                                             {...provided.droppableProps}
  //                                             key={index}
  //                                             className="list-group list-group-flush">
  //                                             {
  //                                                 taskListDetail?.items.map((task, index) => {
  //                                                     return <Draggable key={task.id.toString()} index={index} draggableId={task.id.toString()}>
  //                                                         {(provided) => {
  //                                                             return (
  //                                                                 <li
  //                                                                     ref={provided.innerRef}
  //                                                                     {...provided.draggableProps}
  //                                                                     {...provided.dragHandleProps}
  //                                                                     className="list-group-item"
  //                                                                     data-toggle="modal"
  //                                                                     data-target="#infoModal"
  //                                                                 // onClick={() => {
  //                                                                 //     dispatch({
  //                                                                 //         type: GET_TASK_DETAIL_SAGA,
  //                                                                 //         taskId: task.id,
  //                                                                 //     })
  //                                                                 // }}
  //                                                                 >
  //                                                                     <p>
  //                                                                         {task.name}
  //                                                                     </p>
  //                                                                     <div className="block" style={{ display: 'flex' }}>
  //                                                                         <div className="block-right">
  //                                                                             <div className="avatar-group" style={{ display: 'flex' }}>
  //                                                                                 <div className="avatar-block">
  //                                                                                     <Avatar.Group maxCount={2} maxStyle={{ color: '#f56a00', backgroundColor: '#fde3cf' }} key={index}>
  //                                                                                         {task.usersAssign?.map((member, index) => {
  //                                                                                             return (member.imageUrl === '' || member.imageUrl === null) ? <Avatar key={index}>{member.login.charAt(0).toUpperCase()}</Avatar> : <Avatar src={member.imageUrl} key={index} />
  //                                                                                         })}
  //                                                                                     </Avatar.Group>
  //                                                                                 </div>
  //                                                                             </div>
  //                                                                         </div>
  //                                                                         <div style={{ display: 'flex', justifyContent: 'center' }}>
  //                                                                             <div style={{ width: 24, height: 24, lineHeight: '34px' }}>
  //                                                                                 <div style={{ cursor: 'pointer' }}>
  //                                                                                     <i className="fa fa-bookmark" style={{ fontSize: 18 }} />
  //                                                                                 </div>
  //                                                                             </div>
  //                                                                             <div style={{ width: 24, height: 24, lineHeight: '34px' }}>
  //                                                                                 <div style={{ cursor: 'pointer' }}>
  //                                                                                     <i className="fa fa-check-square" style={{ fontSize: 18 }} />
  //                                                                                 </div>
  //                                                                             </div>
  //                                                                             <div style={{ width: 24, height: 24, lineHeight: '34px' }}>
  //                                                                                 <div style={{ cursor: 'pointer' }}>
  //                                                                                     <i className="fa fa-arrow-up" style={{ fontSize: 18 }} />
  //                                                                                 </div>
  //                                                                             </div>
  //                                                                         </div>
  //                                                                     </div>
  //                                                                 </li>
  //                                                             )
  //                                                         }}
  //                                                     </Draggable>
  //                                                 })
  //                                             }
  //                                         </ul>

  //                                         {provided.placeholder}
  //                                     </div>
  //                                 )
  //                             }}
  //                         </Droppable>
  //                     })
  //                 }
  //             </div>
  //         </div>
  //     </DragDropContext>

  // }
  const handleSearch = (e) => {
    let searchParams = {
      projectId: currProjectData?.projectId,
      sprintId: currSprint.current?.sprintId,
      summary: e,
    };
    getTaskList(searchParams);
  };
  const handleFilters = (e) => {
    let searchParams = {
      projectId: currProjectData?.projectId,
      sprintId: currSprint.current?.sprintId,
      assignee: e?.userId,
    };
    getTaskList(searchParams);
  };
  const handleRequestDtlModalOpen = (value) => {
    let obj = { ...value };
    pmStatus.map((e) => {
      if (value.currStatus === e.code) {
        obj = {
          ...obj,
          currStatusDesc: e?.description,
          assigneeName: value?.assigneeDetails?.firstName,
        };
      }
    });
    setCurrReqDtl(obj);
    currTaskData.current = obj;
    setReqDtlModal(true);
  };
  const renderCardTaskList = () => {
    return (
      <DragDropContext onDragEnd={handleDragEnd}>
        <div style={{ display: "flex" }}>
          <div
            style={{
              margin: "8px",
              display: "flex",
              width: "100%",
              minHeight: "80vh",
            }}
          >
            {requestList &&
              requestList?.map((taskListDetail, index) => {
                return (
                  <Droppable droppableId={taskListDetail.status} key={index}>
                    {(provided) => {
                      return (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          key={index}
                          className="card"
                          style={{
                            width: "17rem",
                            height: "auto",
                            paddingBottom: 10,
                            margin: "5px",
                          }}
                        >
                          <div className="card-header">
                            {taskListDetail.status}{" "}
                            <span>{taskListDetail?.items?.length}</span>
                          </div>
                          <ul
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            key={index}
                            className="list-group list-group-flush"
                            style={{
                              backgroundColor: "lightgrey",
                              paddingBottom: "2px",
                            }}
                          >
                            {taskListDetail?.items.map((task, index) => {
                              Colors.map((c) => {});
                              let randomColor = "#".concat(
                                Math.floor(Math.random() * 16777215)
                                  .toString(16)
                                  .toString()
                              );

                              return (
                                <Draggable
                                  key={task.requestId.toString()}
                                  index={index}
                                  draggableId={task.requestId.toString()}
                                >
                                  {(provided) => {
                                    return (
                                      <li
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className="list-group-item p-1"
                                        // style={{ overflow: 'hidden', whiteSpace: 'pre-wrap', fontWeight: '3px' }}
                                        data-toggle="modal"
                                        data-target="#infoModal"
                                        onClick={() => {
                                          handleRequestDtlModalOpen(task);
                                        }}
                                      >
                                        <span
                                          style={{
                                            overflow: "hidden",
                                            whiteSpace: "pre-wrap",
                                            fontWeight: "3px",
                                            padding: "1px",
                                          }}
                                        >
                                          {" "}
                                          {task.header}
                                        </span>

                                        <div style={{ display: "flex" }}>
                                          {task.uxRequired === "YES" && (
                                            <div
                                              style={{
                                                height: 24,
                                                lineHeight: "34px",
                                              }}
                                            >
                                              <span
                                                style={{ cursor: "pointer" }}
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
                                              </span>{" "}
                                              &nbsp;
                                            </div>
                                          )}
                                          {task.qaRequired === "YES" && (
                                            <div
                                              style={{
                                                height: 24,
                                                lineHeight: "34px",
                                                paddingLeft: "2px",
                                              }}
                                            >
                                              <span
                                                style={{ cursor: "pointer" }}
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
                                            </div>
                                          )}
                                          <i
                                            class="far fa-clock"
                                            style={{
                                              margin: "3px",
                                              alignSelf: "center",
                                            }}
                                          ></i>
                                          <h6 style={{ fontWeight: "700" }}>
                                            {moment(task.dueDate).format("ll")}
                                          </h6>
                                        </div>
                                        <div
                                          className="block"
                                          style={{ display: "flex" }}
                                        >
                                          <div
                                            style={{
                                              display: "flex",
                                              justifyContent: "center",
                                            }}
                                          >
                                            <div
                                              style={{
                                                height: 24,
                                                lineHeight: "34px",
                                              }}
                                            >
                                              {CategoryArray.map((c) => {
                                                if (c.value === task.category) {
                                                  return (
                                                    <div
                                                      style={{
                                                        alignItems: "center",
                                                        cursor: "pointer",
                                                      }}
                                                    >
                                                      {c.icon}
                                                    </div>
                                                  );
                                                }
                                              })}

                                              {/* <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                                        {e.icon}
                                                                                        <span style={{ marginLeft: 5 }}>{e.text}</span>
                                                                                    </div> */}
                                            </div>
                                            <div
                                              style={{
                                                height: 24,
                                                lineHeight: "34px",
                                              }}
                                            >
                                              <div
                                                style={{ cursor: "pointer" }}
                                              >
                                                <h6
                                                  style={{ fontWeight: "700" }}
                                                >
                                                  {task.category.toUpperCase() +
                                                    "-" +
                                                    task.requestId}
                                                </h6>
                                              </div>
                                            </div>
                                          </div>

                                          <div className="block-left">
                                            <div
                                              className="avatar-group"
                                              style={{ display: "flex" }}
                                            >
                                              <div className="avatar-block">
                                                <Avatar.Group
                                                  maxCount={2}
                                                  maxStyle={{
                                                    color: "#f56a00",
                                                    backgroundColor: "#fde3cf",
                                                  }}
                                                  key={index}
                                                >
                                                  <Avatar
                                                    title={
                                                      task?.assigneeDetails
                                                        ?.firstName +
                                                      " " +
                                                      task?.assigneeDetails
                                                        ?.lastName
                                                    }
                                                    key={index}
                                                    size="45"
                                                    round={true}
                                                    style={{
                                                      backgroundColor:
                                                        randomColor,
                                                      verticalAlign: "middle",
                                                      cursor: "pointer",
                                                    }}
                                                  >
                                                    <span
                                                      style={{
                                                        padding: "0px",
                                                        color: "white",
                                                      }}
                                                    >
                                                      {" "}
                                                      {task?.assigneeDetails?.firstName
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        task?.assigneeDetails?.lastName
                                                          .charAt(0)
                                                          .toUpperCase()}
                                                    </span>
                                                  </Avatar>
                                                  {/* {task.assigneeDetails?.map((member, index) => {
                                                                                                //  return (member.profilePicture === '' || member.profilePicture === null) ? <Avatar key={index}>{member.login.charAt(0).toUpperCase()}</Avatar> : <Avatar src={userImage} key={index} />
                                                                                                return <Avatar src={userImage} key={index} />
                                                                                            })} */}
                                                </Avatar.Group>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </li>
                                    );
                                  }}
                                </Draggable>
                              );
                            })}
                          </ul>

                          {provided.placeholder}
                        </div>
                      );
                    }}
                  </Droppable>
                );
              })}
          </div>
        </div>
      </DragDropContext>
    );
  };
  const handleBacklog = () => {
    setBacklogOpen(true);
  };
  return (
    <>
      <div className="row">
        <div className="col-12">
          <div className="page-title-box">
            <h4 className="page-title">Project Board</h4>
          </div>
        </div>
      </div>
      <div className="row mt-1">
        <div className="col-12 p-0">
          <div className="card-box">
            <div className="col-md-9">
              <div className="app-search-box dropdown">
                <div className="input-group">
                  <Select
                    className="col-4 p-0 "
                    components={{
                      IndicatorSeparator: () => null,
                    }}
                    value={[projectData.current]}
                    placeholder={"Please Select Project"}
                    name="project"
                    options={projectList}
                    onChange={handleProjectChange}
                  />
                </div>
              </div>
            </div>
            <br />
            {showBoard && userList && requestList && (
              <div className="d-flex">
                <div className="col-2 p-0 sticky">
                  <ul className="list-group">
                    <li>
                      <Link
                        activeclassName="active"
                        className="list-group-item list-group-item-action"
                        to="attachmentsSection"
                        spy={true}
                        offset={-190}
                        smooth={true}
                        duration={100}
                        onClick={() => {
                          setBacklogOpen(false);
                        }}
                      >
                        Board
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="list-group-item list-group-item-action"
                        onClick={() => {
                          handleBacklog();
                        }}
                      >
                        Backlogs
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="new-customer col-md-10 p-0">
                  <Element name="projectDetailsSection" className="element">
                    <div className="row">
                      <div className="col-12 p-0">
                        <section className="triangle d-flex ">
                          {backlogOpen ? (
                            <>
                              <h4
                                className="pl-2"
                                style={{ alignContent: "left" }}
                              >
                                Backlogs
                              </h4>
                              <div className="text-right">
                                &nbsp;
                                <button
                                  type="button"
                                  className="btn btn-primary waves-effect waves-light m-2 "
                                  onClick={(e) => {
                                    setIsOpen(true);
                                  }}
                                >
                                  Create
                                </button>
                              </div>
                            </>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-primary waves-effect waves-light m-2 "
                              onClick={(e) => {
                                setIsOpen(true);
                              }}
                            >
                              Create
                            </button>
                          )}
                        </section>
                      </div>
                    </div>
                    <div className="pt-0 mt-0">
                      <fieldset className="scheduler-border">
                        <div className="row mt-1">
                          <div className="col-lg-12">
                            <div className="search-result-box m-t-30 card-box">
                              <div className="row mt-2">
                                <div className="col-lg-12">
                                  <div style={{}}>
                                    <div>
                                      <div
                                        className="info"
                                        style={{ display: "flex" }}
                                      >
                                        <span className="search-block">
                                          <div className="col-md-6">
                                            <div className="app-search-box dropdown">
                                              <div className="input-group">
                                                <input
                                                  type="text"
                                                  className="form-control "
                                                  onChange={(e) => {
                                                    setShowClear(true);
                                                    setParameter(
                                                      e.target.value
                                                    );
                                                    handleSearch(
                                                      e.target.value
                                                    );
                                                  }}
                                                  maxLength={10}
                                                  value={parameter}
                                                ></input>
                                                <div className="input-group-append">
                                                  <button
                                                    disabled
                                                    className="btn btn-secondary btn-sm"
                                                    // onClick={handleSearch}
                                                    type="button"
                                                  >
                                                    <i className="fe-search"></i>
                                                  </button>
                                                </div>
                                                {/* <span className="errormsg">{error.serviceNo ? error.serviceNo : ""}</span> */}
                                              </div>
                                            </div>
                                          </div>
                                        </span>

                                        <span
                                          className="avatar-group"
                                          style={{ display: "flex" }}
                                        >
                                          <Avatar.Group
                                            maxCount={5}
                                            size="large"
                                            maxStyle={{
                                              color: "#f56a00",
                                              backgroundColor: "#fde3cf",
                                            }}
                                          >
                                            {userList &&
                                              userList.map((u) => {
                                                let randomColor = "#".concat(
                                                  Math.floor(
                                                    Math.random() * 16777215
                                                  )
                                                    .toString(16)
                                                    .toString()
                                                );
                                                return (
                                                  <Avatar
                                                    title={
                                                      u?.firstName +
                                                      " " +
                                                      u?.lastName
                                                    }
                                                    key={1}
                                                    size="45"
                                                    round={true}
                                                    style={{
                                                      backgroundColor:
                                                        randomColor,
                                                      verticalAlign: "middle",
                                                      cursor: "pointer",
                                                    }}
                                                  >
                                                    <span
                                                      style={{
                                                        padding: "0px",
                                                        color: "white",
                                                      }}
                                                      onClick={(e) => {
                                                        setShowClear(true);
                                                        handleFilters(u);
                                                      }}
                                                    >
                                                      {" "}
                                                      {u?.firstName
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        u?.lastName
                                                          .charAt(0)
                                                          .toUpperCase()}
                                                    </span>
                                                  </Avatar>
                                                );
                                              })}
                                          </Avatar.Group>
                                        </span>
                                        {/* {/* <div style={{ marginLeft: 20 }} className="text ml-5">Only My Issues</div> */}
                                        {showClear && (
                                          <span
                                            style={{ marginLeft: 20 }}
                                            className="text"
                                          >
                                            <Link
                                              className="dropdown-item"
                                              to="#"
                                              onClick={(e) => {
                                                setParameter("");
                                                handleFilters();
                                                setShowClear(!showClear);
                                              }}
                                            >
                                              Clear Filters
                                            </Link>
                                          </span>
                                        )}
                                      </div>

                                      {backlogOpen ? (
                                        <div className="content">
                                          <BackLogs
                                            data={{
                                              currProjectData,
                                              sprintList,
                                              projectData,
                                              // requestList,
                                              screen: "Backlogs",
                                              userList,
                                              pmStatus,
                                              projectList,
                                            }}
                                          ></BackLogs>
                                        </div>
                                      ) : (
                                        <div
                                          className="content"
                                          style={{ display: "flex" }}
                                        >
                                          <div
                                            className="data-scroll1"
                                            style={{
                                              display: "flex",
                                              width: "100%",
                                              overflowX: "scroll",
                                              overflowY: "hidden",
                                              whiteSpace: "nowrap",
                                            }}
                                          >
                                            <DragDropContext
                                              onDragEnd={handleDragEnd}
                                            >
                                              <div style={{ display: "flex" }}>
                                                <div
                                                  style={{
                                                    margin: "8px",
                                                    display: "flex",
                                                    width: "100%",
                                                    minHeight: "80vh",
                                                  }}
                                                >
                                                  {requestList &&
                                                    requestList?.map(
                                                      (
                                                        taskListDetail,
                                                        index
                                                      ) => {
                                                        return (
                                                          <Droppable
                                                            droppableId={
                                                              taskListDetail.status
                                                            }
                                                            key={index}
                                                          >
                                                            {(provided) => {
                                                              return (
                                                                <div
                                                                  ref={
                                                                    provided.innerRef
                                                                  }
                                                                  {...provided.droppableProps}
                                                                  key={index}
                                                                  className="card"
                                                                  style={{
                                                                    width:
                                                                      "17rem",
                                                                    height:
                                                                      "auto",
                                                                    paddingBottom: 10,
                                                                    margin:
                                                                      "5px",
                                                                  }}
                                                                >
                                                                  <div className="card-header">
                                                                    {
                                                                      taskListDetail.status
                                                                    }{" "}
                                                                    <span>
                                                                      {
                                                                        taskListDetail
                                                                          ?.items
                                                                          ?.length
                                                                      }
                                                                    </span>
                                                                  </div>
                                                                  <ul
                                                                    ref={
                                                                      provided.innerRef
                                                                    }
                                                                    {...provided.droppableProps}
                                                                    key={index}
                                                                    className="list-group list-group-flush"
                                                                    style={{
                                                                      backgroundColor:
                                                                        "lightgrey",
                                                                      paddingBottom:
                                                                        "2px",
                                                                    }}
                                                                  >
                                                                    {taskListDetail?.items.map(
                                                                      (
                                                                        task,
                                                                        index
                                                                      ) => {
                                                                        Colors.map(
                                                                          (
                                                                            c
                                                                          ) => {}
                                                                        );
                                                                        let randomColor =
                                                                          "#".concat(
                                                                            Math.floor(
                                                                              Math.random() *
                                                                                16777215
                                                                            )
                                                                              .toString(
                                                                                16
                                                                              )
                                                                              .toString()
                                                                          );

                                                                        return (
                                                                          <Draggable
                                                                            key={task.requestId.toString()}
                                                                            index={
                                                                              index
                                                                            }
                                                                            draggableId={task.requestId.toString()}
                                                                          >
                                                                            {(
                                                                              provided
                                                                            ) => {
                                                                              return (
                                                                                <li
                                                                                  ref={
                                                                                    provided.innerRef
                                                                                  }
                                                                                  {...provided.draggableProps}
                                                                                  {...provided.dragHandleProps}
                                                                                  className="list-group-item p-1"
                                                                                  // style={{ overflow: 'hidden', whiteSpace: 'pre-wrap', fontWeight: '3px' }}
                                                                                  data-toggle="modal"
                                                                                  data-target="#infoModal"
                                                                                  onClick={() => {
                                                                                    handleRequestDtlModalOpen(
                                                                                      task
                                                                                    );
                                                                                  }}
                                                                                >
                                                                                  <span
                                                                                    style={{
                                                                                      overflow:
                                                                                        "hidden",
                                                                                      whiteSpace:
                                                                                        "pre-wrap",
                                                                                      fontWeight:
                                                                                        "3px",
                                                                                      padding:
                                                                                        "1px",
                                                                                    }}
                                                                                  >
                                                                                    {" "}
                                                                                    {
                                                                                      task.header
                                                                                    }
                                                                                  </span>

                                                                                  <div
                                                                                    style={{
                                                                                      display:
                                                                                        "flex",
                                                                                    }}
                                                                                  >
                                                                                    {task.uxRequired ===
                                                                                      "YES" && (
                                                                                      <div
                                                                                        style={{
                                                                                          height: 24,
                                                                                          lineHeight:
                                                                                            "34px",
                                                                                        }}
                                                                                      >
                                                                                        <span
                                                                                          style={{
                                                                                            cursor:
                                                                                              "pointer",
                                                                                          }}
                                                                                        >
                                                                                          <h6
                                                                                            title="UX Required"
                                                                                            style={{
                                                                                              fontWeight:
                                                                                                "350",
                                                                                              backgroundColor:
                                                                                                "lightgray",
                                                                                              padding:
                                                                                                "1px",
                                                                                            }}
                                                                                          >
                                                                                            UX
                                                                                          </h6>
                                                                                        </span>{" "}
                                                                                        &nbsp;
                                                                                      </div>
                                                                                    )}
                                                                                    {task.qaRequired ===
                                                                                      "YES" && (
                                                                                      <div
                                                                                        style={{
                                                                                          height: 24,
                                                                                          lineHeight:
                                                                                            "34px",
                                                                                          paddingLeft:
                                                                                            "2px",
                                                                                        }}
                                                                                      >
                                                                                        <span
                                                                                          style={{
                                                                                            cursor:
                                                                                              "pointer",
                                                                                          }}
                                                                                        >
                                                                                          <h6
                                                                                            title="QA Required"
                                                                                            style={{
                                                                                              fontWeight:
                                                                                                "350",
                                                                                              backgroundColor:
                                                                                                "lightgray",
                                                                                              padding:
                                                                                                "1px",
                                                                                            }}
                                                                                          >
                                                                                            QA
                                                                                          </h6>
                                                                                        </span>
                                                                                      </div>
                                                                                    )}
                                                                                    <i
                                                                                      class="far fa-clock"
                                                                                      style={{
                                                                                        margin:
                                                                                          "3px",
                                                                                        alignSelf:
                                                                                          "center",
                                                                                      }}
                                                                                    ></i>
                                                                                    <h6
                                                                                      style={{
                                                                                        fontWeight:
                                                                                          "700",
                                                                                      }}
                                                                                    >
                                                                                      {moment(
                                                                                        task.dueDate
                                                                                      ).format(
                                                                                        "ll"
                                                                                      )}
                                                                                    </h6>
                                                                                  </div>
                                                                                  <div
                                                                                    className="block"
                                                                                    style={{
                                                                                      display:
                                                                                        "flex",
                                                                                    }}
                                                                                  >
                                                                                    <div
                                                                                      style={{
                                                                                        display:
                                                                                          "flex",
                                                                                        justifyContent:
                                                                                          "center",
                                                                                      }}
                                                                                    >
                                                                                      <div
                                                                                        style={{
                                                                                          height: 24,
                                                                                          lineHeight:
                                                                                            "34px",
                                                                                        }}
                                                                                      >
                                                                                        {CategoryArray.map(
                                                                                          (
                                                                                            c
                                                                                          ) => {
                                                                                            if (
                                                                                              c.value ===
                                                                                              task.category
                                                                                            ) {
                                                                                              return (
                                                                                                <div
                                                                                                  style={{
                                                                                                    alignItems:
                                                                                                      "center",
                                                                                                    cursor:
                                                                                                      "pointer",
                                                                                                  }}
                                                                                                >
                                                                                                  {
                                                                                                    c.icon
                                                                                                  }
                                                                                                </div>
                                                                                              );
                                                                                            }
                                                                                          }
                                                                                        )}

                                                                                        {/* <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                                        {e.icon}
                                                                                        <span style={{ marginLeft: 5 }}>{e.text}</span>
                                                                                    </div> */}
                                                                                      </div>
                                                                                      <div
                                                                                        style={{
                                                                                          height: 24,
                                                                                          lineHeight:
                                                                                            "34px",
                                                                                        }}
                                                                                      >
                                                                                        <div
                                                                                          style={{
                                                                                            cursor:
                                                                                              "pointer",
                                                                                          }}
                                                                                        >
                                                                                          <h6
                                                                                            style={{
                                                                                              fontWeight:
                                                                                                "700",
                                                                                            }}
                                                                                          >
                                                                                            {task.category.toUpperCase() +
                                                                                              "-" +
                                                                                              task.requestId}
                                                                                          </h6>
                                                                                        </div>
                                                                                      </div>
                                                                                    </div>

                                                                                    <div className="block-left">
                                                                                      <div
                                                                                        className="avatar-group"
                                                                                        style={{
                                                                                          display:
                                                                                            "flex",
                                                                                        }}
                                                                                      >
                                                                                        <div className="avatar-block">
                                                                                          <Avatar.Group
                                                                                            maxCount={
                                                                                              2
                                                                                            }
                                                                                            maxStyle={{
                                                                                              color:
                                                                                                "#f56a00",
                                                                                              backgroundColor:
                                                                                                "#fde3cf",
                                                                                            }}
                                                                                            key={
                                                                                              index
                                                                                            }
                                                                                          >
                                                                                            <Avatar
                                                                                              title={
                                                                                                task
                                                                                                  ?.assigneeDetails
                                                                                                  ?.firstName +
                                                                                                " " +
                                                                                                task
                                                                                                  ?.assigneeDetails
                                                                                                  ?.lastName
                                                                                              }
                                                                                              key={
                                                                                                index
                                                                                              }
                                                                                              size="45"
                                                                                              round={
                                                                                                true
                                                                                              }
                                                                                              style={{
                                                                                                backgroundColor:
                                                                                                  randomColor,
                                                                                                verticalAlign:
                                                                                                  "middle",
                                                                                                cursor:
                                                                                                  "pointer",
                                                                                              }}
                                                                                            >
                                                                                              <span
                                                                                                style={{
                                                                                                  padding:
                                                                                                    "0px",
                                                                                                  color:
                                                                                                    "white",
                                                                                                }}
                                                                                              >
                                                                                                {" "}
                                                                                                {task?.assigneeDetails?.firstName
                                                                                                  .charAt(
                                                                                                    0
                                                                                                  )
                                                                                                  .toUpperCase() +
                                                                                                  task?.assigneeDetails?.lastName
                                                                                                    .charAt(
                                                                                                      0
                                                                                                    )
                                                                                                    .toUpperCase()}
                                                                                              </span>
                                                                                            </Avatar>
                                                                                            {/* {task.assigneeDetails?.map((member, index) => {
                                                                                                //  return (member.profilePicture === '' || member.profilePicture === null) ? <Avatar key={index}>{member.login.charAt(0).toUpperCase()}</Avatar> : <Avatar src={userImage} key={index} />
                                                                                                return <Avatar src={userImage} key={index} />
                                                                                            })} */}
                                                                                          </Avatar.Group>
                                                                                        </div>
                                                                                      </div>
                                                                                    </div>
                                                                                  </div>
                                                                                </li>
                                                                              );
                                                                            }}
                                                                          </Draggable>
                                                                        );
                                                                      }
                                                                    )}
                                                                  </ul>

                                                                  {
                                                                    provided.placeholder
                                                                  }
                                                                </div>
                                                              );
                                                            }}
                                                          </Droppable>
                                                        );
                                                      }
                                                    )}
                                                </div>
                                              </div>
                                            </DragDropContext>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </fieldset>
                    </div>
                  </Element>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {isOpen && (
        <CreateIssue
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          data={{
            projectData: currProjectData,
            sprintData: currSprintdata,
            sprintList: sprintList,
          }}
        ></CreateIssue>
      )}
      {reqDtlModal && (
        <IssueDetails
          isOpen={reqDtlModal}
          setIsOpen={setReqDtlModal}
          data={{
            pmStatus: pmStatus,
            refresh: refresh,
            task: currTaskData?.current,
            projectData: currProjectData,
            sprintData: currSprintdata,
            sprintList: sprintList,
            projectList: projectList,
          }}
          handlers={{
            setRefresh: setRefresh,
          }}
        ></IssueDetails>
      )}
    </>
  );
};

export default Board;
