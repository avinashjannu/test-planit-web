import React, { useState, useEffect } from 'react';
import CreateIssue from './Request/createIssue';
import { ProSidebar, Menu, MenuItem, SubMenu, SidebarContent } from 'react-pro-sidebar';
import 'react-pro-sidebar/dist/css/styles.css';
import JiraIcon from '../../src/assets/images/jiraicon.png'
import { Link, useHistory } from "react-router-dom";
const NavbarLeft = (props) => {

    const { allList } = props.data;
    const { setStatusFilter } = props.handlers;
    const [isOpen, setIsOpen] = useState(false)
    const [selectedLeftMenuItem, setSelectedLeftMenuItem] = useState('ALL');
    const [menuCollapse, setMenuCollapse] = useState(true)
    const iconMapping = {
        'CREATE ISSUE': {
            class: 'mail-icon',
            icon: 'far fa-list-alt'
        },
        'SEARCH ISSUE': {
            class: 'mail-icon',
            icon: 'fas fa-envelope'
        }

    }

    const handleOnSelection = (e) => {
        const { target } = e;
        setStatusFilter(target.closest('.st').id);
        setSelectedLeftMenuItem(target.closest('.st').id)
    }

    return (
        // <>
        //     <div className="blue-bar">
        //         <div className="p-0">
        //             {/* <ul>
        //                 {
        //                     allList.map((list, idx) => (
        //                         <li id={list.source} className={`${iconMapping[list.source?.replace('-', '')]['class']} st cursor-pointer ` + ((selectedLeftMenuItem === list.source) ? 'active' : '')} onClick={handleOnSelection} key={idx}>
        //                             <div>
        //                                 <i className={`${iconMapping[list.source?.replace('-', '')]['icon']} text-white font-22 pt-2`}></i>
        //                                 {
        //                                     idx !== 0 &&
        //                                     <span className="badge badge-danger rounded-circle noti-icon-badge">{list.count}</span>
        //                                 }
        //                                 <br />
        //                                 <span className="text-white text-capitalize">{list.source?.replace('-', '')?.toLowerCase()}</span>
        //                             </div>
        //                         </li>
        //                     ))
        //                 }
        //             </ul> */}
        //         </div>
        //     </div>
        //     < div className="sideBar text-center" >
        //         <div className="">
        //             <div className="text-blue mt-4">
        //                 <i className="fab fa-jira" style={{ fontSize: 28, cursor: 'pointer' }} />
        //             </div>
        //             <div className="text-blue">
        //                 <i className="fa fa-search mt-4" style={{ fontSize: 18, cursor: 'pointer' }} />
        //             </div>
        //             <div className="text-blue">
        //                 <i className="fa fa-plus mt-4" style={{ fontSize: 18, cursor: 'pointer' }}
        //                     onClick={() => {
        //                         setIsOpen(true)
        //                     }}
        //                 />
        //             </div>
        //             <div className="text-blue mt-4">
        //                 <i className="fa fa-question-circle" style={{ fontSize: 18, cursor: 'pointer' }} />
        //             </div>
        //         </div>

        //     </div >
        // </>


        <div id="header" style={{ overflow: "hidden" }}>

            <ProSidebar collapsed={menuCollapse} >
                <ul className="list-unstyled topnav-menu topnav-menu-left mb-0 ">
                    <li>
                        <button className="button-menu-mobile waves-effect waves-light" onClick={() => {
                            setMenuCollapse(!menuCollapse)
                        }}>
                            <i className="fab fa-jira"></i>
                        </button>
                    </li>
                </ul>

                <SidebarContent>
                    <Menu iconShape="square">
                        {/* <SubMenu title="" icon={<i className="fab fa-jira"></i>}>
                            <MenuItem >
                                <i className="fab fa-jira" style={{ fontSize: 28, cursor: 'pointer' }} />
                            </MenuItem>
                        </SubMenu> */}
                        <MenuItem icon={<i className="fa fa-plus mt-4" style={{ fontSize: 28, cursor: 'pointer' }}></i>}
                            onClick={() => {
                                setIsOpen(true)
                            }}> Create Issue

                        </MenuItem>
                        <MenuItem icon={<i className="fa fa-search mt-4" style={{ fontSize: 28, cursor: 'pointer' }}></i>}
                            onClick={() => {
                                setIsOpen(true)
                            }}> Search Issue

                        </MenuItem>
                        <MenuItem icon={<i className="fa fa-search mt-4" style={{ fontSize: 28, cursor: 'pointer' }}></i>}> Board
                            <Link to={{ pathname: `${process.env.REACT_APP_BASE}/pm-board` }} >
                            </Link>
                        </MenuItem>
                    </Menu>
                </SidebarContent>

            </ProSidebar>
            <CreateIssue isOpen={isOpen} setIsOpen={setIsOpen}>
            </CreateIssue>

        </div>

    )
}

export default NavbarLeft;