
// import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
// import React, { useState } from 'react';
// // import styled from '@emotion/styled';
// import { columnsFromBackend } from './ProjectManagementData';
// import TaskCard from './taskCard';

// const Container = styled.div`
//   display: flex;
// `;

// const TaskList = styled.div`
//   min-height: 100px;
//   display: flex;
//   flex-direction: column;
//   background: #f3f3f3;
//   min-width: 341px;
//   border-radius: 5px;
//   padding: 15px 15px;
//   margin-right: 45px;
// `;

// const TaskColumnStyles = styled.div`
//   margin: 8px;
//   display: flex;
//   width: 100%;
//   min-height: 80vh;
// `;

// const Title = styled.span`
//   color: #10957d;
//   background: rgba(16, 149, 125, 0.15);
//   padding: 2px 10px;
//   border-radius: 5px;
//   align-self: flex-start;
// `;
// const ProjectManagementContainer = () => {
//     const [columns, setColumns] = useState(columnsFromBackend);

//     const onDragEnd = (result, columns, setColumns) => {
//         if (!result.destination) return;
//         const { source, destination } = result;
//         if (source.droppableId !== destination.droppableId) {
//             const sourceColumn = columns[source.droppableId];
//             const destColumn = columns[destination.droppableId];
//             const sourceItems = [...sourceColumn.items];
//             const destItems = [...destColumn.items];
//             const [removed] = sourceItems.splice(source.index, 1);
//             destItems.splice(destination.index, 0, removed);
//             setColumns({
//                 ...columns,
//                 [source.droppableId]: {
//                     ...sourceColumn,
//                     items: sourceItems,
//                 },
//                 [destination.droppableId]: {
//                     ...destColumn,
//                     items: destItems,
//                 },
//             });
//         } else {
//             const column = columns[source.droppableId];
//             const copiedItems = [...column.items];
//             const [removed] = copiedItems.splice(source.index, 1);
//             copiedItems.splice(destination.index, 0, removed);
//             setColumns({
//                 ...columns,
//                 [source.droppableId]: {
//                     ...column,
//                     items: copiedItems,
//                 },
//             });
//         }
//     };
//     return (
//         <div className="row">
//             <div className="col-12 row">
//                 <div className="col-1 bar-left pr-0">

//                 </div>
//                 <div className="col-11 pt-1 pr-0">

//                     <div className="row pt-2 px-0">
//                         <div className="col-lg-7 p-0">
//                             <DragDropContext
//                                 onDragEnd={(result) => onDragEnd(result, columns, setColumns)}
//                             >
//                                 <Container>
//                                     <TaskColumnStyles>
//                                         {Object.entries(columns).map(([columnId, column], index) => {
//                                             return (
//                                                 <Droppable key={columnId} droppableId={columnId}>
//                                                     {(provided, snapshot) => (
//                                                         <TaskList
//                                                             ref={provided.innerRef}
//                                                             {...provided.droppableProps}
//                                                         >
//                                                             <Title>{column.title}</Title>
//                                                             {column.items.map((item, index) => (
//                                                                 <TaskCard key={item} item={item} index={index} />
//                                                             ))}
//                                                             {provided.placeholder}
//                                                         </TaskList>
//                                                     )}
//                                                 </Droppable>
//                                             );
//                                         })}
//                                     </TaskColumnStyles>
//                                 </Container>
//                             </DragDropContext>
//                         </div>
//                         <div className="col-lg-5 pr-0">

//                         </div>

//                     </div>
//                 </div>
//             </div>
//         </div>
//     )
// }
// export default ProjectManagementContainer;