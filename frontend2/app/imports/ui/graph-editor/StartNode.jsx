import { useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import React, {useRef} from 'react'
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
    InputGroup, Button, Icon, FormErrorMessage
} from '@chakra-ui/react'
import { Select } from '@chakra-ui/react'
import { useForm } from "react-hook-form";
import {FiFile} from "react-icons/fi";
import { FcDataSheet } from "react-icons/fc";

export default function StartNode({ data }) {
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const onSubmit = handleSubmit((data) => console.log('On Submit: ', data))
    const watchFeedType = watch("feedType", 'csv'); // you can supply default value as second argument
    const onChange = useCallback((evt) => {
        console.log(evt.target.value);
    }, []);

    return (
        <div className="text-updater-node">
            <Card>
                <form>
                    <CardBody>
                        <Stack divider={<StackDivider/>} spacing='4'>
                            <Box>
                                <Heading size='xs' textTransform='uppercase'>
                                    <Icon as={FcDataSheet} /> Flow Input
                                </Heading>
                                <Text pt='2' fontSize='sm'>
                                    Feed type
                                </Text>
                                <Select  defaultValue={"csv"} {...register("feedType", { required: true })} size="sm" placeholder='Select option'>
                                    <option value='csv'>File (csv)</option>
                                    <option value='datastream'>Data Stream</option>
                                </Select>
                            </Box>
                            {watchFeedType === "csv" ?
                            <Box>
                                <Heading size='xs' textTransform='uppercase' pb={"10px"}>
                                    Select file
                                </Heading>

                                <FileUpload
                                    multiple
                                    register={register('file_')}
                                >
                                    <Button size="sm" leftIcon={<Icon as={FiFile} />}>
                                        Upload
                                    </Button>
                                </FileUpload>
                                <FormErrorMessage>
                                    {errors.file_ && errors?.file_.message}
                                </FormErrorMessage>
                            </Box> :
                            <Box>
                                <Heading size='xs' textTransform='uppercase'>
                                    Data Stream
                                </Heading>
                                <Text pt='2' fontSize='sm'>
                                    POST data to 192.168.xxx.xxx
                                </Text>
                            </Box> }
                        </Stack>
                    </CardBody>
                </form>
            </Card>

            <Handle type="source" position={Position.Right} id="b" />
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

