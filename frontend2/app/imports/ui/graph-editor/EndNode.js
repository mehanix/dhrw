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
    InputGroup, Button, Icon
} from '@chakra-ui/react'
import { Select } from '@chakra-ui/react'
import { useForm } from "react-hook-form";
import {FiFile} from "react-icons/fi";
import { FcDataSheet } from "react-icons/fc";

export default function EndNode({ data }) {
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
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
                                    🏁 Flow Output
                                </Heading>
                                <Text pt='2' fontSize='sm'>
                                    Output type
                                </Text>
                                <Select  defaultValue={"csv"} {...register("feedType", { required: true })} size="sm" placeholder='Select option'>
                                    <option value='csv'>File (csv)</option>
                                    <option value='datastream'>Data Stream</option>
                                </Select>
                            </Box>
                            {watchFeedType === "csv" ?
                                <Box>
                                    <Heading size='xs' textTransform='uppercase' pb={"10px"}>
                                        Download output
                                    </Heading>

                                    <FileUpload
                                        multiple
                                        register={register('file_', { validate: validateFiles })}
                                    >
                                        <Button size="sm" leftIcon={<Icon as={FiFile} />}>
                                            Download
                                        </Button>
                                    </FileUpload>
                                </Box> :
                                <Box>
                                    <Heading size='xs' textTransform='uppercase'>
                                        Data Stream
                                    </Heading>
                                    <Text pt='2' fontSize='sm'>
                                        GET data from 192.168.xxx.xxx
                                    </Text>
                                </Box> }
                        </Stack>
                    </CardBody>
                </form>
            </Card>

            <Handle type="target" position={Position.Left} id="END.EndCsv.string" />
        </div>
    );
}


const validateFiles = (value) => {
    if (value.length < 1) {
        return 'Files is required'
    }
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

