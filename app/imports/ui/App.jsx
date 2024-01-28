import React from 'react';
import ReactDOM from 'react-dom/client'
import { useState, Fragment } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import { useTracker } from 'meteor/react-meteor-data';
import { TasksCollection } from '/imports/db/TasksCollection';
import { Task } from './Task';
import { TaskForm } from './TaskForm';
import { LoginForm } from './LoginForm';
import { ChakraProvider, Box } from '@chakra-ui/react'

import GraphEditor from './routes/GraphEditor.jsx';


const router = createBrowserRouter([
  {
    path: "/",
    element: <GraphEditor />
  }
]);

export const App = () => {
  const tasks = useTracker(() => {
    const handler = Meteor.subscribe('tasks');

    if (!handler.ready()) {
      return []
    }

    const tasks = TasksCollection.find({}
    ).fetch();

    return tasks
  });
  const user = useTracker(() => Meteor.user());

  const submit = () => {
    Meteor.logout()
  }
  return (
    <ChakraProvider>
      <Box h="100%" display={"grid"}> 
        <RouterProvider router={router} />
      </Box>
      {/* <div> */}


        {/* <form onSubmit={submit} className="login-form">
          <button type="submit">Log out</button>
        </form>
      </div> */}
    </ChakraProvider>

  );
};
