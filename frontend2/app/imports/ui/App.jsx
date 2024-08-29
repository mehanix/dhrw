import React from 'react';
import ReactDOM from 'react-dom/client'
import { useState, Fragment } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import { useTracker } from 'meteor/react-meteor-data';
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
  const user = useTracker(() => Meteor.user());
  return (
    <ChakraProvider>
      <Box h="100%" display={"grid"}>
        {user ? <RouterProvider router={router} /> : <LoginForm/>}
      </Box>
      {/* <div> */}

    </ChakraProvider>

  );
};
