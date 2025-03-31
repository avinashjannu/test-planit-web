import React, { useState } from 'react';

import { columnsFromBackend } from './ProjectManagementData';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import TaskCard from '../ProjectManagementTool/taskCard';


const Kanban = () => {
    const [columns, setColumns] = useState(columnsFromBackend);

    const onDragEnd = (result, columns, setColumns) => {
        if (!result.destination) return;
        const { source, destination } = result;
        if (source.droppableId !== destination.droppableId) {
            const sourceColumn = columns[source.droppableId];
            const destColumn = columns[destination.droppableId];
            const sourceItems = [...sourceColumn.items];
            const destItems = [...destColumn.items];
            const [removed] = sourceItems.splice(source.index, 1);
            destItems.splice(destination.index, 0, removed);
            setColumns({
                ...columns,
                [source.droppableId]: {
                    ...sourceColumn,
                    items: sourceItems,
                },
                [destination.droppableId]: {
                    ...destColumn,
                    items: destItems,
                },
            });
        } else {
            const column = columns[source.droppableId];
            const copiedItems = [...column.items];
            const [removed] = copiedItems.splice(source.index, 1);
            copiedItems.splice(destination.index, 0, removed);
            setColumns({
                ...columns,
                [source.droppableId]: {
                    ...column,
                    items: copiedItems,
                },
            });
        }
    };
    return (
        <DragDropContext
            onDragEnd={(result) => onDragEnd(result, columns, setColumns)}
        >
            <div style={{ display: "flex" }}>
                <div style={{
                    margin: "8px",
                    display: "flex",
                    width: "100%",
                    minHeight: "80vh",
                }}>
                    {Object.entries(columns).map(([columnId, column], index) => {
                        return (
                            <Droppable key={columnId} droppableId={columnId}>
                                {(provided, snapshot) => (
                                    <div style={{
                                        minHeight: "100px", display: "flex", flexDirection: "column", background: "#f3f3f3", minWidth: "341px",
                                        borderRadius: "5px",
                                        padding: "15px 15px",
                                        marginRight: "45px",
                                    }}
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                    >
                                        <div style={{
                                            color: "#10957d",
                                            background: "rgba(16, 149, 125, 0.15)",
                                            padding: "2px 10px",
                                            borderRadius: "5px",
                                            alignSelf: "flex-start",
                                        }}>{column.title}</div>
                                        {column.items.map((item, index) => (
                                            <TaskCard key={item} item={item} index={index} />
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        );
                    })}
                </div>
            </div>
        </DragDropContext>
    );
};

export default Kanban;
