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
import SprintHistory from './SprintHistory';
const validationSchema = object().shape({
    projectId: string().required("Project is required"),
    sprintName: string().required("Sprint Name is required"),
    startDate: string().required("Start date is required"),
    endDate: string().required("End date is required"),

});

const SprintLandingPage = (props) => {
    const { sprintData } = props?.location?.state?.data
    const [sprintDetails, setSprintDetails] = useState({})
    const [existingFiles, setExistingFiles] = useState([]);
    const [currentFiles, setCurrentFiles] = useState([]);
    const [sprintHistoryTab, setSprintHistory] = useState(false)
    useEffect(() => {
        if (props?.location?.state?.data?.sprintData) {
            setSprintDetails({
                ...props?.location?.state?.data?.sprintData,
                whatWentWell: props?.location?.state?.data?.sprintData?.retro?.whatWentWell,
                lessonLearnt: props?.location?.state?.data?.sprintData?.retro?.lessonLearnt,
                whatWouldHaveGoneRight: props?.location?.state?.data?.sprintData?.retro?.whatWouldHaveGoneRight
            })
            showSpinner()
            get(properties.ATTACHMENT_API + "?entity-id=" + props?.location?.state?.data?.sprintId + "&entity-type=" + 'SPRINT')
                .then((resp) => {
                    if (resp.data && resp.data.length) {
                        console.log(resp.data)
                        setExistingFiles(resp.data)
                    }
                })
                .catch((error) => {
                    console.error("error", error)
                }).finally(hideSpinner)
        }
    }, [props?.location?.state?.data])
    const handleFileDownload = (id) => {
        showSpinner()
        get(properties.ATTACHMENT_API + "/" + id + "?entity-id=" + props?.location?.state?.data?.sprintId + "&entity-type=" + "SPRINT")
            .then((resp) => {
                if (resp.data) {
                    var a = document.createElement("a");
                    a.href = resp.data.content;
                    a.download = resp.data.fileName;
                    a.click();
                }
            })
            .catch((error) => {
                console.error("error", error)
            })
            .finally(() => {
                hideSpinner()
            })
    }

    return (
        <div className="container-fluid edit-complaint" >
            <div className="row align-items-center">
                <div className="col-12">
                    <div className="page-title-box">
                        <h4 className="page-title">Sprint Details</h4>
                    </div>
                </div>

            </div>
            <div className="row mt-1">
                <div className="col-12 p-0">
                    <div className="card-box">
                        <div className="d-flex">


                            <div className="new-customer col-md-12 p-1">
                                <div data-spy="scroll" data-target="#scroll-list" data-offset="0" className="scrollspy-div new-customer">
                                    <div className="col-12">
                                        <ul key="ecul2" className="nav nav-tabs" role="tablist">
                                            <li key="ecli21" className={`nav-item pl-0`}>
                                                <button data-target="#sprintDetails" role="tab" data-toggle="tab" aria-expanded="false" className={`nav-link font-17 bolder active`}
                                                // onClick={() => { setOnTabChange('Interaction') }}
                                                >
                                                    Sprint Details
                                                </button>
                                            </li>

                                            <li key="ecli22" className={`nav-item `}>
                                                <button data-target="#sprintHistory" role="tab" data-toggle="tab" aria-expanded="false" className="nav-link font-17 bolder"
                                                    onClick={() => { setSprintHistory(true) }}
                                                >
                                                    Sprint History
                                                </button>
                                            </li>

                                        </ul>

                                    </div>
                                    <div className="tab-content py-0 pl-3">
                                        <div className={`tab-pane show active`} id="sprintDetails">



                                            <Element name="sprintDetailsSection" className="" >
                                                <div className="pt-0 mt-0">
                                                    <div className="row">
                                                        <div className="col-12 p-0">
                                                            <section className="triangle"><h4 id="list-item-0" className="pl-2" style={{ alignContent: 'left' }}>Sprint Details</h4></section>
                                                        </div>
                                                    </div>
                                                    <br></br>
                                                    <fieldset className="scheduler-border">
                                                        <>
                                                            <div className="row col-12">
                                                                <div className="col-md-3">
                                                                    <div className="form-group">
                                                                        <label htmlFor="projectId" className="col-form-label">Project</label>
                                                                        <p>{sprintDetails?.projectDtl?.projectName}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-3">
                                                                    <div className="form-group">
                                                                        <label htmlFor="sprintName" className="col-form-label">Sprint Name<span>*</span></label>
                                                                        {/* <input type="text" className="form-control "
                                                                            value={sprintDetails.sprintName} id="sprintName" placeholder="Sprint Name"

                                                                        /> */}
                                                                        <p>{sprintDetails?.sprintName}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-3">
                                                                    <div className="form-group">
                                                                        <label htmlFor="Surname" className="col-form-label">Start Date<span>*</span></label>
                                                                        {/* <input type="date" className="form-control "
                                                                            value={sprintDetails.startDate} id="startDate" placeholder="Start Date"
                                                                        // min={moment(existingSprintList.current).format('YYYY-MM-DD')}

                                                                        /> */}
                                                                        <p>{sprintDetails?.startDate}</p>

                                                                    </div>
                                                                </div>

                                                                <div className="col-md-3">
                                                                    <div className="form-group">
                                                                        <label htmlFor="Surname" className="col-form-label">End Date<span>*</span></label>
                                                                        <p>{sprintDetails?.endDate}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </>
                                                    </fieldset>
                                                </div>
                                            </Element>
                                            {existingFiles.length > 0 &&
                                                <Element name="attachmentsSection" className="element btm-space attach-sec" style={{ minHeight: 'fit-content' }}>
                                                    <div className="row">
                                                        <div className="col-12 p-0">
                                                            <section className="triangle"><h4 id="list-item-0" className="pl-2" style={{ alignContent: 'left' }}>Attachments</h4></section>
                                                        </div>
                                                    </div>
                                                    <br></br>
                                                    <fieldset className="scheduler-border">
                                                        <>
                                                            {existingFiles.length > 0 && <div className="col-md-12">
                                                                <div className="form-group">
                                                                    <label className="control-label">Attachments&nbsp;</label>

                                                                    <div className="col-12" /*style={{ width: "900px" }}*/>
                                                                        {
                                                                            existingFiles && existingFiles.map((file) => {
                                                                                return (
                                                                                    <div className="attach-btn">
                                                                                        <i className="fa fa-paperclip" aria-hidden="true"></i>
                                                                                        <a key={file.attachmentId}
                                                                                            onClick={() => handleFileDownload(file.attachmentId)}
                                                                                        >{file.fileName}</a>
                                                                                        {/* <button type="button" disabled={permission} className="close ml-2" onClick={() => handleDelete(file.attachmentId)}>
                                        <span aria-hidden="true">&times;</span>
                                    </button> */}
                                                                                    </div>
                                                                                );
                                                                            })
                                                                        }
                                                                    </div>
                                                                </div>
                                                            </div>}
                                                        </>
                                                    </fieldset>
                                                </Element>}
                                            <Element name="retroSection" className="element btm-space attach-sec">
                                                <div className="row">
                                                    <div className="col-12 p-0">
                                                        <section className="triangle"><h4 id="list-item-0" className="pl-2" style={{ alignContent: 'left' }}>Sprint Retro </h4></section>
                                                    </div>
                                                </div>

                                                <div className="col-md-12">
                                                    <div className="form-group">
                                                        <label className="col-form-label">What went well</label>
                                                        <p>{sprintDetails?.whatWentWell}</p>
                                                        {/* <textarea className="form-control mb-2" rows="3" value={sprintDetails?.whatWentWell}
                                                        ></textarea> */}
                                                    </div>
                                                </div>
                                                <div className="col-md-12">
                                                    <div className="form-group">
                                                        <label className="col-form-label">What would have gone right</label>
                                                        <p>{sprintDetails?.whatWouldHaveGoneRight}</p>
                                                        {/* <textarea className="form-control mb-2" rows="3" value={sprintDetails?.whatWouldHaveGoneRight}
                                                        ></textarea> */}
                                                    </div>
                                                </div>
                                                <div className="col-md-12">
                                                    <div className="form-group">
                                                        <label className="col-form-label">Lesson learnt</label>
                                                        <p>{sprintDetails?.lessonLearnt}</p>
                                                        {/* <textarea className="form-control mb-2" rows="3" value={sprintDetails?.lessonLearnt}
                                                        ></textarea> */}
                                                    </div>
                                                </div>
                                            </Element>




                                        </div>
                                        <div className="tab-pane" id="sprintHistory">
                                            {sprintHistoryTab && sprintDetails && <SprintHistory
                                                data={{
                                                    sprintDetails: sprintDetails,
                                                }}></SprintHistory>}
                                        </div>

                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SprintLandingPage