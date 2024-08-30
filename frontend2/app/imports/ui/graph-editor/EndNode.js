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
import ResultsModal from '../components/ResultsModal';

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
                            </Box>
                                <Box>
                                    <Heading size='xs' textTransform='uppercase' pb={"10px"}>
                                        View output
                                    </Heading>
                                    <ResultsModal />
                                </Box> 
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

