import {Fragment, useCallback} from 'react';
import { Handle, Position, NodeToolbar, useReactFlow } from 'reactflow';
import React, {useRef} from 'react'
import { TbMathFunction } from "react-icons/tb";
import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Text,
    StackDivider,
    Stack,
    Box,
    Icon,
    Heading,
    InputGroup, Button, FormErrorMessage, IconButton, HStack, Tooltip, Divider, VStack
} from '@chakra-ui/react'
import { useForm } from "react-hook-form";
import DatatypeBlock from "./DatatypeBlock";
import { IoCodeSlashSharp } from "react-icons/io5";

export default function FunctionNode({ data }) {
    const { setNodes } = useReactFlow();
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const onSubmit = handleSubmit((data) => console.log('On Submit: ', data))
    const watchFeedType = watch("feedType", 'csv'); // you can supply default value as second argument
    const onChange = useCallback((evt) => {
        // console.log(evt.target.value);
    }, []);

    const Inputs = () => {
        const inputSchema = JSON.parse(data.inputSchema)

        return Object.keys(inputSchema.properties).map((property, index) => {
            return <DatatypeBlock functionId={data._id} property={inputSchema.properties[property]} type="target" offset={index * 100} />
        })
    }

    const Outputs = () => {
        const outputSchema = JSON.parse(data.outputSchema)

        return Object.keys(outputSchema.properties).map((property, index) => {
            return <DatatypeBlock functionId={data._id} property={outputSchema.properties[property]} type="source" offset={index * 30} />
        })
    }

    return (
        <div className="text-updater-node">
            <NodeToolbar
                position={Position.Top}
            >
                <HStack>
                    <Tooltip label='Live edit code'>
                        <IconButton aria-label='Edit' icon={<Icon as={IoCodeSlashSharp} />} hasArrow placement={"top"}/>
                    </Tooltip>
                    {/*<Tooltip label='Remove'>*/}
                    {/*<IconButton aria-label='Remove' onClick={deleteNodeById} icon={<DeleteIcon />} hasArrow placement={"top"}/>*/}
                    {/*</Tooltip>*/}
                </HStack>

            </NodeToolbar>
            <Card>
                <form>
                    <CardBody>
                        <Stack divider={<StackDivider/>} spacing='4'>
                            <Box>
                                <Heading size='xs' textTransform='uppercase'>
                                    <Icon as={TbMathFunction} />  {data.name}
                                </Heading>

                                <Text pt='2' fontSize='xs'>
                                    {data.description}
                                </Text>
                            </Box>
                                <Box>
                                    <Heading size='xs' textTransform='uppercase' pb={"10px"}>

                                        Inputs
                                    </Heading>
                                    <Box>
                                        <VStack align={"stretch"}>
                                            <Inputs />
                                        </VStack>
                                    </Box>
                                    <FormErrorMessage/>
                                </Box>
                            <Box>
                                <Heading size='xs' textTransform='uppercase' pb={"10px"}>
                                    Outputs
                                </Heading>
                                <VStack align={"stretch"}>
                                    <Outputs />
                                </VStack>
                                <FormErrorMessage>
                                </FormErrorMessage>
                            </Box>

                        </Stack>
                    </CardBody>
                </form>
            </Card>
        </div>
    );
}