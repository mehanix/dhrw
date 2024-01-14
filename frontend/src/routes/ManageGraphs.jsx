import { Divider, Heading, Stack, Box, Card, CardHeader, CardBody, LinkOverlay, CardFooter, Button, Text, Wrap, IconButton } from '@chakra-ui/react'
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from 'react';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';

const GraphCard = (props) => {
    const graphInfo = props.graphInfo
 return  <Card key={graphInfo.id} width="300px">
    <CardHeader>
        <Heading size='md'> {graphInfo.name} </Heading>
    </CardHeader>
    <CardBody>
        <Text> Status: {graphInfo.status}</Text>
    </CardBody>
    <CardFooter>

    <LinkOverlay  href={'/graph-editor/' + graphInfo.id} >
        <IconButton mr="1" aria-label='Edit graph' icon={<EditIcon />} />        
    </LinkOverlay>

    <LinkOverlay href={'/graph-editor/' + graphInfo.id}>
        <IconButton aria-label='Delete graph' icon={<DeleteIcon />} />        
    </LinkOverlay>
    </CardFooter>
</Card>
}

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

export default function ManageGraphs() {
    const dispatch = useDispatch();
    const graphs = useSelector((state) => state.ComputationGraphs);
    
    useEffect(() => {
        dispatch.ComputationGraphs.setComputationGraphs()
    }, []);

    if (graphs == 0) {
        console.log("Loading")
        return <p>Loading...</p>
    }

    return <Box>
        <Stack p={2} alignItems={'start'} justifyContent={"start"}>
        <GraphsList graphs={graphs}/>

        </Stack>
        <Divider />
    </Box>
}