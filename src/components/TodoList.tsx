"use client";

import { useState } from "react";
import { addTodo, toggleTodo } from "@/server/actions";

type Todo = {
  id: string;
  title: string;
  isDone: boolean;
};

export default function TodoList({ todos }: { todos: Todo[] }) {
  const [newTodo, setNewTodo] = useState("");

  const handleAdd = async () => {
    if (!newTodo) return;
    await addTodo(newTodo);
    setNewTodo(""); // Clear the box
  };

  return (
    <div className="max-w-2xl mx-auto p-8 font-sans">
      <h1 className="text-3xl font-bold mb-6">One-off Tasks</h1>
      
      <div className="flex gap-2 mb-8">
        <input 
          type="text" 
          placeholder="What needs to be done?" 
          className="flex-1 p-3 border rounded-md dark:bg-black dark:border-zinc-800"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
        />
        <button 
          onClick={handleAdd}
          className="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black font-medium rounded-md hover:opacity-90"
        >
          Add
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {todos.length === 0 ? (
          <p className="text-zinc-500 text-center py-8">No tasks yet. Add one above!</p>
        ) : (
          todos.map((todo) => (
            <div key={todo.id} className="flex items-center gap-3 p-4 border rounded-lg shadow-sm">
              <div 
                onClick={() => toggleTodo(todo.id, todo.isDone)}
                className={`w-6 h-6 rounded-md border-2 cursor-pointer transition-colors ${todo.isDone ? 'bg-blue-600 border-blue-600' : 'border-zinc-400 hover:border-zinc-500'}`}
              ></div>
              <span className={`text-lg ${todo.isDone ? 'line-through text-zinc-500' : ''}`}>
                {todo.title}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}