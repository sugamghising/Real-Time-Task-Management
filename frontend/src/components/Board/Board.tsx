import React from "react";
import { type Board as BoardType, type Task } from "../../types";
import Column from "../Column/Column";

interface BoardProps {
  board: BoardType;
  tasks: Record<string, Task>;
  onAddClick: (columnId: string) => void;
  onTaskClick: (task: Task) => void;
}

const Board: React.FC<BoardProps> = ({
  board,
  tasks,
  onAddClick,
  onTaskClick,
}) => {
  return (
    <div className="flex flex-col h-screen p-8 bg-gray-100 overflow-x-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">{board.title}</h1>
      <div className="flex gap-6 h-full items-start">
        {board.columnsOrder.map((columnId) => {
          const column = board.columns[columnId];
          const columnTasks = column.taskIds.map((taskId) => tasks[taskId]);
          return (
            <Column
              key={column.id}
              column={column}
              tasks={columnTasks}
              onAddClick={onAddClick}
              onTaskClick={onTaskClick}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Board;
