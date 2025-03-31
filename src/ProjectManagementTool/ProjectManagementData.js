import { v4 as uuidv4 } from 'uuid';
export const columnsFromBackend = {
    [uuidv4()]: {
        title: 'TO-DO',
        items: [],
    },
    [uuidv4()]: {
        title: 'FUNCTIONAL CLARIFICATIONS',
        items: [],
    },
    [uuidv4()]: {
        title: 'READY FOR DEVELOPMENT',
        items: [],
    },
    [uuidv4()]: {
        title: 'IN PROGRESS',
        items: [],
    },
    [uuidv4()]: {
        title: 'READY FOR TESTING',
        items: [],
    },
    [uuidv4()]: {
        title: 'TESTING IN PROGRESS',
        items: [],
    },
    [uuidv4()]: {
        title: 'READY FOR DEPLOYMENT',
        items: [],
    },
    [uuidv4()]: {
        title: 'DONE',
        items: [],
    }
};

export const PriorityArray = [
    {
        value: "HIGHEST",
        text: 'Highest',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="red" class="bi bi-arrow-up-circle" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-7.5 3.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V11.5z" />
        </svg>
    },
    {
        value: 'HIGH',
        text: 'High',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="orange" class="bi bi-arrow-up-circle" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-7.5 3.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V11.5z" />

        </svg>
    },
    {
        value: 'MEDIUM',
        text: 'Medium',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="green" class="bi bi-arrow-down-circle" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v5.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V4.5z" />
            {/* <path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-4.5-.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5z" /> */}
        </svg>
    },
    {
        value: 'LOW',
        text: 'Low',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#90EE90" class="bi bi-arrow-down-circle" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v5.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V4.5z" />
            {/* <path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-4.5-.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5z" /> */}
        </svg>
    }
]

export const CategoryArray = [
    {
        value: "TASK",
        text: 'Task',
        icon:
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#1E90C2" class="bi bi-check-square-fill" viewBox="0 0 16 16">
                <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2zm10.03 4.97a.75.75 0 0 1 .011 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.75.75 0 0 1 1.08-.022z" />
            </svg>
    },
    {
        value: 'EPIC',
        text: 'Epic',
        icon:
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="purple" class="bi bi-lightning-fill" viewBox="0 0 16 16">
                <path d="M5.52.359A.5.5 0 0 1 6 0h4a.5.5 0 0 1 .474.658L8.694 6H12.5a.5.5 0 0 1 .395.807l-7 9a.5.5 0 0 1-.873-.454L6.823 9.5H3.5a.5.5 0 0 1-.48-.641l2.5-8.5z" />
            </svg>
    },
    {
        value: 'BUG',
        text: 'Bug',
        icon:
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="red" class="bi bi-exclamation-square-fill" viewBox="0 0 16 16">
                <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2zm6 4c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995A.905.905 0 0 1 8 4zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
            </svg>

    },
    {
        value: 'STORY',
        text: 'Story',
        icon:
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="green" class="bi bi-bookmark-fill" viewBox="0 0 16 16">
                <path d="M2 2v13.5a.5.5 0 0 0 .74.439L8 13.069l5.26 2.87A.5.5 0 0 0 14 15.5V2a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
            </svg>
    },


]
export const Colors = ['#2d335b', '#535b2d', '#494949', '#d7d7d7', '9ad4ce'];

export const colourOptions = [
    { value: 'ocean', label: 'Ocean', color: '#00B8D9', isFixed: true },
    { value: 'blue', label: 'Blue', color: '#0052CC', isDisabled: true },
    { value: 'purple', label: 'Purple', color: '#5243AA' },
    { value: 'red', label: 'Red', color: '#FF5630', isFixed: true },
    { value: 'orange', label: 'Orange', color: '#FF8B00' },
    { value: 'yellow', label: 'Yellow', color: '#FFC400' },
    { value: 'green', label: 'Green', color: '#36B37E' },
    { value: 'forest', label: 'Forest', color: '#00875A' },
    { value: 'slate', label: 'Slate', color: '#253858' },
    { value: 'silver', label: 'Silver', color: '#666666' },
];

export const SearchProjectColumns = [
    {
        Header: "Project Name",
        accessor: "projectName",
        disableFilters: false,
        id: 'projectName'
    },

    {
        Header: "Project Type",
        // accessor: "projectTypeDesc.description",
        accessor: "projectType",
        disableFilters: false,
        id: 'projectType'
    },
    {
        Header: "Customer Name",
        accessor: "customerName",
        disableFilters: false,
        id: 'customerName'
    },
    {
        Header: "Start Date",
        accessor: "startDate",
        disableFilters: true,
        id: 'startDate'
    },
    {
        Header: "End Date",
        accessor: "endDate",
        disableFilters: true,
        id: "endDate"
    },

    {
        Header: "Created By",
        accessor: "createdBy",
        disableFilters: true,
    },
    {
        Header: "Created At",
        accessor: "createdAt",
        disableFilters: true,
    },
    // {
    //     Header: "Updated By",
    //     accessor: "updatedBy",
    //     disableFilters: true,
    // },
    // {
    //     Header: "Updated At",
    //     accessor: "updatedAt",
    //     disableFilters: true,
    // }
]
