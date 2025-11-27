import React from "react";
import { Droppable } from "@hello-pangea/dnd";
import { type Column as ColumnType, type Task } from "../../types";
import TaskCard from "../Task/TaskCard";
import Button from "../common/Button";

interface ColumnProps {
  column: ColumnType;
  tasks: Task[];
  onAddClick: (columnId: string) => void;
  onTaskClick: (task: Task) => void;
}

const Column: React.FC<ColumnProps> = ({
  column,
  tasks,
  onAddClick,
  onTaskClick,
}) => {
  return (
    <div className="bg-gray-200 rounded-lg w-[300px] min-w-[300px] flex flex-col max-h-full p-2">
      <h2 className="p-4 text-base font-semibold text-gray-800 m-0">
        {column.title}
      </h2>
      <Droppable droppableId={column.id}>
        {(provided) => (
          <div
            className="grow overflow-y-auto min-h-[100px] p-2 flex flex-col gap-2"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onClick={() => onTaskClick(task)}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      <div className="p-2">
        <Button
          variant="ghost"
          fullWidth
          onClick={() => onAddClick(column.id)}
          className="justify-start text-gray-600 hover:bg-gray-300 hover:text-gray-800"
        >
          + Add Task
        </Button>
      </div>
    </div>
  );
};

export default Column;
