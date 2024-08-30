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
import {GraphEditorContext} from "../graph-editor/GraphEditorContext";

export default function AddGraphModal() {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const {
        handleSubmit,
        register,
        formState: { errors, isSubmitting },
    } = useForm()
    const [activeGraphId, setActiveGraphId] = React.useContext(GraphEditorContext);
    function onSubmit(graphData) {
        let graph = {}
        graph.userId = Meteor.userId()
        graph.name = graphData.name
        graph.data = {nodes:[
                {
                    id: 'START', //node id
                    type: 'startNode',
                    data: { _id:"START", code:"START_CODE", userId:this.userId, fun }, //function and user id
                    position: { x: 20, y: 5 },

                },
                {
                    id: 'END',
                    type: 'endNode',
                    data: { _id:"END", code:"END_CODE", userId:this.userId  },
                    position: { x: 500, y: 5 },

                },
            ],
        edges:[],
        viewport:[]
        }
        graph.status = "offline"
        console.log("graph pre insert", graph)
        Meteor.call('graphs.insert', graph,((err,id) => {
            setActiveGraphId(id)
            onClose()
        }))

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