import {
    Button, FormControl, FormHelperText, FormLabel, Icon, IconButton, Input, MenuItem,
    Modal, ModalBody,
    ModalCloseButton,
    ModalContent, ModalFooter,
    ModalHeader,
    ModalOverlay, Textarea,

    useDisclosure
} from "@chakra-ui/react";
import {AddIcon} from "@chakra-ui/icons";
import React from "react";
import {useForm} from "react-hook-form";
import {FunctionsCollection} from "../../db/FunctionsCollection";

export default function AddGraphModal({setWorkingGraph}) {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const {
        handleSubmit,
        register,
        formState: { errors, isSubmitting },
    } = useForm()

    function onSubmit(graphData) {
        let graph = {}
        graph.userId = Meteor.userId()
        graph.name = graphData.name
        graph.data = {}
        graph.status = "offline"
        Meteor.call('graphs.insert', graph);
        console.log(graph)
        setWorkingGraph(graph)
        onClose()
    }
    return (
        <>
            <MenuItem icon={<AddIcon />} onClick={onOpen}>
                New Graph
            </MenuItem>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay/>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <ModalContent>
                        <ModalHeader>Add graph</ModalHeader>
                        <ModalCloseButton/>
                        <ModalBody>
                            <FormControl>
                                <FormLabel>Name</FormLabel>
                                <Input {...register("name")}/>
                            </FormControl>
                        </ModalBody>
                        <ModalFooter>
                            <Button colorScheme='blue' mr={3} type="submit">
                                Submit
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </form>
            </Modal>
        </>
    );
}