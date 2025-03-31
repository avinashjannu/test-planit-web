
import React, { useContext, useState, useEffect, useRef } from 'react'
import {
    Link, DirectLink, Element, Events,
    animateScroll as scroll, scrollSpy, scroller
} from 'react-scroll'
import './backlog.css'
import { useHistory } from "react-router-dom";
import { toast } from 'react-toastify';
import { Avatar } from 'antd';
import { properties } from "../properties";
import { post, put, get } from "../util/restUtil";
import { showSpinner, hideSpinner } from "../common/spinner";
import Select from 'react-select'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { Colors, CategoryArray } from './ProjectManagementData'
import IssueDetails from './Request/issueDetails';
import moment from 'moment'
import { AppContext } from "../AppContext";
import RequestHistory from './Request/requestHistory';

const SprintHistory = (props) => {
    const { sprintDetails } = props?.data
    const [issueList, setIssueList] = useState([])
    const [isOpen, setIsOpen] = useState(false)
    const [projects, setProjects] = useState([])
    const [data, setData] = useState({ projectName: "", projectId: "" })
    const [showImportantInstruction, setShowImportantInstruction] = useState(false)
    const contentEl = useRef();
    const currReqData = useRef();
    const [active, setActive] = useState(null);
    const [backlogArray, setBacklogArray] = useState([])
    const [sprintList, setSprintList] = useState([])
    const { auth } = useContext(AppContext);
    console.log("auth", auth)
    useEffect(() => {
        if (props?.data?.sprintDetails) {

            showSpinner()
            let obj = {
                sprintId: props?.data?.sprintDetails?.sprintId,
                projectId: props?.data?.sprintDetails?.projectId
            }
            post(`${properties.PROJECT_MANAGEMENT_API}/get-request-list`, obj).then((response) => {
                if (response.data) {
                    console.log(response.data)
                    setIssueList(response.data)
                    const result = []
                    result.push({
                        id: props?.data?.sprintDetails?.sprintId,
                        header: props?.data?.sprintDetails?.sprintName,
                        status: props?.data?.sprintDetails?.status,
                        items: response.data
                    })
                    console.log("result", result)
                    setBacklogArray(result)
                }
            }).finally(hideSpinner)
            showSpinner();
            get(properties.PROJECT_MANAGEMENT_API + "/sprint-list/" + props?.data?.sprintDetails?.projectId)
                .then((resp) => {
                    if (resp.data) {
                        let sprintArray = []
                        resp.data.map((e) => {
                            sprintArray.push({ label: e.sprintName, value: e.sprintId, startDate: e.startDate, endDate: e.endDate, status: e.status })
                        })

                        setSprintList(sprintArray)
                    }

                }).finally(hideSpinner)
        }
    }, [props?.data])


    const handleStartSprint = (faq) => {
        let sprintArray = sprintList.filter((f) => f.status === "ACTIVE" || f.status === "AC")
        if (sprintArray.length > 0) {
            toast.error("Please end active sprint")
        } else {
            let obj = {
                mode: "edit",
                sprintId: faq.id,
                status: "ACTIVE"
            }
            console.log("obj", obj)
            showSpinner()
            post(properties.PROJECT_MANAGEMENT_API + '/sprint/create', obj).then((resp) => {
                if (resp.data) {
                    toast.success("Sprint activated successfully")
                    console.log("sprint ended")
                }
            }).finally(hideSpinner)
        }


    }
    const handleEndSprint = (faq) => {

        if (faq.items.length > 0) {
            let pendingTask = faq?.items.filter((f) => f.currStatus !== 'PM_DONE' && f.sprintId === faq.id)
            if (pendingTask.length > 0) {
                toast.error("This sprint has pending requests")
            } else {
                let obj = {
                    mode: "edit",
                    sprintId: faq.id,
                    status: "IN"
                }
                showSpinner()
                post(properties.PROJECT_MANAGEMENT_API + '/sprint/create', obj).then((resp) => {
                    if (resp.data) {
                        toast.success("Sprint Ended Successfully")
                        console.log("sprint ended")
                    }
                }).finally(hideSpinner)
            }
        }

    }
    const handleRequestDetails = (task) => {

        currReqData.current = task
        setIsOpen(true)
    }

    return (
        <>
            <Element name="sprintDetailsSection" className="" >
                <div className="pt-0 mt-0">
                    <div className="col-lg-12">
                        <br></br>

                        {backlogArray && backlogArray.map((faq, index) => {
                            return (
                                <div className="rc-accordion-card">
                                    <div className="rc-accordion-header">
                                        <span className={`rc-accordion-toggle p-2 ${'active'}`}
                                        // onClick={() => handleToggle(index)}
                                        >
                                            <h5 className="rc-accordion-title ">&nbsp;{faq.header}
                                                &nbsp;&nbsp;<small className="">{"(" + faq?.items?.length + " issues)"} </small>
                                            </h5>

                                            {[1, 30].includes(auth.currRoleId) &&
                                                <>{(faq.status === "AC" || faq.status === "ACTIVE") ?
                                                    <button type="button" className="btn btn-secondary "
                                                        onClick={() => {
                                                            handleEndSprint(faq)
                                                        }}
                                                    >End Sprint</button> : <>
                                                        {faq.status === "TEMP" && <button type="button" className="btn btn-secondary "
                                                            onClick={() => {
                                                                handleStartSprint(faq)
                                                            }}
                                                        >Start Sprint</button>}</>}
                                                </>}
                                        </span>
                                    </div>
                                    <div ref={contentEl} className={`rc-collapse ${'show'}`}
                                    >
                                        <div className="rc-accordion-body">
                                            <table
                                                className="table table-responsive table-striped dt-responsive nowrap w-100"
                                                style={{ textAlign: "left", marginLeft: "1px" }}>
                                                <tbody>
                                                    {
                                                        faq?.items.length > 0 ? <>
                                                            {faq?.items.map((item, i) => {
                                                                let randomColor = '#'.concat(Math.floor(Math.random() * 16777215).toString(16).toString())
                                                                return (<tr className='mb-0'>
                                                                    <td
                                                                        onClick={(e) => {
                                                                            handleRequestDetails(item)
                                                                            // setReqDtlModal(true)
                                                                        }}
                                                                    >
                                                                        <span className='text-left' style={{ height: 24, marginRight: "3px" }}>
                                                                            {
                                                                                CategoryArray.map((c) => {
                                                                                    if (c.value === item.category) {
                                                                                        return (
                                                                                            <span style={{ alignItems: 'center', cursor: 'pointer' }}>
                                                                                                {c.icon}
                                                                                            </span>
                                                                                        )
                                                                                    }
                                                                                })
                                                                            }
                                                                        </span>
                                                                        <span className='text-center' style={{ fontWeight: '350', backgroundColor: 'lightgray', padding: '1px' }}>{item.requestId}</span>&nbsp;&nbsp;
                                                                        <span className='text-center'>{item.header}</span>
                                                                        {/* <span className='text-right' style={{ float: 'right' }}>
                                                                                            {item?.currStatus}
                                                                                        </span> */}
                                                                        <span className='text-right' style={{ float: 'right', display: 'flex' }}>
                                                                            {item?.uxRequired === "YES" &&

                                                                                <span style={{ marginRight: '4px', padding: '2px' }}>
                                                                                    <h6 title="UX Required" style={{ fontWeight: '350', backgroundColor: 'lightgray', padding: '1px' }}>UX</h6>
                                                                                </span>}

                                                                            {item?.qaRequired === "YES" &&

                                                                                <span style={{ marginRight: '4px', padding: '2px' }}>
                                                                                    <h6 title="QA Required" style={{ fontWeight: '350', backgroundColor: 'lightgray', padding: '1px', }}>QA</h6>
                                                                                </span>
                                                                            }
                                                                            <span style={{ marginRight: '4px', backgroundColor: '#ADD8E6', padding: '2px' }}>
                                                                                {item?.statusDesc?.description}
                                                                            </span>
                                                                            <span style={{ marginRight: '4px', padding: '2px', fontWeight: "600" }}>
                                                                                {moment(item?.dueDate).format('YYYY-MM-DD')}
                                                                            </span>

                                                                            <Avatar
                                                                                title={item?.assigneeDetails.firstName}
                                                                                key={1}
                                                                                size="small"
                                                                                round={true}
                                                                                style={{ backgroundColor: randomColor, verticalAlign: 'middle', cursor: 'pointer', fontSize: "0.9rem" }}>
                                                                                <span style={{ padding: "0px", color: "white" }}
                                                                                > {item?.assigneeDetails?.firstName.charAt(0).toUpperCase() + item?.assigneeDetails.lastName.charAt(0).toUpperCase()}</span>
                                                                            </Avatar>
                                                                        </span>
                                                                    </td>
                                                                </tr>)
                                                            })} </> : <>
                                                            <span className='text-center'>No Requests Found</span></>
                                                    }
                                                </tbody >
                                            </table>

                                        </div>
                                    </div>
                                </div>
                            )
                        })
                        }
                        <br></br>
                    </div>

                </div>
            </Element>
            {isOpen && <RequestHistory isOpen={isOpen} setIsOpen={setIsOpen} data={{
                task: currReqData.current,
            }}></RequestHistory>}
        </>
    )
}
export default SprintHistory