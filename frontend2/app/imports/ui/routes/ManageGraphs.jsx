import { Divider, Heading, Stack, Box, Card, CardHeader, CardBody, LinkOverlay, CardFooter, Button, Text, Wrap, IconButton } from '@chakra-ui/react'
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from 'react';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import React from 'react';
import {FunctionsCollection} from "../../db/FunctionsCollection";
import {GraphsCollection} from "../../db/GraphsCollection";
import {
    useTracker
} from "meteor/react-meteor-data";
import {GraphEditorContext} from "../graph-editor/GraphEditorContext";

export default function ManageGraphs() {

    const GraphsList = (props) => {
        console.log("props", props.graphs);
        const graphs = props.graphs;
        let graphCards = graphs.map((graph) => <GraphCard graphInfo={graph} />
        )
        return <>
            <Wrap>
                {graphCards}
            </Wrap>
        </>
    }
    const GraphCard = (props) => {
        const setActiveGraphId = React.useContext(GraphEditorContext);
        const graphInfo = props.graphInfo
        const setGraph = () => {
            console.log(props.graphInfo)
            setActiveGraphId(props.graphInfo._id)
        }
        return  <Card onClick={setGraph} key={graphInfo.id} width="300px">
            <CardHeader>
                <Heading size='md'> {graphInfo.name} </Heading>
            </CardHeader>
            <CardBody>
                <Text> Status: {graphInfo.status}</Text>
            </CardBody>
            <CardFooter>
                    <IconButton mr="1" aria-label='Edit graph' icon={<EditIcon />} />
                    <IconButton aria-label='Delete graph' icon={<DeleteIcon />} />
            </CardFooter>
        </Card>
    }

    // const dispatch = useDispatch();
    const { graphs, isLoading } = useTracker(() => {
        console.log("useTracker graphs")
        const noDataAvailable = { graphs: [] };
        if (!Meteor.user()) {
            return noDataAvailable;
        }
        const handler = Meteor.subscribe('graphs');

        if (!handler.ready()) {
            return { ...noDataAvailable, isLoading: true };
        }

        const loadedGraphs = GraphsCollection.find({}).fetch();
        console.log("loadedGraphs", loadedGraphs)

        return { graphs:loadedGraphs, isLoading: false };
    });
    
    // useEffect(() => {
    //     Meteor.
    //     // dispatch.ComputationGraphs.setComputationGraphs()
    // }, []);

    // if (graphs.isLoading === true) {
    //     console.log("Loading")
    //     return <p>Loading...</p>
    // }

    return <Box>
        <Stack p={2} alignItems={'start'} justifyContent={"start"}>
        <GraphsList graphs={graphs}/>

        </Stack>
        <Divider />
    </Box>
}