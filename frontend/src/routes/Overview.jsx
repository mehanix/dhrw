import { Divider, Heading, Stack, Box, Card, CardHeader, CardBody, LinkOverlay, CardFooter, Button, Text, Link } from '@chakra-ui/react'
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from 'react';

const GraphCard = (props) => {
    const graphInfo = props.graphInfo
 return  <Card key={graphInfo.id} width="200px">
    <CardHeader>
        <Heading size='md'> {graphInfo.name} </Heading>
    </CardHeader>
    <CardBody>
        <Text> Status: {graphInfo.status}</Text>
    </CardBody>
    <CardFooter>
    <LinkOverlay href={'/graph-editor/' + graphInfo.id}>
        <Button>Edit</Button>
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
    <Stack direction={'row'} height="300px">
        {graphCards}
    </Stack>
    </>
}

export default function Overview() {
    const dispatch = useDispatch();
    const graphs = useSelector((state) => state.ComputationGraphs);
    
    console.log("a", graphs, graphs == [])
    useEffect(() => {
        dispatch.ComputationGraphs.setComputationGraphs()
    }, []);

    if (graphs == 0) {
        console.log("Loading")
        return <p>Loading...</p>
    }

    return <Box>
        <Heading p={2}>Your graphs</Heading>
        <Divider />
        <Stack p={2} alignItems={'start'} justifyContent={"start"}>
        <GraphsList graphs={graphs}/>

        </Stack>
        <Divider />
    </Box>
}