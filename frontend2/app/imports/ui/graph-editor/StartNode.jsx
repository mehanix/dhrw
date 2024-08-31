import { useCallback, useState } from 'react';
import { Handle, Position } from 'reactflow';
import React, { useRef } from 'react'
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
    InputGroup, Button, Icon, FormErrorMessage,
    HStack
} from '@chakra-ui/react'
import { Select } from '@chakra-ui/react'
import { useForm } from "react-hook-form";
import { FiFile } from "react-icons/fi";
import { FcDataSheet } from "react-icons/fc";
import { GraphEditorContext } from "./GraphEditorContext";
import { useToast } from '@chakra-ui/react'
import {
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
} from '@chakra-ui/react'
export default function StartNode({ data }) {
    const toast = useToast()
    const [activeGraphId, setActiveGraphId] = React.useContext(GraphEditorContext);
    const [batchSize, setBatchSize] = useState(1)
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const onSubmit = handleSubmit(async (data) => {
        console.log("aaa", data.file_[0].name)
        const csvText = await data.file_[0].text();
        const examplePromise = new Promise((resolve, reject) => {
            setTimeout(() => resolve(200), 3000)
        })

        // Will display the loading toast until the promise is either resolved
        // or rejected.
        toast.promise(examplePromise, {
            success: { title: 'Done!', description: 'Results computed' },
            error: { title: 'Promise rejected', description: 'Something wrong' },
            loading: { title: 'Processing data...', description: 'Please wait!' },
        })
        Meteor.call("functions.startWithCsv", csvText, activeGraphId, batchSize)

    })
    const watchFeedType = watch("feedType", 'csv'); // you can supply default value as second argument
    const onChange = useCallback((evt) => {
        // console.log(evt.target.value);
    }, []);

    return (
        <div className="text-updater-node">
            <Card>
                <form onSubmit={onSubmit}>
                    <CardBody>
                        <Stack divider={<StackDivider />} spacing='4'>
                            <Box>
                                <Heading size='xs' textTransform='uppercase'>
                                    <Icon as={FcDataSheet} /> Flow Input
                                </Heading>

                            </Box>

                            <Box>
                                <Heading size='xs' textTransform='uppercase' pb={"10px"}>
                                    Batch Size
                                </Heading>
                                <HStack>
                                    <NumberInput onChange={setBatchSize} value={batchSize} min={1}>
                                        <NumberInputField />
                                        <NumberInputStepper>
                                            <NumberIncrementStepper />
                                            <NumberDecrementStepper />
                                        </NumberInputStepper>
                                    </NumberInput>
                                </HStack>
                            </Box>

                            <Box>
                                <Heading size='xs' textTransform='uppercase' pb={"10px"}>
                                    Upload CSV
                                </Heading>
                                <HStack>

                                    <FileUpload
                                        register={register('file_')}
                                    >
                                        <Button size="sm" padding="5" leftIcon={<Icon as={FiFile} />}>
                                            Upload
                                        </Button>
                                    </FileUpload>
                                    <Button type='submit' padding="5" size="sm" leftIcon={<Icon as={FiFile} />}>
                                        Submit
                                    </Button>
                                </HStack>

                                {errors.file_ && errors?.file_.message}

                            </Box>

                        </Stack>


                    </CardBody>

                </form>
            </Card>

            <Handle type="source" position={Position.Right} id="START.StartCsv.string" />
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

