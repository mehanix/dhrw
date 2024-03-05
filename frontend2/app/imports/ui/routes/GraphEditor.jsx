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
import { Random } from 'meteor/random'

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
const getId = () => Random.id()
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

            const functionData = event.dataTransfer.getData('application/reactflow');

            // check if the dropped element is valid
            if (typeof functionData === 'undefined' || !functionData) {
                return;
            }
            // reactFlowInstance.project was renamed to reactFlowInstance.screenToFlowPosition
            // and you don't need to subtract the reactFlowBounds.left/top anymore
            // details: https://reactflow.dev/whats-new/2023-11-10
            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });
            const newId = getId()
            const newNode = {
                id: newId,
                type:"functionNode",
                position,
                data: JSON.parse(functionData),
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

    const isValidConnection = (connection) => {
        const [sourceNode, sourceDataTitle, sourceDataType] = connection.sourceHandle.split('.')
        const [targetNode, targetDataTitle, targetDataType] = connection.targetHandle.split('.')

        return sourceDataType === targetDataType;
    }


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
                                       isValidConnection={isValidConnection}
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
