import {Fragment, useCallback} from 'react';
import { Handle, Position, NodeToolbar } from 'reactflow';
import React, {useRef} from 'react'
import { TbMathFunction } from "react-icons/tb";
const handleStyle = { left: 10 };
import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Text,
    StackDivider,
    Stack,
    Box,
    Heading,
    InputGroup, Button, Icon, FormErrorMessage, IconButton, HStack, Tooltip, Divider
} from '@chakra-ui/react'
import { Select } from '@chakra-ui/react'
import { useForm } from "react-hook-form";
import {FiFile} from "react-icons/fi";
import { FcDataSheet } from "react-icons/fc";
import {DeleteIcon, EditIcon} from "@chakra-ui/icons";

export default function FunctionNode({ data }) {
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const onSubmit = handleSubmit((data) => console.log('On Submit: ', data))
    const watchFeedType = watch("feedType", 'csv'); // you can supply default value as second argument
    const onChange = useCallback((evt) => {
        console.log(evt.target.value);
    }, []);

    // const handleStyle = {
    //    top: 30,
    //     background:'#A00'
    // }


    const handleStyleTarget = {
        position: "relative",
        top: "-13px",
        left:"-28px"
    }

    const handleStyleSource = {
        position: "relative",
        top: "-13px",
        left:"105%"
    }

    const DatatypeBlock = ({property, offset, type}) => {
        return <Card>
            <CardHeader>
               <Text fontSize={'sm'}>
                   {property.title[0].toLowerCase() + property.title.slice(1)}
               </Text>
                <Text fontSize='xs' textTransform={'uppercase'}>
                    {property.type}
                </Text>
                <Divider/>
            </CardHeader>
            <Handle type={type} style={type === "source" ? handleStyleSource : handleStyleTarget} id={property.title}  position={type === "source" ? Position.Left : Position.Right}/>
            <Text>A parameter</Text>
            </Card>

        //
    }

    const Inputs = () => {
        const inputSchema = JSON.parse(data.inputSchema)

        const ans = Object.keys(inputSchema.properties).map((property, index) => {
            return <DatatypeBlock property={inputSchema.properties[property]} type="target" offset={index * 100} />
        })
        return ans
    }

    const Outputs = () => {
        const outputSchema = JSON.parse(data.outputSchema)

        const ans = Object.keys(outputSchema.properties).map((property, index) => {
            return <DatatypeBlock property={outputSchema.properties[property]} type="source" offset={index * 30} />
        })
        return ans
    }
    return (
        <div className="text-updater-node">
            <NodeToolbar
                position={Position.Top}
            >
                <HStack>
                    <Tooltip label='Live edit code'>
                        <IconButton aria-label='Edit' icon={<EditIcon />} hasArrow placement={"top"}/>
                    </Tooltip>
                    <Tooltip label='Remove'>
                    <IconButton aria-label='Remove' icon={<DeleteIcon />} hasArrow placement={"top"}/>
                    </Tooltip>
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
                                {/*<Text>*/}
                                {/*    {data.inputSchema}*/}
                                {/*</Text>*/}
                                <Text pt='2' fontSize='xs'>
                                    {data.description}
                                </Text>
                                {/*<Select  defaultValue={"csv"} {...register("feedType", { required: true })} size="sm" placeholder='Select option'>*/}
                                {/*    <option value='csv'>File (csv)</option>*/}
                                {/*    <option value='datastream'>Data Stream</option>*/}
                                {/*</Select>*/}
                            </Box>
                                <Box>
                                    <Heading size='xs' textTransform='uppercase' pb={"10px"}>
                                        Inputs
                                    </Heading>
                                    <Box>
                                        <Inputs />
                                    </Box>
                                    <FormErrorMessage/>
                                </Box>
                            <Box>
                                <Heading size='xs' textTransform='uppercase' pb={"10px"}>
                                    Outputs
                                </Heading>
                                <Outputs />
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


const validateFiles = (value) => {
    if (value.length < 1) {
        return 'Files is required'
    }
    console.log(value.length)
    for (const file of Array.from(value)) {
        const fsMb = file.size / (1024 * 1024)
        const MAX_FILE_SIZE = 10
        if (fsMb > MAX_FILE_SIZE) {
            return 'Max file size 10mb'
        }
        console.log(file)
    }
    return true
}

const FileUpload = (props) => {
    const { register, multiple, children } = props
    const inputRef = useRef(null)
    const { ref, ...rest } = register

    const handleClick = () => inputRef.current?.click()

    return (
        <InputGroup onClick={handleClick}>
            <input
                type={'file'}
                multiple={multiple || false}
                hidden
                {...rest}
                ref={(e) => {
                    ref(e)
                    inputRef.current = e
                }}
            />
            <>
                {children}
            </>
        </InputGroup>
    )
}

