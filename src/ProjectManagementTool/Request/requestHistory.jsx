
import React, { useEffect, useState, useRef, useContext } from 'react';
import Modal from 'react-modal';
import { Editor } from '@tinymce/tinymce-react';
import { PriorityArray, CategoryArray } from '../ProjectManagementData'
import ReactSelect, { StylesConfig, components } from 'react-select'
import { toast } from 'react-toastify';
import { Link, useHistory } from "react-router-dom";
import { properties } from "../../properties";
import { post, put, get, remove } from "../../util/restUtil";
import { showSpinner, hideSpinner } from "../../common/spinner";
import userImage from '../../../src/assets/images/placeholder.jpg'
import moment from 'moment';
import { AppContext } from "../../AppContext";
import FileUpload from '../../common/uploadAttachment/fileUpload'
import { string, object, array } from "yup";
import { Avatar, Input, Popconfirm, Button, notification } from 'antd';
import { formatISODateTime } from '../../util/dateUtil';

const RequestHistory = (props) => {
    console.log("props  RequestHistory", props)
    let { auth, setAuth } = useContext(AppContext);
    const history = useHistory();
    const [refresh, setRefresh] = useState(false)
    const { task } = props?.data
    const [existingFiles, setExistingFiles] = useState([]);
    const lookupData = useRef({})
    const { isOpen, setIsOpen } = props
    const [reqhistory, setReqhistory] = useState([])
    const [currReqStatus, setCurrReqStatus] = ([{}])
    const [projects, setProjects] = useState([])
    const [members, setMembers] = useState([])
    const [usersArray, setUsersArray] = useState([])
    const [currentFiles, setCurrentFiles] = useState([]);
    const [reqDetails, setReqDetails] = useState(task)
    const [yesNoArray, setYesNoArray] = useState([])
    const [status, setStatus] = useState([])
    const [commentContent, setCommentContent] = useState('')
    const [updateCommentContent, setUpdateCommentContent] = useState('')
    const [showAssign, setShowAssign] = useState(false)
    const [editComment, setEditComment] = useState('')
    const PmLabels = [
        { value: "Pon", label: "Pon Arasi" },
        { value: "Kharpagam", label: "Kharpagam N" },
        { value: "Shirish", label: "Shirish S" }
    ]
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


    let array = []
    const userOptions = members.map((user, index) => {
        return { value: user.id, label: user.login, key: index };
    })
    useEffect(() => {
        showSpinner()
        get(properties.ATTACHMENT_API + "?entity-id=" + reqDetails?.requestId + "&entity-type=" + 'REQUEST')
            .then((resp) => {
                if (resp.data && resp.data.length) {
                    setExistingFiles(resp.data)
                }
            })
            .catch((error) => {
                console.error("error", error)
            })
        get(properties.PROJECT_MANAGEMENT_API + "/request-history/" + reqDetails?.requestId)
            .then((resp) => {
                if (resp.data) {
                    console.log("resp.data", resp.data)
                    setReqhistory(resp.data)
                }
            })
            .catch((error) => {
                console.error("error", error)
            }).finally(hideSpinner)
    }, [refresh])

    useEffect(() => {


    }, [props, reqDetails.comments])


    const updateRequest = (e) => {

        let target = e.target
        let obj
        if (target.id === 'currStatus') {
            obj = {
                currStatus: target.value,
                currStatusDesc: target.label

            }
            setReqDetails({
                ...reqDetails,
                statusDesc: { description: target.label, code: target.value, },
                [target.id]: target.value,
                currStatusDesc: target.label
            })
        }
        else if (target.id === 'dueDate') {
            obj = {
                dueDate: target.value
            }
            setReqDetails({
                ...reqDetails,
                [target.id]: target.value,
            })
        }
        else if (target.id === 'uxRequired') {
            obj = {
                uxRequired: target.value
            }
            setReqDetails({
                ...reqDetails,
                [target.id]: target.value,
            })
        }
        else if (target.id === 'qaRequired') {
            obj = {
                qaRequired: target.value
            }
            setReqDetails({
                ...reqDetails,
                [target.id]: target.value,
            })
        }
        else if (target.id === 'deploymentDate') {
            obj = {
                deploymentDate: target.value
            }
            if ((reqDetails?.devCompDate && target.value < reqDetails?.devCompDate)
                || (reqDetails?.testingDate && target.value < reqDetails?.testingDate)
                || (reqDetails?.dueDate && target.value > reqDetails?.dueDate)) {
                toast.error("Please select valid deployment date")
                return
            }
            setReqDetails({
                ...reqDetails,
                [target.id]: target.value,
            })
        }
        else if (target.id === 'testingDate') {
            obj = {
                testingDate: target.value
            }
            if (
                (reqDetails?.devCompDate && target.value < reqDetails?.devCompDate)
                || (reqDetails?.dueDate && target.value > reqDetails?.dueDate) || (reqDetails?.deploymentDate && target.value > reqDetails?.deploymentDate)) {
                toast.error("Please select valid testing completion date")
                return
            }
            setReqDetails({
                ...reqDetails,
                [target.id]: target.value,
            })
        }
        else if (target.id === 'devCompDate') {
            obj = {
                devCompDate: target.value
            }
            if (
                (reqDetails?.testingDate && target.value > reqDetails?.testingDate)
                || (reqDetails?.deploymentDate && target.value > reqDetails?.deploymentDate)
                || (reqDetails?.dueDate && target.value > reqDetails?.dueDate)
            ) {
                toast.error("Please select valid development completion date")
                return
            }
            setReqDetails({
                ...reqDetails,
                [target.id]: target.value,
            })
        }
        else if (target.id === 'projectId') {
            obj = {
                projectId: target.value
            }
            setReqDetails({
                ...reqDetails,
                [target.id]: target.value,
            })
        }
        else if (target.id === 'sprintId') {
            obj = {
                sprintId: target.value
            }
            setReqDetails({
                ...reqDetails,
                [target.id]: target.value,
            })
        }
        else if (target.id === 'assignee') {
            obj = {
                assignee: target?.value,

            }
            setReqDetails({
                ...reqDetails,
                [target.id]: target.value,
                assigneeName: target?.label
            })
        }


    }
    const assignToSelf = (e) => {
        let taskUpdate = {
            assignee: auth?.user?.userId
        }
        showSpinner()
        put(properties.PROJECT_MANAGEMENT_API + '/request/update/' + task.requestId, taskUpdate).then((resp) => {
            if (resp.status === 200) {
                toast.success("Successfully assigned")
                // setRefresh(!refresh)
            }
        }).finally(hideSpinner)
    }
    const openNotification = (type, message, description) => {
        notification[type]({
            message: message,
            description: description,
        });
    };


    const createComment = (comment) => {
        console.log("create comment", comment)
        let requestBody = {
            remarks: comment?.content,
            requestId: comment?.task?.id,
            reporterId: comment?.user?.id
        }

        showSpinner()
        post(properties.PROJECT_MANAGEMENT_API + "/create-comment", requestBody).then((resp) => {
            if (resp.status === 200) {
                toast.success("Comment created successfully")
                get(properties.PROJECT_MANAGEMENT_API + "/request/" + resp?.data?.requestId).then((resp) => {
                    if (resp.data) {
                        console.log("reqDetails", reqDetails)
                        // console.log(resp.data.comments.sort((a,b) =>  b.txnId-a.txnId ))
                        setCommentContent('');
                        setReqDetails({ ...reqDetails, comments: resp.data.comments })
                    }
                })
            }
        }).finally(hideSpinner)
    }
    const updateComment = (comment) => {
        console.log("comment", comment)
        let requestBody = {
            remarks: comment?.content,
            requestId: comment?.task?.id,
            reporterId: comment?.user?.id,
            txnId: comment?.txnId?.id
        }
        showSpinner()
        post(properties.PROJECT_MANAGEMENT_API + "/update-comment", requestBody).then((resp) => {
            if (resp.status === 200) {
                toast.success("Comment updated successfully")
                get(properties.PROJECT_MANAGEMENT_API + "/request/" + comment?.task?.id).then((resp) => {
                    if (resp.data) {
                        console.log("reqDetails", reqDetails)
                        setUpdateCommentContent('');
                        setEditComment('')
                        setReqDetails({ ...reqDetails, comments: resp.data.comments })
                    }
                })
            }
        }).finally(hideSpinner)
    }
    const closeModal = () => {
        setIsOpen(!isOpen)
        // window.location.reload();
        // setRefresh(true)
        setReqDetails({})
    }


    // const renderCommnets = () => {

    //     reqDetails?.comments.sort((a, b) => b.txnId - a.txnId)
    //     return (
    //         reqDetails?.comments?.map((comment, index) => {
    //             return (
    //                 <>{
    //                     editComment === comment.txnId ?
    //                         <div className="block-comment mt-4" style={{ display: 'flex' }}>
    //                             <div className="avatar">
    //                                 <Avatar
    //                                     title={comment?.reporterDetails[0]?.firstName + " " + comment?.reporterDetails[0]?.lastName}
    //                                     key={index}
    //                                     size="45"
    //                                     round={true}
    //                                     style={{ backgroundColor: '#0275d8', verticalAlign: 'middle', cursor: 'pointer' }}>
    //                                     <span style={{ padding: "0px", color: "white", }}> {comment?.reporterDetails[0]?.firstName.charAt(0).toUpperCase() + comment?.reporterDetails[0]?.lastName.charAt(0).toUpperCase()}</span>
    //                                 </Avatar>

    //                             </div>
    //                             <div className="input-comment">
    //                                 <Input type="text" placeholder="Add a comment..."
    //                                     value={updateCommentContent}
    //                                     onChange={(e) => {
    //                                         setUpdateCommentContent(e.target.value);
    //                                     }} />

    //                             </div>
    //                             <div>
    //                                 <Button type="primary" style={{ height: 40 }} className="ml-2"
    //                                     onClick={() => {
    //                                         if (updateCommentContent === '') {
    //                                             openNotification('error', 'Fail!', 'Please add a comment...!');
    //                                             return;
    //                                         }
    //                                         let newComment = {
    //                                             user: {
    //                                                 id: comment?.reporterId,
    //                                             },
    //                                             txnId: {
    //                                                 id: comment?.txnId,
    //                                             },
    //                                             task: {
    //                                                 id: comment?.requestId,
    //                                             },
    //                                             content: updateCommentContent,
    //                                         };

    //                                         updateComment(newComment)

    //                                     }}
    //                                 >Update</Button>
    //                             </div>
    //                         </div> :
    //                         <div className="comment-item mt-4" key={index}>
    //                             <div className="display-comment" style={{ display: 'flex' }}>
    //                                 <div className="avatar">
    //                                     <Avatar
    //                                         title={comment?.reporterDetails[0]?.firstName + " " + comment?.reporterDetails[0]?.lastName}
    //                                         key={index}
    //                                         size="45"
    //                                         round={true}
    //                                         style={{ backgroundColor: '#0275d8', verticalAlign: 'middle', cursor: 'pointer' }}>
    //                                         <span style={{ padding: "0px", color: "white", }}> {comment?.reporterDetails[0]?.firstName.charAt(0).toUpperCase() + comment?.reporterDetails[0]?.lastName.charAt(0).toUpperCase()}</span>
    //                                     </Avatar>
    //                                     {/* {(comment.user.imageUrl === '' || comment.user.imageUrl === null) ?
    //                                 <Avatar icon={<i className="fa fa-user-alt"></i>} /> : <Avatar src={comment.user.imageUrl} />
    //                             } */}
    //                                 </div>
    //                                 <div>
    //                                     <span style={{ marginBottom: 5, fontSize: '14px', color: '#42526E', fontWeight: "9px" }}>
    //                                         {comment?.reporterDetails[0]?.firstName}&nbsp;
    //                                         {/* <span>&nbsp;a month ago</span> */}
    //                                         <small className="mr-1">{moment(comment.createdAt).fromNow()}</small>
    //                                     </span>
    //                                     <br></br>
    //                                     <span style={{ marginBottom: 0, color: '172B4D' }}>
    //                                         {comment.remarks}
    //                                         {/* Please confirm if the data set issue is resolved and update the next action item from your end. */}
    //                                     </span>
    //                                     {/* {userLogin.id === comment.user.id  */}
    //                                     {true ?
    //                                         <div>
    //                                             {auth?.user?.userId === comment.reporterId ?
    //                                                 <span style={{ color: '#65676B', cursor: 'pointer', fontSize: 12 }}
    //                                                     onClick={() => {
    //                                                         setUpdateCommentContent(comment.remarks)
    //                                                         setEditComment(comment.txnId)
    //                                                         // editComment(comment)
    //                                                     }}>Edit
    //                                                 </span> : <></>}

    //                                         </div> :
    //                                         <div>
    //                                             <span style={{ color: '#65676B', cursor: 'pointer', fontSize: 12 }}>Like </span>
    //                                             •
    //                                             <span style={{ color: '#65676B', cursor: 'pointer', fontSize: 12 }}> Response</span>
    //                                         </div>}
    //                                 </div>
    //                             </div>
    //                         </div>
    //                 }

    //                 </>
    //             )
    //         })
    //     )
    // }
    const inputRef = useRef(null);

    const handleClick = () => {
        // 👇️ open file input box on click of other element
        inputRef.current.click();
    };


    const handleFileChange = (e) => {

        const file = e.target.files && e.target.files[0];

        if (file.size > 5242880) {
            if (status === "preparing") {
                remove()
                toast.error("Attached file size is big greater than 5MB")
                return false;
            }
            else {
                return false;
            }
        }
        let name = file.name
        let arrayObject = {}

        showSpinner();
        (async () => {
            let base64 = await convertBase64(file);

            let filebody = {
                fileName: file.name,
                fileType: file.type,
                entityType: 'REQUEST',
                entityId: reqDetails?.requestId,
                content: base64
            }
            post(properties.ATTACHMENT_API + '/create/attachment', [filebody])
                .then((resp) => {
                    if (resp.data) {
                        arrayObject = resp.data[0];
                        // arrayObject.metaId = meta.id;
                        setRefresh(!refresh)
                        array.push(arrayObject)
                        setCurrentFiles([...currentFiles, ...array])
                        toast.success(`${file.name} Uploaded Successfully`)
                        hideSpinner();
                    }
                    else {
                        toast.error("Failed to upload document");
                    }
                })
                .catch((error) => {
                    console.error('Error while uploading data', error);
                })
        })();

        // else if (status == 'removed') {
        //     // let data = currentFiles.filter((item) => item.metaId !== meta.id)
        //     // setCurrentFiles(data)

        // }
    }

    const convertBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);

            fileReader.onload = () => {
                resolve(fileReader.result);
                return fileReader.result
            };

            fileReader.onerror = (error) => {
                reject(error);
            };
        });
    };
    const handleFileDownload = (id) => {
        showSpinner()
        get(properties.ATTACHMENT_API + "/" + id + "?entity-id=" + reqDetails?.requestId + "&entity-type=" + "REQUEST")
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
    const deleteComment = (comment) => {
        showSpinner()
        remove(properties.PROJECT_MANAGEMENT_API + "/delete-comment/" + comment.txnId).then((resp) => {
            if (resp.status === 200) {
                get(properties.PROJECT_MANAGEMENT_API + "/request/" + comment?.requestId).then((resp) => {
                    if (resp.data) {
                        console.log("reqDetails", reqDetails)
                        setReqDetails({ reqDetails, comments: resp.data.comments })
                    }
                })

            }
        }).finally(hideSpinner)

    }

    return (
        <>
            <Modal isOpen={isOpen} onRequestClose={() => setIsOpen(false)} contentLabel="Example Modal">
                <div className="">
                    <div className="modal-content">
                        <div style={{ height: 24, lineHeight: '34px', paddingLeft: '2%' }}>

                            <div style={{ cursor: 'pointer' }}>
                                {
                                    CategoryArray.map((c) => {
                                        if (c.value === task.category) {
                                            return (

                                                <div style={{ cursor: 'pointer', display: 'flex' }}>
                                                    <div style={{}}>{c.icon}</div>&nbsp;
                                                    <h6 style={{ fontWeight: '700' }}>{task.category.toUpperCase() + '-' + task.requestId}</h6>
                                                </div>
                                            )
                                        }
                                    })
                                }

                            </div>
                        </div>
                        <div className="modal-header">
                            <h4 className="modal-title" style={{ width: '80%', fontWeight: '600' }}>{task?.header}</h4>

                            <button onClick={closeModal} type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div style={{ display: 'flex', marginLeft: 20, width: '7%', overflow: 'hidden', whiteSpace: 'pre-wrap' }} className="text">
                            <input
                                style={{ display: 'none' }}
                                type='file'
                                ref={inputRef}
                                onChange={handleFileChange}>

                            </input>
                            <i onClick={handleClick} className="fa fa-paperclip" style={{ fontSize: "20px" }}></i>
                            {/* <i onClick={handleClick}>Open file upload box</i> */}
                        </div>
                        <div className="modal-body" style={{ display: 'flex' }}>
                            <div className="col-6">
                                <fieldset className="scheduler-border">
                                    <form className="d-flex justify-content-center">
                                        {<div className="row">



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
                                            <div className="col-md-12">
                                                <div className="form-group">
                                                    <label className="control-label">Activity History&nbsp;</label>

                                                    <div className="comment mt-2">


                                                        <div className="lastest-comment mt-4">
                                                            <div className="col-12 p-2">
                                                                <div className="timeline">
                                                                    {
                                                                        reqhistory &&
                                                                        reqhistory.map((data, index) => {
                                                                            return (
                                                                                <div key={index} className="timeline-container primary">
                                                                                    <div className="timeline-icon">
                                                                                        {++index}
                                                                                    </div>
                                                                                    <div className="timeline-body">
                                                                                        <h4 className="timeline-title m-0">
                                                                                            <span className="badge text-white">Updated on {formatISODateTime(data.histInserteredDate)}</span>
                                                                                        </h4>
                                                                                        <div className="bg-white border p-2">
                                                                                            <div className="col-md-12 row text-dark">
                                                                                                {/* <div className="col-md-3">
                                                                                                    <label htmlFor="inputState" className="col-form-label pt-0">From Department/Role</label>
                                                                                                    <p>{data?.fromEntityName?.unitDesc + " - " + data?.fromRoleName?.roleDesc}</p>
                                                                                                </div>
                                                                                                <div className="col-md-3">
                                                                                                    <label htmlFor="inputState" className="col-form-label pt-0">To Department/Role</label>
                                                                                                    <p>{data?.toEntityName?.unitDesc + " - " + data?.toRoleName?.roleDesc}</p>
                                                                                                </div> */}
                                                                                                <div className="col-md-4">
                                                                                                    <label htmlFor="inputState" className="col-form-label pt-0">User</label>
                                                                                                    <p>{data?.updatedByDetails?.firstName + " " + data?.updatedByDetails?.lastName}</p>
                                                                                                </div>
                                                                                                <div className="col-md-4">
                                                                                                    <label htmlFor="inputState" className="col-form-label pt-0">Status</label>
                                                                                                    <p>{data?.statusDesc?.description}</p>
                                                                                                </div>
                                                                                                <div className="col-md-4"><label htmlFor="inputState" className="col-form-label pt-0">Action Performed</label>
                                                                                                    <p>{data?.flwAction}</p>
                                                                                                </div>
                                                                                                {/* <div className="col-md-12 pb-0 mb-0 pt-1">
                                                                                                    <div className="form-group detailsbg-grey p-2">
                                                                                                        <label htmlFor="inputState" className="col-form-label pt-0">Comments</label>
                                                                                                        {
                                                                                                            (data?.flwAction === "Assign to self") ?
                                                                                                                <p>Assigned to self</p>
                                                                                                                :
                                                                                                                <p style={{ textAlign: "justify" }}>{data?.remarks}</p>
                                                                                                        }
                                                                                                    </div>
                                                                                                </div> */}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            )
                                                                        })
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>}
                                    </form>

                                </fieldset>
                            </div>
                            <div className="col-6">
                                <fieldset className="scheduler-border">
                                    <form className="d-flex justify-content-left">

                                        <div className="row">


                                            <div className="col-md-6">
                                                <div className="form-group" >

                                                    {reqDetails &&
                                                        <ReactSelect
                                                            isDisabled={true}
                                                            placeholder="Select Option"
                                                            value={[{ label: reqDetails?.statusDesc?.description, value: reqDetails?.statusDesc?.code }]}
                                                            options={status}
                                                            name='currStatus'
                                                            onChange={
                                                                (e, meta) => {
                                                                    meta.target = {}
                                                                    meta.target.id = meta?.name
                                                                    meta.target.label = e?.label
                                                                    meta.target.value = e?.value
                                                                    updateRequest(meta)
                                                                }}
                                                        />}
                                                </div>
                                                <br></br>

                                            </div>


                                            <div className="col-md-6">

                                                <div className="form-group" >
                                                    <div style={{ display: 'flex' }}>
                                                        <label className="control-label" style={{ padding: '10px' }}>Assignee&nbsp;</label>

                                                        <div className="avatar-block " style={{ marginLeft: "50%" }}>
                                                            <Avatar.Group maxCount={2} maxStyle={{ color: '#f56a00', backgroundColor: '#fde3cf' }} key={task.requestId}>
                                                                <Avatar
                                                                    title={task?.assigneeDetails?.firstName + " " + task?.assigneeDetails?.lastName}
                                                                    key={task?.requestId}
                                                                    size="45"
                                                                    round={true}
                                                                    style={{ backgroundColor: '#3256d9', verticalAlign: 'middle', cursor: 'pointer' }}>
                                                                    <span style={{ padding: "0px", color: "white" }}> {task?.assigneeDetails?.firstName.charAt(0).toUpperCase() + task?.assigneeDetails?.lastName.charAt(0).toUpperCase()}</span>
                                                                </Avatar>

                                                            </Avatar.Group>
                                                            {showAssign && <Link className="dropdown-item"
                                                                to='#'
                                                                style={{ padding: '4px', color: 'black' }}
                                                                disabled
                                                                onClick={(e) => {
                                                                    assignToSelf()
                                                                }
                                                                }
                                                            >  Assign to Self</Link>}
                                                        </div>

                                                    </div>




                                                </div>
                                            </div>
                                        </div>

                                    </form>

                                    <div className=" pt-2" >
                                        <div className="col-12 pl-2 bg-light border" > <h5 className="text-primary" >Details</h5 > </div >
                                    </div >
                                    <br></br>
                                    {/* <div className="d-flex justify-content-center"> */}
                                    <div className="row">

                                        <div className="col-md-6">

                                            <div className="form-group" >
                                                <div style={{ display: 'flex' }}>
                                                    <label className="control-label col-md-4">Due Date&nbsp;</label>
                                                    <input className="form-control" id="dueDate"
                                                        disabled
                                                        value={reqDetails?.dueDate}
                                                        min={reqDetails?.sprintDetails ? moment(reqDetails?.sprintDetails?.startDate).format('YYYY-MM-DD') : moment(reqDetails?.projectDetails?.startDate).format('YYYY-MM-DD')}
                                                        max={reqDetails?.sprintDetails ? moment(reqDetails?.sprintDetails?.endDate).format('YYYY-MM-DD') : moment(reqDetails?.projectDetails?.endDate).format('YYYY-MM-DD')}
                                                        type="date"
                                                        onChange={
                                                            (e) => {
                                                                updateRequest(e)
                                                            }}
                                                    />

                                                </div>
                                            </div>
                                            <div className="form-group" >
                                                <div style={{ display: 'flex' }}>
                                                    <label className="control-label col-md-3">UX Required&nbsp;</label>
                                                    <select className="form-control" id='uxRequired'
                                                        disabled
                                                        value={reqDetails?.uxRequired}
                                                        onChange={
                                                            (e) => {
                                                                updateRequest(e)
                                                            }}
                                                    >

                                                        <option id='1' value={"YES"} >Yes</option>
                                                        <option id='2' value={'NO'}>No</option>
                                                    </select>

                                                </div>
                                            </div>
                                            <div className="form-group" >
                                                <div style={{ display: 'flex' }}>
                                                    <label className="control-label col-md-3">QA Required&nbsp;</label>
                                                    <select className="form-control" id="qaRequired"
                                                        disabled
                                                        value={reqDetails?.qaRequired}
                                                        onChange={
                                                            (e) => {
                                                                updateRequest(e)
                                                            }}

                                                    >
                                                        <option id='1' value={"YES"} >Yes</option>
                                                        <option id='2' value={'NO'}>No</option>
                                                    </select>

                                                </div>
                                            </div>
                                            <div className="form-group" >
                                                <div style={{ display: 'flex' }}>
                                                    <label className="control-label col-md-3">Development Completion Date&nbsp;</label>
                                                    <input className="form-control"
                                                        disabled
                                                        min={reqDetails?.sprintDetails ? moment(reqDetails?.sprintDetails?.startDate).format('YYYY-MM-DD') : moment(reqDetails?.projectDetails?.startDate).format('YYYY-MM-DD')}
                                                        value={reqDetails?.devCompDate}
                                                        max={moment(reqDetails?.testingDate).format('YYYY-MM-DD')}
                                                        type="date"
                                                        id='devCompDate'
                                                        onChange={
                                                            (e) => {
                                                                updateRequest(e)
                                                            }}
                                                    />

                                                </div>
                                            </div>
                                            <div className="form-group" >
                                                <div style={{ display: 'flex' }}>
                                                    <label className="control-label col-md-3">Testing Completion Date&nbsp;</label>
                                                    <input className="form-control"
                                                        disabled
                                                        id='testingDate'
                                                        min={moment(reqDetails?.devCompDate).format('YYYY-MM-DD')}
                                                        value={reqDetails?.testingDate}
                                                        max={moment(reqDetails?.deploymentDate).format('YYYY-MM-DD')}
                                                        type="date"
                                                        onChange={
                                                            (e) => {
                                                                updateRequest(e)
                                                            }}
                                                    />

                                                </div>
                                            </div>
                                            <div className="form-group" >
                                                <div style={{ display: 'flex' }}>
                                                    <label className="control-label col-md-4">Production Deployment Date&nbsp;</label>
                                                    <input className="form-control" id='deploymentDate'
                                                        disabled
                                                        min={moment(reqDetails?.testingDate).format('YYYY-MM-DD')}
                                                        max={moment(reqDetails?.dueDate).format('YYYY-MM-DD')}
                                                        value={reqDetails?.deploymentDate}
                                                        type="date"
                                                        onChange={
                                                            (e) => {
                                                                updateRequest(e)
                                                            }}
                                                    />

                                                </div>
                                            </div>


                                            <div className="form-group" >
                                                <div style={{ display: 'flex' }}>
                                                    <label className="control-label col-md-3">Project Name&nbsp;</label>
                                                    <input className="form-control"
                                                        disabled
                                                        value={task?.projectDetails?.projectName}
                                                        type="text"
                                                        onChange={
                                                            (e) => {
                                                                updateRequest(e)
                                                            }}
                                                    />

                                                </div>
                                            </div>
                                            {/* <div className="form-group" >
                                                    <div style={{ display: 'flex' }}>
                                                        <label className="control-label col-md-3">Labels&nbsp;</label>
                                                        <input className="form-control"
                                                            disabled
                                                            value={task.labels}
                                                            type="text"
                                                        />

                                                    </div>
                                                </div> */}
                                            <div className="form-group" >
                                                <div style={{ display: 'flex' }}>
                                                    <label className="control-label col-md-3">Sprint&nbsp;</label>
                                                    <input className="form-control"
                                                        disabled
                                                        value={task?.sprintDetails?.sprintName}
                                                        type="text"
                                                        onChange={
                                                            (e) => {
                                                                updateRequest(e)
                                                            }}
                                                    />

                                                </div>
                                            </div>
                                            <div className="form-group" >
                                                <div style={{ display: 'flex' }}>
                                                    <label className="control-label col-md-3">Reporter&nbsp;</label>
                                                    <input className="form-control"
                                                        disabled
                                                        type='text'
                                                        value={task?.assigneeDetails?.firstName}
                                                    />

                                                </div>
                                            </div>
                                        </div>


                                    </div>
                                    {/* </div> */}

                                </fieldset>
                            </div>


                        </div >
                    </div>
                </div>


            </Modal >
        </>
    );
}


export default RequestHistory