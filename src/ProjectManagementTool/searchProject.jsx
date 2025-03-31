/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useState, useEffect, useRef } from 'react'
import NumberFormat from 'react-number-format';
import { toast } from 'react-toastify';
import { hideSpinner, showSpinner } from '../common/spinner';
import DynamicTable from '../common/table/DynamicTable';
import { properties } from '../properties';
import { post } from '../util/restUtil';
import { SearchProjectColumns } from './ProjectManagementData'
import { unstable_batchedUpdates } from 'react-dom';
import { validateNumber } from '../util/validateUtil';
import { formFilterObject } from '../util/util';
import moment from 'moment'

const SearchProject = (props) => {
    const lookupData = useRef({})
    const initialValues = {
        customerName: "",
        projectName: "",
        projectType: "",
    }
    const ProjectTypes = [
        { value: "Agile", label: "Agile" },
        { value: "Waterfall", label: "Waterfall" },
        { value: "Iterative", label: "Iterative" }
    ]
    const [customerData, setCustomerData] = useState([])
    const [customerTypeLookup, setCustomerTypeLookup] = useState([])
    const [searchInputs, setSearchInputs] = useState(initialValues);
    const [displayForm, setDisplayForm] = useState(true);
    const [listSearch, setListSearch] = useState([]);
    const [projectSearchData, setProjectSearchData] = useState([]);
    const [projectList, setProjectList] = useState([])
    const [userPermission, setUserPermission] = useState({
        searchCustomer: "write",
        viewCustomer: "write",
        createComplaint: "write",
        createServiceRequest: "write",
        createInquiry: "write",
    })
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
            }).finally(hideSpinner)


    }, [])
    useEffect(() => {
        if (!isFirstRender.current) {
            getProjectData();
        }
        else {
            isFirstRender.current = false;
        }
    }, [currentPage, perPage])

    const getProjectData = () => {
        showSpinner();
        const requestBody = {
            ...searchInputs,
            filters: formFilterObject(filters)
        }
        setListSearch(requestBody);
        post(`${properties.PROJECT_MANAGEMENT_API}/project-list?limit=${perPage}&page=${currentPage}&from=search`, requestBody)
            .then((resp) => {
                if (resp.data) {
                    console.log("resp.data", resp.data)
                    if (resp.status === 200) {
                        const { count, rows } = resp.data;
                        if (Number(count) > 0) {
                            unstable_batchedUpdates(() => {
                                setTotalCount(count)
                                setProjectSearchData(rows);
                            })
                        }
                        else {
                            toast.error("Records Not found");
                            setFilters([]);
                        }
                    } else {
                        setProjectSearchData([]);
                        toast.error("Records Not Found");
                    }
                } else {
                    setProjectSearchData([]);
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
        if (e.target.id === "idType") {
            setSearchInputs({
                ...searchInputs,
                [target.id]: target.value,
                idValue: ""
            })
            return;
        }
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
        if (['Project Name'].includes(cell.column.Header)) {
            return (<span className="text-secondary cursor-pointer" id="PROJECT_NAME" onClick={(e) => handleOnCellActionsOrLink(row.original)}>{cell.value}</span>)
        }
        else if (['Customer Name'].includes(cell.column.Header)) {

            return (<span>{row?.original?.customerDetails ? row.original?.customerDetails.description : '-'}</span>);
        }
        else if (['Updated At', 'Created At', 'Start Date', 'End Date'].includes(cell.column.Header)) {
            return (<span>{cell.value ? moment(cell.value).format('DD/MM/YYYY') : '-'}</span>);
        }
        else if (['Created By'].includes(cell.column.Header)) {
            let name = (row?.original?.createdByDetails?.firstName || "") + " " + (row?.original?.createdByDetails?.lastName || "")
            return (<span>{name}</span>);
        }
        else if (['Updated By'].includes(cell.column.Header)) {
            let name = (row?.original?.updatedByName?.firstName || "") + " " + (row?.original?.updatedByName?.lastName || "")
            return (<span>{name}</span>);
        }
        return (<span>{cell.value}</span>);
    }

    const handleOnCellActionsOrLink = (rowData) => {
        // sessionStorage.setItem("projectId", rowData?.projectId || null)
        // sessionStorage.setItem("projectName", rowData?. || null)
        // sessionStorage.setItem("accountId", rowData?.account[0]?.accountId || null)
        // sessionStorage.setItem("serviceId", rowData?.account[0]?.service[0]?.connectionId || null)
        props.history.push(`${process.env.REACT_APP_BASE}/edit-project`, {
            data: {
                projectId: rowData?.projectId,
                mode: 'edit'
            }
        })
    }

    return (
        <>{userPermission?.searchCustomer !== 'deny' &&
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <div className="page-title-box">
                            <h4 className="page-title">Search Project</h4>
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
                                                        <label htmlFor="projectName" className="control-label">Project Name</label>
                                                        <input
                                                            value={searchInputs.projectName}
                                                            onChange={handleInputChange}
                                                            type="text"
                                                            className="form-control"
                                                            id="projectName"
                                                            placeholder="Enter Project Name"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        <label htmlFor="customerType" className="control-label">Project Type</label>
                                                        <select id="projectType" className="form-control" value={searchInputs.projectType} onChange={handleInputChange}>
                                                            <option key="projectType" value="">Choose Project Type</option>
                                                            {
                                                                ProjectTypes && ProjectTypes.map((id, index) => (
                                                                    <option key={index} value={id.value}>{id.label}</option>
                                                                ))
                                                            }
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        <label htmlFor="customerName" className="control-label">Customer Name</label>
                                                        <select id="customerName" className="form-control" value={searchInputs?.customerName} onChange={handleInputChange}>
                                                            <option key="customerName" value="">Choose Customer Name</option>
                                                            {
                                                                customerData && customerData.map((id, index) => (
                                                                    <option key={index} value={id.value}>{id.label}</option>
                                                                ))
                                                            }
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-12 text-center mt-2">
                                                <button type="submit" className="btn btn-primary waves-effect waves- mr-2" onClick={getProjectData}>Search</button>
                                                <button type="button" className="btn btn-secondary waves-effect waves-light" onClick={() => { setSearchInputs(initialValues); setProjectSearchData([]); }}>Clear</button>
                                            </div>
                                        </form>
                                    )
                                }
                            </div>
                            {
                                !!projectSearchData.length &&
                                <div className="row mt-2">
                                    <div className="col-lg-12">
                                        {
                                            !!projectSearchData.length &&
                                            < div className="card">
                                                <div className="card-body" id="datatable">
                                                    <div style={{}}>
                                                        <DynamicTable
                                                            listSearch={listSearch}
                                                            listKey={"Search Project"}
                                                            row={projectSearchData}
                                                            rowCount={totalCount}
                                                            header={SearchProjectColumns}
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
            </div >}
        </>
    );
}

export default SearchProject;