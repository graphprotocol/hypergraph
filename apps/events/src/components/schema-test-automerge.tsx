import type { Doc } from "@automerge/automerge";
import * as Automerge from "@automerge/automerge";
import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";

type TodoType = {
  value: string;
  completed: boolean;
  createdAt: number;
};

type Todos = { todos: { [key: string]: TodoType } };

export const SchemaTestAutomerge: React.FC = () => {
  const [newTodo, setNewTodo] = React.useState("");
  const [doc, setDoc] = useState<Doc<Todos>>(() => Automerge.init());

  return (
    <>
      <div className="todoapp">
        <form
          onSubmit={(event) => {
            event.preventDefault();

            const newDoc: Doc<Todos> = Automerge.change(doc, (doc) => {
              if (!doc.todos) doc.todos = {};
              const id = uuidv4();
              doc.todos[id] = {
                value: newTodo,
                completed: false,
                createdAt: new Date().getTime(),
              };
            });
            setDoc(newDoc);
            setNewTodo("");
          }}
        >
          <input
            placeholder="What needs to be done?"
            onChange={(event) => setNewTodo(event.target.value)}
            value={newTodo}
            className="new-todo"
          />
          <button className="add">Add</button>
        </form>
        <ul className="todo-list">
          {doc.todos &&
            Object.keys(doc.todos)
              .map((id) => {
                return {
                  ...doc.todos[id],
                  id,
                };
              })
              .sort((a, b) => b.createdAt - a.createdAt)
              .map((todo) => (
                <li key={todo.id}>
                  <input
                    className="edit"
                    onChange={(event) => {
                      const newDoc: Doc<Todos> = Automerge.change(
                        doc,
                        (doc) => {
                          doc.todos[todo.id].value = event.target.value;
                        }
                      );
                      setDoc(newDoc);
                    }}
                    value={todo.value}
                  />
                  <input
                    className="toggle"
                    type="checkbox"
                    checked={todo.completed}
                    onChange={(event) => {
                      const newDoc: Doc<Todos> = Automerge.change(
                        doc,
                        (doc) => {
                          doc.todos[todo.id].completed = event.target.checked;
                        }
                      );
                      setDoc(newDoc);
                    }}
                  />
                  <button
                    className="destroy"
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      const newDoc: Doc<Todos> = Automerge.change(
                        doc,
                        (doc) => {
                          delete doc.todos[todo.id];
                        }
                      );
                      setDoc(newDoc);
                    }}
                  ></button>
                </li>
              ))}
        </ul>
      </div>
    </>
  );
};
