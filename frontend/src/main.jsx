import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import { ChakraProvider, Box } from '@chakra-ui/react'
import './index.css'
import customTheme from "./utils/themes";
import Overview from './routes/Overview.jsx';
import GraphEditor from './routes/GraphEditor.jsx';
import { Provider } from 'react-redux'
import store from './store.js'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Overview/>
  },
  {
    path: "/graph-editor/:graphId",
    element: <GraphEditor/>
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode> 
    <Provider store={store}> 
    <ChakraProvider theme={customTheme}>
      <Box h="100%"  display={"grid"}>
      <RouterProvider router={router} />

      </Box>
    </ChakraProvider>
    </Provider>
  </React.StrictMode>
)
