
import React, { useEffect, useState, useRef } from 'react';
import Modal from 'react-modal';
import { Editor } from '@tinymce/tinymce-react';
import { PriorityArray, CategoryArray } from '../ProjectManagementData'
import ReactSelect, { StylesConfig, components } from 'react-select'
import { toast } from 'react-toastify';
import { properties } from "../../properties";
import { post, put, get } from "../../util/restUtil";
// import { showSpinner,  } from "../../common/spinner";
import { Avatar } from 'antd';
import userImage from '../../../src/assets/images/placeholder.jpg'
import moment from 'moment';
import FileUpload from '../../common/uploadAttachment/fileUpload'
import { string, object, array } from "yup";

const requestValidationSchema = object().shape({
    issueType: string().required("Request type is required"),
    summary: string().required("Summary is required"),
    dueDate: string().required("Due date is required"),
    qaRequired: string().required("This field is required"),
    uxRequired: string().required("This field is required"),
    // priority: string().required("Priority is required"),
    prodDeploymentDate: string().required("Prodction deployment date is required"),
    developmentCompletionDate: string().required("Development completion date is required"),
    testingCompletionDate: string().required("Testing completion is required"),
    // sprintId: string().required("Sprint is required"),
    assignee: string().required("Assignee is required"),


});
const CreateIssue = (props) => {

    const { projectData, sprintData, sprintList } = props?.data
    console.log("create issue props", projectData, sprintData, sprintList)
    const lookupData = useRef({})
    const { isOpen, setIsOpen } = props
    const [usersAssign, setUsersAssign] = useState([])
    const [projects, setProjects] = useState([])
    const [members, setMembers] = useState([])
    const [usersArray, setUsersArray] = useState([])
    const [currentFiles, setCurrentFiles] = useState([]);
    const [issueDetails, setIssueDetails] = useState({
        projectId: "",
        projectName: "",
        issueType: "",
        status: "TODO",
        summary: "",
        description: "",
        dueDate: "",
        qaRequired: "",
        uxRequired: "",
        priority: "",
        prodDeploymentDate: "",
        developmentCompletionDate: "",
        testingCompletionDate: "",
        sprintId: "",
        sprintName: "",
        assignee: "",
        labels: ""
    })
    const [error, setError] = useState({})
    const [yesNoArray, setYesNoArray] = useState([])
    const [pmStatus, setPmStatus] = useState([])

    const PmLabels = [
        { value: "Pon", label: "Pon Arasi" },
        { value: "Kharpagam", label: "Kharpagam N" },
        { value: "Shirish", label: "Shirish S" }
    ]
    const { Option } = components;
    useEffect(() => {

    }, [props.data])
    useEffect(() => {
        
        post(properties.BUSINESS_ENTITY_API, [
            'YES_NO',
            'PM_STATUS'
        ])
            .then((response) => {
                if (response.data) {
                    lookupData.current = response.data

                    setYesNoArray(lookupData.current["YES_NO"])
                    setPmStatus(lookupData.current['PM_STATUS'])
                }
            })

        get(properties.PROJECT_MANAGEMENT_API + '/project-details/' + projectData?.projectId).then((resp) => {
            if (resp.data) {
                if (resp?.data?.mappingPayload?.users) {
                    post(properties.USER_API + '/get-users-by-ids', resp?.data?.mappingPayload?.users).then((response) => {
                        if (response.data) {

                            let userArray = []
                            response?.data?.map((e) => {
                                userArray.push({ value: e.userId, label: e.firstName, icon: e.profilePicture })
                            })

                            setUsersArray(userArray)
                        }
                    })
                }

            }
        }).finally()

    }, [])

    const handleChange = (e) => {

        setIssueDetails({ ...issueDetails, issueType: e.value })

    }
    const handlePriorityChange = (e) => {

        setIssueDetails({ ...issueDetails, priority: e.value })
    }

    const renderProjectOptions = () => {
        return projects.map((project, index) => {
            return <option value={project.id} key={index}>{project.name}</option>
        })
    }
    const closeModal = () => {
        setIsOpen(!isOpen)
        setIssueDetails({})
    }
    const validate = (section, schema, data) => {
        try {
            if (section === 'REQUEST') {
                setError({})
            }
            schema.validateSync(data, { abortEarly: false });
        } catch (e) {
            e.inner.forEach((err) => {
                if (section === 'REQUEST') {
                    setError((prevState) => {
                        return { ...prevState, [err.params.path]: err.message };
                    });
                }
            });
            return e;
        }
    };
    const handleSubmit = () => {
        console.log("issueDetails", issueDetails)
        let obj = {
            ...issueDetails,
            projectId: projectData.projectId,
            projectName: projectData.projectName,
            sprintId: issueDetails?.sprintId === 'BACKLOG' ? null : issueDetails?.sprintId,
            status: 'TODO',
            attachments: [...currentFiles.map((current) => current.entityId)],
        }
        console.log("obj", obj)
        const requestDetailsError = validate('REQUEST', requestValidationSchema, obj);
        if (requestDetailsError) {
            toast.error("Validation error found, Please check the mandatory fields")
            return
        }
        
        post(properties.PROJECT_MANAGEMENT_API + '/request/create', obj).then((resp) => {
            if (resp.data) {
                toast.success("Request created successfully")
                setIsOpen(false)
            }
        }).finally()

    }
    const handleInputChange = (e) => {
        const { target } = e
        console.log("target", target)
        if (target.id === 'developmentCompletionDate' &&
            ((issueDetails?.testingCompletionDate && target.value > issueDetails?.testingCompletionDate)
                || (issueDetails?.prodDeploymentDate && target.value > issueDetails?.prodDeploymentDate)
                || (issueDetails?.dueDate && target.value > issueDetails?.dueDate))) {
            toast.error("Please select valid development completion date")
            return
        }

        if (target.id === 'testingCompletionDate'
            && ((issueDetails?.developmentCompletionDate && target.value < issueDetails?.developmentCompletionDate)
                || (issueDetails?.dueDate && target.value > issueDetails?.dueDate) || (issueDetails?.prodDeploymentDate && target.value > issueDetails?.prodDeploymentDate))) {
            toast.error("Please select valid testing completion date")
            return
        }
        if (target.id === 'prodDeploymentDate'
            && ((issueDetails?.developmentCompletionDate && target.value < issueDetails?.developmentCompletionDate)
                || (issueDetails?.testingCompletionDate && target.value < issueDetails?.testingCompletionDate)
                || (issueDetails?.dueDate && target.value > issueDetails?.dueDate))) {
            toast.error("Please select valid deployment date")
            return
        }
        setIssueDetails({
            ...issueDetails,
            [target.id]: target.value,
        })
    }


    return (
        <>
            <Modal isOpen={isOpen} onRequestClose={() => setIsOpen(false)} contentLabel="Example Modal">
                <div className="">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">Create Issue</h4>
                            <button onClick={closeModal} type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div></div>
                        <div className="modal-body">
                            <fieldset className="scheduler-border">
                                <form className="d-flex justify-content-center">
                                    {<div className="row">
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label className="control-label">Sprint&nbsp;<span>*</span></label>
                                                <ReactSelect
                                                    placeholder="Select sprint"
                                                    //value={selectedOption}
                                                    options={sprintList}
                                                    onChange={(e) => {
                                                        console.log("sprint", e)
                                                        setError({ ...error, sprintId: '' })
                                                        setIssueDetails({ ...issueDetails, sprintId: e.value, sprintName: e.label, sprintStartDate: e.startDate, sprintEndDate: e.endDate })
                                                    }}

                                                />
                                                {error.sprintId ? <span className="errormsg">{error.sprintId}</span> : ""}
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label className="control-label">Issue Type&nbsp;<span>*</span></label>
                                                <ReactSelect
                                                    placeholder="Select Option"
                                                    //value={selectedOption}
                                                    options={CategoryArray}
                                                    onChange={(e) => {
                                                        setError({ ...error, issueType: "" })
                                                        handleChange(e)
                                                    }}
                                                    getOptionLabel={e => (
                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                            {e.icon}
                                                            <span style={{ marginLeft: 5 }}>{e.text}</span>
                                                        </div>
                                                    )}
                                                />
                                                {error.issueType ? <span className="errormsg">{error.issueType}</span> : ""}

                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label className="control-label">Assignee&nbsp;<span>*</span></label>
                                                <ReactSelect
                                                    placeholder="Select Assignee"
                                                    components={{
                                                        // Option: IconOption,
                                                        IndicatorSeparator: () => null
                                                    }}
                                                    //value={selectedOption}
                                                    options={usersArray}
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
                                                                <span style={{ marginLeft: 5, whiteSpace: 'pre-wrap' }}>{e.label}</span>
                                                            </div>
                                                        )
                                                    }}
                                                    onChange={
                                                        (e) => {
                                                            setError({ ...error, assignee: "" })
                                                            setIssueDetails({ ...issueDetails, assignee: e.value })
                                                        }
                                                    }
                                                />
                                                {error.assignee ? <span className="errormsg">{error.assignee}</span> : ""}

                                            </div>
                                        </div>

                                        <div className="col-md-4 d-none">
                                            <div className="form-group">
                                                <label className="control-label">Status&nbsp;<span>*</span></label>
                                                <select name="status" className="form-control" value={issueDetails.status}
                                                    id="status"
                                                    onChange={(e) => {
                                                        handleInputChange(e)
                                                        // setIssueDetails({ ...issueDetails, status: e.target.value })
                                                    }}>
                                                    <option value="TODO" selected={true} disabled>To Do</option>
                                                    {pmStatus.map((e) => {
                                                        return (<option value={e.code}>{e.description}</option>)
                                                    })}
                                                </select>

                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">

                                                <label className="control-label">Priority&nbsp;</label>
                                                {/* <select name="priority" className="form-control" onChange={handleChange}>
                                                <option value={"High"}>High</option>
                                                <option value={"Medium"}>Medium</option>
                                                <option value={"Low"}>Low</option>
                                            </select> */}
                                                <ReactSelect
                                                    placeholder="Select Option"
                                                    //value={selectedOption}
                                                    options={PriorityArray}
                                                    onChange={(e) => {
                                                        // setError({ ...error, priority: "" })
                                                        handlePriorityChange(e)
                                                    }}
                                                    getOptionLabel={e => (
                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                            {e.icon}
                                                            <span style={{ marginLeft: 5 }}>{e.text}</span>
                                                        </div>
                                                    )}
                                                />
                                                {/* {error.priority ? <span className="errormsg">{error.priority}</span> : ""} */}

                                            </div>
                                        </div>

                                        <div className="col-md-12">
                                            <div className="form-group">
                                                <label className="control-label">Summary&nbsp;<span>*</span></label>
                                                <textarea className="form-control mb-2" rows="3" value={issueDetails.summary}
                                                    id="summary"
                                                    onChange={(e) => {
                                                        setError({ ...error, summary: "" })
                                                        handleInputChange(e)
                                                        // setIssueDetails({ ...issueDetails, summary: e.target.value })
                                                    }}></textarea>
                                                {error.summary ? <span className="errormsg">{error.summary}</span> : ""}
                                            </div>
                                        </div>
                                        <div className="col-md-12">
                                            <div className="form-group">
                                                <label className="control-label">Description&nbsp;</label>
                                                <Editor
                                                    init={{
                                                        height: 250,
                                                        menubar: false,
                                                        statusbar: false,
                                                        plugins: [
                                                            'advlist autolink lists link image charmap print preview anchor',
                                                            'searchreplace visualblocks code fullscreen',
                                                            'insertdatetime media table paste code help wordcount'
                                                        ],
                                                        toolbar: 'undo redo  | ' +
                                                            'bold italic  | alignleft aligncenter ' +
                                                            'alignright alignjustify | bullist numlist outdent indent | ',
                                                        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:10px, font-weight:400 }'
                                                    }}
                                                    onEditorChange={(content, editor) => {
                                                        setIssueDetails({ ...issueDetails, 'description': content });
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label className="control-label">QA Required&nbsp;<span>*</span></label>
                                                <select name="priority" className="form-control" value={issueDetails.qaRequired}
                                                    id="qaRequired"
                                                    onChange={(e) => {
                                                        setError({ ...error, qaRequired: "" })
                                                        handleInputChange(e)
                                                        // setIssueDetails({ ...issueDetails, qaRequired: e.target.value })
                                                    }}>
                                                    <option value="" selected={true}>Select option</option>
                                                    {yesNoArray.map((e) => {

                                                        return (<option value={e.code}>{e.description}</option>)
                                                    })}

                                                </select>
                                                {error.qaRequired ? <span className="errormsg">{error.qaRequired}</span> : ""}
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label className="control-label">UX Required&nbsp;<span>*</span></label>
                                                <select name="priority" className="form-control" value={issueDetails.uxRequired} id="uxRequired"
                                                    onChange={(e) => {
                                                        setError({ ...error, uxRequired: "" })
                                                        handleInputChange(e)
                                                        // setIssueDetails({ ...issueDetails, uxRequired: e.target.value })
                                                    }}>
                                                    <option value="" selected={true} disabled>Select option</option>
                                                    {yesNoArray.map((e) => {
                                                        return (<option value={e.code}>{e.description}</option>)
                                                    })}

                                                </select>
                                                {error.uxRequired ? <span className="errormsg">{error.uxRequired}</span> : ""}
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label className="control-label">Due Date&nbsp;<span>*</span></label>
                                                <input className="form-control" value={issueDetails.dueDate}
                                                    type="date" id="dueDate"
                                                    min={issueDetails.sprintStartDate ? moment(issueDetails?.sprintStartDate).format('YYYY-MM-DD') : moment(projectData?.startDate).format('YYYY-MM-DD')}
                                                    max={issueDetails.sprintEndDate ? moment(issueDetails?.sprintEndDate).format('YYYY-MM-DD') : moment(projectData?.endDate).format('YYYY-MM-DD')}
                                                    onChange={(e) => {
                                                        setError({ ...error, dueDate: "" })
                                                        // setIssueDetails({ ...issueDetails, dueDate: e.target.value })
                                                        handleInputChange(e)
                                                    }}
                                                />
                                                {error.dueDate ? <span className="errormsg">{error.dueDate}</span> : ""}
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label className="control-label">Development Completion Date&nbsp;<span>*</span></label>
                                                <input className="form-control" id="developmentCompletionDate"
                                                    value={issueDetails.developmentCompletionDate}
                                                    type="date"
                                                    min={issueDetails.sprintStartDate ? moment(issueDetails?.sprintStartDate).format('YYYY-MM-DD') : moment(projectData?.startDate).format('YYYY-MM-DD')}
                                                    max={issueDetails.testingCompletionDate ? moment(issueDetails?.dueDate).format('YYYY-MM-DD') : issueDetails.sprintEndDate ? moment(issueDetails?.sprintEndDate).format('YYYY-MM-DD') : moment(projectData?.endDate).format('YYYY-MM-DD')}
                                                    onChange={(e) => {
                                                        handleInputChange(e)
                                                        setError({ ...error, developmentCompletionDate: "" })
                                                        // setIssueDetails({ ...issueDetails, developmentCompletionDate: e.target.value })
                                                    }}
                                                />
                                                {error.developmentCompletionDate ? <span className="errormsg">{error.developmentCompletionDate}</span> : ""}
                                            </div>
                                        </div>

                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label className="control-label">Testing Completion Date&nbsp;<span>*</span></label>
                                                <input className="form-control" id="testingCompletionDate"
                                                    value={issueDetails.testingCompletionDate}
                                                    type="date"
                                                    min={issueDetails.sprintStartDate ? moment(issueDetails?.sprintStartDate).format('YYYY-MM-DD') : moment(projectData?.startDate).format('YYYY-MM-DD')}
                                                    max={issueDetails.sprintEndDate ? moment(issueDetails?.sprintEndDate).format('YYYY-MM-DD') : moment(projectData?.endDate).format('YYYY-MM-DD')}
                                                    // min={moment(projectData?.startDate).format('YYYY-MM-DD')}
                                                    // max={moment(issueDetails?.prodDeploymentDate).format('YYYY-MM-DD')}
                                                    onChange={(e) => {
                                                        handleInputChange(e)
                                                        setError({ ...error, testingCompletionDate: "" })
                                                        // setIssueDetails({ ...issueDetails, testingCompletionDate: e.target.value })
                                                    }}
                                                />
                                                {error.testingCompletionDate ? <span className="errormsg">{error.testingCompletionDate}</span> : ""}
                                            </div>
                                        </div>

                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label className="control-label">Production Deployment Date&nbsp;<span>*</span></label>
                                                <input className="form-control" id="prodDeploymentDate"
                                                    value={issueDetails.prodDeploymentDate}
                                                    type="date"
                                                    min={issueDetails.sprintStartDate ? moment(issueDetails?.sprintStartDate).format('YYYY-MM-DD') : moment(projectData?.startDate).format('YYYY-MM-DD')}
                                                    max={issueDetails.sprintEndDate ? moment(issueDetails?.sprintEndDate).format('YYYY-MM-DD') : moment(projectData?.endDate).format('YYYY-MM-DD')}
                                                    // min={moment(projectData?.startDate).format('YYYY-MM-DD')}
                                                    // max={moment(issueDetails?.dueDate).format('YYYY-MM-DD')}
                                                    onChange={(e) => {
                                                        handleInputChange(e)
                                                        setError({ ...error, prodDeploymentDate: "" })
                                                        // setIssueDetails({ ...issueDetails, prodDeploymentDate: e.target.value })
                                                    }}
                                                />
                                                {error.prodDeploymentDate ? <span className="errormsg">{error.prodDeploymentDate}</span> : ""}
                                            </div>
                                        </div>



                                        {/* <div className="col-md-4">
                                            <div className="form-group">
                                                <label className="control-label">Labels</label>
                                                <ReactSelect
                                                    placeholder="Select label"
                                                    components={{
                                                        IndicatorSeparator: () => null
                                                    }}
                                                    // value={issueDetails?.label}
                                                    options={PmLabels}
                                                    onChange={
                                                        (e) => {
                                                            setIssueDetails({ ...issueDetails, labels: e.value })
                                                        }
                                                    }
                                                />

                                            </div>
                                        </div> */}





                                    </div>}



                                </form>
                                <div className=" pt-2" >
                                    <div className="col-12 pl-2 bg-light border" > <h5 className="text-primary" >Attachments</h5 > </div >
                                </div >

                                <FileUpload
                                    data={{
                                        currentFiles,
                                        //customerId: props.location.state.data.customerId,
                                        entityType: 'REQUEST',
                                        shouldGetExistingFiles: false,
                                        permission: false
                                    }}
                                    handlers={{
                                        setCurrentFiles
                                    }}
                                />
                            </fieldset>


                            <div style={{ marginTop: "30px" }} className="col-md-12 text-center">
                                <button className="btn waves-effect waves-light btn-primary" onClick={handleSubmit} >Submit</button>&nbsp;
                                <button className="btn waves-effect waves-light btn-secondary" onClick={closeModal}>Close</button>
                            </div>
                        </div >
                    </div>
                </div>


            </Modal >
        </>
    );
}

// const CreateTaskWithFormik = withFormik({
//     enableReinitialize: true,
//     mapPropsToValues: (props) => {
//         return {
//             name: '',
//             projectId: 33,
//             type: 'New Task',
//             priority: 'High',
//             timeTrackingSpent: 0,
//             timeTrackingRemaining: 0,
//             originalEstimate: 0,
//             description: '',
//             usersAssign: [],
//             status: 'BACKLOG',
//         }
//     },

//     handleSubmit: (values, { setSubmitting, props }) => {
//         setSubmitting(true);
//         // props.dispatch({
//         //     type: CREATE_TASK_SAGA,
//         //     newTask: { ...values },
//         // })
//     },

//     displayName: 'Jira Bugs Create Task',
// })(CreateTaskModal);

export default CreateIssue