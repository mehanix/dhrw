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
    MiniMap,
    MarkerType
} from 'reactflow';

import { useToast } from '@chakra-ui/react'

import 'reactflow/dist/style.css';

import NavBar from '../components/navbar.jsx';
import Sidebar from '../components/sidebar.jsx';
import StartNode from "../graph-editor/StartNode";
import { useContext } from 'react';
import { GraphEditorContext } from '../graph-editor/GraphEditorContext';
// import './index.css';
import '../graph-editor/graph-node.css';
import EndNode from "../graph-editor/EndNode";
import FunctionNode from "../graph-editor/function-node/FunctionNode";
import ControlPanel from "../components/ControlPanel";
import {GraphsCollection} from "../../db/GraphsCollection";
import {
    useTracker
} from "meteor/react-meteor-data";
import {MachinesCollection} from "../../db/MachinesCollection";

const nodeTypes = { startNode: StartNode, endNode: EndNode, functionNode: FunctionNode };

const edgeStyle = {
    markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: '#FF0072',
    },
    style: {
        strokeWidth: 2,
        stroke: '#FF0072',
    },
    type:"straight",
    // animated: true,
}


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
    const [activeGraphId, setActiveGraphId] = useState(null)
    const [reactFlowInstance, setReactFlowInstance] = useState(null);

    // drag n drop funcitonality

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

            reactFlowInstance.addNodes([newNode])
        },
        [reactFlowInstance],
    );


    // end drag n drop functionality


    const {metadata, nodes, edges, viewport} = useTracker(() => {

        const handler = Meteor.subscribe('graphs');
        const handler2 = Meteor.subscribe('machines');

        if (!handler.ready()) {
            return {metadata:null, nodes:[],edges:[],viewport:[]}
        }
        const loadedGraph = GraphsCollection.find({_id:activeGraphId}).fetch()[0];
        MachinesCollection.find({}).fetch(); //for debugging TODO remove
        return {metadata:loadedGraph, nodes:loadedGraph.data.nodes, edges:loadedGraph.data.edges, viewport:loadedGraph.data.viewport}
    }, [activeGraphId])

    const onNodesChange = useCallback(
        (changes) => {
            Meteor.call("graph.updateNodes", {_id: metadata._id, nodes:applyNodeChanges(changes, nodes)})
        }, [nodes]
    )

    const onEdgesChange = useCallback(
        (changes) => {
            Meteor.call("graph.updateEdges", {_id: metadata._id, edges:applyEdgeChanges(changes, edges)})
        }, [edges]
    )

    const onConnect = useCallback(
        (connection) => {
            Meteor.call("graph.updateEdges", {_id: metadata._id, edges:addEdge({...connection, ...edgeStyle}, edges)})
        }, [edges]
    );
        // (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        // [setNodes]
    // const onEdgesChange = useCallback(
    //     (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    //     [setEdges]
    // );

    // const [edges, setEdges] = useState([]);

    return (
        <div className="main">
            <GraphEditorContext.Provider value={setActiveGraphId}>
                <NavBar/>
            </GraphEditorContext.Provider>
            <div className="dndflow">
                {activeGraphId === null ? <p className="reactflow-wrapper" >Load a graph to start working.</p>:
                    <ReactFlowProvider >
                        <div className="reactflow-wrapper" ref={null}>
                            <ReactFlow nodes={nodes}
                                       edges={edges}
                                       onInit={setReactFlowInstance}
                                       nodeTypes={nodeTypes}
                                       onNodesChange={onNodesChange}
                                       onEdgesChange={onEdgesChange}
                                       onConnect={onConnect}
                                       connectionLineType={ConnectionLineType.Straight}

                                       //dnd
                                        onDragOver={onDragOver}
                                        onDrop={onDrop}
                                       fitView >;
                                <Controls></Controls>
                                <ControlPanel metadata={metadata} onSave={null}/>
                            </ReactFlow>
                        </div>
                    </ReactFlowProvider>
                }
                <Sidebar />
            </div>
        </div>

    );
}





export default Flow;
