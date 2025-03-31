import React, { useState, useRef } from 'react'
import {
    Link, DirectLink, Element, Events,
    animateScroll as scroll, scrollSpy, scroller
} from 'react-scroll'
import FileUpload from '../common/uploadAttachment/fileUpload'
import { string, object } from "yup";
import { toast } from 'react-toastify';
import { properties } from "../properties";
import { post, put, get } from "../util/restUtil";
import { showSpinner, hideSpinner } from "../common/spinner";
import { useHistory } from "react-router-dom";
import { useEffect } from 'react';
import moment from 'moment';
const validationSchema = object().shape({
    projectId: string().required("Project is required"),
    sprintName: string().required("Sprint Name is required"),
    startDate: string().required("Start date is required"),
    endDate: string().required("End date is required"),

});
const CreateSprint = (props) => {
    console.log("props", props)
    const existingSprintList = useRef({})
    const history = useHistory();
    const [sprintDetails, setSprintDetails] = useState({
        projectId: "",
        sprintName: "",
        startDate: "",
        endDate: "",
        whatWentWell: "",
        whatWouldHaveGoneRight: "",
        lessonLearnt: ""

    })
    const sprintId = props?.location?.state?.data?.sprintId
    const mode = props?.location?.state?.data?.mode || null
    const [currentFiles, setCurrentFiles] = useState([]);
    const [projectListLookUp, setProjectListLookUp] = useState([]);
    const [error, setError] = useState({})
    const [existingFiles, setExistingFiles] = useState([]);

    useEffect(() => {
        get(properties.PROJECT_MANAGEMENT_API + '/sprint/projectlist').then((resp) => {
            if (resp && resp.status === 200 && resp.data) {
                setProjectListLookUp(resp.data)
            }
        })

        if (sprintId) {
            post(`${properties.PROJECT_MANAGEMENT_API}/sprint/search`, { sprintId: sprintId, mode: mode })
                .then((resp) => {
                    if (resp.data) {
                        if (resp.status === 200) {
                            const { count, rows } = resp.data;
                            if (Number(count) > 0) {
                                console.log(" ...rows[0]", rows[0])
                                setSprintDetails({
                                    ...rows[0],
                                    whatWentWell: rows[0]?.retro?.whatWentWell,
                                    lessonLearnt: rows[0]?.retro?.lessonLearnt,
                                    whatWouldHaveGoneRight: rows[0]?.retro?.whatWouldHaveGoneRight
                                });
                            }
                        }
                    }
                }).finally(() => {
                    hideSpinner();
                });
        }
    }, [sprintId])


    const validate = (section, schema, data) => {
        try {
            if (section === 'PROJECT') {
                setError({})
            }
            schema.validateSync(data, { abortEarly: false });
        } catch (e) {
            e.inner.forEach((err) => {
                if (section === 'PROJECT') {
                    setError((prevState) => {
                        return { ...prevState, [err.params.path]: err.message };
                    });
                }
            });
            return e;
        }
    };
    const handleSubmit = () => {
        console.log("sprintDetails", sprintDetails)
        const projectDetailsError = validate('PROJECT', validationSchema, sprintDetails);
        if (projectDetailsError) {
            toast.error("Validation error found, Please check the mandatory fields")
        } else {
            let obj = {
                ...sprintDetails,
                mode: mode,
                status: "TEMP",
                retro: {
                    "whatWentWell": sprintDetails?.whatWentWell,
                    "lessonLearnt": sprintDetails?.lessonLearnt,
                    "whatWouldHaveGoneRight": sprintDetails?.whatWouldHaveGoneRight
                },
                // status: sprintDetails.startDate > existingSprintList.current ? "TEMP" : "AC",
                attachments: [...currentFiles.map((current) => { return { entityId: current.entityId, entityType: 'SPRINT' } })],
            }
            showSpinner();
            post(properties.PROJECT_MANAGEMENT_API + '/sprint/create', obj)
                .then((resp) => {
                    if (resp.data) {
                        if (mode === 'edit') {
                            toast.success("Sprint Updated successfully")
                        } else {
                            toast.success("Sprint Created successfully")
                        }

                        history.push(`${process.env.REACT_APP_BASE}/pm-board`)
                    }

                }).finally(hideSpinner);
        }
    }
    const handleCancel = () => {
        setSprintDetails({})
        history.push(`${process.env.REACT_APP_BASE}/pm-board`)
    }

    // const handleOnchange = (e) => {
    //     const target = e.target;
    //     setSprintDetails({
    //         ...sprintDetails,
    //         [target.id]: target.value
    //     })
    // }
    const handleProjectChange = (e) => {
        const target = e.target;
        showSpinner()
        setSprintDetails({
            ...sprintDetails,
            [target.id]: target.value
        })
        // get(properties.PROJECT_MANAGEMENT_API + '/project-details/' + target.value).then((resp) => {
        //     if (resp.data) {

        //     }
        // }).finally(hideSpinner)
        get(properties.PROJECT_MANAGEMENT_API + "/sprint-list/" + e.target.value)
            .then((resp) => {
                if (resp.data) {
                    let sprintArray = []
                    resp.data.map((e) => {
                        if (e.status === "AC" || e.status === "ACTIVE") {
                            sprintArray.push({ label: e.sprintName, value: e.sprintId, startDate: e.startDate, endDate: e.endDate })
                        }

                    })

                    if (sprintArray.length > 0) {
                        let startDates = sprintArray.map(({ endDate }) => endDate)
                        let maxDate = startDates.reduce(function (a, b) { return a > b ? a : b; });
                        existingSprintList.current = { 'maxDate': maxDate }
                        console.log("Active sprint", existingSprintList.current)
                    } else {
                        existingSprintList.current = {}
                    }


                }

            }).finally(hideSpinner)

    }
    const handleDateChange = (e) => {
        const { target } = e
        console.log("existingSprintList.current", existingSprintList.current.maxDate)
        if (existingSprintList.current.hasOwnProperty('maxDate')) {
            if (target.id === 'startDate') {
                if (moment(moment(target.value).format('YYYY-MM-DD')).isBefore(moment(existingSprintList.current?.maxDate).format('YYYY-MM-DD'))) {
                    toast.error("Sprint already exist with this date")
                    return;
                }
                setSprintDetails({ ...sprintDetails, startDate: e.target.value })
            }
            if (target.id === 'endDate') {
                if ((existingSprintList.current.maxDate && moment(moment(target.value).format('YYYY-MM-DD')).isBefore(moment(existingSprintList.current?.maxDate).format('YYYY-MM-DD'))
                    || (sprintDetails.startDate && (moment(moment(target.value).format('YYYY-MM-DD')).isBefore(moment(sprintDetails.startDate).format('YYYY-MM-DD')))))) {
                    toast.error("Please select valid sprint end date")
                    return;
                }
                setSprintDetails({ ...sprintDetails, endDate: e.target.value })
            }
        }
        else {
            setSprintDetails({ ...sprintDetails, [target.id]: target.value })
        }


    }
    return (
        <>
            <div className="row">
                <div className="col-12">
                    <div className="page-title-box">
                        <h4 className="page-title">Create Sprint</h4>
                    </div>
                </div>
            </div>
            <div className="row mt-1">
                <div className="col-12 p-0">
                    <div className="card-box">
                        <div className="d-flex">
                            <div className="col-2 p-0 sticky">
                                <ul className="list-group">
                                    <li><Link activeclassName="active" className="list-group-item list-group-item-action" to="projectDetailsSection" spy={true} offset={-190} smooth={true} duration={100}>Sprint Details</Link></li>
                                    <li><Link activeclassName="active" className="list-group-item list-group-item-action" to="retroSection" spy={true} offset={-100} smooth={true} duration={100}>Sprint Retro</Link></li>
                                    <li><Link activeclassName="active" className="list-group-item list-group-item-action" to="attachmentsSection" spy={true} offset={-100} smooth={true} duration={100}>Attachments</Link></li>
                                </ul>
                            </div>

                            <div className="new-customer col-md-10 p-0">

                                <Element name="sprintDetailsSection" className="" >
                                    <div className="pt-0 mt-0">

                                        <fieldset className="scheduler-border">
                                            <>
                                                <div className="form-row">
                                                    <div className="col-12 pl-2 bg-light border">
                                                        <h5 className="text-primary">Sprint Details</h5>
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        <label htmlFor="projectId" className="control-label">Project<span>*</span></label>
                                                        <select id="projectId" className="form-control" value={sprintDetails.projectId}
                                                            onChange={handleProjectChange}>
                                                            <option key="projectId" value="">Choose Project</option>
                                                            {
                                                                projectListLookUp && projectListLookUp.map((id) => (
                                                                    <option key={id.projectId} value={id.projectId}>{id.projectName}</option>
                                                                ))
                                                            }

                                                        </select>
                                                        <span className="errormsg">{error.projectId ? error.projectId : ""}</span>
                                                    </div>
                                                </div>
                                                <div className="row col-12">
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label htmlFor="sprintName" className="col-form-label">Sprint Name<span>*</span></label>
                                                            <input type="text" className={`form-control ${(error.sprintName ? "input-error" : "")}`} value={sprintDetails.sprintName} id="sprintName" placeholder="Sprint Name"
                                                                onChange={(e) => {
                                                                    setSprintDetails({ ...sprintDetails, sprintName: e.target.value })
                                                                }
                                                                }
                                                            />
                                                            <span className="errormsg">{error.sprintName ? error.sprintName : ""}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label htmlFor="Surname" className="col-form-label">Start Date<span>*</span></label>
                                                            <input type="date" className={`form-control ${(error.startDate ? "input-error" : "")}`} value={sprintDetails.startDate} id="startDate" placeholder="Start Date"
                                                                // min={moment(existingSprintList.current).format('YYYY-MM-DD')}
                                                                onChange={(e) => {
                                                                    handleDateChange(e)

                                                                }
                                                                }
                                                            />
                                                            <span className="errormsg">{error.startDate ? error.startDate : ""}</span>
                                                        </div>
                                                    </div>

                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label htmlFor="Surname" className="col-form-label">End Date<span>*</span></label>
                                                            <input type="date" className={`form-control ${(error.endDate ? "input-error" : "")}`}
                                                                // min={moment(existingSprintList.current).format('YYYY-MM-DD')}
                                                                value={sprintDetails.endDate} id="endDate" placeholder="End Date"
                                                                onChange={(e) => {
                                                                    handleDateChange(e)
                                                                    // setSprintDetails({ ...sprintDetails, endDate: e.target.value })
                                                                }
                                                                }
                                                            />
                                                            <span className="errormsg">{error.endDate ? error.endDate : ""}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        </fieldset>
                                    </div>
                                </Element>
                                <Element name="attachmentsSection" className="element btm-space attach-sec">
                                    <div className="row">
                                        <div className="col-12 p-0">
                                            <section className="triangle"><h4 id="list-item-0" className="pl-2" style={{ alignContent: 'left' }}>Attachments</h4></section>
                                        </div>
                                    </div>
                                    <fieldset className="scheduler-border">
                                        <>
                                            <FileUpload
                                                data={{
                                                    currentFiles,
                                                    interactionId: sprintId,
                                                    entityType: 'SPRINT',
                                                    shouldGetExistingFiles: true,
                                                    permission: false,
                                                    existingFiles,
                                                }}
                                                handlers={{
                                                    setCurrentFiles,
                                                    setExistingFiles
                                                }}
                                            />
                                        </>
                                    </fieldset>
                                </Element>
                                <Element name="retroSection" className="element btm-space attach-sec">
                                    <div className="row">
                                        <div className="col-12 p-0">
                                            <section className="triangle"><h4 id="list-item-0" className="pl-2" style={{ alignContent: 'left' }}>Sprint Retro </h4></section>
                                        </div>
                                    </div>

                                    <div className="col-md-12">
                                        <div className="form-group">
                                            <label className="control-label">What went well</label>
                                            <textarea className="form-control mb-2" rows="3" value={sprintDetails?.whatWentWell}
                                                onChange={(e) => {
                                                    setSprintDetails({ ...sprintDetails, whatWentWell: e.target.value })
                                                }}></textarea>
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="form-group">
                                            <label className="control-label">What would have gone right</label>
                                            <textarea className="form-control mb-2" rows="3" value={sprintDetails?.whatWouldHaveGoneRight}
                                                onChange={(e) => {
                                                    setSprintDetails({ ...sprintDetails, whatWouldHaveGoneRight: e.target.value })
                                                }}></textarea>
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="form-group">
                                            <label className="control-label">Lesson learnt</label>
                                            <textarea className="form-control mb-2" rows="3" value={sprintDetails?.lessonLearnt}
                                                onChange={(e) => {
                                                    setSprintDetails({ ...sprintDetails, lessonLearnt: e.target.value })
                                                }}></textarea>
                                        </div>
                                    </div>
                                </Element>

                                <Element name="SubitSection" className="element">
                                    <div id="page-buttons" className="d-flex justify-content-center mt-3" >
                                        <button type="submit" id="submit" className="btn btn-primary waves-effect waves-light mr-2" onClick={handleSubmit}>Submit</button>
                                        <button type="button" id="cancel" className="btn btn-secondary waves-effect waves-light ml-2" onClick={handleCancel}>Cancel</button>
                                    </div>

                                </Element>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default CreateSprint