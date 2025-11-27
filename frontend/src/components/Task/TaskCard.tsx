import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { type Task } from "../../types";

interface TaskCardProps {
  task: Task;
  index: number;
  onClick: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, index, onClick }) => {
  const priorityColors = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
  };

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <div
          className="bg-white rounded shadow-sm p-3 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
        >
          <h3 className="text-sm font-medium mb-2 text-gray-800">
            {task.title}
          </h3>
          {task.description && (
            <p className="text-xs text-gray-500 mb-3 line-clamp-2">
              {task.description}
            </p>
          )}
          <div className="flex justify-between items-center">
            <span
              className={`text-[10px] uppercase font-bold px-1 py-0.5 rounded ${
                priorityColors[task.priority]
              }`}
            >
              {task.priority}
            </span>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;
