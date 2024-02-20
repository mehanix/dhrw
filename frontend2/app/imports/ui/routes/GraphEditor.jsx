import React, { useState, useRef, useCallback , useEffect} from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
    applyNodeChanges,
    applyEdgeChanges,
    setViewport,
    ConnectionLineType,
  Controls,
    Panel,
    MiniMap
} from 'reactflow';

import { useToast } from '@chakra-ui/react'

import 'reactflow/dist/style.css';

import NavBar from '../components/navbar.jsx';
import Sidebar from '../components/sidebar.jsx';
import StartNode from "../graph-editor/StartNode";

// import './index.css';
import '../graph-editor/graph-node.css';
import EndNode from "../graph-editor/EndNode";
import FunctionNode from "../graph-editor/function-node/FunctionNode";
import ControlPanel from "../components/ControlPanel";
import {GraphsCollection} from "../../db/GraphsCollection";
import {
    useTracker
} from "meteor/react-meteor-data";

const nodeTypes = { startNode: StartNode, endNode: EndNode, functionNode: FunctionNode };

const initialNodes = [
  {
    id: '1',
    type: 'startNode',
    data: { label: 'hi' },
    position: { x: 20, y: 5 },

  },
    {
        id: '2',
        type: 'endNode',
        data: { label: 'hi' },
        position: { x: 500, y: 5 },

    },
];

let id = 0;
const getId = () => `dndnode_${id++}`;

const DnDFlow = () => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const [workingGraph, setWorkingGraph] = useState(null)
  const toast = useToast()

 const onSave = useCallback(() => {
        if (reactFlowInstance) {
            let updatedWorkingGraph = workingGraph
            updatedWorkingGraph.data = reactFlowInstance.toObject()
            console.log(updatedWorkingGraph)
            Meteor.call("graphs.insert", updatedWorkingGraph)
        }
    }, [reactFlowInstance]);


    useEffect(() => {    // Update the document title using the browser API
      if (workingGraph === null)
          return


      if (Object.keys(workingGraph.data).length === 0) {
          setNodes(initialNodes);
          toast({
              title: 'Ready to go',
              description: "Created graph " + workingGraph.name,
              status: 'info',
              duration: 9000,
              isClosable: true,
          })

      }
          return

      const { x = 0, y = 0, zoom = 1 } = workingGraph.data.viewport;
      setNodes(workingGraph.data.nodes || []);
      setEdges(workingGraph.data.edges || []);
      reactFlowInstance.setViewport({ x, y, zoom });

      toast({
          title: 'Ready to go',
          description: "Loaded graph " + workingGraph.name,
          status: 'info',
          duration: 9000,
          isClosable: true,
      })


    }, [workingGraph]);

    const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({...params, type:"straight"}, eds)),
    [],
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const nodeData = event.dataTransfer.getData('application/reactflow');

      // check if the dropped element is valid
      if (typeof nodeData === 'undefined' || !nodeData) {
          return;
      }
      // reactFlowInstance.project was renamed to reactFlowInstance.screenToFlowPosition
      // and you don't need to subtract the reactFlowBounds.left/top anymore
      // details: https://reactflow.dev/whats-new/2023-11-10
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode = {
        id: getId(),
        type:"functionNode",
        position,
        data: {nodeId: id, ...JSON.parse(nodeData)},
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance],
  );


    const edgeUpdateSuccessful = useRef(true);
    const onEdgeUpdateStart = useCallback(() => {
        edgeUpdateSuccessful.current = false;
    }, []);

    const onEdgeUpdate = useCallback((oldEdge, newConnection) => {
        edgeUpdateSuccessful.current = true;
        setEdges((els) => updateEdge(oldEdge, newConnection, els));
    }, []);

    const onEdgeUpdateEnd = useCallback((_, edge) => {
        if (!edgeUpdateSuccessful.current) {
            setEdges((eds) => eds.filter((e) => e.id !== edge.id));
        }

        edgeUpdateSuccessful.current = true;
    }, []);


  return (
    <div className="main">
      <NavBar setWorkingGraph={setWorkingGraph}/>
      <div className="dndflow">
          {workingGraph === null ? <p className="reactflow-wrapper" >Load a graph to start working.</p>:
              <ReactFlowProvider >
                  <div className="reactflow-wrapper" ref={reactFlowWrapper}>
                      <ReactFlow
                          nodeTypes={nodeTypes}
                          nodes={nodes}
                          edges={edges}
                          onNodesChange={onNodesChange}
                          onEdgesChange={onEdgesChange}
                          onEdgeUpdate={onEdgeUpdate}
                          onEdgeUpdateStart={onEdgeUpdateStart}
                          onEdgeUpdateEnd={onEdgeUpdateEnd}
                          onConnect={onConnect}
                          connectionLineType={ConnectionLineType.Straight}
                          onInit={setReactFlowInstance}
                          onDrop={onDrop}
                          onDragOver={onDragOver}
                          snapToGrid={true}
                          // fitView
                      >
                          <Controls></Controls>
                          <ControlPanel onSave={onSave}/>
                      </ReactFlow>
                  </div>
              </ReactFlowProvider>
                  }
        <Sidebar />
      </div>
    </div>

  );
};


function Flow() {
    const {nodes, edges, viewport} = useTracker(() => {

        const handler = Meteor.subscribe('graphById');
        console.log("a")
        if (!handler.ready()) {
            return {nodes:[],edges:[],viewport:[]}
        }
        console.log("b")
        const loadedGraph = GraphsCollection.find({}).fetch()[0];
        console.log(loadedGraph)
        // console.log(Meteor.subscribe('graphs.graphById'));
        // return GraphsCollection.find().fetch()[0]["data"]["nodes"]
        return {nodes:loadedGraph.data.nodes, edges:loadedGraph.data.edges, viewport:loadedGraph.data.viewport}
    })

    const onNodesChange = useCallback(
        (changes) => {
            Meteor.call("graph.updateNodes", {_id: "77Nrp9pQvv8gkm2xu", nodes:applyNodeChanges(changes, nodes)})
        }, [nodes]
    )

    const onEdgesChange = useCallback(
        (changes) => {
            Meteor.call("graph.updateEdges", {_id: "77Nrp9pQvv8gkm2xu", edges:applyEdgeChanges(changes, edges)})
        }, [edges]
    )

    const onConnect = useCallback(
        (connection) => {
            Meteor.call("graph.updateEdges", {_id: "77Nrp9pQvv8gkm2xu", edges:addEdge(connection, edges)})
        },
        [edges]
    );
        // (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        // [setNodes]
    // const onEdgesChange = useCallback(
    //     (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    //     [setEdges]
    // );

    // const [edges, setEdges] = useState([]);

    return <ReactFlow nodes={nodes}
                      edges={edges}
                      nodeTypes={nodeTypes}
                      onNodesChange={onNodesChange}
                      onEdgesChange={onEdgesChange}
                      onConnect={onConnect}
                      fitView />;
}





export default Flow;
