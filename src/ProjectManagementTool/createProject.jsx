import React, { useState, useRef, useEffect } from 'react'
import {
    Link, DirectLink, Element, Events,
    animateScroll as scroll, scrollSpy, scroller
} from 'react-scroll'
import FileUpload from '../common/uploadAttachment/fileUpload'
import { string, object, array } from "yup";
import { toast } from 'react-toastify';
import { properties } from "../properties";
import { post, put, get } from "../util/restUtil";
import { showSpinner, hideSpinner } from "../common/spinner";
import { useHistory } from "react-router-dom";
import ReactSelect, { components } from 'react-select'
import userImage from '../../src/assets/images/placeholder.jpg'
import { Avatar } from 'antd';

const projectValidationSchema = object().shape({
    projectName: string().required("Project Name is required"),
    customerName: string().required("Customer Name is required"),
    projectType: string().required("Project Type is required"),
    startDate: string().required("Start date is required"),
    endDate: string().required("End date is required"),
    users: string().required("User project mapping is required")

});
const CreateProject = (props) => {

    const history = useHistory();
    const [project, setProject] = useState({
        projectName: "",
        customerName: "",
        projectType: "",
        // (Agile, Waterfall, Iterative)
        startDate: "",
        endDate: "",
        attachments: "",//attachments
        users: ""
    })


    const [renderMode, setRenderMode] = useState(props?.location?.state?.data)
    const ProjectTypes = [
        { value: "Agile", label: "Agile" },
        { value: "Waterfall", label: "Waterfall" },
        { value: "Iterative", label: "Iterative" }
    ]
    const lookupData = useRef({})
    const [currentFilesQA, setCurrentFilesQA] = useState([]);
    const [currentFilesTech, setCurrentFilesTech] = useState([]);
    const [currentFilesBuss, setCurrentFilesBuss] = useState([]);
    const [currentFilesProj, setCurrentFilesProj] = useState([]);
    const [currentFilesUx, setCurrentFilesUx] = useState([]);

    const [existingFilesQA, setExistingFilesQA] = useState([]);
    const [existingFilesTech, setExistingFilesTech] = useState([]);
    const [existingFilesBuss, setExistingFilesBuss] = useState([]);
    const [existingFilesProj, setExistingFilesProj] = useState([]);
    const [existingFilesUx, setExistingFilesUx] = useState([]);

    const [projectAttachments, setProjectAttachments] = useState([]);
    const [customerData, setCustomerData] = useState([])
    const [usersArray, setUsersArray] = useState([])
    const [error, setError] = useState({})
    const [selectedUsers, setSelectedUsers] = useState([])
    useEffect(() => {
        showSpinner()
        post(properties.BUSINESS_ENTITY_API, [
            'CUSTOMERS',
        ])
            .then((response) => {
                if (response.data) {
                    lookupData.current = response.data
                    let categoryData = []
                    lookupData.current['CUSTOMERS'].map((e) => {
                        // if (e?.mapping && e?.mapping.hasOwnProperty('department') && e?.mapping?.department.includes('COMQUEST.BCT.CQ-APP')) {
                        //     categoryData.push({ "label": e.description, "value": e.code })
                        // }
                        categoryData.push({ "label": e.description, "value": e.code })
                    })
                    setCustomerData(categoryData)
                }
            })

        get(properties.USER_API + '/users/list')
            .then((response) => {
                if (response.data) {
                    if (response?.data?.count > 0) {
                        let result = []
                        response?.data?.rows.map((u) => {

                            if (u?.mappingPayload && u?.mappingPayload.hasOwnProperty('userDeptRoleMapping') && u?.mappingPayload?.userDeptRoleMapping.length > 0) {
                                u?.mappingPayload?.userDeptRoleMapping.map((m) => {
                                    if (m.roleId.includes(30) || m.roleId.includes(31)) {
                                        // result.push(u)
                                        result.push({ value: u.userId, label: u.firstName, icon: u.profilePicture })
                                    }
                                })
                            }
                        })

                        setUsersArray(result)


                    }
                }
            }).finally(hideSpinner)
    }, [])
    useEffect(() => {
        let users = []
        if (props?.location?.state?.data?.mode === 'edit') {
            showSpinner()
            get(properties.PROJECT_MANAGEMENT_API + '/project-details/' + Number(props?.location?.state?.data?.projectId))
                .then((response) => {
                    if (response.data) {

                        users = response?.data?.mappingPayload?.users

                        setProject({ ...response.data, users: users })
                        post(properties.USER_API + '/get-users-by-ids', users).then((resp) => {
                            if (resp.data) {
                                let userArray = []
                                resp.data.map((e) => {
                                    userArray.push({ value: e.userId, label: e.firstName, icon: e.profilePicture })
                                })

                                setSelectedUsers(userArray)
                            }
                        })

                    }
                }).finally(hideSpinner)
        }
    }, [])

    const { Option } = components;
    const IconOption = props => (
        <Option {...props}>
            <img
                src={userImage}
                style={{ width: 36, height: 20, borderRadius: "50%" }}
                alt={userImage}
            />&nbsp;
            {props.data.label}
        </Option>
    );
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

        const projectDetailsError = validate('PROJECT', projectValidationSchema, project);
        if (projectDetailsError) {
            toast.error("Validation error found, Please check the mandatory fields")
            return
        }
        else {
            if (props?.location?.state?.data?.mode === 'edit') {
                let obj = {
                    // mode: props?.location?.state?.data?.mode,
                    ...project,
                    attachments: [
                        ...currentFilesQA.map((current) => { return { entityId: current.entityId, entityType: current.entityType } }),
                        ...currentFilesUx.map((current) => { return { entityId: current.entityId, entityType: current.entityType } }),
                        ...currentFilesTech.map((current) => { return { entityId: current.entityId, entityType: current.entityType } }),
                        ...currentFilesBuss.map((current) => { return { entityId: current.entityId, entityType: current.entityType } }),
                        ...currentFilesProj.map((current) => { return { entityId: current.entityId, entityType: current.entityType } })
                    ],
                }

                showSpinner();
                put(properties.PROJECT_MANAGEMENT_API + "/" + props?.location?.state?.data?.projectId, obj)
                    .then((resp) => {
                        if (resp.data) {
                            toast.success("Project Updateda successfully")
                            history.push(`${process.env.REACT_APP_BASE}/pm-board`)

                        }

                    }).finally(hideSpinner);
            } else {
                let obj = {
                    // mode: props?.location?.state?.data?.mode,
                    ...project,
                    attachments: [
                        ...currentFilesQA.map((current) => { return { entityId: current.entityId, entityType: current.entityType } }),
                        ...currentFilesUx.map((current) => { return { entityId: current.entityId, entityType: current.entityType } }),
                        ...currentFilesTech.map((current) => { return { entityId: current.entityId, entityType: current.entityType } }),
                        ...currentFilesBuss.map((current) => { return { entityId: current.entityId, entityType: current.entityType } }),
                        ...currentFilesProj.map((current) => { return { entityId: current.entityId, entityType: current.entityType } })
                    ],
                }

                showSpinner();
                post(properties.PROJECT_MANAGEMENT_API, obj)
                    .then((resp) => {
                        if (resp.data) {
                            toast.success("Project Created successfully")
                            history.push(`${process.env.REACT_APP_BASE}/pm-board`)

                        }

                    }).finally(hideSpinner);
            }

        }
    }
    const handleCancel = () => {
        setProject({})
        history.push(`${process.env.REACT_APP_BASE}/`)
    }
    const handleUserMapping = (userMapped) => {

        setSelectedUsers(userMapped)

        setProject({ ...project, users: userMapped.map(({ value }) => value) })
    }

    return (
        <>
            <div className="row">
                <div className="col-12">
                    <div className="page-title-box">
                        {props?.location?.state?.data?.mode === 'edit' ? <h4 className="page-title">Edit Project</h4> : <h4 className="page-title">Create Project</h4>}
                    </div>
                </div>
            </div>
            <div className="row mt-1">
                <div className="col-12 p-0">
                    <div className="card-box">
                        <div className="d-flex">
                            <div className="col-2 p-0 sticky">
                                <ul className="list-group">
                                    <li><Link activeclassName="active" className="list-group-item list-group-item-action" to="projectDetailsSection" spy={true} offset={-190} smooth={true} duration={100}>Project Details</Link></li>
                                    <li><Link activeclassName="active" className="list-group-item list-group-item-action" to="attachmentsSection" spy={true} offset={-100} smooth={true} duration={100}>Project Arifacts</Link></li>
                                </ul>
                            </div>
                            <div className="new-customer col-md-10 p-0">
                                <Element name="projectDetailsSection" className="element" >
                                    <div className="row">
                                        <div className="col-12 p-0">
                                            <section className="triangle">
                                                <h4 className="pl-2" style={{ alignContent: 'left' }}>Project</h4>
                                            </section>
                                        </div>
                                    </div>



                                    <div className="pt-0 mt-0">

                                        <fieldset className="scheduler-border">
                                            <>
                                                <div className="form-row">
                                                    <div className="col-12 pl-2 bg-light border">
                                                        <h5 className="text-primary">Project Details</h5>
                                                    </div>
                                                </div>
                                                <div className="row col-12">
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label htmlFor="customerTitle" className="col-form-label">Project Name<span>*</span></label>
                                                            <input type="text" className={`form-control ${(error.projectName ? "input-error" : "")}`}
                                                                value={project.projectName} id="projectName" placeholder="Project Name"
                                                                onChange={(e) => {
                                                                    setProject({ ...project, projectName: e.target.value })
                                                                }
                                                                }
                                                            />
                                                            <span className="errormsg">{error.projectName ? error.projectName : ""}</span>
                                                        </div>
                                                    </div>
                                                    {/* customer name should be dropdown once master data ready */}
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label htmlFor="Surname" className="col-form-label">Customer Name<span>*</span></label>
                                                            <ReactSelect
                                                                placeholder="Select Customer"
                                                                components={{
                                                                    IndicatorSeparator: () => null
                                                                }}
                                                                value={project?.customerDetails?.description ? [{ label: project?.customerDetails?.description, value: project?.customerDetails?.code }] : []}
                                                                options={customerData}
                                                                onChange={(e) => {

                                                                    setProject({
                                                                        ...project, customerName: e.value,
                                                                        customerDetails: {
                                                                            description: e.label,
                                                                            code: e.value,
                                                                        }
                                                                    })
                                                                }}
                                                                getOptionLabel={option => `${option.label}`}
                                                            />

                                                            <span className="errormsg">{error.customerName ? error.customerName : ""}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label htmlFor="Surname" className="col-form-label">Project Type<span>*</span></label>
                                                            <select className={`form-control ${(error.projectType ? "input-error" : "")}`} value={project.projectType} id="projectType" placeholder="Project Type"
                                                                onChange={(e) => {
                                                                    setProject({ ...project, projectType: e.target.value })

                                                                }
                                                                }
                                                            >
                                                                <option value="" selected={true}>Select Project Type</option>
                                                                {ProjectTypes && ProjectTypes.map((p, i) => {
                                                                    return (<option id={i} value={p.value}>{p.label}</option>)
                                                                })}

                                                            </select>
                                                            <span className="errormsg">{error.projectType ? error.projectType : ""}</span>
                                                        </div>
                                                    </div>

                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label htmlFor="Surname" className="col-form-label">Start Date<span>*</span></label>
                                                            <input type="date" className={`form-control ${(error.startDate ? "input-error" : "")}`}
                                                                value={project.startDate} id="startDate" placeholder="Start Date"
                                                                max={project?.endDate}
                                                                onChange={(e) => {
                                                                    setProject({ ...project, startDate: e.target.value })
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
                                                                min={project?.startDate}
                                                                value={project.endDate} id="endDate" placeholder="End Date"
                                                                onChange={(e) => {
                                                                    setProject({ ...project, endDate: e.target.value })
                                                                }
                                                                }
                                                            />
                                                            <span className="errormsg">{error.endDate ? error.endDate : ""}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <br></br>      <br></br>
                                                {/* <div className="form-row">
                                                    <div className="col-12 pl-2 bg-light border">
                                                        <h5 className="text-primary">User Mapping</h5>
                                                    </div>
                                                </div> */}
                                                <div className=" pt-2" >
                                                    <div className="col-12 pl-2 bg-light border" > <h5 className="text-primary" >User Project Mapping</h5 > </div >
                                                </div >
                                                <br></br>

                                                <form className="d-flex justify-content-center" >
                                                    <div style={{ width: "100%" }}>
                                                        {/* <label htmlFor="Surname" className="col-form-label">User Mapping<span>*</span></label> */}
                                                        {project?.mappingPayload?.users.length > 0 ? <><ReactSelect
                                                            placeholder="Select Users"
                                                            value={project?.mappingPayload?.users.length > 0 ? selectedUsers : ''}
                                                            components={{
                                                                // Option: IconOption,
                                                                IndicatorSeparator: () => null
                                                            }}
                                                            // value={selectedUsers ? selectedUsers : null}
                                                            closeMenuOnSelect={false}
                                                            options={usersArray}
                                                            isMulti
                                                            getOptionLabel={(e) => {
                                                                let randomColor = '#'.concat(Math.floor(Math.random() * 16777215).toString(16).toString())
                                                                return (
                                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                        <span style={{ width: "30px" }}>
                                                                            <Avatar
                                                                                title={e?.label}
                                                                                key={1}
                                                                                size="small"
                                                                                round={true}
                                                                                style={{ backgroundColor: randomColor, verticalAlign: 'middle', cursor: 'pointer', fontSize: "0.9rem" }}>
                                                                                <span style={{ padding: "0px", color: "white" }}
                                                                                > {e?.label.charAt(0).toUpperCase() + e?.label.charAt(1).toUpperCase()}</span>
                                                                            </Avatar>
                                                                        </span>
                                                                        <span style={{ marginLeft: 5 }}>{e.label}</span>
                                                                    </div>
                                                                )
                                                            }}
                                                            onChange={handleUserMapping}

                                                        /> </> :
                                                            <ReactSelect
                                                                placeholder="Select Users"
                                                                defaultValue={[]}
                                                                components={{
                                                                    // Option: IconOption,
                                                                    IndicatorSeparator: () => null
                                                                }}
                                                                // value={selectedUsers ? selectedUsers : null}
                                                                closeMenuOnSelect={false}
                                                                options={usersArray}
                                                                isMulti
                                                                getOptionLabel={(e) => {
                                                                    let randomColor = '#'.concat(Math.floor(Math.random() * 16777215).toString(16).toString())
                                                                    return (
                                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                            <span style={{ width: "30px" }}>
                                                                                <Avatar
                                                                                    title={e?.label}
                                                                                    key={1}
                                                                                    size="small"
                                                                                    round={true}
                                                                                    style={{ backgroundColor: randomColor, verticalAlign: 'middle', cursor: 'pointer', fontSize: "0.9rem" }}>
                                                                                    <span style={{ padding: "0px", color: "white" }}
                                                                                    > {e?.label.charAt(0).toUpperCase() + e?.label.charAt(1).toUpperCase()}</span>
                                                                                </Avatar>
                                                                            </span>
                                                                            <span style={{ marginLeft: 5 }}>{e.label}</span>
                                                                        </div>
                                                                    )
                                                                }}
                                                                onChange={handleUserMapping}

                                                            />}

                                                        <span className="errormsg">{error.users ? error.users : ""}</span>
                                                    </div>
                                                </form>


                                            </>

                                        </fieldset>

                                    </div>


                                </Element>
                                <Element name="attachmentsSection" className="element btm-space attach-sec">
                                    <div className="row">
                                        <div className="col-12 p-0">
                                            <section className="triangle"><h4 id="list-item-0" className="pl-2" style={{ alignContent: 'left' }}>Project Arifacts </h4></section>
                                        </div>
                                    </div>
                                    <fieldset className="scheduler-border">
                                        <>
                                            <div className="form-row">
                                                <div className="col-12 pl-2 bg-light border">
                                                    <h5 className="text-primary">Business Related</h5>
                                                </div>
                                            </div>
                                            <FileUpload
                                                data={{
                                                    currentFiles: currentFilesBuss,
                                                    interactionId: props?.location?.state?.data?.mode === 'edit' ? props?.location?.state?.data?.projectId : '',
                                                    entityType: 'BUSINESS_RELATED',
                                                    shouldGetExistingFiles: true,
                                                    permission: false,
                                                    existingFiles: existingFilesBuss,
                                                }}
                                                handlers={{
                                                    setCurrentFiles: setCurrentFilesBuss,
                                                    setExistingFiles: setExistingFilesBuss
                                                }}
                                            />
                                            <div className="form-row">
                                                <div className="col-12 pl-2 bg-light border">
                                                    <h5 className="text-primary">Project Related</h5>
                                                </div>
                                            </div>
                                            <FileUpload
                                                data={{
                                                    currentFiles: currentFilesProj,
                                                    existingFiles: existingFilesProj,
                                                    interactionId: props?.location?.state?.data?.mode === 'edit' ? props?.location?.state?.data?.projectId : '',
                                                    entityType: 'PROJECT_RELATED',
                                                    shouldGetExistingFiles: true,
                                                    permission: false
                                                }}
                                                handlers={{
                                                    setCurrentFiles: setCurrentFilesProj,
                                                    setExistingFiles: setExistingFilesProj
                                                }}
                                            />
                                            <div className="form-row">
                                                <div className="col-12 pl-2 bg-light border">
                                                    <h5 className="text-primary">UI/UX Related</h5>
                                                </div>
                                            </div>
                                            <FileUpload
                                                data={{
                                                    currentFiles: currentFilesUx,
                                                    existingFiles: existingFilesUx,
                                                    interactionId: props?.location?.state?.data?.mode === 'edit' ? props?.location?.state?.data?.projectId : '',
                                                    entityType: 'UI_RELATED',
                                                    shouldGetExistingFiles: true,
                                                    permission: false
                                                }}
                                                handlers={{
                                                    setCurrentFiles: setCurrentFilesUx,
                                                    setExistingFiles: setExistingFilesUx
                                                }}
                                            />
                                            <div className="form-row">
                                                <div className="col-12 pl-2 bg-light border">
                                                    <h5 className="text-primary">Technical Related</h5>
                                                </div>
                                            </div>
                                            <FileUpload
                                                style={{ height: "100px" }}
                                                data={{
                                                    currentFiles: currentFilesTech,
                                                    existingFiles: existingFilesTech,
                                                    interactionId: props?.location?.state?.data?.mode === 'edit' ? props?.location?.state?.data?.projectId : '',
                                                    entityType: 'TECH_RELATED',
                                                    shouldGetExistingFiles: true,
                                                    permission: false
                                                }}
                                                handlers={{
                                                    setCurrentFiles: setCurrentFilesTech,
                                                    setExistingFiles: setExistingFilesTech
                                                }}
                                            />
                                            <div className="form-row">
                                                <div className="col-12 pl-2 bg-light border">
                                                    <h5 className="text-primary">QA Related</h5>
                                                </div>
                                            </div>
                                            <FileUpload
                                                data={{
                                                    currentFiles: currentFilesQA,
                                                    existingFiles: existingFilesQA,
                                                    interactionId: props?.location?.state?.data?.mode === 'edit' ? props?.location?.state?.data?.projectId : '',
                                                    entityType: 'QA_RELATED',
                                                    shouldGetExistingFiles: true,
                                                    permission: false
                                                }}
                                                handlers={{
                                                    setCurrentFiles: setCurrentFilesQA,
                                                    setExistingFiles: setExistingFilesQA
                                                }}
                                            />
                                        </>
                                    </fieldset>
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

export default CreateProject