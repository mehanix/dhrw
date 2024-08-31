import {
    Button, FormControl, FormHelperText, FormLabel, Icon, IconButton, Input, MenuItem,
    Modal, ModalBody,
    ModalCloseButton,
    ModalContent, ModalFooter,
    ModalHeader,
    ModalOverlay, Textarea,

    useDisclosure
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { FunctionsCollection } from "../../db/FunctionsCollection";
import { GraphEditorContext } from "../graph-editor/GraphEditorContext";
import { ResultsCollection } from "../../db/ResultsCollection";
import { useTracker } from 'meteor/react-meteor-data';
import { FiFile } from "react-icons/fi";
import { DeleteIcon } from '@chakra-ui/icons';

import {
    Table,
    Thead,
    Tbody,
    Tfoot,
    Tr,
    Th,
    Td,
    TableCaption,
    TableContainer,
} from '@chakra-ui/react'


export default function ResultsModal() {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const Rows = (props) => {
        console.log("results", props.results);
        const results = props.results;
        let rows = results.sort(function (x, y) {
            return y.timestamp - x.timestamp;
        }).map((result) => <Tr>
            <Td>{(new Date(result.timestamp * 1000).toDateString()) + ' ' + (new Date(result.timestamp * 1000).toLocaleTimeString())}</Td>
            <Td>{result.batchId}</Td>
            <Td>
                {result.data.length > 5000 ? <img src={"data:image/png;base64, " + result.data} /> : <>{result.data}</>}
            </Td>
            <Td>
                <IconButton onClick={() => {
                    console.log("AA", result._id)
                    Meteor.call('results.remove', result._id)
                }} icon={<DeleteIcon />} variant='solid' colorScheme='red' />
            </Td>
        </Tr>
        )

        return <>{rows}</>
    }
    const [activeGraphId, setActiveGraphId] = React.useContext(GraphEditorContext);
    const { results, isLoading } = useTracker(() => {
        const noDataAvailable = { results: [] };
        if (!Meteor.user()) {
            return noDataAvailable;
        }
        if (activeGraphId == null) {
            return noDataAvailable;
        }
        const handler = Meteor.subscribe('results', activeGraphId);

        if (!handler.ready()) {
            return { ...noDataAvailable, isLoading: true };
        }

        const results = ResultsCollection.find({}).fetch();

        return { results };
    });




    const {
        handleSubmit,
        register,
        formState: { errors, isSubmitting },
    } = useForm()
    function onSubmit() {

        Meteor.call('graphs.insert', graph, ((err, id) => {
            setActiveGraphId(id)
            onClose()
        }))

    }

    return (
        <>
            <Button onClick={onOpen} size="sm" leftIcon={<Icon as={FiFile} />}>
                View
            </Button>
            <Modal size="full" isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <form onSubmit={handleSubmit(onSubmit)}>
                    <ModalContent>
                        <ModalHeader>Function Results</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <TableContainer>
                                <Table variant='simple'>
                                    <TableCaption></TableCaption>
                                    <Thead>
                                        <Tr>
                                            <Th>Timestamp</Th>
                                            <Th>First Row</Th>
                                            <Th>Results</Th>
                                            <Th>Actions</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        <Rows results={results} />
                                    </Tbody >
                                </Table>
                            </TableContainer>
                        </ModalBody>
                    </ModalContent>
                </form>
            </Modal>
        </>
    );
}