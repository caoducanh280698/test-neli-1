import React, { useEffect } from 'react';
import {
  useQuery,
  gql
} from "@apollo/client";
import { client } from './apollo/client';


const ListTodo = gql`
query Todos {
  todos {
    id
    description
    isFinished
  }
}
`;

const fetch = gql`
query Todos($fetchId: Int!) {
  fetch(id: $fetchId) {
    id
    description
    isFinished
  }
}
`
const edit = gql`
query Edit($editId: Int!, $description: String!, $isFinished: Int!) {
  edit(id: $editId, description: $description, isFinished: $isFinished) {
    id
    description
    isFinished
  }
}
`

const create = gql`
query Create($description: String!, $isFinished: Int!) {
  create(description: $description, isFinished: $isFinished) {
    id
    description
    isFinished
  }
}
`

const deleteToDo = gql`
query Create($deleteId: Int!) {
  delete(id: $deleteId) {
    id
    description
    isFinished
  }
}
`

export const TodoList = () => {
  const { loading, error, data, refetch } = useQuery(ListTodo);
  const [openInput, setOpenInput] = React.useState(false);
  const [descriptionValue, setDescriptionValue] = React.useState('');
  const [isFinishedValue, setIsFinishedValue] = React.useState(0);
  const [statusClick, setStatusClick] = React.useState("add");
  const [editId, setEditId] = React.useState(0);
  const [findId, setFindId] = React.useState(0);
  const [searchValue, setSearchValue] = React.useState(null);

  const onAddToDo = () => {
    setStatusClick("add");
    setOpenInput(true);
  }
  const onEditClick = (id, description, isFinished) => {
    setStatusClick("edit");
    setEditId(id);
    setDescriptionValue(description);
    setIsFinishedValue(isFinished ? 1 : 0);
    setOpenInput(true);
  }

  const onSubmit = async () => {
    await client.query({
      query: create,
      variables: { description: descriptionValue, isFinished: isFinishedValue }
    });
    setDescriptionValue("");
    setIsFinishedValue(0);
    setOpenInput(false)
    refetch();
  }
  const onDelete = async (id) => {
    await client.query({
      query: deleteToDo,
      variables: {
        deleteId: id
      }
    });
    refetch();

  }
  const onEdit = async () => {
    await client.query({
      query: edit,
      variables: {
        editId: editId,
        description: descriptionValue,
        isFinished: isFinishedValue
      }
    });
    setOpenInput(false);
    refetch();

  }
  const onFetch = async (id) => {
    const res = await client.query({
      query: fetch,
      variables: {
        fetchId: id
      }
    });
    setSearchValue(res.data.fetch[0]);
  }

  const onChangeSearch = (e) => {
    setFindId(parseInt(e.target.value));

  }

  useEffect(() => {
    if (!findId) {
      //reset data set data => todoList
      setSearchValue(null);
    } else {
      // set data => data onFetch
      onFetch(findId);
    }
  }, [findId]);

  return (
    <div>
      <h1>Todo List</h1>
      {loading && <p>Loading...</p>}
      {error && <p>Error :(</p>}

      Find by id : <input type="number" value={findId} onChange={(e) => onChangeSearch(e)} />

      <table>
        <tr>
          <th>Id</th>
          <th>Description</th>
          <th>Status</th>
          <th></th>
        </tr>
        {searchValue && <tr>
          <td>{searchValue.id}</td>
          <td>{searchValue.description}</td>
          <td>{searchValue.isFinished ? "Finished" : "Not Finished"}</td>
          <td>
            <button onClick={() => onEditClick(searchValue.id, searchValue.description, searchValue.isFinished)}>Edit</button>&nbsp;
            <button onClick={() => onDelete(searchValue.id)}>Delete</button>
          </td>
        </tr>}
        {data && !searchValue && data.todos.map(todo => (
          <tr key={todo.id}>
            <td>{todo.id}</td>
            <td>{todo.description}</td>
            <td>{todo.isFinished ? "Finished" : "Not Finished"}</td>
            <td>
              <button onClick={() => onEditClick(todo.id, todo.description, todo.isFinished)}>Edit</button>&nbsp;
              <button onClick={() => onDelete(todo.id)}>Delete</button>
            </td>
          </tr>

        ))}
      </table>
      <div>
        <button onClick={onAddToDo} disabled={openInput ? true : false} >{statusClick === "add" ? "Add " : "Edit "}to do list</button>
      </div>
      {openInput && (<div>
        {statusClick === 'add' ? "" : <div>Id : {editId}</div>}
        <span>Description : </span>
        <input type="text" value={descriptionValue}
          onChange={(e) => setDescriptionValue(e.target.value)} />
        <br />
        <label for="isFinished">Is finished :</label>
        <select name="isFinished" id="isFinished" value={isFinishedValue ? 1 : 0}
          onChange={(e) => setIsFinishedValue(parseInt(e.target.value))} >
          <option value={0}>Not Finished</option>
          <option value={1}>Finished</option>
        </select><br />
        {statusClick === "add" ? <button onClick={onSubmit}>Submit</button> :
          <button onClick={onEdit}>Change</button>}
      </div>)}



    </div>
  );
}