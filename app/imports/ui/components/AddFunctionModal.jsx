import {
    Button, FormControl, FormHelperText, FormLabel, Icon, IconButton, Input,
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

export default function AddFunctionModal() {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const {
        handleSubmit,
        register,
        formState: { errors, isSubmitting },
    } = useForm()

    function onSubmit(functionData) {
        functionData.userId = Meteor.userId()
        Meteor.call('functions.insert', functionData);
        console.log(result)
        onClose()
    }
    return (
        <>
            <IconButton onClick={onOpen} variant="outline" icon={<Icon as={AddIcon}></Icon> }></IconButton>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay/>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <ModalContent>
                        <ModalHeader>Add function</ModalHeader>
                        <ModalCloseButton/>
                        <ModalBody>
                            <FormControl>
                                <FormLabel>Source Link (GitLab)</FormLabel>
                                <Input {...register("gitlabLink")}/>
                                <FormHelperText>Use raw source links!</FormHelperText>
                                <FormLabel>Name</FormLabel>
                                <Input  {...register("name")}/>
                                <FormLabel>Description</FormLabel>
                                <Textarea  {...register("description")} id={"description"} placeholder='Here is a sample placeholder'/>
                                <Textarea  {...register("inputSchema")} id={"inputSchema"} placeholder='Place input schema here'/>
                                <Textarea  {...register("outputSchema")} id={"outputSchema"} placeholder='Place output schema here'/>

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