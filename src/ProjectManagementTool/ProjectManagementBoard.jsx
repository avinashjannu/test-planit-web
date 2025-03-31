import React, { useState } from 'react'
import Menu from './menu';
import NavbarLeft from './navbarleft'


const ProjectManagementBoard = () => {
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [allList, setAllList] = useState([{ source: "CREATE ISSUE", count: "0" }
    ]);
    return (
        <>
            <div className="row">
                <div className="col-12 row">
                    <div className="col-1 p-0 vh-100">
                        <NavbarLeft
                            data={{
                                allList
                            }}
                            handlers={{
                                setAllList,
                                setStatusFilter
                            }}
                        />
                     
                    </div>
                    <div className="col-2 p-0 vh-100">
                        <Menu></Menu>
                    </div>
                </div>
            </div>
        </>

        // <>
        //     {/* <Loading />
        //     <ViewProjectModal />
        //     <EditProjectDrawer />
        //     <CreateTaskModal />
        //     <ViewTaskModal /> */}

        //     <Switch>



        //         {/* Jira Bugs Template */}
        //         <JiraBugsTemplate exact path="/project/board/:id" Component={Board} title="Kanban Board" />
        //         <JiraBugsTemplate exact path="/project-management/settings" Component={ProjectSetting} title="Project Settings" />

        //         {/* Project Management */}
        //         <JiraBugsTemplate exact path="/project-management" Component={ProjectManagement} title="Project Management" />

        //         {/* Project Management */}
        //         <JiraBugsTemplate exact path="/account" Component={Account} title="Account" />


        //         {/* <JiraBugsTemplate exact path="/" Component={Board} title="Kanban Board" /> */}
        //     </Switch>
        // </>

    )
}
export default ProjectManagementBoard;


