/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useState, useEffect, useRef } from 'react'
import NumberFormat from 'react-number-format';
import { toast } from 'react-toastify';
import { hideSpinner, showSpinner } from '../common/spinner';
import DynamicTable from '../common/table/DynamicTable';
import { properties } from '../properties';
import { post, get } from '../util/restUtil';
import { unstable_batchedUpdates } from 'react-dom';
import { validateNumber } from '../util/validateUtil';
import { formFilterObject } from '../util/util';
import moment from 'moment'
import { Link } from 'react-router-dom';

const SearchSprint = (props) => {

    const initialValues = {
        customer: "",
        sprintName: "",
        projectId: "",
    }
    const [projectListLookUp, setProjectListLookUp] = useState([])
    const [searchInputs, setSearchInputs] = useState(initialValues);
    const [displayForm, setDisplayForm] = useState(true);
    const [listSearch, setListSearch] = useState([]);
    const [sprintData, setSprintData] = useState([]);
    const isFirstRender = useRef(true);
    const [totalCount, setTotalCount] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [filters, setFilters] = useState([]);
    const [exportBtn, setExportBtn] = useState(true)

    const isTableFirstRender = useRef(true);
    const hasExternalSearch = useRef(false);


    useEffect(() => {
        showSpinner()
        get(properties.PROJECT_MANAGEMENT_API + '/sprint/projectlist').then((resp) => {
            if (resp && resp.status === 200 && resp.data) {
                setProjectListLookUp(resp.data)
            }
        }).finally(hideSpinner)
    }, [])

    useEffect(() => {
        if (!isFirstRender.current) {
            getSprintData();
        }
        else {
            isFirstRender.current = false;
        }
    }, [currentPage, perPage])

    const getSprintData = () => {
        showSpinner();
        const requestBody = {
            ...searchInputs,
            filters: formFilterObject(filters)
        }
        setListSearch(requestBody);
        post(`${properties.PROJECT_MANAGEMENT_API}/sprint/search?limit=${perPage}&page=${currentPage}`, requestBody)
            .then((resp) => {
                if (resp.data) {
                    if (resp.status === 200) {
                        const { count, rows } = resp.data;
                        if (Number(count) > 0) {
                            unstable_batchedUpdates(() => {
                                setTotalCount(count)
                                setSprintData(rows);
                            })
                        }
                        else {
                            toast.error("Records Not found");
                            setFilters([]);
                        }
                    } else {
                        setSprintData([]);
                        toast.error("Records Not Found");
                    }
                } else {
                    setSprintData([]);
                    toast.error("Records Not Found");
                }
            }).finally(() => {
                hideSpinner();
                isTableFirstRender.current = false;
            });
    }

    const handlePageSelect = (pageNo) => {
        setCurrentPage(pageNo)
    }

    const handleInputChange = (e) => {
        const target = e.target;

        setSearchInputs({
            ...searchInputs,
            [target.id]: target.value
        })
    }


    const handleSubmit = (e) => {
        e.preventDefault();
        isFirstRender.current = true;
        isTableFirstRender.current = true;
        unstable_batchedUpdates(() => {
            setFilters([])
            setCurrentPage((currentPage) => {
                if (currentPage === 0) {
                    return '0'
                }
                return 0
            });
        })
    }

    const handleCellRender = (cell, row) => {
        if (cell.column.id === 'sprintId') {
            return (<span className="text-secondary cursor-pointer" id="PROJECT_NAME"
                onClick={(e) => {
                    console.log('sprintData===>', row.original?.sprintId)
                    // props.history.push(`${process.env.REACT_APP_BASE}/create-sprint`, {
                    //     data: {
                    //         sprintId: row.original?.sprintId,
                    //         mode: 'edit'
                    //     }
                    // })
                    props.history.push(`${process.env.REACT_APP_BASE}/sprint/details`, {
                        data: {
                            sprintId: row.original?.sprintId,
                            sprintData: row.original,
                            mode: 'edit'
                        }
                    })
                }
                }>{cell.value}</span>)
        }
        else if (cell.column.Header === "Edit Sprint") {
            return (
                <button type="button" className="btn btn-primary waves-effect waves-light "
                    onClick={(e) => {
                        props.history.push(`${process.env.REACT_APP_BASE}/create-sprint`, {
                            data: {
                                sprintId: row.original?.sprintId,
                                mode: 'edit'
                            }
                        })
                    }}
                >
                    Edit</button>
            )
        }
        else if (['Updated At', 'Created At'].includes(cell.column.Header)) {
            return (<span>{cell.value ? moment(cell.value).format('DD MMM YYYY hh:mm:ss A') : '-'}</span>);
        }
        else if (['Created By'].includes(cell.column.Header)) {
            let name = (row?.original?.createdByName?.firstName || "") + " " + (row?.original?.createdByName?.lastName || "")
            return (<span>{name}</span>);
        }
        else if (['Updated By'].includes(cell.column.Header)) {
            let name = (row?.original?.updatedByName?.firstName || "") + " " + (row?.original?.updatedByName?.lastName || "")
            return (<span>{name}</span>);
        }
        return (<span>{cell.value}</span>);
    }

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-12">
                    <div className="page-title-box">
                        <h4 className="page-title">Search Sprint</h4>
                    </div>
                </div>
            </div>
            <div className="row mt-1">
                <div className="col-lg-12">
                    <div className="search-result-box m-t-30 card-box">
                        <div id="searchBlock" className="modal-body p-2 d-block">
                            <div className="d-flex justify-content-end">
                                <h6 className="text-primary cursor-pointer" onClick={() => { setDisplayForm(!displayForm) }}>{displayForm ? "Hide Search" : "Show Search"}</h6>
                            </div>
                            {
                                displayForm && (
                                    <form onSubmit={handleSubmit}>
                                        <div className="row">

                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label htmlFor="projectId" className="control-label">Project</label>
                                                    <select id="projectId" className="form-control" value={searchInputs.projectId} onChange={handleInputChange}>
                                                        <option key="projectId" value="">Choose Project</option>
                                                        {
                                                            projectListLookUp && projectListLookUp.map((id) => (
                                                                <option key={id.projectId} value={id.projectId}>{id.projectName}</option>
                                                            ))
                                                        }
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label htmlFor="sprintName" className="control-label">Sprint Name</label>
                                                    <input
                                                        value={searchInputs.sprintName}
                                                        onChange={handleInputChange}
                                                        type="text"
                                                        className="form-control"
                                                        id="sprintName"
                                                        placeholder="Enter Sprint Name"
                                                    />
                                                </div>
                                            </div>
                                            {/* <div className="col-md-4">
                                                <div className="form-group">
                                                    <label htmlFor="category" className="control-label">Customer</label>
                                                    <select id="category" className="form-control" value={searchInputs.customer} onChange={handleInputChange}>
                                                        <option key="category" value="">Choose Customer</option>
                                                        {
                                                            projectListLookUp && projectListLookUp.map((id) => (
                                                                <option key={id.code} value={id.code}>{id.description}</option>
                                                            ))
                                                        }
                                                    </select>
                                                </div>
                                            </div> */}
                                        </div>
                                        <div className="col-md-12 text-center mt-2">
                                            <button type="submit" className="btn btn-primary waves-effect waves- mr-2" onClick={getSprintData}>Search</button>
                                            <button type="button" className="btn btn-secondary waves-effect waves-light" onClick={() => { setSearchInputs(initialValues); setSprintData([]); }}>Clear</button>
                                        </div>
                                    </form>
                                )
                            }
                        </div>
                        {
                            !!sprintData.length &&
                            <div className="row mt-2">
                                <div className="col-lg-12">
                                    {
                                        !!sprintData.length &&
                                        < div className="card">
                                            <div className="card-body" id="datatable">
                                                <div style={{}}>
                                                    <DynamicTable
                                                        listSearch={listSearch}
                                                        listKey={"Search Sprint"}
                                                        row={sprintData}
                                                        rowCount={totalCount}
                                                        header={SearchColumnsList}
                                                        itemsPerPage={perPage}
                                                        backendPaging={true}
                                                        backendCurrentPage={currentPage}
                                                        isTableFirstRender={isTableFirstRender}
                                                        hasExternalSearch={hasExternalSearch}
                                                        exportBtn={exportBtn}
                                                        handler={{
                                                            handleCellRender: handleCellRender,
                                                            handlePageSelect: handlePageSelect,
                                                            handleItemPerPage: setPerPage,
                                                            handleCurrentPage: setCurrentPage,
                                                            handleFilters: setFilters,
                                                            handleExportButton: setExportBtn
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    }
                                </div>
                            </div>
                        }
                    </div>
                </div >
            </div >
        </div >
    );
}

export default SearchSprint;

const SearchColumnsList = [
    {
        Header: "Sprint Id",
        accessor: "sprintId",
        disableFilters: false,
        id: 'sprintId'
    },
    {
        Header: "Sprint Name",
        accessor: "sprintName",
        disableFilters: false,
        id: 'sprintName'
    },
    {
        Header: "Project Name",
        accessor: "projectDtl.projectName",
        disableFilters: false,
        id: 'projectName'
    },
    {
        Header: "Start Date",
        accessor: "startDate",
        disableFilters: true,
    },
    {
        Header: "End Date",
        accessor: "endDate",
        disableFilters: true
    },
    {
        Header: "Edit Sprint",
        accessor: "action",
        disableFilters: true
    }
]